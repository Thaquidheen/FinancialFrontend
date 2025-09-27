// src/constants/notificationConstants.ts

import { NotificationType, NotificationPriority, NotificationChannel } from '@/types/notification.types';

export const NOTIFICATION_TYPES = [
  { 
    value: NotificationType.QUOTATION_SUBMITTED, 
    label: 'Quotation Submitted', 
    icon: '📝',
    color: 'blue'
  },
  { 
    value: NotificationType.QUOTATION_APPROVED, 
    label: 'Quotation Approved', 
    icon: '✅',
    color: 'green'
  },
  { 
    value: NotificationType.QUOTATION_REJECTED, 
    label: 'Quotation Rejected', 
    icon: '❌',
    color: 'red'
  },
  { 
    value: NotificationType.BUDGET_WARNING, 
    label: 'Budget Warning', 
    icon: '⚠️',
    color: 'yellow'
  },
  { 
    value: NotificationType.BUDGET_CRITICAL, 
    label: 'Budget Critical', 
    icon: '🚨',
    color: 'orange'
  },
  { 
    value: NotificationType.BUDGET_EXCEEDED, 
    label: 'Budget Exceeded', 
    icon: '🔴',
    color: 'red'
  },
  { 
    value: NotificationType.PAYMENT_CREATED, 
    label: 'Payment Created', 
    icon: '💰',
    color: 'blue'
  },
  { 
    value: NotificationType.PAYMENT_COMPLETED, 
    label: 'Payment Completed', 
    icon: '✅',
    color: 'green'
  },
  { 
    value: NotificationType.PAYMENT_FAILED, 
    label: 'Payment Failed', 
    icon: '❌',
    color: 'red'
  },
  { 
    value: NotificationType.PROJECT_ASSIGNED, 
    label: 'Project Assigned', 
    icon: '👤',
    color: 'blue'
  },
  { 
    value: NotificationType.PROJECT_CREATED, 
    label: 'Project Created', 
    icon: '🏗️',
    color: 'green'
  },
  { 
    value: NotificationType.PROJECT_UPDATED, 
    label: 'Project Updated', 
    icon: '🔄',
    color: 'blue'
  },
  { 
    value: NotificationType.SYSTEM_MAINTENANCE, 
    label: 'System Maintenance', 
    icon: '🔧',
    color: 'gray'
  },
  { 
    value: NotificationType.SYSTEM_UPDATE, 
    label: 'System Update', 
    icon: '🆙',
    color: 'blue'
  },
  { 
    value: NotificationType.SYSTEM_ERROR, 
    label: 'System Error', 
    icon: '💥',
    color: 'red'
  }
];

export const NOTIFICATION_PRIORITIES = [
  { value: NotificationPriority.CRITICAL, label: 'Critical', color: 'red' },
  { value: NotificationPriority.HIGH, label: 'High', color: 'orange' },
  { value: NotificationPriority.MEDIUM, label: 'Medium', color: 'blue' },
  { value: NotificationPriority.LOW, label: 'Low', color: 'gray' },
  { value: NotificationPriority.NORMAL, label: 'Normal', color: 'gray' }
];

export const NOTIFICATION_CHANNELS = [
  { value: NotificationChannel.EMAIL, label: 'Email', icon: '📧' },
  { value: NotificationChannel.SMS, label: 'SMS', icon: '📱' },
  { value: NotificationChannel.IN_APP, label: 'In-App', icon: '🔔' },
  { value: NotificationChannel.PUSH, label: 'Push', icon: '📬' }
];

export const NOTIFICATION_SOUNDS = {
  [NotificationPriority.CRITICAL]: '/assets/sounds/critical.mp3',
  [NotificationPriority.HIGH]: '/assets/sounds/notification.mp3',
  [NotificationPriority.MEDIUM]: '/assets/sounds/notification.mp3',
  [NotificationPriority.LOW]: '/assets/sounds/success.mp3',
  [NotificationPriority.NORMAL]: '/assets/sounds/success.mp3'
};

export const DEFAULT_NOTIFICATION_PREFERENCES = {
  emailEnabled: true,
  smsEnabled: false,
  inAppEnabled: true,
  pushEnabled: true,
  dailySummaryEnabled: true,
  weeklySummaryEnabled: false,
  doNotDisturbEnabled: false,
  doNotDisturbStart: '22:00',
  doNotDisturbEnd: '08:00',
  language: 'en' as const,
  timezone: 'Asia/Riyadh',
  enabledTypes: Object.values(NotificationType),
  enabledChannels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL]
};

