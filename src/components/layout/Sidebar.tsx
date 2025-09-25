import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
  Collapse,
  IconButton,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  Dashboard,
  People,
  Work,
  RequestQuote,
  Approval,
  Payment,
  Assessment,
  Folder,
  Settings,
  ChevronLeft,
  ExpandLess,
  ExpandMore,
  Business,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import { NAVIGATION_ITEMS, THEME_CONFIG, USER_ROLES } from '@constants/app';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  isMobile: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose, isMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Get navigation items based on user role
  const getNavigationItems = () => {
    if (!user?.roles || user.roles.length === 0) return [];
    
    const primaryRole = user.roles[0] as keyof typeof NAVIGATION_ITEMS;
    return NAVIGATION_ITEMS[primaryRole] || [];
  };

  // Icon mapping
  const iconMap: { [key: string]: React.ReactElement } = {
    Dashboard: <Dashboard />,
    People: <People />,
    Work: <Work />,
    RequestQuote: <RequestQuote />,
    Approval: <Approval />,
    Payment: <Payment />,
    Assessment: <Assessment />,
    Folder: <Folder />,
    Settings: <Settings />,
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  const handleExpandClick = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const isActivePath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
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

  const navigationItems = getNavigationItems();

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Sidebar Header */}
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: open ? 'space-between' : 'center',
          px: 2,
          minHeight: THEME_CONFIG.HEADER_HEIGHT,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        {open && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
              <Business />
            </Avatar>
            <Box>
              <Typography variant="h6" noWrap component="div" sx={{ fontSize: '1rem' }}>
                Financial ERP
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                Management System
              </Typography>
            </Box>
          </Box>
        )}
        
        {!isMobile && (
          <Tooltip title={open ? 'Collapse' : 'Expand'}>
            <IconButton onClick={onClose} size="small">
              {open ? <ChevronLeft /> : <Business />}
            </IconButton>
          </Tooltip>
        )}
      </Toolbar>

      {/* User Info Section */}
      {open && (
        <Box
          sx={{
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
            backgroundColor: 'action.hover',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                bgcolor: 'secondary.main',
                width: 40,
                height: 40,
                fontSize: '1rem',
              }}
            >
              {getUserInitials()}
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="subtitle2" noWrap>
                {getUserDisplayName()}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {user?.roles?.[0]?.replace('_', ' ') || 'User'}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {/* Navigation Menu */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <List sx={{ pt: 1 }}>
          {navigationItems.map((item) => (
            <ListItem key={item.path} disablePadding sx={{ display: 'block' }}>
              <Tooltip title={!open ? item.label : ''} placement="right">
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  selected={isActivePath(item.path)}
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                    '&.Mui-selected': {
                      backgroundColor: 'primary.main',
                      color: 'primary.contrastText',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'primary.contrastText',
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : 'auto',
                      justifyContent: 'center',
                    }}
                  >
                    {iconMap[item.icon] || <Dashboard />}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    sx={{
                      opacity: open ? 1 : 0,
                      '& .MuiTypography-root': {
                        fontWeight: isActivePath(item.path) ? 600 : 400,
                      },
                    }}
                  />
                </ListItemButton>
              </Tooltip>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Bottom section with additional info */}
      {open && (
        <Box
          sx={{
            p: 2,
            borderTop: 1,
            borderColor: 'divider',
            backgroundColor: 'background.paper',
          }}
        >
          <Typography variant="caption" color="text.secondary" align="center" display="block">
            © 2025 Financial ERP
          </Typography>
          <Typography variant="caption" color="text.secondary" align="center" display="block">
            Version 1.0.0
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Sidebar;