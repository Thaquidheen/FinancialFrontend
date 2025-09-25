import React, { useState } from 'react';
import {
  Toolbar,
  Typography,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Avatar,
  Badge,
  Divider,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  Settings,
  Logout,
  Person,
  Language,
} from '@mui/icons-material';
import { useAuth } from '@contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@constants/app';

interface HeaderProps {
  onMenuClick: () => void;
  sidebarOpen: boolean;
  isMobile: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, sidebarOpen, isMobile }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileMenuAnchor, setProfileMenuAnchor] = useState<null | HTMLElement>(null);
  const [notificationCount] = useState(5); // Mock notification count

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };

  const handleProfileClick = () => {
    navigate(ROUTES.PROFILE);
    handleProfileMenuClose();
  };

  const handleSettingsClick = () => {
    navigate(ROUTES.SETTINGS);
    handleProfileMenuClose();
  };

  const handleLogout = () => {
    logout();
    handleProfileMenuClose();
  };

  const getUserDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.username || 'User';
  };

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }
    return user?.username?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
      {/* Menu button - show on mobile or when sidebar is collapsed */}
      {(isMobile || !sidebarOpen) && (
        <IconButton
          edge="start"
          color="inherit"
          aria-label="open drawer"
          onClick={onMenuClick}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
      )}

      {/* App Title */}
      <Typography
        variant="h6"
        noWrap
        component="div"
        sx={{
          flexGrow: 0,
          display: { xs: 'none', sm: 'block' },
          mr: 4,
        }}
      >
        Financial Management System
      </Typography>

      {/* Spacer */}
      <Box sx={{ flexGrow: 1 }} />

      {/* Header actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* Language toggle (placeholder for future) */}
        <Tooltip title="Language">
          <IconButton color="inherit" size="large">
            <Language />
          </IconButton>
        </Tooltip>

        {/* Notifications */}
        <Tooltip title="Notifications">
          <IconButton color="inherit" size="large">
            <Badge badgeContent={notificationCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* User Profile */}
        <Box sx={{ ml: 1 }}>
          {/* User info - hidden on mobile */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              mr: 2,
            }}
          >
            <Box sx={{ textAlign: 'right', mr: 1 }}>
              <Typography variant="body2" color="inherit" noWrap>
                {getUserDisplayName()}
              </Typography>
              <Typography variant="caption" color="inherit" sx={{ opacity: 0.7 }}>
                {user?.roles?.[0] || 'User'}
              </Typography>
            </Box>
          </Box>

          {/* Profile menu trigger */}
          <Tooltip title="Account">
            <IconButton
              onClick={handleProfileMenuOpen}
              color="inherit"
              size="large"
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: 'secondary.main',
                  fontSize: '0.875rem',
                }}
              >
                {getUserInitials()}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Profile Menu */}
      <Menu
        anchorEl={profileMenuAnchor}
        open={Boolean(profileMenuAnchor)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
            mt: 1.5,
            minWidth: 220,
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* User info in menu */}
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle2" noWrap>
            {getUserDisplayName()}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {user?.email}
          </Typography>
        </Box>

        <MenuItem onClick={handleProfileClick}>
          <ListItemIcon>
            <Person fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Profile" />
        </MenuItem>

        <MenuItem onClick={handleSettingsClick}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </MenuItem>

        <Divider />

        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </MenuItem>
      </Menu>
    </Toolbar>
  );
};

export default Header;