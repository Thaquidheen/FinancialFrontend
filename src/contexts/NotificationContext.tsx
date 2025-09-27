// src/contexts/NotificationContext.tsx

import React, { createContext, useContext, useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@contexts/AuthContext';
import type {
  Notification,
  NotificationFilters,
  NotificationPreferences,
  NotificationStats
} from '@/types/notification.types';

interface NotificationContextType {
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

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotificationContext = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
  autoConnect?: boolean;
  pollingEnabled?: boolean;
  enableBrowserNotifications?: boolean;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  autoConnect = true,
  pollingEnabled = false,
  enableBrowserNotifications = true
}) => {
  const { user } = useAuth();
  
  const notificationHook = useNotifications(
    user?.id ? Number(user.id) : undefined,
    autoConnect && !!user,
    pollingEnabled
  );

  // Request browser notification permission on mount if enabled
  useEffect(() => {
    if (enableBrowserNotifications && user && 'Notification' in window) {
      if (Notification.permission === 'default') {
        // Don't auto-request permission, let user do it explicitly
        console.log('Browser notifications available but permission not requested');
      }
    }
  }, [user, enableBrowserNotifications]);

  // Show browser notifications for new notifications
  useEffect(() => {
    if (!enableBrowserNotifications || !notificationHook.preferences?.pushEnabled) {
      return;
    }

    // This effect will run when new notifications arrive via WebSocket
    // The actual browser notification display is handled in the useNotifications hook
  }, [enableBrowserNotifications, notificationHook.preferences]);

  const contextValue: NotificationContextType = {
    ...notificationHook
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

// Higher-order component for easier usage
export const withNotifications = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  return (props: P) => (
    <NotificationProvider>
      <Component {...props} />
    </NotificationProvider>
  );
};

// Hook for accessing notifications in components that don't need the full context
export const useNotificationCount = () => {
  const { unreadCount, wsConnected } = useNotificationContext();
  return { unreadCount, wsConnected };
};

// Hook for quick notification actions
export const useNotificationActions = () => {
  const {
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications
  } = useNotificationContext();
  
  return {
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications
  };
};

// Hook for notification preferences
export const useNotificationPreferences = () => {
  const {
    preferences,
    updatePreferences,
    requestBrowserPermission
  } = useNotificationContext();
  
  return {
    preferences,
    updatePreferences,
    requestBrowserPermission
  };
};