export const SAUDI_TIMEZONES = [
  { value: 'Asia/Riyadh', label: 'Riyadh (GMT+3)' },
  { value: 'Asia/Kuwait', label: 'Kuwait (GMT+3)' },
  { value: 'Asia/Bahrain', label: 'Bahrain (GMT+3)' },
  { value: 'Asia/Qatar', label: 'Qatar (GMT+3)' },
  { value: 'Asia/Dubai', label: 'Dubai (GMT+4)' },
  { value: 'UTC', label: 'UTC (GMT+0)' }
];

export const NOTIFICATION_POLLING_INTERVAL = 30000; // 30 seconds
export const NOTIFICATION_DISPLAY_DURATION = 5000; // 5 seconds for toast
export const MAX_NOTIFICATIONS_IN_DROPDOWN = 5;
export const DEFAULT_PAGE_SIZE = 20;

// API Endpoints
export const NOTIFICATION_ENDPOINTS = {
  BASE: '/notifications',
  UNREAD_COUNT: '/notifications/unread-count',
  STATS: '/notifications/stats',
  PREFERENCES: '/notifications/preferences',
  MARK_READ: (id: number) => `/notifications/${id}/mark-read`,
  MARK_ALL_READ: '/notifications/mark-all-read',
  DELETE: (id: number) => `/notifications/${id}`,
  BULK_DELETE: '/notifications/bulk-delete',
  TEST: '/notifications/test',
  EXPORT: '/notifications/export'
};

// WebSocket Events
export const WS_EVENTS = {
  NOTIFICATION: 'notification',
  CONNECTION_STATUS: 'connection_status',
  PING: 'ping',
  PONG: 'pong',
  ERROR: 'error'
};

// WebSocket Settings
export const NOTIFICATION_SETTINGS = {
  WS_MAX_RECONNECT_ATTEMPTS: 5,
  WS_RECONNECT_INTERVAL: 5000, // 5 seconds
  POLLING_INTERVAL: NOTIFICATION_POLLING_INTERVAL
};

// Notification Actions
export const NOTIFICATION_ACTIONS: Record<NotificationType, Array<{ label: string; action: string; target?: string }>> = {
  [NotificationType.QUOTATION_SUBMITTED]: [
    { label: 'View Quotation', action: 'view', target: '/quotations/{quotationId}' },
    { label: 'Approve', action: 'approve', target: '/quotations/{quotationId}/approve' }
  ],
  [NotificationType.QUOTATION_APPROVED]: [
    { label: 'View Quotation', action: 'view', target: '/quotations/{quotationId}' }
  ],
  [NotificationType.QUOTATION_REJECTED]: [
    { label: 'View Quotation', action: 'view', target: '/quotations/{quotationId}' },
    { label: 'Edit', action: 'edit', target: '/quotations/{quotationId}/edit' }
  ],
  [NotificationType.PROJECT_ASSIGNED]: [
    { label: 'View Project', action: 'view', target: '/projects/{projectId}' }
  ],
  [NotificationType.PROJECT_CREATED]: [
    { label: 'View Project', action: 'view', target: '/projects/{projectId}' }
  ],
  [NotificationType.PROJECT_UPDATED]: [
    { label: 'View Project', action: 'view', target: '/projects/{projectId}' }
  ],
  [NotificationType.PAYMENT_CREATED]: [
    { label: 'View Payment', action: 'view', target: '/payments/{paymentId}' }
  ],
  [NotificationType.PAYMENT_COMPLETED]: [
    { label: 'View Payment', action: 'view', target: '/payments/{paymentId}' }
  ],
  [NotificationType.PAYMENT_FAILED]: [
    { label: 'View Payment', action: 'view', target: '/payments/{paymentId}' },
    { label: 'Retry', action: 'retry', target: '/payments/{paymentId}/retry' }
  ],
  [NotificationType.BUDGET_WARNING]: [
    { label: 'View Project', action: 'view', target: '/projects/{projectId}/budget' }
  ],
  [NotificationType.BUDGET_CRITICAL]: [
    { label: 'View Project', action: 'view', target: '/projects/{projectId}/budget' }
  ],
  [NotificationType.BUDGET_EXCEEDED]: [
    { label: 'View Project', action: 'view', target: '/projects/{projectId}/budget' }
  ],
  [NotificationType.SYSTEM_MAINTENANCE]: [
    { label: 'Learn More', action: 'info', target: '/system/status' }
  ],
  [NotificationType.SYSTEM_UPDATE]: [
    { label: 'Learn More', action: 'info', target: '/system/updates' }
  ],
  [NotificationType.SYSTEM_ERROR]: [
    { label: 'Report Issue', action: 'report', target: '/support' }
  ],
  [NotificationType.USER_CREATED]: [
    { label: 'View User', action: 'view', target: '/users/{userId}' }
  ],
  [NotificationType.PASSWORD_CHANGED]: [
    { label: 'Security Settings', action: 'settings', target: '/profile/security' }
  ]
};