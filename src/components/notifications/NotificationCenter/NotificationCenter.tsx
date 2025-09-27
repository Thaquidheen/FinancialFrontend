import React, { useState, useEffect } from 'react';
import { Bell, Filter, Search, CheckCheck, Trash2, RefreshCw } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@contexts/AuthContext';
import { formatTimeAgo, getNotificationTypeInfo, getNotificationPriorityInfo } from '@/utils/notificationUtils';
import { Notification, NotificationPriority, NotificationFilters } from '@/types/notification.types';

interface NotificationCenterProps {
  className?: string;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [filters, setFilters] = useState<NotificationFilters>({
    read: null,
    priority: null,
    type: null,
    dateRange: null
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>([]);

  const {
    notifications,
    unreadCount,
    loading,
    error,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    bulkDeleteNotifications,
    searchNotifications
  } = useNotifications(user?.id, true, false);

  // Filter notifications based on current filters
  const filteredNotifications = notifications.filter(notification => {
    if (filters.read !== null && notification.read !== filters.read) return false;
    if (filters.priority && notification.priority !== filters.priority) return false;
    if (filters.type && notification.type !== filters.type) return false;
    if (searchQuery && !notification.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !notification.message.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleSelectNotification = (id: number) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(nId => nId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  const handleBulkMarkAsRead = async () => {
    for (const id of selectedNotifications) {
      await markAsRead(id);
    }
    setSelectedNotifications([]);
  };

  const handleBulkDelete = async () => {
    await bulkDeleteNotifications(selectedNotifications);
    setSelectedNotifications([]);
  };

  const formatNotificationIcon = (notification: Notification) => {
    const typeInfo = getNotificationTypeInfo(notification.type);
    
    return (
      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
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
    );
  };

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            {unreadCount > 0 && (
              <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                {unreadCount} unread
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => refreshNotifications(filters)}
              disabled={loading}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh notifications"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <CheckCheck className="w-4 h-4" />
                Mark all read
              </button>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mt-4 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={filters.read === null ? '' : filters.read ? 'read' : 'unread'}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                read: e.target.value === '' ? null : e.target.value === 'read' 
              }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
            
            <select
              value={filters.priority || ''}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                priority: e.target.value || null 
              }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedNotifications.length > 0 && (
        <div className="p-4 bg-blue-50 border-b border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {selectedNotifications.length} notification{selectedNotifications.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleBulkMarkAsRead}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
              >
                Mark as read
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div className="divide-y divide-gray-200">
        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-8 h-8 mx-auto text-gray-400 animate-spin mb-2" />
            <p className="text-gray-500">Loading notifications...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-600 mb-2">Error loading notifications</p>
            <p className="text-sm text-gray-500">{error}</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No notifications</h3>
            <p className="text-gray-500">
              {searchQuery || Object.values(filters).some(f => f !== null) 
                ? 'No notifications match your filters' 
                : 'You\'re all caught up!'}
            </p>
          </div>
        ) : (
          <>
            {/* Select All */}
            <div className="p-4 border-b border-gray-100">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Select all</span>
              </label>
            </div>

            {/* Notifications */}
            {filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                selected={selectedNotifications.includes(notification.id)}
                onSelect={() => handleSelectNotification(notification.id)}
                onMarkAsRead={() => markAsRead(notification.id)}
                onDelete={() => deleteNotification(notification.id)}
                showIcon={true}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

// Individual notification item component
const NotificationItem: React.FC<{
  notification: Notification;
  selected: boolean;
  onSelect: () => void;
  onMarkAsRead: () => void;
  onDelete: () => void;
  showIcon?: boolean;
}> = ({ notification, selected, onSelect, onMarkAsRead, onDelete, showIcon = false }) => {
  const typeInfo = getNotificationTypeInfo(notification.type);
  const priorityInfo = getNotificationPriorityInfo(notification.priority);

  return (
    <div className={`p-4 hover:bg-gray-50 transition-colors ${
      !notification.read ? 'bg-blue-50 border-l-4 border-blue-400' : ''
    }`}>
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={selected}
          onChange={onSelect}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
        />

        {/* Icon */}
        {showIcon && (
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl flex-shrink-0 ${
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
              <h3 className={`text-lg font-medium ${
                notification.read ? 'text-gray-700' : 'text-gray-900'
              }`}>
                {notification.title}
              </h3>
              <p className={`text-sm mt-1 ${
                notification.read ? 'text-gray-500' : 'text-gray-700'
              }`}>
                {notification.message}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {!notification.read && (
                <button
                  onClick={onMarkAsRead}
                  className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                  title="Mark as read"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
              
              <button
                onClick={onDelete}
                className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors"
                title="Delete notification"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Meta information */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>{formatTimeAgo(notification.createdAt)}</span>
              
              {notification.priority === NotificationPriority.CRITICAL && (
                <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs">
                  Critical
                </span>
              )}
              
              {notification.priority === NotificationPriority.HIGH && (
                <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs">
                  High Priority
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

export default NotificationCenter;
