// src/types/notification.types.ts

export interface Notification {
    id: number;
    title: string;
    message: string;
    type: NotificationType;
    priority: NotificationPriority;
    channel: NotificationChannel;
    read: boolean;
    sent: boolean;
    sentAt?: string;
    createdAt: string;
    userId: number;
    templateData?: Record<string, any>;
    actionUrl?: string;
    metadata?: {
      quotationId?: number;
      projectId?: number;
      paymentId?: number;
      entityType?: string;
      entityId?: number;
    };
  }
  
  export enum NotificationType {
    QUOTATION_SUBMITTED = 'QUOTATION_SUBMITTED',
    QUOTATION_APPROVED = 'QUOTATION_APPROVED',
    QUOTATION_REJECTED = 'QUOTATION_REJECTED',
    BUDGET_WARNING = 'BUDGET_WARNING',
    BUDGET_CRITICAL = 'BUDGET_CRITICAL',
    BUDGET_EXCEEDED = 'BUDGET_EXCEEDED',
    PAYMENT_CREATED = 'PAYMENT_CREATED',
    PAYMENT_COMPLETED = 'PAYMENT_COMPLETED',
    PAYMENT_FAILED = 'PAYMENT_FAILED',
    PROJECT_ASSIGNED = 'PROJECT_ASSIGNED',
    PROJECT_CREATED = 'PROJECT_CREATED',
    PROJECT_UPDATED = 'PROJECT_UPDATED',
    SYSTEM_MAINTENANCE = 'SYSTEM_MAINTENANCE',
    SYSTEM_UPDATE = 'SYSTEM_UPDATE',
    SYSTEM_ERROR = 'SYSTEM_ERROR',
    USER_CREATED = 'USER_CREATED',
    PASSWORD_CHANGED = 'PASSWORD_CHANGED'
  }
  
  export enum NotificationPriority {
    CRITICAL = 'CRITICAL',
    HIGH = 'HIGH',
    MEDIUM = 'MEDIUM',
    LOW = 'LOW',
    NORMAL = 'NORMAL'
  }
  
  export enum NotificationChannel {
    EMAIL = 'EMAIL',
    SMS = 'SMS',
    IN_APP = 'IN_APP',
    PUSH = 'PUSH'
  }
  
  export interface NotificationPreferences {
    id?: number;
    userId: number;
    emailEnabled: boolean;
    smsEnabled: boolean;
    inAppEnabled: boolean;
    pushEnabled: boolean;
    dailySummaryEnabled: boolean;
    weeklySummaryEnabled: boolean;
    doNotDisturbEnabled: boolean;
    doNotDisturbStart?: string; // Time format: "HH:mm"
    doNotDisturbEnd?: string;
    language: 'en' | 'ar';
    timezone: string;
    enabledTypes: NotificationType[];
    enabledChannels: NotificationChannel[];
  }
  
  export interface NotificationFilters {
    type?: NotificationType;
    priority?: NotificationPriority;
    read?: boolean;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
  }
  
  export interface NotificationStats {
    totalCount: number;
    unreadCount: number;
    todayCount: number;
    weekCount: number;
    typeBreakdown: Record<NotificationType, number>;
    priorityBreakdown: Record<NotificationPriority, number>;
  }
  
  // API Response types matching your backend
  export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    timestamp: string;
  }
  
  export interface PaginatedResponse<T> {
    content: T[];
    pageable: {
      page: number;
      size: number;
      sort: string;
    };
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
    numberOfElements: number;
  }
  
  // WebSocket message types
  export interface WebSocketMessage {
    type: 'NOTIFICATION' | 'PING' | 'PONG';
    data?: Notification;
    timestamp: string;
  }
  
  // Notification action types
  export interface NotificationAction {
    label: string;
    action: () => void;
    primary?: boolean;
    destructive?: boolean;
  }
  
  // Export types for easier importing
  export type {
    Notification as NotificationEntity,
    NotificationPreferences as UserNotificationPreferences,
    NotificationFilters as NotificationQueryFilters,
    NotificationStats as NotificationStatistics
  };