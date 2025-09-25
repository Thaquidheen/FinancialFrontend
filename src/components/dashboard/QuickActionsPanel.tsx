import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Avatar,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add,
  Assignment,
  RequestQuote,
  Approval,
  Payment,
  Assessment,
  People,
  Settings,
  Upload,
  Download,
  Notifications,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import { USER_ROLES, ROUTES } from '@constants/app';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  route?: string;
  onClick?: () => void;
  roles: string[];
}

interface QuickActionsPanelProps {
  onActionClick?: (actionId: string) => void;
}

const QuickActionsPanel: React.FC<QuickActionsPanelProps> = ({ onActionClick }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const quickActions: QuickAction[] = [
    // Super Admin Actions
    {
      id: 'create-user',
      title: 'Create User',
      description: 'Add a new system user',
      icon: People,
      color: 'primary',
      route: ROUTES.USER_CREATE,
      roles: [USER_ROLES.SUPER_ADMIN],
    },
    {
      id: 'system-settings',
      title: 'System Settings',
      description: 'Configure system parameters',
      icon: Settings,
      color: 'info',
      route: ROUTES.SETTINGS,
      roles: [USER_ROLES.SUPER_ADMIN],
    },
    {
      id: 'financial-reports',
      title: 'Financial Reports',
      description: 'Generate comprehensive reports',
      icon: Assessment,
      color: 'success',
      route: ROUTES.REPORTS_FINANCIAL,
      roles: [USER_ROLES.SUPER_ADMIN],
    },

    // Project Manager Actions
    {
      id: 'create-project',
      title: 'Create Project',
      description: 'Start a new project',
      icon: Assignment,
      color: 'primary',
      route: ROUTES.PROJECT_CREATE,
      roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.PROJECT_MANAGER],
    },
    {
      id: 'create-quotation',
      title: 'New Quotation',
      description: 'Submit a quotation request',
      icon: RequestQuote,
      color: 'success',
      route: ROUTES.QUOTATION_CREATE,
      roles: [USER_ROLES.PROJECT_MANAGER, USER_ROLES.EMPLOYEE],
    },
    {
      id: 'my-projects',
      title: 'My Projects',
      description: 'View and manage projects',
      icon: Assignment,
      color: 'info',
      route: ROUTES.PROJECTS,
      roles: [USER_ROLES.PROJECT_MANAGER],
    },

    // Account Manager Actions
    {
      id: 'pending-approvals',
      title: 'Pending Approvals',
      description: 'Review quotation approvals',
      icon: Approval,
      color: 'warning',
      route: ROUTES.APPROVALS,
      roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ACCOUNT_MANAGER],
    },
    {
      id: 'process-payments',
      title: 'Process Payments',
      description: 'Handle payment processing',
      icon: Payment,
      color: 'success',
      route: ROUTES.PAYMENT_PROCESSING,
      roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ACCOUNT_MANAGER],
    },
    {
      id: 'payment-batches',
      title: 'Payment Batches',
      description: 'Manage payment batches',
      icon: Download,
      color: 'info',
      route: ROUTES.PAYMENT_BATCHES,
      roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ACCOUNT_MANAGER],
    },

    // Employee Actions
    {
      id: 'my-quotations',
      title: 'My Requests',
      description: 'View my quotation requests',
      icon: RequestQuote,
      color: 'primary',
      route: ROUTES.QUOTATIONS,
      roles: [USER_ROLES.EMPLOYEE],
    },
    {
      id: 'upload-documents',
      title: 'Upload Documents',
      description: 'Upload supporting documents',
      icon: Upload,
      color: 'info',
      route: ROUTES.DOCUMENTS,
      roles: [USER_ROLES.EMPLOYEE, USER_ROLES.PROJECT_MANAGER],
    },

    // Common Actions
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'View all notifications',
      icon: Notifications,
      color: 'secondary',
      route: ROUTES.NOTIFICATIONS,
      roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.PROJECT_MANAGER, USER_ROLES.ACCOUNT_MANAGER, USER_ROLES.EMPLOYEE],
    },
    {
      id: 'reports',
      title: 'Reports',
      description: 'Generate and view reports',
      icon: Assessment,
      color: 'success',
      route: ROUTES.REPORTS,
      roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.PROJECT_MANAGER, USER_ROLES.ACCOUNT_MANAGER],
    },
  ];

  const getUserActions = () => {
    if (!user?.roles) return [];
    
    return quickActions.filter(action => 
      action.roles.some(role => user.roles?.includes(role))
    );
  };

  const handleActionClick = (action: QuickAction) => {
    if (onActionClick) {
      onActionClick(action.id);
    }

    if (action.onClick) {
      action.onClick();
    } else if (action.route) {
      navigate(action.route);
    }
  };

  const userActions = getUserActions().slice(0, 8); // Show max 8 actions

  return (
    <Card elevation={2}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>

        <Grid container spacing={2}>
          {userActions.map((action) => (
            <Grid item xs={6} sm={4} md={3} key={action.id}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  p: 2,
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                    transform: 'translateY(-2px)',
                  },
                }}
                onClick={() => handleActionClick(action)}
              >
                <Avatar
                  sx={{
                    bgcolor: `${action.color}.main`,
                    mb: 1,
                    width: 48,
                    height: 48,
                  }}
                >
                  <action.icon />
                </Avatar>
                <Typography
                  variant="body2"
                  fontWeight="medium"
                  textAlign="center"
                  sx={{ mb: 0.5 }}
                >
                  {action.title}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  textAlign="center"
                  sx={{ 
                    display: { xs: 'none', md: 'block' },
                    lineHeight: 1.2,
                  }}
                >
                  {action.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Primary Actions as Buttons */}
        <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Grid container spacing={2}>
            {/* Most common action based on role */}
            {user?.roles?.includes(USER_ROLES.PROJECT_MANAGER) && (
              <Grid item xs={12} sm={6}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<Add />}
                  onClick={() => navigate(ROUTES.QUOTATION_CREATE)}
                  sx={{ py: 1.5 }}
                >
                  Create New Quotation
                </Button>
              </Grid>
            )}
            
            {user?.roles?.includes(USER_ROLES.ACCOUNT_MANAGER) && (
              <Grid item xs={12} sm={6}>
                <Button
                  variant="contained"
                  color="warning"