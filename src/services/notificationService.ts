// src/services/notificationService.ts

import apiClient from './api';
import type { ApiResponse } from '@/types/api';
import type {
  Notification,
  NotificationPreferences,
  NotificationFilters,
  NotificationStats
} from '@/types/notification.types';
import { NOTIFICATION_ENDPOINTS } from '@/constants/notificationConstants';

class NotificationService {
  /**
   * Get paginated notifications with filters
   */
  async getNotifications(filters: NotificationFilters = {}): Promise<ApiResponse<Notification[]>> {
    try {
      const params = new URLSearchParams();
      
      // Add filter parameters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response = await apiClient.get<Notification[]>(
        `${NOTIFICATION_ENDPOINTS.BASE}?${params.toString()}`
      );
      
      return response;
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      throw error;
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<ApiResponse<number>> {
    try {
      const response = await apiClient.get<number>(NOTIFICATION_ENDPOINTS.UNREAD_COUNT);
      return response;
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
      throw error;
    }
  }

  /**
   * Get notification statistics for dashboard
   */
  async getNotificationStats(): Promise<ApiResponse<NotificationStats>> {
    try {
      const response = await apiClient.get<NotificationStats>(NOTIFICATION_ENDPOINTS.STATS);
      return response;
    } catch (error) {
      console.error('Failed to fetch notification stats:', error);
      throw error;
    }
  }

  /**
   * Mark single notification as read
   */
  async markAsRead(notificationId: number): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.post<void>(
        NOTIFICATION_ENDPOINTS.MARK_READ(notificationId)
      );
      return response;
    } catch (error) {
      console.error(`Failed to mark notification ${notificationId} as read:`, error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.post<void>(NOTIFICATION_ENDPOINTS.MARK_ALL_READ);
      return response;
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Delete a single notification
   */
  async deleteNotification(notificationId: number): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete<void>(
        NOTIFICATION_ENDPOINTS.DELETE(notificationId)
      );
      return response;
    } catch (error) {
      console.error(`Failed to delete notification ${notificationId}:`, error);
      throw error;
    }
  }

