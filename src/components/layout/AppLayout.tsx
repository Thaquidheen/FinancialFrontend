import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  useTheme,
  useMediaQuery,
  CssBaseline,
} from '@mui/material';
import { THEME_CONFIG } from '@constants/app';
import Sidebar from './Sidebar';
import Header from './Header';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  const drawerWidth = sidebarOpen ? THEME_CONFIG.DRAWER_WIDTH : THEME_CONFIG.DRAWER_WIDTH_COLLAPSED;

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* Header */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          width: isMobile ? '100%' : `calc(100% - ${drawerWidth}px)`,
          backgroundColor: '#1a1d29', // Dark blue background to match sidebar
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Header 
          onMenuClick={handleSidebarToggle}
          sidebarOpen={sidebarOpen}
          isMobile={isMobile}
        />
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        {...(isMobile ? { open: sidebarOpen, onClose: handleSidebarClose } : {})}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            overflowX: 'hidden',
            backgroundColor: '#1a1d29', // Dark blue background
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            borderRight: 'none',
          },
        }}
      >
        <Sidebar 
          open={sidebarOpen}
          onClose={handleSidebarClose}
          isMobile={isMobile}
        />
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: isMobile ? '100%' : `calc(100% - ${drawerWidth}px)`,
          minHeight: '100vh',
          backgroundColor: theme.palette.background.default,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        {/* Toolbar spacer without horizontal padding to avoid left gap */}
        <Toolbar sx={{ px: 0, minHeight: THEME_CONFIG.HEADER_HEIGHT }} />
        
        {/* Page content */}
        <Box
          sx={{
            padding: 0,
            maxWidth: '100%',
            overflow: 'auto',
            minHeight: 'calc(100vh - 64px)', // Account for header height
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default AppLayout;
