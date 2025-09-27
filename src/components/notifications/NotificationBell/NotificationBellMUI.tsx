import React, { useState, useEffect, useRef } from 'react';
import {
  IconButton,
  Badge,
  Tooltip,
  Popover,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Typography,
  Box,
  Button,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Check,
  CheckCircle,
  Settings,
  OpenInNew,
  Refresh
} from '@mui/icons-material';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@contexts/AuthContext';
import { formatTimeAgo, getNotificationTypeInfo, getNotificationPriorityInfo } from '@/utils/notificationUtils';
import { Notification, NotificationPriority } from '@/types/notification.types';

interface NotificationBellMUIProps {
  className?: string;
  maxDropdownItems?: number;
}

const NotificationBellMUI: React.FC<NotificationBellMUIProps> = ({ 
  className = '', 
  maxDropdownItems = 5 
}) => {
  const { user } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);

  const {
    unreadCount,
    getRecentNotifications,
    markAsRead,
    markAllAsRead,
    wsConnected,
    error,
    loading
  } = useNotifications(user?.id, true, false);

  const recentNotifications = getRecentNotifications(maxDropdownItems);
  const open = Boolean(anchorEl);

  // Flash effect for new notifications
  useEffect(() => {
    if (unreadCount > 0) {
      setHasNewNotifications(true);
      const timer = setTimeout(() => setHasNewNotifications(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [unreadCount]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if unread
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    // Navigate to action URL if available
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }

    handleClose();
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    handleClose();
  };

  const formatNotificationIcon = (notification: Notification) => {
    const typeInfo = getNotificationTypeInfo(notification.type);
    
    return (
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.2rem',
          backgroundColor: 
            notification.priority === NotificationPriority.CRITICAL 
              ? 'error.light' 
              : notification.priority === NotificationPriority.HIGH
              ? 'warning.light'
              : notification.read
              ? 'grey.200'
              : 'primary.light',
          color: 
            notification.priority === NotificationPriority.CRITICAL 
              ? 'error.main' 
              : notification.priority === NotificationPriority.HIGH
              ? 'warning.main'
              : notification.read
              ? 'grey.600'
              : 'primary.main'
        }}
      >
        {typeInfo.icon}
      </Box>
    );
  };

  return (
    <>
      {/* Bell Button */}
      <Tooltip title={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}>
        <IconButton
          onClick={handleClick}
          color="inherit"
          size="large"
          sx={{ 
            color: '#a0aec0',
            '&:hover': {
              backgroundColor: '#2d3748',
              color: '#ffffff',
            },
            ...(hasNewNotifications && {
              animation: 'pulse 1s infinite',
            })
          }}
        >
          <Badge
            badgeContent={unreadCount}
            color="error"
            overlap="circular"
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      {/* Connection Status Indicator */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: 12,
          height: 12,
          borderRadius: '50%',
          border: '2px solid white',
          backgroundColor: wsConnected ? '#4ade80' : '#ef4444'
        }}
        title={wsConnected ? 'Connected' : 'Disconnected'}
      />

      {/* Popover */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 400,
            maxHeight: 500,
            mt: 1,
            overflow: 'visible',
            filter: 'drop-shadow(0px 4px 12px rgba(0,0,0,0.3))',
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderBottom: 'none',
              borderRight: 'none',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
      >
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <NotificationsIcon color="primary" />
              <Typography variant="h6" component="h3">
                Notifications
              </Typography>
              {unreadCount > 0 && (
                <Chip
                  label={`${unreadCount} new`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {unreadCount > 0 && (
                <Button
                  size="small"
                  startIcon={<CheckCircle />}
                  onClick={handleMarkAllRead}
                  sx={{ textTransform: 'none' }}
                >
                  Mark all read
                </Button>
              )}
            </Box>
          </Box>
        </Box>

        {/* Error State */}
        {error && (
          <Box sx={{ p: 2, bgcolor: 'error.light', borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          </Box>
        )}

        {/* Notifications List */}
        <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : recentNotifications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <NotificationsIcon sx={{ fontSize: 48, color: 'grey.300', mb: 1 }} />
              <Typography variant="h6" color="textSecondary" gutterBottom>
                No notifications
              </Typography>
              <Typography variant="body2" color="textSecondary">
                You're all caught up!
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {recentNotifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <NotificationListItem
                    notification={notification}
                    onClick={() => handleNotificationClick(notification)}
                    onMarkRead={() => markAsRead(notification.id)}
                  />
                  {index < recentNotifications.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>

        {/* Footer */}
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              size="small"
              endIcon={<OpenInNew />}
              onClick={() => {
                window.location.href = '/notifications';
                handleClose();
              }}
              sx={{ textTransform: 'none' }}
            >
              View all notifications
            </Button>
            
            <Button
              size="small"
              startIcon={<Settings />}
              onClick={() => {
                window.location.href = '/settings/notifications';
                handleClose();
              }}
              sx={{ textTransform: 'none', color: 'text.secondary' }}
            >
              Settings
            </Button>
          </Box>
        </Box>
      </Popover>
    </>
  );
};

// Individual notification item in the list
const NotificationListItem: React.FC<{
  notification: Notification;
  onClick: () => void;
  onMarkRead: () => void;
}> = ({ notification, onClick, onMarkRead }) => {
  const typeInfo = getNotificationTypeInfo(notification.type);

  return (
    <ListItem
      button
      onClick={onClick}
      sx={{
        backgroundColor: notification.read ? 'transparent' : 'primary.light',
        borderLeft: notification.read ? 'none' : 4,
        borderColor: 'primary.main',
        '&:hover': {
          backgroundColor: notification.read ? 'action.hover' : 'primary.light',
        },
      }}
    >
      <ListItemIcon>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            backgroundColor: 
              notification.priority === NotificationPriority.CRITICAL 
                ? 'error.light' 
                : notification.priority === NotificationPriority.HIGH
                ? 'warning.light'
                : notification.read
                ? 'grey.200'
                : 'primary.light',
            color: 
              notification.priority === NotificationPriority.CRITICAL 
                ? 'error.main' 
                : notification.priority === NotificationPriority.HIGH
                ? 'warning.main'
                : notification.read
                ? 'grey.600'
                : 'primary.main'
          }}
        >
          {typeInfo.icon}
        </Box>
      </ListItemIcon>
      
      <ListItemText
        primary={
          <Typography
            variant="body2"
            sx={{
              fontWeight: notification.read ? 400 : 600,
              color: notification.read ? 'text.secondary' : 'text.primary',
            }}
          >
            {notification.title}
          </Typography>
        }
        secondary={
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mb: 0.5 }}
            >
              {notification.message}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {formatTimeAgo(notification.createdAt)}
              </Typography>
              {notification.priority === NotificationPriority.CRITICAL && (
                <Chip
                  label="Critical"
                  size="small"
                  color="error"
                  variant="outlined"
                />
              )}
              {!notification.read && (
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: 'primary.main',
                  }}
                />
              )}
            </Box>
          </Box>
        }
      />
      
      {!notification.read && (
        <ListItemSecondaryAction>
          <IconButton
            edge="end"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onMarkRead();
            }}
            sx={{ color: 'primary.main' }}
          >
            <Check />
          </IconButton>
        </ListItemSecondaryAction>
      )}
    </ListItem>
  );
};

export default NotificationBellMUI;
