import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, CheckCheck, Settings, ExternalLink } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@contexts/AuthContext';
import { formatTimeAgo, getNotificationTypeInfo, getNotificationPriorityInfo } from '@/utils/notificationUtils';
import { Notification, NotificationPriority } from '@/types/notification.types';

interface NotificationDropdownProps {
  className?: string;
  maxItems?: number;
  onClose?: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ 
  className = '', 
  maxItems = 5,
  onClose
}) => {
  const { user } = useAuth();
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    unreadCount,
    getRecentNotifications,
    markAsRead,
    markAllAsRead,
    wsConnected,
    error
  } = useNotifications(user?.id, true, false);

  const recentNotifications = getRecentNotifications(maxItems);

  // Flash effect for new notifications
  useEffect(() => {
    if (unreadCount > 0) {
      setHasNewNotifications(true);
      const timer = setTimeout(() => setHasNewNotifications(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [unreadCount]);

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if unread
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    // Navigate to action URL if available
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }

    onClose?.();
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  return (
    <div 
      ref={dropdownRef}
      className={`bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notifications
          {unreadCount > 0 && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {unreadCount} new
            </span>
          )}
        </h3>
        
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              title="Mark all as read"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all read
            </button>
          )}
          
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            aria-label="Close notifications"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 border-b border-red-100">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Notifications List */}
      <div className="max-h-64 overflow-y-auto">
        {recentNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <h4 className="text-sm font-medium text-gray-900 mb-1">No notifications</h4>
            <p className="text-xs text-gray-500">You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentNotifications.map((notification) => (
              <NotificationDropdownItem
                key={notification.id}
                notification={notification}
                onClick={() => handleNotificationClick(notification)}
                onMarkRead={() => markAsRead(notification.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 p-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              window.location.href = '/notifications';
              onClose?.();
            }}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            View all notifications
            <ExternalLink className="w-3 h-3" />
          </button>
          
          <button
            onClick={() => {
              window.location.href = '/settings/notifications';
              onClose?.();
            }}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
            title="Notification settings"
          >
            <Settings className="w-3 h-3" />
            Settings
          </button>
        </div>
      </div>
    </div>
  );
};

// Individual notification item in dropdown
const NotificationDropdownItem: React.FC<{
  notification: Notification;
  onClick: () => void;
  onMarkRead: () => void;
}> = ({ notification, onClick, onMarkRead }) => {
  const typeInfo = getNotificationTypeInfo(notification.type);
  const priorityInfo = getNotificationPriorityInfo(notification.priority);

  return (
    <div 
      className={`p-4 cursor-pointer transition-colors ${
        notification.read 
          ? 'hover:bg-gray-50' 
          : 'bg-blue-50 hover:bg-blue-100 border-l-4 border-blue-400'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${
          notification.priority === NotificationPriority.CRITICAL 
            ? 'bg-red-100 text-red-600' 
            : notification.priority === NotificationPriority.HIGH
            ? 'bg-orange-100 text-orange-600'
            : notification.read
            ? 'bg-gray-100 text-gray-600'
            : 'bg-blue-100 text-blue-600'
        }`}>
          {typeInfo.icon}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={`text-sm font-medium line-clamp-2 ${
              notification.read ? 'text-gray-700' : 'text-gray-900'
            }`}>
              {notification.title}
            </h4>
            
            {!notification.read && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkRead();
                }}
                className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors flex-shrink-0"
                title="Mark as read"
              >
                <Check className="w-3 h-3" />
              </button>
            )}
          </div>
          
          <p className={`text-xs mt-1 line-clamp-2 ${
            notification.read ? 'text-gray-500' : 'text-gray-700'
          }`}>
            {notification.message}
          </p>
          
          <div className="flex items-center justify-between mt-2">
            <span className={`text-xs ${
              notification.read ? 'text-gray-400' : 'text-blue-600 font-medium'
            }`}>
              {formatTimeAgo(notification.createdAt)}
            </span>
            
            {/* Priority indicator */}
            {notification.priority === NotificationPriority.CRITICAL && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                Critical
              </span>
            )}
            
            {/* Unread indicator */}
            {!notification.read && (
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationDropdown;
