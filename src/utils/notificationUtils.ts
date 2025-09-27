// src/utils/notificationUtils.ts

import { NotificationType, NotificationPriority, Notification } from '@/types/notification.types';
import { 
  NOTIFICATION_TYPES, 
  NOTIFICATION_PRIORITIES, 
  NOTIFICATION_ACTIONS 
} from '@/constants/notificationConstants';

/**
 * Get notification type information (icon, color, label, etc.)
 */
export const getNotificationTypeInfo = (type: NotificationType) => {
  return NOTIFICATION_TYPES.find(t => t.value === type) || {
    value: type,
    label: type.replace(/_/g, ' '),
    icon: '📢',
    color: 'gray',
    description: 'Unknown notification type'
  };
};

/**
 * Get notification priority information (color, styling, etc.)
 */
export const getNotificationPriorityInfo = (priority: NotificationPriority) => {
  return NOTIFICATION_PRIORITIES.find(p => p.value === priority) || {
    value: priority,
    label: priority,
    color: 'gray',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
    borderColor: 'border-gray-200'
  };
};

/**
 * Format time ago string (e.g., "2h ago", "Yesterday")
 */
export const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths}mo ago`;
  
  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears}y ago`;
};

/**
 * Format full date and time
 */
export const formatDateTime = (dateString: string, options?: Intl.DateTimeFormatOptions): string => {
  const date = new Date(dateString);
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options
  };
  
  return date.toLocaleDateString('en-US', defaultOptions);
};

/**
 * Format date only
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Check if notification should play sound based on priority and preferences
 */
export const shouldPlaySound = (
  priority: NotificationPriority,
  preferences: any
): boolean => {
  if (!preferences?.soundEnabled) return false;
  
  switch (priority) {
    case NotificationPriority.CRITICAL:
      return true; // Always play sound for critical
    case NotificationPriority.HIGH:
      return preferences.soundForHigh !== false;
    case NotificationPriority.MEDIUM:
      return preferences.soundForMedium === true;
    default:
      return preferences.soundForAll === true;
  }
};

/**
 * Generate action URL based on notification type and metadata
 */
export const getActionUrlForNotification = (notification: Notification): string => {
  if (notification.actionUrl) {
    return notification.actionUrl;
  }

  const { type, metadata } = notification;
  
  switch (type) {
    case NotificationType.QUOTATION_SUBMITTED:
    case NotificationType.QUOTATION_APPROVED:
    case NotificationType.QUOTATION_REJECTED:
      return metadata?.quotationId 
        ? `/quotations/${metadata.quotationId}` 
        : '/quotations';
    
    case NotificationType.PROJECT_ASSIGNED:
    case NotificationType.PROJECT_CREATED:
    case NotificationType.PROJECT_UPDATED:
      return metadata?.projectId 
        ? `/projects/${metadata.projectId}` 
        : '/projects';
    
    case NotificationType.PAYMENT_CREATED:
    case NotificationType.PAYMENT_COMPLETED:
    case NotificationType.PAYMENT_FAILED:
      return metadata?.paymentId 
        ? `/payments/${metadata.paymentId}` 
        : '/payments';
    
    case NotificationType.BUDGET_WARNING:
    case NotificationType.BUDGET_CRITICAL:
    case NotificationType.BUDGET_EXCEEDED:
      return metadata?.projectId 
        ? `/projects/${metadata.projectId}/budget` 
        : '/projects';
    
    default:
      return '/notifications';
  }
};

/**
 * Group notifications by date (Today, Yesterday, etc.)
 */
