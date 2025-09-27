import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
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
  Business,
  Search,
  Home,
  LocalOffer,
  Inventory,
  Percent,
  BarChart,
  AttachMoney,
  Description,
  Groups,
  Bookmark,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import { NAVIGATION_ITEMS, THEME_CONFIG } from '@constants/app';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  isMobile: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose, isMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Get navigation items based on user role
  const getNavigationItems = () => {
    if (!user?.roles || user.roles.length === 0) return [];
    
    const primaryRole = user.roles[0] as keyof typeof NAVIGATION_ITEMS;
    return NAVIGATION_ITEMS[primaryRole] || [];
  };

  // Icon mapping
  const iconMap: { [key: string]: React.ReactElement } = {
    Dashboard: <Home />,
    People: <People />,
    Work: <Work />,
    RequestQuote: <RequestQuote />,
    Approval: <Approval />,
    Payment: <Payment />,
    Assessment: <BarChart />,
    Folder: <Folder />,
    Settings: <Settings />,
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
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
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: '#1a1d29', // Dark blue background
      color: '#ffffff'
    }}>
      {/* Search Bar */}
      {open && (
        <Box sx={{ p: 2, borderBottom: '1px solid #2d3748' }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            backgroundColor: '#2d3748',
            borderRadius: 1,
            px: 2,
            py: 1
          }}>
            <Search sx={{ color: '#a0aec0', mr: 1, fontSize: 20 }} />
            <Typography variant="body2" color="#a0aec0">
              Search
            </Typography>
          </Box>
        </Box>
      )}

      {/* Sidebar Header */}
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: open ? 'space-between' : 'center',
          px: open ? 2 : 1,
          minHeight: THEME_CONFIG.HEADER_HEIGHT,
          borderBottom: '1px solid #2d3748',
          backgroundColor: '#1a1d29',
        }}
      >
        {open ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: '#4a5568', width: 32, height: 32 }}>
              <Business sx={{ color: '#ffffff' }} />
            </Avatar>
            <Box>
              <Typography variant="h6" noWrap component="div" sx={{ fontSize: '1rem', color: '#ffffff' }}>
                Financial ERP
              </Typography>
              <Typography variant="caption" sx={{ color: '#a0aec0' }} noWrap>
                Management System
              </Typography>
            </Box>
          </Box>
        ) : (
          <Tooltip title="Financial ERP - Click to expand">
            <IconButton 
              onClick={onClose} 
              sx={{ 
                p: 0,
                '&:hover': { 
                  bgcolor: '#2d3748',
                  borderRadius: 1
                }
              }}
            >
              <Avatar sx={{ bgcolor: '#4a5568', width: 32, height: 32 }}>
                <Business sx={{ color: '#ffffff' }} />
              </Avatar>
            </IconButton>
          </Tooltip>
        )}
        
        {!isMobile && open && (
          <Tooltip title="Collapse">
            <IconButton onClick={onClose} size="small" sx={{ color: '#a0aec0' }}>
              <ChevronLeft />
            </IconButton>
          </Tooltip>
        )}
      </Toolbar>


      {/* Navigation Menu */}
      <Box sx={{ flex: 1, overflow: 'auto', backgroundColor: '#1a1d29' }}>
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
                    color: '#ffffff',
                    '&:hover': {
                      backgroundColor: '#2d3748',
                    },
                    '&.Mui-selected': {
                      backgroundColor: '#3182ce',
                      color: '#ffffff',
                      '&:hover': {
                        backgroundColor: '#2c5aa0',
                      },
                      '& .MuiListItemIcon-root': {
                        color: '#ffffff',
                      },
                    },
                    '& .MuiListItemIcon-root': {
                      color: '#a0aec0',
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
                    {iconMap[item.icon] || <Home />}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    sx={{
                      opacity: open ? 1 : 0,
                      '& .MuiTypography-root': {
                        fontWeight: isActivePath(item.path) ? 600 : 400,
                        color: 'inherit',
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
            borderTop: '1px solid #2d3748',
            backgroundColor: '#1a1d29',
          }}
        >
          <Typography variant="caption" sx={{ color: '#a0aec0' }} align="center" display="block">
            © 2025 Financial ERP
          </Typography>
          <Typography variant="caption" sx={{ color: '#a0aec0' }} align="center" display="block">
            Version 1.0.0
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Sidebar;