  /**
   * Bulk delete multiple notifications
   */
  async bulkDeleteNotifications(notificationIds: number[]): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.post<void>(NOTIFICATION_ENDPOINTS.BULK_DELETE, {
        notificationIds
      });
      return response;
    } catch (error) {
      console.error('Failed to bulk delete notifications:', error);
      throw error;
    }
  }

  /**
   * Get user notification preferences
   */
  async getPreferences(): Promise<ApiResponse<NotificationPreferences>> {
    try {
      const response = await apiClient.get<NotificationPreferences>(
        NOTIFICATION_ENDPOINTS.PREFERENCES
      );
      return response;
    } catch (error) {
      console.error('Failed to fetch notification preferences:', error);
      throw error;
    }
  }

  /**
   * Update user notification preferences
   */
  async updatePreferences(
    preferences: Partial<NotificationPreferences>
  ): Promise<ApiResponse<NotificationPreferences>> {
    try {
      const response = await apiClient.put<NotificationPreferences>(
        NOTIFICATION_ENDPOINTS.PREFERENCES,
        preferences
      );
      return response;
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      throw error;
    }
  }

  /**
   * Get a specific notification by ID
   */
  async getNotificationById(notificationId: number): Promise<ApiResponse<Notification>> {
    try {
      const response = await apiClient.get<Notification>(
        `${NOTIFICATION_ENDPOINTS.BASE}/${notificationId}`
      );
      return response;
    } catch (error) {
      console.error(`Failed to fetch notification ${notificationId}:`, error);
      throw error;
    }
  }

  /**
   * Send a test notification (admin only)
   */
  async sendTestNotification(
    type: string, 
    message: string, 
    userId?: number
  ): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.post<void>(NOTIFICATION_ENDPOINTS.TEST, {
        type,
        message,
        userId
      });
      return response;
    } catch (error) {
      console.error('Failed to send test notification:', error);
      throw error;
    }
  }

  /**
   * Get recent notifications for dropdown (limited count)
   */
  async getRecentNotifications(limit: number = 5): Promise<ApiResponse<Notification[]>> {
    try {
      const filters: NotificationFilters = {
        page: 0,
        size: limit,
        sortBy: 'createdAt',
        sortDir: 'desc'
      };
      
      const response = await this.getNotifications(filters);
      
      // Return the response as is since it's already ApiResponse<Notification[]>
      return response;
    } catch (error) {
      console.error('Failed to fetch recent notifications:', error);
      throw error;
    }
  }

  /**
   * Search notifications by query
   */
  async searchNotifications(
    query: string, 
    filters: NotificationFilters = {}
  ): Promise<ApiResponse<Notification[]>> {
    try {
      const searchFilters = {
        ...filters,
        q: query // Assuming backend supports 'q' parameter for search
      };
      
      return await this.getNotifications(searchFilters);
    } catch (error) {
      console.error('Failed to search notifications:', error);
      throw error;
    }
  }

  /**
   * Export notifications to CSV/Excel (if supported by backend)
   */
  async exportNotifications(
    format: 'csv' | 'excel' = 'csv',
    filters: NotificationFilters = {}
  ): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      
      // Add filter parameters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
      
      params.append('format', format);

      const response = await apiClient.get(
        `${NOTIFICATION_ENDPOINTS.BASE}/export?${params.toString()}`,
        { responseType: 'blob' }
      );
      
      return response.data;
    } catch (error) {
      console.error('Failed to export notifications:', error);
      throw error;
    }
  }

  /**
   * Get notification templates (for admin configuration)
   */
  async getNotificationTemplates(): Promise<ApiResponse<any[]>> {
    try {
      const response = await apiClient.get<any[]>('/api/notification-templates');
      return response;
    } catch (error) {
      console.error('Failed to fetch notification templates:', error);
      throw error;
    }
  }

  /**
   * Update notification template (admin only)
   */
  async updateNotificationTemplate(
    templateId: number, 
    template: any
  ): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.put<any>(
        `/api/notification-templates/${templateId}`,
        template
      );
      return response;
    } catch (error) {
      console.error(`Failed to update notification template ${templateId}:`, error);
      throw error;
    }
  }

  /**
   * Utility: Format notification for display
   */
  formatNotificationForDisplay(notification: Notification): Notification {
    return {
      ...notification,
      // Ensure dates are properly formatted
      createdAt: new Date(notification.createdAt).toISOString(),
      sentAt: notification.sentAt ? new Date(notification.sentAt).toISOString() : undefined,
      // Add computed properties if needed
      actionUrl: notification.actionUrl || this.generateActionUrl(notification)
    };
  }

  /**
   * Utility: Generate action URL based on notification type and metadata
   */
  private generateActionUrl(notification: Notification): string {
    const { type, metadata } = notification;
    
    switch (type) {
      case 'QUOTATION_SUBMITTED':
      case 'QUOTATION_APPROVED':
      case 'QUOTATION_REJECTED':
        return metadata?.quotationId 
          ? `/quotations/${metadata.quotationId}` 
          : '/quotations';
      
      case 'PROJECT_ASSIGNED':
      case 'PROJECT_CREATED':
      case 'PROJECT_UPDATED':
        return metadata?.projectId 
          ? `/projects/${metadata.projectId}` 
          : '/projects';
      
      case 'PAYMENT_CREATED':
      case 'PAYMENT_COMPLETED':
      case 'PAYMENT_FAILED':
        return metadata?.paymentId 
          ? `/payments/${metadata.paymentId}` 
          : '/payments';
      
      case 'BUDGET_WARNING':
      case 'BUDGET_CRITICAL':
      case 'BUDGET_EXCEEDED':
        return metadata?.projectId 
          ? `/projects/${metadata.projectId}/budget` 
          : '/projects';
      
      default:
        return '/notifications';
    }
  }

  /**
   * Utility: Check if browser supports notifications
   */
  isBrowserNotificationSupported(): boolean {
    return 'Notification' in window;
  }

  /**
   * Utility: Request browser notification permission
   */
  async requestBrowserNotificationPermission(): Promise<NotificationPermission> {
    if (!this.isBrowserNotificationSupported()) {
      throw new Error('Browser notifications are not supported');
    }

    if (Notification.permission === 'default') {
      return await Notification.requestPermission();
    }

    return Notification.permission;
  }

  /**
   * Utility: Show browser notification
   */
  showBrowserNotification(notification: Notification): void {
    if (Notification.permission !== 'granted') {
      return;
    }

    const browserNotification = new Notification(notification.title, {
      body: notification.message,
      icon: '/favicon.ico',
      tag: `notification-${notification.id}`,
      requireInteraction: notification.priority === 'CRITICAL',
      silent: notification.priority === 'LOW'
    });

    // Auto-close after 5 seconds for non-critical notifications
    if (notification.priority !== 'CRITICAL') {
      setTimeout(() => {
        browserNotification.close();
      }, 5000);
    }

    // Handle notification click
    browserNotification.onclick = () => {
      window.focus();
      if (notification.actionUrl) {
        window.location.href = notification.actionUrl;
      }
      browserNotification.close();
    };
  }
}

// Export singleton instance
const notificationService = new NotificationService();
export default notificationService;