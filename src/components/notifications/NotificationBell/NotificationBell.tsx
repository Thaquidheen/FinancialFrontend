import React, { useState, useEffect, useRef } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@contexts/AuthContext';
import { formatTimeAgo, getNotificationTypeInfo } from '@/utils/notificationUtils';
import { Notification, NotificationPriority } from '@/types/notification.types';
import {
  Notifications as BellIcon,
  Close as XIcon,
  Check as CheckIcon,
  CheckCircle as CheckCheckIcon,
  Settings as SettingsIcon,
  OpenInNew as ExternalLinkIcon
} from '@mui/icons-material';

interface NotificationBellProps {
  className?: string;
  maxDropdownItems?: number;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ 
  className = '', 
  maxDropdownItems = 5 
}) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const {
    unreadCount,
    getRecentNotifications,
    markAsRead,
    markAllAsRead,
    wsConnected,
    error
  } = useNotifications(user?.id ? Number(user.id) : undefined, true, false);

  const recentNotifications = getRecentNotifications(maxDropdownItems);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

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

    setIsOpen(false);
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };


  return (
    <div className={`relative ${className}`}>
      {/* Bell Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-full transition-all duration-200 ${
          isOpen 
            ? 'bg-blue-100 text-blue-600' 
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        } ${hasNewNotifications ? 'animate-pulse' : ''}`}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <BellIcon className={`w-6 h-6 ${hasNewNotifications ? 'animate-bounce' : ''}`} />
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold min-w-[20px] animate-in fade-in slide-in-from-top-1 duration-300">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}

        {/* Connection Status Indicator */}
        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
          wsConnected ? 'bg-green-400' : 'bg-red-400'
        }`} title={wsConnected ? 'Connected' : 'Disconnected'} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div 
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          
          {/* Dropdown Content */}
          <div 
            ref={dropdownRef}
            className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <BellIcon className="w-5 h-5" />
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
                    <CheckCheckIcon className="w-4 h-4" />
                    Mark all read
                  </button>
                )}
                
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  aria-label="Close notifications"
                >
                  <XIcon className="w-4 h-4" />
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
                  <BellIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
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
                    setIsOpen(false);
                  }}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  View all notifications
                  <ExternalLinkIcon className="w-3 h-3" />
                </button>
                
                <button
                  onClick={() => {
                    window.location.href = '/settings/notifications';
                    setIsOpen(false);
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                  title="Notification settings"
                >
                  <SettingsIcon className="w-3 h-3" />
                  Settings
                </button>
              </div>
            </div>
          </div>
        </>
      )}
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
                <CheckIcon className="w-3 h-3" />
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

export default NotificationBell;