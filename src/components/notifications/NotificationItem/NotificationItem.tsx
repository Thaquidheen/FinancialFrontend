import React from 'react';
import { Check, CheckCheck, Trash2, ExternalLink } from 'lucide-react';
import { formatTimeAgo, getNotificationTypeInfo, getNotificationPriorityInfo } from '@/utils/notificationUtils';
import { Notification, NotificationPriority } from '@/types/notification.types';

interface NotificationItemProps {
  notification: Notification;
  selected?: boolean;
  onSelect?: () => void;
  onMarkAsRead?: () => void;
  onDelete?: () => void;
  onAction?: () => void;
  showIcon?: boolean;
  showCheckbox?: boolean;
  compact?: boolean;
  className?: string;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  selected = false,
  onSelect,
  onMarkAsRead,
  onDelete,
  onAction,
  showIcon = true,
  showCheckbox = false,
  compact = false,
  className = ''
}) => {
  const typeInfo = getNotificationTypeInfo(notification.type);
  const priorityInfo = getNotificationPriorityInfo(notification.priority);

  const handleClick = () => {
    if (onAction) {
      onAction();
    } else if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkAsRead?.();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.();
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.();
  };

  return (
    <div 
      className={`transition-colors ${
        compact ? 'p-3' : 'p-4'
      } ${
        !notification.read ? 'bg-blue-50 border-l-4 border-blue-400' : 'hover:bg-gray-50'
      } ${className}`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        {showCheckbox && (
          <input
            type="checkbox"
            checked={selected}
            onChange={handleSelect}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
            onClick={handleSelect}
          />
        )}

        {/* Icon */}
        {showIcon && (
          <div className={`${
            compact ? 'w-8 h-8 text-base' : 'w-12 h-12 text-xl'
          } rounded-full flex items-center justify-center flex-shrink-0 ${
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
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className={`${
                compact ? 'text-sm' : 'text-lg'
              } font-medium ${
                notification.read ? 'text-gray-700' : 'text-gray-900'
              }`}>
                {notification.title}
              </h3>
              <p className={`${
                compact ? 'text-xs' : 'text-sm'
              } mt-1 ${
                notification.read ? 'text-gray-500' : 'text-gray-700'
              }`}>
                {notification.message}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {!notification.read && onMarkAsRead && (
                <button
                  onClick={handleMarkAsRead}
                  className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                  title="Mark as read"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
              
              {onDelete && (
                <button
                  onClick={handleDelete}
                  className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors"
                  title="Delete notification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              {notification.actionUrl && (
                <button
                  onClick={handleClick}
                  className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                  title="View details"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Meta information */}
          <div className={`flex items-center justify-between ${
            compact ? 'mt-2' : 'mt-3'
          }`}>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span>{formatTimeAgo(notification.createdAt)}</span>
              
              {notification.priority === NotificationPriority.CRITICAL && (
                <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full">
                  Critical
                </span>
              )}
              
              {notification.priority === NotificationPriority.HIGH && (
                <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                  High Priority
                </span>
              )}

              {notification.priority === NotificationPriority.MEDIUM && (
                <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                  Medium Priority
                </span>
              )}
            </div>

            {!notification.read && (
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
