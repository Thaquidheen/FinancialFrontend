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
    <Toolbar
      sx={{
        px: { xs: 2.5, sm: 4 },
        minHeight: 64,
        alignItems: 'center',
        backgroundColor: '#1a1d29', // Dark blue background to match sidebar
        color: '#ffffff',
        borderBottom: '1px solid #2d3748',
      }}
    >
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
        }}
      >
      {/* Menu button - show on mobile or when sidebar is collapsed */}
      {(isMobile || !sidebarOpen) && (
        <IconButton
          edge="start"
          color="inherit"
          aria-label="open drawer"
          onClick={onMenuClick}
          sx={{ 
            mr: 2,
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#2d3748',
            }
          }}
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
          display: { xs: 'block', sm: 'block' },
          mr: { xs: 2, sm: 4 },
          maxWidth: { xs: '45vw', sm: 'unset' },
          color: '#ffffff',
          fontWeight: 600,
        }}
      >
        Financial Management System
      </Typography>

      {/* Spacer */}
      <Box sx={{ flexGrow: 1 }} />

      {/* Header actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, md: 1.25 } }}>
        {/* Language toggle (placeholder for future) */}
        <Tooltip title="Language">
          <IconButton 
            color="inherit" 
            size="large"
            sx={{ 
              color: '#a0aec0',
              '&:hover': {
                backgroundColor: '#2d3748',
                color: '#ffffff',
              }
            }}
          >
            <Language />
          </IconButton>
        </Tooltip>

        {/* Notifications */}
        <Tooltip title="Notifications">
          <IconButton 
            color="inherit" 
            size="large"
            sx={{ 
              color: '#a0aec0',
              '&:hover': {
                backgroundColor: '#2d3748',
                color: '#ffffff',
              }
            }}
          >
            <Badge
              badgeContent={notificationCount}
              color="error"
              overlap="circular"
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
           >
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* User Profile */}
        <Box sx={{ ml: { xs: 0.5, md: 1 } }}>
          {/* User info - hidden on mobile */}
          {/* <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              mr: 1.5,
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
          </Box> */}

          {/* Profile menu trigger */}
          <Tooltip title="Account">
            <IconButton
              onClick={handleProfileMenuOpen}
              color="inherit"
              size="large"
              sx={{ 
                '&:hover': {
                  backgroundColor: '#2d3748',
                }
              }}
            >
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: '#4a5568',
                  fontSize: '0.9rem',
                  color: '#ffffff',
                  border: '2px solid #2d3748',
                }}
              >
                {getUserInitials()}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      </Box>

      {/* Profile Menu */}
      <Menu
        anchorEl={profileMenuAnchor}
        open={Boolean(profileMenuAnchor)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        PaperProps={{
          elevation: 8,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 4px 12px rgba(0,0,0,0.3))',
            mt: 1.5,
            minWidth: 220,
            backgroundColor: '#1a1d29',
            border: '1px solid #2d3748',
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: '#1a1d29',
              border: '1px solid #2d3748',
              borderBottom: 'none',
              borderRight: 'none',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* User info in menu */}
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #2d3748' }}>
          <Typography variant="subtitle2" noWrap sx={{ color: '#ffffff' }}>
            {getUserDisplayName()}
          </Typography>
          <Typography variant="body2" noWrap sx={{ color: '#a0aec0' }}>
            {user?.email}
          </Typography>
        </Box>

        <MenuItem 
          onClick={handleProfileClick}
          sx={{ 
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#2d3748',
            },
            '& .MuiListItemIcon-root': {
              color: '#a0aec0',
            }
          }}
        >
          <ListItemIcon>
            <Person fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Profile" />
        </MenuItem>

        <MenuItem 
          onClick={handleSettingsClick}
          sx={{ 
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#2d3748',
            },
            '& .MuiListItemIcon-root': {
              color: '#a0aec0',
            }
          }}
        >
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </MenuItem>

        <Divider sx={{ borderColor: '#2d3748' }} />

        <MenuItem 
          onClick={handleLogout}
          sx={{ 
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#2d3748',
            },
            '& .MuiListItemIcon-root': {
              color: '#a0aec0',
            }
          }}
        >
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