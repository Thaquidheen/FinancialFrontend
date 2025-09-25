import React, { useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Button,
  IconButton,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Assignment,
  People,
  CheckCircle,
  Schedule,
  AttachMoney,
  RequestQuote,
  Refresh,
  DateRange,
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useAuth } from '../../contexts/AuthContext';
import { USER_ROLES } from '../../types/auth';
import {
  useRoleDashboard,
  useRefreshDashboard,
} from '../../hooks/useDashboard';
import ActivityFeed from '../../components/dashboard/ActivityFeed';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [dateFilter] = useState<{ startDate?: Date; endDate?: Date }>({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // First day of current month
    endDate: new Date(),
  });

  // Hooks for data fetching
  const { isLoading, error, refetch } = useRoleDashboard({
    startDate: dateFilter.startDate?.toISOString().split('T')[0],
    endDate: dateFilter.endDate?.toISOString().split('T')[0],
  });

  const { refreshAll } = useRefreshDashboard();

  const getUserRole = (): keyof typeof USER_ROLES => {
    const primaryRole = user?.roles?.[0] as keyof typeof USER_ROLES;
    return primaryRole in USER_ROLES ? primaryRole : 'EMPLOYEE';
  };

  const userRole = getUserRole();

  const getRoleDisplayName = () => {
    switch (userRole) {
      case USER_ROLES.SUPER_ADMIN:
        return 'Super Administrator';
      case USER_ROLES.PROJECT_MANAGER:
        return 'Project Manager';
      case USER_ROLES.ACCOUNT_MANAGER:
        return 'Account Manager';
      case USER_ROLES.EMPLOYEE:
        return 'Employee';
      default:
        return 'User';
    }
  };

  const getWelcomeMessage = () => {
    const userName = user?.firstName || user?.username || 'User';
    const currentHour = new Date().getHours();
    let greeting = 'Good morning';
    
    if (currentHour >= 12 && currentHour < 17) {
      greeting = 'Good afternoon';
    } else if (currentHour >= 17) {
      greeting = 'Good evening';
    }

    return `${greeting}, ${userName}!`;
  };

  const handleRefresh = async () => {
    await refreshAll();
    await refetch();
  };

  const renderSuperAdminDashboard = () => {
    return (
      <Grid container spacing={3}>
        {/* Budget Overview */}
        <Grid item xs={12}>
          <Box sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Budget Overview
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Financial dashboard data will be displayed here
            </Typography>
          </Box>
        </Grid>

        {/* Activity Feed */}
        <Grid item xs={12}>
          <ActivityFeed
            activities={[]} // Will be populated with real data
            isLoading={isLoading}
            onRefresh={handleRefresh}
          />
        </Grid>
      </Grid>
    );
  };

  const renderAccountManagerDashboard = () => {
    return (
      <Grid container spacing={3}>
        {/* Financial Metrics */}
        <Grid item xs={12}>
          <Box sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Account Management Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Account management data will be displayed here
            </Typography>
          </Box>
        </Grid>

        {/* Activity Feed */}
        <Grid item xs={12}>
          <ActivityFeed
            activities={[]} // Will be populated with real data
            isLoading={isLoading}
            onRefresh={handleRefresh}
          />
        </Grid>
      </Grid>
    );
  };

  const renderProjectManagerDashboard = () => {
    return (
      <Grid container spacing={3}>
        {/* Project Metrics */}
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2, textAlign: 'center' }}>
            <Assignment sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h6">My Projects</Typography>
            <Typography variant="h4" color="primary">5</Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2, textAlign: 'center' }}>
            <RequestQuote sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
            <Typography variant="h6">Active Quotations</Typography>
            <Typography variant="h4" color="info.main">12</Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2, textAlign: 'center' }}>
            <AttachMoney sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
            <Typography variant="h6">Budget Allocated</Typography>
            <Typography variant="h4" color="success.main">$50K</Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2, textAlign: 'center' }}>
            <People sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
            <Typography variant="h6">Team Members</Typography>
            <Typography variant="h4" color="secondary.main">8</Typography>
          </Box>
        </Grid>

        {/* Activity Feed */}
        <Grid item xs={12}>
          <ActivityFeed
            activities={[]} // Will be populated with real data
            isLoading={isLoading}
            onRefresh={handleRefresh}
          />
        </Grid>
      </Grid>
    );
  };

  const renderEmployeeDashboard = () => {
    return (
      <Grid container spacing={3}>
        {/* Employee Metrics */}
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2, textAlign: 'center' }}>
            <RequestQuote sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h6">My Requests</Typography>
            <Typography variant="h4" color="primary">3</Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2, textAlign: 'center' }}>
            <CheckCircle sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
            <Typography variant="h6">Approved</Typography>
            <Typography variant="h4" color="success.main">8</Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2, textAlign: 'center' }}>
            <Schedule sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
            <Typography variant="h6">Pending</Typography>
            <Typography variant="h4" color="warning.main">2</Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2, textAlign: 'center' }}>
            <AttachMoney sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
            <Typography variant="h6">This Month Total</Typography>
            <Typography variant="h4" color="info.main">$12K</Typography>
          </Box>
        </Grid>

        {/* Activity Feed */}
        <Grid item xs={12}>
          <ActivityFeed
            activities={[]} // Will be populated with real data
            isLoading={isLoading}
            onRefresh={handleRefresh}
          />
        </Grid>
      </Grid>
    );
  };

  const renderDashboardContent = () => {
    if (error) {
      return (
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Retry
            </Button>
          }
        >
          Failed to load dashboard data. Please try again.
        </Alert>
      );
    }

    switch (userRole) {
      case USER_ROLES.SUPER_ADMIN:
        return renderSuperAdminDashboard();
      case USER_ROLES.ACCOUNT_MANAGER:
        return renderAccountManagerDashboard();
      case USER_ROLES.PROJECT_MANAGER:
        return renderProjectManagerDashboard();
      case USER_ROLES.EMPLOYEE:
      default:
        return renderEmployeeDashboard();
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        {/* Page Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          mb: 4,
          gap: 2,
        }}>
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
              Dashboard
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {getWelcomeMessage()}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Welcome to your {getRoleDisplayName()} dashboard
            </Typography>
          </Box>

          {/* Dashboard Controls */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Date Range Filter */}
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <DateRange sx={{ color: 'text.secondary' }} />
              {/* Note: DatePicker would need to be properly implemented with MUI X */}
              <Typography variant="body2" color="text.secondary">
                {dateFilter.startDate?.toLocaleDateString()} - {dateFilter.endDate?.toLocaleDateString()}
              </Typography>
            </Box>

            {/* Refresh Button */}
            <Tooltip title="Refresh Dashboard">
              <IconButton onClick={handleRefresh} disabled={isLoading}>
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Dashboard Content */}
        {renderDashboardContent()}
      </Box>
    </LocalizationProvider>
  );
};

export default DashboardPage;