export const groupNotificationsByDate = (notifications: Notification[]): Record<string, Notification[]> => {
  const groups: Record<string, Notification[]> = {};
  
  notifications.forEach(notification => {
    const date = new Date(notification.createdAt);
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    
    let groupKey: string;
    
    if (date.toDateString() === today.toDateString()) {
      groupKey = 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      groupKey = 'Yesterday';
    } else if (date.getTime() > today.getTime() - 7 * 24 * 60 * 60 * 1000) {
      groupKey = date.toLocaleDateString('en-US', { weekday: 'long' });
    } else {
      groupKey = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
    
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(notification);
  });
  
  return groups;
};

/**
 * Get available actions for a notification
 */
export const getNotificationActions = (notification: Notification) => {
  const actions = NOTIFICATION_ACTIONS[notification.type] || [];
  
  return actions.map((action: { label: string; action: string; target?: string }) => ({
    ...action,
    target: action.target?.replace('{projectId}', notification.metadata?.projectId?.toString() || '')
                     .replace('{quotationId}', notification.metadata?.quotationId?.toString() || '')
                     .replace('{paymentId}', notification.metadata?.paymentId?.toString() || '')
  }));
};

/**
 * Filter notifications by various criteria
 */
export const filterNotifications = (
  notifications: Notification[],
  filters: {
    read?: boolean;
    type?: NotificationType;
    priority?: NotificationPriority;
    searchQuery?: string;
    dateFrom?: string;
    dateTo?: string;
  }
): Notification[] => {
  return notifications.filter(notification => {
    // Read/unread filter
    if (filters.read !== undefined && notification.read !== filters.read) {
      return false;
    }
    
    // Type filter
    if (filters.type && notification.type !== filters.type) {
      return false;
    }
    
    // Priority filter
    if (filters.priority && notification.priority !== filters.priority) {
      return false;
    }
    
    // Search query filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const searchableText = `${notification.title} ${notification.message}`.toLowerCase();
      if (!searchableText.includes(query)) {
        return false;
      }
    }
    
    // Date range filter
    if (filters.dateFrom) {
      const notificationDate = new Date(notification.createdAt);
      const fromDate = new Date(filters.dateFrom);
      if (notificationDate < fromDate) {
        return false;
      }
    }
    
    if (filters.dateTo) {
      const notificationDate = new Date(notification.createdAt);
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999); // Include the entire day
      if (notificationDate > toDate) {
        return false;
      }
    }
    
    return true;
  });
};

/**
 * Sort notifications by various criteria
 */
export const sortNotifications = (
  notifications: Notification[],
  sortBy: 'date' | 'priority' | 'type' | 'read',
  sortOrder: 'asc' | 'desc' = 'desc'
): Notification[] => {
  const sorted = [...notifications].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
        
      case 'priority':
        const priorityOrder = {
          [NotificationPriority.CRITICAL]: 4,
          [NotificationPriority.HIGH]: 3,
          [NotificationPriority.MEDIUM]: 2,
          [NotificationPriority.LOW]: 1,
          [NotificationPriority.NORMAL]: 1
        };
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
        break;
        
      case 'type':
        comparison = a.type.localeCompare(b.type);
        break;
        
      case 'read':
        comparison = Number(a.read) - Number(b.read);
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });
  
  return sorted;
};

/**
 * Check if notification is in "Do Not Disturb" period
 */
export const isInDoNotDisturbPeriod = (
  _notification: Notification, // Currently unused but kept for future extensibility
  doNotDisturbStart?: string,
  doNotDisturbEnd?: string
): boolean => {
  if (!doNotDisturbStart || !doNotDisturbEnd) return false;
  
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  const [startHour, startMin] = doNotDisturbStart.split(':').map(Number);
  const [endHour, endMin] = doNotDisturbEnd.split(':').map(Number);
  
  const startTime = startHour * 60 + startMin;
  const endTime = endHour * 60 + endMin;
  
  // Handle overnight periods (e.g., 22:00 to 08:00)
  if (startTime > endTime) {
    return currentTime >= startTime || currentTime <= endTime;
  }
  
  return currentTime >= startTime && currentTime <= endTime;
};

/**
 * Get notification statistics
 */
export const getNotificationStatistics = (notifications: Notification[]) => {
  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.read).length,
    byType: {} as Record<NotificationType, number>,
    byPriority: {} as Record<NotificationPriority, number>,
    todayCount: 0,
    weekCount: 0
  };
  
  const today = new Date();
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  notifications.forEach(notification => {
    // Count by type
    stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1;
    
    // Count by priority
    stats.byPriority[notification.priority] = (stats.byPriority[notification.priority] || 0) + 1;
    
    const notificationDate = new Date(notification.createdAt);
    
    // Count today's notifications
    if (notificationDate >= todayStart) {
      stats.todayCount++;
    }
    
    // Count this week's notifications
    if (notificationDate >= weekAgo) {
      stats.weekCount++;
    }
  });
  
  return stats;
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Debounce function for search inputs
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: number;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};