import React, { useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Alert,
  Skeleton,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  DatePicker,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp,
  AccountBalance,
  Assignment,
  People,
  CheckCircle,
  Schedule,
  Warning,
  AttachMoney,
  RequestQuote,
  Approval,
  Refresh,
  DateRange,
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useAuth } from '@contexts/AuthContext';
import { USER_ROLES } from '@constants/app';
import {
  useRoleDashboard,
  useRefreshDashboard,
  useDashboardAnalytics,
} from '@hooks/useDashboard';
import { MetricsCard, BudgetMetrics, ApprovalMetrics, PaymentMetrics } from '@components/dashboard/MetricsCards';
import ActivityFeed from '@components/dashboard/ActivityFeed';
import {
  BudgetUtilizationChart,
  SpendingTrendsChart,
  CategorySpendingChart,
  ApprovalMetricsChart,
  PaymentProcessingChart,
} from '@components/dashboard/DashboardCharts';
import { formatCurrency } from '@utils/helpers';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [dateFilter, setDateFilter] = useState<{ startDate?: Date; endDate?: Date }>({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // First day of current month
    endDate: new Date(),
  });
  const [refreshKey, setRefreshKey] = useState(0);

  // Hooks for data fetching
  const { data: dashboardData, isLoading, error, refetch } = useRoleDashboard({
    startDate: dateFilter.startDate?.toISOString().split('T')[0],
    endDate: dateFilter.endDate?.toISOString().split('T')[0],
  });

  const { data: analyticsData, isLoading: analyticsLoading } = useDashboardAnalytics({
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
    setRefreshKey(prev => prev + 1);
  };

  const handleDateFilterChange = (field: 'startDate' | 'endDate') => (date: Date | null) => {
    if (date) {
      setDateFilter(prev => ({
        ...prev,
        [field]: date,
      }));
    }
  };

  const renderSuperAdminDashboard = () => {
    if (!dashboardData || typeof dashboardData !== 'object' || !('totalBudgetAllocated' in dashboardData)) {
      return <Alert severity="warning">Dashboard data not available</Alert>;
    }

    const financialData = dashboardData;

    return (
      <Grid container spacing={3}>
        {/* Budget Overview */}
        <Grid item xs={12}>
          <BudgetMetrics
            totalAllocated={financialData.totalBudgetAllocated}
            totalSpent={financialData.totalSpent}
            utilization={financialData.overallUtilizationPercentage}
            isLoading={isLoading}
          />
        </Grid>

        {/* Charts Row */}
        <Grid item xs={12} lg={8}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <SpendingTrendsChart
                data={financialData.spendingTrends?.map(trend => ({
                  period: trend.period,
                  actual: trend.actualSpending,
                  budget: trend.budgetAllocated,
                  projected: trend.projectedSpending,
                })) || []}
                isLoading={analyticsLoading}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <BudgetUtilizationChart
                data={analyticsData?.budgetUtilization || []}
                isLoading={analyticsLoading}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CategorySpendingChart
                data={financialData.categorySpending?.map(cat => ({
                  name: cat.category,
                  value: cat.amount,
                  percentage: cat.percentage,
                })) || []}
                isLoading={isLoading}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Activity Feed */}
        <Grid item xs={12} lg={4}>
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
    if (!dashboardData || typeof dashboardData !== 'object') {
      return <Alert severity="warning">Dashboard data not available</Alert>;
    }

    const data = dashboardData as any;
    const financial = data.financial || {};
    const approvals = data.approvals || {};
    const payments = data.payments || {};

    return (
      <Grid container spacing={3}>
        {/* Financial Metrics */}
        <Grid item xs={12}>
          <BudgetMetrics
            totalAllocated={financial.totalBudgetAllocated || 0}
            totalSpent={financial.totalSpent || 0}
            utilization={financial.overallUtilizationPercentage || 0}
            isLoading={isLoading}
          />
        </Grid>

        {/* Approval Metrics */}
        <Grid item xs={12}>
          <ApprovalMetrics
            pendingCount={approvals.pendingApprovalsCount || 0}
            approvedToday={approvals.approvedTodayCount || 0}
            avgApprovalTime={approvals.averageApprovalTime || 0}
            totalPendingAmount={approvals.totalPendingAmount || 0}
            isLoading={isLoading}
          />
        </Grid>

        {/* Payment Metrics */}
        <Grid item xs={12}>
          <PaymentMetrics
            readyForPayment={payments.readyForPaymentAmount || 0}
            processedToday={payments.processedTodayAmount || 0}
            monthlyTotal={payments.monthlyPaymentTotal || 0}
            failedPayments={payments.failedPaymentsCount || 0}
            isLoading={isLoading}
          />
        </Grid>

        {/* Charts */}
        <Grid item xs={12} lg={8}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <ApprovalMetricsChart
                data={approvals.weeklyApprovalTrends || []}
                isLoading={isLoading}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <PaymentProcessingChart
                data={payments.monthlyPaymentTrends || []}
                isLoading={isLoading}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Activity Feed */}
        <Grid item xs={12} lg={4}>
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
    if (!dashboardData || typeof dashboardData !== 'object' || !('totalBudgetAllocated' in dashboardData)) {
      return <Alert severity="warning">Dashboard data not available</Alert>;
    }

    const financialData = dashboardData;

    return (
      <Grid container spacing={3}>
        {/* Project Metrics */}
        <Grid item xs={12} sm={6} md={3}>
          <MetricsCard
            title="My Projects"
            value={{ current: 5, format: 'number' }}
            icon={Assignment}
            color="primary"
            isLoading={isLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricsCard
            title="Active Quotations"
            value={{ current: 12, format: 'number' }}
            icon={RequestQuote}
            color="info"
            isLoading={isLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricsCard
            title="Budget Allocated"
            value={{ current: financialData.totalBudgetAllocated, format: 'currency' }}
            icon={AttachMoney}
            color="success"
            isLoading={isLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricsCard
            title="Team Members"
            value={{ current: 8, format: 'number' }}
            icon={People}
            color="secondary"
            isLoading={isLoading}
          />
        </Grid>

        {/* Charts */}
        <Grid item xs={12} lg={8}>
          <SpendingTrendsChart
            data={financialData.spendingTrends?.map(trend => ({
              period: trend.period,
              actual: trend.actualSpending,
              budget: trend.budgetAllocated,
            })) || []}
            isLoading={isLoading}
          />
        </Grid>

        {/* Activity Feed */}
        <Grid item xs={12} lg={4}>
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
          <MetricsCard
            title="My Requests"
            value={{ current: 3, format: 'number' }}
            icon={RequestQuote}
            color="primary"
            isLoading={isLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricsCard
            title="Approved"
            value={{ current: 8, format: 'number' }}
            icon={CheckCircle}
            color="success"
            isLoading={isLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricsCard
            title="Pending"
            value={{ current: 2, format: 'number' }}
            icon={Schedule}
            color="warning"
            isLoading={isLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricsCard
            title="This Month Total"
            value={{ current: 12000, format: 'currency' }}
            icon={AttachMoney}
            color="info"
            isLoading={isLoading}
          />
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
};'Active Quotations', value: 12, change: '+4', color: 'info', icon: RequestQuote },
      { label: 'This Month Budget', value: '450K SAR', change: '+15%', color: 'success', icon: AttachMoney },
      { label: 'Team Members', value: 23, change: '0', color: 'default', icon: People },
    ],
    recentActivities: [
      { id: 1, type: 'quotation', message: 'Quotation Q-2024-089 submitted for approval', time: '1 hour ago' },
      { id: 2, type: 'project', message: 'Project milestone achieved: Site Preparation', time: '3 hours ago' },
      { id: 3, type: 'team', message: 'New team member assigned: Sara Ahmed', time: '1 day ago' },
      { id: 4, type: 'budget', message: 'Budget utilization: 65% of allocated funds', time: '2 days ago' },
    ],
  },
  ACCOUNT_MANAGER: {
    stats: [
      { label: 'Pending Approvals', value: 15, change: '+3', color: 'warning', icon: Approval },
      { label: 'Ready for Payment', value: 8, change: '-1', color: 'info', icon: AttachMoney },
      { label: 'Processed Today', value: '180K SAR', change: '+25%', color: 'success', icon: CheckCircle },
      { label: 'Monthly Total', value: '2.1M SAR', change: '+12%', color: 'primary', icon: TrendingUp },
    ],
    recentActivities: [
      { id: 1, type: 'approval', message: 'Approved quotation Q-2024-087 (85,000 SAR)', time: '30 min ago' },
      { id: 2, type: 'payment', message: 'Payment processed for Al-Rajhi Bank batch', time: '2 hours ago' },
      { id: 3, type: 'review', message: 'Reviewed 5 quotations for compliance', time: '4 hours ago' },
      { id: 4, type: 'report', message: 'Generated monthly financial report', time: '1 day ago' },
    ],
  },
  EMPLOYEE: {
    stats: [
      { label: 'My Requests', value: 3, change: '+1', color: 'primary', icon: RequestQuote },
      { label: 'Approved', value: 8, change: '+2', color: 'success', icon: CheckCircle },
      { label: 'Pending', value: 2, change: '0', color: 'warning', icon: Schedule },
      { label: 'This Month Total', value: '12K SAR', change: '+5%', color: 'info', icon: AttachMoney },
    ],
    recentActivities: [
      { id: 1, type: 'request', message: 'Submitted new quotation request', time: '2 hours ago' },
      { id: 2, type: 'approval', message: 'Office supplies request approved', time: '1 day ago' },
      { id: 3, type: 'update', message: 'Updated project documentation', time: '2 days ago' },
      { id: 4, type: 'meeting', message: 'Attended project review meeting', time: '3 days ago' },
    ],
  },
};

// Stats Card Component
interface StatsCardProps {
  label: string;
  value: string | number;
  change: string;
  color: 'primary' | 'success' | 'warning' | 'info' | 'error' | 'default';
  icon: React.ComponentType;
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value, change, color, icon: IconComponent }) => {
  const isPositive = change.startsWith('+');
  const isNeutral = change === '0';

  return (
    <Card elevation={2}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {label}
            </Typography>
            <Typography variant="h4" component="div" fontWeight="bold">
              {value}
            </Typography>
            <Chip
              label={change}
              size="small"
              color={isNeutral ? 'default' : isPositive ? 'success' : 'error'}
              sx={{ mt: 1 }}
            />
          </Box>
          <Avatar sx={{ bgcolor: `${color}.main`, width: 56, height: 56 }}>
            <IconComponent sx={{ fontSize: 28 }} />
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

// Recent Activities Component
interface Activity {
  id: number;
  type: string;
  message: string;
  time: string;
}

interface RecentActivitiesProps {
  activities: Activity[];
}

const RecentActivities: React.FC<RecentActivitiesProps> = ({ activities }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user': return <People />;
      case 'project': return <Assignment />;
      case 'approval': return <Approval />;
      case 'payment': return <AttachMoney />;
      case 'quotation': return <RequestQuote />;
      case 'team': return <People />;
      case 'budget': return <AccountBalance />;
      case 'review': return <CheckCircle />;
      case 'report': return <TrendingUp />;
      case 'request': return <RequestQuote />;
      case 'update': return <Assignment />;
      case 'meeting': return <Schedule />;
      default: return <Schedule />;
    }
  };

  return (
    <Card elevation={2} sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Recent Activities
        </Typography>
        <List sx={{ pt: 0 }}>
          {activities.map((activity, index) => (
            <React.Fragment key={activity.id}>
              <ListItem sx={{ px: 0, py: 1 }}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'action.selected' }}>
                    {getActivityIcon(activity.type)}
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={activity.message}
                  secondary={activity.time}
                  primaryTypographyProps={{ variant: 'body2' }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
              </ListItem>
              {index < activities.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const getUserRole = (): keyof typeof mockDashboardData => {
    const primaryRole = user?.roles?.[0] as keyof typeof mockDashboardData;
    return primaryRole in mockDashboardData ? primaryRole : 'EMPLOYEE';
  };

  const userRole = getUserRole();
  const dashboardData = mockDashboardData[userRole];

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

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
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

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {dashboardData.stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatsCard {...stat} />
          </Grid>
        ))}
      </Grid>

      {/* Recent Activities and Additional Info */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <RecentActivities activities={dashboardData.recentActivities} />
        </Grid>
        
        <Grid item xs={12} md={4}>
          {/* Quick Actions Card */}
          <Card elevation={2} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {userRole === USER_ROLES.PROJECT_MANAGER && (
                  <>
                    <Chip label="Create New Quotation" clickable color="primary" />
                    <Chip label="View My Projects" clickable color="info" />
                    <Chip label="Team Management" clickable color="success" />
                  </>
                )}
                {userRole === USER_ROLES.ACCOUNT_MANAGER && (
                  <>
                    <Chip label="Review Approvals" clickable color="warning" />
                    <Chip label="Process Payments" clickable color="success" />
                    <Chip label="Generate Reports" clickable color="info" />
                  </>
                )}
                {userRole === USER_ROLES.SUPER_ADMIN && (
                  <>
                    <Chip label="User Management" clickable color="primary" />
                    <Chip label="System Settings" clickable color="info" />
                    <Chip label="View All Reports" clickable color="success" />
                  </>
                )}
                {userRole === USER_ROLES.EMPLOYEE && (
                  <>
                    <Chip label="New Request" clickable color="primary" />
                    <Chip label="View My Requests" clickable color="info" />
                    <Chip label="Upload Documents" clickable color="success" />
                  </>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* System Status Card */}
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Status
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Database Connection
                </Typography>
                <LinearProgress variant="determinate" value={100} color="success" />
                <Typography variant="caption" color="success.main">
                  Operational
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  API Services
                </Typography>
                <LinearProgress variant="determinate" value={95} color="info" />
                <Typography variant="caption" color="info.main">
                  95% Uptime
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" gutterBottom>
                  Storage Usage
                </Typography>
                <LinearProgress variant="determinate" value={68} color="warning" />
                <Typography variant="caption" color="warning.main">
                  68% Used
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;