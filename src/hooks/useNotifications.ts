// src/hooks/useNotifications.ts

import { useState, useEffect, useCallback, useRef } from 'react';
import notificationService from '@/services/notificationService';
import webSocketService from '@/services/webSocketService';
import type { 
  Notification, 
  NotificationFilters, 
  NotificationPreferences,
  NotificationStats 
} from '@/types/notification.types';
import { NOTIFICATION_POLLING_INTERVAL } from '@/constants/notificationConstants';

// Hook return type
interface UseNotificationsReturn {
  // Data
  notifications: Notification[];
  unreadCount: number;
  preferences: NotificationPreferences | null;
  stats: NotificationStats | null;
  
  // State
  loading: boolean;
  error: string | null;
  wsConnected: boolean;
  
  // Actions
  refreshNotifications: (filters?: NotificationFilters) => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  bulkDeleteNotifications: (ids: number[]) => Promise<void>;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>;
  
  // Utility
  getRecentNotifications: (limit?: number) => Notification[];
  searchNotifications: (query: string, filters?: NotificationFilters) => Promise<void>;
  exportNotifications: (format?: 'csv' | 'excel', filters?: NotificationFilters) => Promise<void>;
  requestBrowserPermission: () => Promise<NotificationPermission>;
}

export const useNotifications = (
  userId?: number,
  autoConnect: boolean = true,
  pollingEnabled: boolean = false
): UseNotificationsReturn => {
  // State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState(false);

  // Refs
  const pollingInterval = useRef<number | null>(null);
  const lastFetchTime = useRef<number>(0);
  const isComponentMounted = useRef(true);

  /**
   * Safe state update (only if component is mounted)
   */
  const safeSetState = useCallback((updater: () => void) => {
    if (isComponentMounted.current) {
      updater();
    }
  }, []);

  /**
   * Refresh notifications from server
   */
  const refreshNotifications = useCallback(async (filters: NotificationFilters = {}) => {
    if (!userId) return;

    setLoading(true);
    setError(null);
    
    try {
      const [notifResponse, countResponse] = await Promise.all([
        notificationService.getNotifications(filters),
        notificationService.getUnreadCount()
      ]);

      safeSetState(() => {
        setNotifications(notifResponse.data || []);
        setUnreadCount(countResponse.data || 0);
        lastFetchTime.current = Date.now();
      });
    } catch (err: any) {
      safeSetState(() => {
        setError(err.message || 'Failed to load notifications');
      });
      console.error('Failed to refresh notifications:', err);
    } finally {
      safeSetState(() => {
        setLoading(false);
      });
    }
  }, [userId, safeSetState]);

  /**
   * Load user preferences
   */
  const loadPreferences = useCallback(async () => {
    if (!userId) return;
    
    try {
      const response = await notificationService.getPreferences();
      safeSetState(() => {
        setPreferences(response.data || null);
      });
    } catch (err: any) {
      console.error('Failed to load preferences:', err);
      // Set default preferences on error
      safeSetState(() => {
        setPreferences({
          userId: userId!,
          emailEnabled: true,
          smsEnabled: false,
          inAppEnabled: true,
          pushEnabled: false,
          dailySummaryEnabled: true,
          weeklySummaryEnabled: false,
          doNotDisturbEnabled: false,
          language: 'en',
          timezone: 'Asia/Riyadh',
          enabledTypes: [],
          enabledChannels: []
        });
      });
    }
  }, [userId, safeSetState]);

  /**
   * Load notification statistics
   */
  const loadStats = useCallback(async () => {
    if (!userId) return;
    
    try {
      const response = await notificationService.getNotificationStats();
      safeSetState(() => {
        setStats(response.data || null);
      });
    } catch (err: any) {
      console.error('Failed to load stats:', err);
    }
  }, [userId, safeSetState]);

  /**
   * Mark notification as read
   */
  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      safeSetState(() => {
        setNotifications(prev =>
          prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      });
    } catch (err: any) {
      setError(err.message || 'Failed to mark as read');
      console.error('Failed to mark as read:', err);
    }
  }, [safeSetState]);

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      
      safeSetState(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
      });
    } catch (err: any) {
      setError(err.message || 'Failed to mark all as read');
      console.error('Failed to mark all as read:', err);
    }
  }, [safeSetState]);

  /**
   * Delete single notification
   */
  const deleteNotification = useCallback(async (notificationId: number) => {
    try {
      await notificationService.deleteNotification(notificationId);
      
      const deletedNotification = notifications.find(n => n.id === notificationId);
      
      safeSetState(() => {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        
        if (deletedNotification && !deletedNotification.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      });
    } catch (err: any) {
      setError(err.message || 'Failed to delete notification');
      console.error('Failed to delete notification:', err);
    }
  }, [notifications, safeSetState]);

  /**
   * Bulk delete notifications
   */
  const bulkDeleteNotifications = useCallback(async (notificationIds: number[]) => {
    try {
      await notificationService.bulkDeleteNotifications(notificationIds);
      
      const deletedNotifications = notifications.filter(n => notificationIds.includes(n.id));
      const deletedUnreadCount = deletedNotifications.filter(n => !n.read).length;
      
      safeSetState(() => {
        setNotifications(prev => prev.filter(n => !notificationIds.includes(n.id)));
        setUnreadCount(prev => Math.max(0, prev - deletedUnreadCount));
      });
    } catch (err: any) {
      setError(err.message || 'Failed to delete notifications');
      console.error('Failed to bulk delete notifications:', err);
    }
  }, [notifications, safeSetState]);

  /**
   * Update user preferences
   */
  const updatePreferences = useCallback(async (prefs: Partial<NotificationPreferences>) => {
    try {
      const response = await notificationService.updatePreferences(prefs);
      safeSetState(() => {
        setPreferences(response.data || null);
      });
    } catch (err: any) {
      setError(err.message || 'Failed to update preferences');
      console.error('Failed to update preferences:', err);
    }
  }, [safeSetState]);

  /**
   * Get recent notifications (for dropdown)
   */
  const getRecentNotifications = useCallback((limit: number = 5) => {
    return notifications
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }, [notifications]);

  /**
   * Search notifications
   */
  const searchNotifications = useCallback(async (query: string, filters: NotificationFilters = {}) => {
    if (!userId) return;

    setLoading(true);
    setError(null);
    
    try {
      const response = await notificationService.searchNotifications(query, filters);
      safeSetState(() => {
        setNotifications(response.data || []);
      });
    } catch (err: any) {
      safeSetState(() => {
        setError(err.message || 'Failed to search notifications');
      });
      console.error('Failed to search notifications:', err);
    } finally {
      safeSetState(() => {
        setLoading(false);
      });
    }
  }, [userId, safeSetState]);

  /**
   * Export notifications
   */
  const exportNotifications = useCallback(async (
    format: 'csv' | 'excel' = 'csv', 
    filters: NotificationFilters = {}
  ) => {
    try {
      const blob = await notificationService.exportNotifications(format, filters);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `notifications_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message || 'Failed to export notifications');
      console.error('Failed to export notifications:', err);
    }
  }, []);

  /**
   * Request browser notification permission
   */
  const requestBrowserPermission = useCallback(async (): Promise<NotificationPermission> => {
    try {
      return await notificationService.requestBrowserNotificationPermission();
    } catch (err: any) {
      console.error('Failed to request browser permission:', err);
      return 'denied';
    }
  }, []);

  /**
   * Handle new notification from WebSocket
   */
  const handleNewNotification = useCallback((notification: Notification) => {
    safeSetState(() => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });
    
    // Show browser notification if permission granted and preferences allow
    if (preferences?.pushEnabled && Notification.permission === 'granted') {
      notificationService.showBrowserNotification(notification);
    }
  }, [preferences, safeSetState]);

  /**
   * Handle WebSocket connection status
   */
  const handleConnectionStatus = useCallback((status: 'connecting' | 'connected' | 'disconnected' | 'error') => {
    safeSetState(() => {
      setWsConnected(status === 'connected');
    });
  }, [safeSetState]);

  /**
   * Start polling for notifications (fallback when WebSocket is not available)
   */
  const startPolling = useCallback(() => {
    if (pollingInterval.current) return;

    pollingInterval.current = setInterval(() => {
      // Only poll if WebSocket is not connected and it's been a while since last fetch
      if (!wsConnected && Date.now() - lastFetchTime.current > NOTIFICATION_POLLING_INTERVAL) {
        refreshNotifications();
      }
    }, NOTIFICATION_POLLING_INTERVAL);
  }, [wsConnected, refreshNotifications]);

  /**
   * Stop polling
   */
  const stopPolling = useCallback(() => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }
  }, []);

  // Initialize hook
  useEffect(() => {
    if (!userId) return;

    // Load initial data
    refreshNotifications();
    loadPreferences();
    loadStats();

    // Connect to WebSocket if enabled
    if (autoConnect) {
      webSocketService.connect(userId);
      
      // Subscribe to WebSocket events
      const unsubscribeNotifications = webSocketService.subscribeToNotifications(handleNewNotification);
      const unsubscribeStatus = webSocketService.subscribeToConnectionStatus(handleConnectionStatus);
      
      // Start polling as fallback
      if (pollingEnabled) {
        startPolling();
      }

      return () => {
        unsubscribeNotifications();
        unsubscribeStatus();
        stopPolling();
      };
    }
  }, [
    userId, 
    autoConnect, 
    pollingEnabled,
    refreshNotifications, 
    loadPreferences, 
    loadStats,
    handleNewNotification,
    handleConnectionStatus,
    startPolling,
    stopPolling
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isComponentMounted.current = false;
      stopPolling();
    };
  }, [stopPolling]);

  return {
    // Data
    notifications,
    unreadCount,
    preferences,
    stats,
    
    // State
    loading,
    error,
    wsConnected,
    
    // Actions
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    bulkDeleteNotifications,
    updatePreferences,
    
    // Utility
    getRecentNotifications,
    searchNotifications,
    exportNotifications,
    requestBrowserPermission
  };
};