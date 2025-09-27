import React, { useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Button,
  IconButton,
  Alert,
  Tooltip,
  Card,
  CardContent,
  CardActions,
  Chip,
  Avatar,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Paper,
  Stack,
  Badge,
  CircularProgress,
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
  TrendingUp,
  TrendingDown,
  Assessment,
  Payment,
  Approval,
  Business,
  Dashboard as DashboardIcon,
  Notifications,
  MoreVert,
  ArrowUpward,
  ArrowDownward,
  Warning,
  Info,
  Star,
  Timeline,
  PieChart,
  BarChart,
  ShowChart,
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
        {/* Key Metrics Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Budget"
            value="₿2.4M"
            change="+12.5%"
            changeType="positive"
            icon={<AttachMoney />}
            color="#3b82f6"
            bgColor="#dbeafe"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Active Projects"
            value="24"
            change="+3"
            changeType="positive"
            icon={<Assignment />}
            color="#10b981"
            bgColor="#d1fae5"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Pending Approvals"
            value="8"
            change="-2"
            changeType="negative"
            icon={<Approval />}
            color="#f59e0b"
            bgColor="#fef3c7"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Monthly Payments"
            value="₿180K"
            change="+8.2%"
            changeType="positive"
            icon={<Payment />}
            color="#8b5cf6"
            bgColor="#ede9fe"
          />
        </Grid>

        {/* Financial Overview Chart */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: '100%', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" fontWeight={600} color="#1a202c">
                  Financial Overview
                </Typography>
                <Chip label="Last 6 months" size="small" variant="outlined" />
              </Box>
              <Box height={300} display="flex" alignItems="center" justifyContent="center" bgcolor="#f8fafc" borderRadius={2}>
                <Box textAlign="center">
                  <BarChart sx={{ fontSize: 64, color: '#64748b', mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Chart visualization will be implemented
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} color="#1a202c" mb={3}>
                Quick Actions
              </Typography>
              <Stack spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<RequestQuote />}
                  fullWidth
                  sx={{ 
                    bgcolor: '#3b82f6', 
                    borderRadius: '12px',
                    py: 1.5,
                    '&:hover': { bgcolor: '#2563eb' }
                  }}
                >
                  Create Quotation
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Approval />}
                  fullWidth
                  sx={{ 
                    borderColor: '#d1d5db',
                    borderRadius: '12px',
                    py: 1.5,
                    '&:hover': { borderColor: '#9ca3af' }
                  }}
                >
                  Review Approvals
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Payment />}
                  fullWidth
                  sx={{ 
                    borderColor: '#d1d5db',
                    borderRadius: '12px',
                    py: 1.5,
                    '&:hover': { borderColor: '#9ca3af' }
                  }}
                >
                  Process Payments
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
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
        {/* Key Metrics Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Pending Approvals"
            value="12"
            change="+4"
            changeType="positive"
            icon={<Approval />}
            color="#f59e0b"
            bgColor="#fef3c7"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Payments"
            value="₿450K"
            change="+15.2%"
            changeType="positive"
            icon={<Payment />}
            color="#10b981"
            bgColor="#d1fae5"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Active Quotations"
            value="28"
            change="+6"
            changeType="positive"
            icon={<RequestQuote />}
            color="#3b82f6"
            bgColor="#dbeafe"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Budget Utilization"
            value="78%"
            change="+5%"
            changeType="positive"
            icon={<Assessment />}
            color="#8b5cf6"
            bgColor="#ede9fe"
          />
        </Grid>

        {/* Approval Queue */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ height: '100%', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" fontWeight={600} color="#1a202c">
                  Pending Approvals
                </Typography>
                <Badge badgeContent={12} color="error">
                  <Approval sx={{ color: '#64748b' }} />
                </Badge>
              </Box>
              <List dense>
                {[
                  { id: 1, title: 'Quotation #1234', amount: '₿15,000', priority: 'high' },
                  { id: 2, title: 'Payment Request #5678', amount: '₿8,500', priority: 'medium' },
                  { id: 3, title: 'Budget Allocation #9012', amount: '₿25,000', priority: 'high' },
                ].map((item) => (
                  <ListItem key={item.id} sx={{ px: 0, py: 1 }}>
                    <ListItemIcon>
                      <Avatar sx={{ 
                        width: 32, 
                        height: 32, 
                        bgcolor: item.priority === 'high' ? '#fef2f2' : '#f0f9ff',
                        color: item.priority === 'high' ? '#dc2626' : '#2563eb'
                      }}>
                        {item.priority === 'high' ? <Warning /> : <Info />}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={item.title}
                      secondary={item.amount}
                      primaryTypographyProps={{ fontWeight: 500, fontSize: '0.875rem' }}
                      secondaryTypographyProps={{ fontSize: '0.75rem', color: '#64748b' }}
                    />
                    <Chip 
                      label={item.priority} 
                      size="small" 
                      color={item.priority === 'high' ? 'error' : 'info'}
                      variant="outlined"
                    />
                  </ListItem>
                ))}
              </List>
              <Button fullWidth variant="outlined" sx={{ mt: 2, borderRadius: '8px' }}>
                View All Approvals
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Payment Status */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ height: '100%', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} color="#1a202c" mb={3}>
                Payment Status
              </Typography>
              <Stack spacing={3}>
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2" color="text.secondary">Processed</Typography>
                    <Typography variant="body2" fontWeight={600}>₿180K</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={75} sx={{ height: 8, borderRadius: 4, bgcolor: '#f1f5f9' }} />
                </Box>
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2" color="text.secondary">Pending</Typography>
                    <Typography variant="body2" fontWeight={600}>₿45K</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={25} color="warning" sx={{ height: 8, borderRadius: 4, bgcolor: '#f1f5f9' }} />
                </Box>
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2" color="text.secondary">Failed</Typography>
                    <Typography variant="body2" fontWeight={600}>₿5K</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={5} color="error" sx={{ height: 8, borderRadius: 4, bgcolor: '#f1f5f9' }} />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
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
          <MetricCard
            title="My Projects"
            value="5"
            change="+1"
            changeType="positive"
            icon={<Assignment />}
            color="#3b82f6"
            bgColor="#dbeafe"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Active Quotations"
            value="12"
            change="+3"
            changeType="positive"
            icon={<RequestQuote />}
            color="#10b981"
            bgColor="#d1fae5"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Budget Allocated"
            value="₿50K"
            change="+8.5%"
            changeType="positive"
            icon={<AttachMoney />}
            color="#8b5cf6"
            bgColor="#ede9fe"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Team Members"
            value="8"
            change="+2"
            changeType="positive"
            icon={<People />}
            color="#f59e0b"
            bgColor="#fef3c7"
          />
        </Grid>

        {/* Project Progress */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: '100%', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} color="#1a202c" mb={3}>
                Project Progress
              </Typography>
              <Stack spacing={3}>
                {[
                  { name: 'ERP Implementation', progress: 85, status: 'On Track', color: '#10b981' },
                  { name: 'Mobile App Development', progress: 60, status: 'In Progress', color: '#3b82f6' },
                  { name: 'Database Migration', progress: 30, status: 'Delayed', color: '#f59e0b' },
                  { name: 'Security Audit', progress: 95, status: 'Almost Done', color: '#8b5cf6' },
                ].map((project) => (
                  <Box key={project.name}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2" fontWeight={500}>{project.name}</Typography>
                      <Chip 
                        label={project.status} 
                        size="small" 
                        sx={{ 
                          bgcolor: project.color + '20', 
                          color: project.color,
                          fontWeight: 500
                        }}
                      />
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={project.progress} 
                      sx={{ 
                        height: 8, 
                        borderRadius: 4, 
                        bgcolor: '#f1f5f9',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: project.color
                        }
                      }} 
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      {project.progress}% complete
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} color="#1a202c" mb={3}>
                Quick Stats
              </Typography>
              <Stack spacing={3}>
                <Box textAlign="center">
                  <Avatar sx={{ bgcolor: '#dbeafe', color: '#3b82f6', width: 48, height: 48, mx: 'auto', mb: 2 }}>
                    <RequestQuote />
                  </Avatar>
                  <Typography variant="h4" fontWeight={700} color="#1a202c">12</Typography>
                  <Typography variant="body2" color="text.secondary">Draft Quotations</Typography>
                </Box>
                <Divider />
                <Box textAlign="center">
                  <Avatar sx={{ bgcolor: '#d1fae5', color: '#10b981', width: 48, height: 48, mx: 'auto', mb: 2 }}>
                    <CheckCircle />
                  </Avatar>
                  <Typography variant="h4" fontWeight={700} color="#1a202c">8</Typography>
                  <Typography variant="body2" color="text.secondary">Approved This Month</Typography>
                </Box>
                <Divider />
                <Box textAlign="center">
                  <Avatar sx={{ bgcolor: '#fef3c7', color: '#f59e0b', width: 48, height: 48, mx: 'auto', mb: 2 }}>
                    <Schedule />
                  </Avatar>
                  <Typography variant="h4" fontWeight={700} color="#1a202c">3</Typography>
                  <Typography variant="body2" color="text.secondary">Pending Review</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
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
          <MetricCard
            title="My Requests"
            value="3"
            change="+1"
            changeType="positive"
            icon={<RequestQuote />}
            color="#3b82f6"
            bgColor="#dbeafe"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Approved"
            value="8"
            change="+2"
            changeType="positive"
            icon={<CheckCircle />}
            color="#10b981"
            bgColor="#d1fae5"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Pending"
            value="2"
            change="-1"
            changeType="negative"
            icon={<Schedule />}
            color="#f59e0b"
            bgColor="#fef3c7"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="This Month Total"
            value="₿12K"
            change="+15.3%"
            changeType="positive"
            icon={<AttachMoney />}
            color="#8b5cf6"
            bgColor="#ede9fe"
          />
        </Grid>

        {/* My Requests */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: '100%', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} color="#1a202c" mb={3}>
                My Recent Requests
              </Typography>
              <List>
                {[
                  { id: 1, title: 'Office Supplies Request', amount: '₿250', status: 'Approved', date: '2 days ago' },
                  { id: 2, title: 'Software License Renewal', amount: '₿1,200', status: 'Pending', date: '1 week ago' },
                  { id: 3, title: 'Training Course Fee', amount: '₿800', status: 'Under Review', date: '2 weeks ago' },
                ].map((request) => (
                  <ListItem key={request.id} sx={{ px: 0, py: 2, borderBottom: '1px solid #f1f5f9' }}>
                    <ListItemIcon>
                      <Avatar sx={{ 
                        width: 40, 
                        height: 40, 
                        bgcolor: request.status === 'Approved' ? '#d1fae5' : 
                                request.status === 'Pending' ? '#fef3c7' : '#f0f9ff',
                        color: request.status === 'Approved' ? '#10b981' : 
                               request.status === 'Pending' ? '#f59e0b' : '#3b82f6'
                      }}>
                        {request.status === 'Approved' ? <CheckCircle /> : 
                         request.status === 'Pending' ? <Schedule /> : <Info />}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={request.title}
                      secondary={`${request.amount} • ${request.date}`}
                      primaryTypographyProps={{ fontWeight: 500 }}
                      secondaryTypographyProps={{ color: '#64748b' }}
                    />
                    <Chip 
                      label={request.status} 
                      size="small" 
                      color={request.status === 'Approved' ? 'success' : 
                             request.status === 'Pending' ? 'warning' : 'info'}
                      variant="outlined"
                    />
                  </ListItem>
                ))}
              </List>
              <Button fullWidth variant="outlined" sx={{ mt: 2, borderRadius: '8px' }}>
                View All Requests
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} color="#1a202c" mb={3}>
                Quick Actions
              </Typography>
              <Stack spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<RequestQuote />}
                  fullWidth
                  sx={{ 
                    bgcolor: '#3b82f6', 
                    borderRadius: '12px',
                    py: 1.5,
                    '&:hover': { bgcolor: '#2563eb' }
                  }}
                >
                  New Request
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Timeline />}
                  fullWidth
                  sx={{ 
                    borderColor: '#d1d5db',
                    borderRadius: '12px',
                    py: 1.5,
                    '&:hover': { borderColor: '#9ca3af' }
                  }}
                >
                  Track Status
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Assessment />}
                  fullWidth
                  sx={{ 
                    borderColor: '#d1d5db',
                    borderRadius: '12px',
                    py: 1.5,
                    '&:hover': { borderColor: '#9ca3af' }
                  }}
                >
                  View Reports
                </Button>
              </Stack>
            </CardContent>
          </Card>
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
      <Box sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#f8fafc',
      }}>
        {/* Page Header */}
        <Paper 
          elevation={0} 
          sx={{ 
            borderBottom: '1px solid #e2e8f0',
            px: 3,
            py: 2,
            bgcolor: '#ffffff',
            borderRadius: 0,
            mb: 3,
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: { xs: 'flex-start', sm: 'center' },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
          }}>
            <Box>
              <Typography 
                variant="h4" 
                component="h1" 
                fontWeight={700}
                sx={{ 
                  color: '#1a202c',
                  fontSize: '1.875rem',
                  letterSpacing: '-0.025em',
                  mb: 0.5
                }}
              >
                Dashboard
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#64748b',
                  fontSize: '1.125rem',
                  fontWeight: 500,
                  mb: 0.5
                }}
              >
                {getWelcomeMessage()}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#64748b',
                  fontSize: '0.875rem'
                }}
              >
                Welcome to your {getRoleDisplayName()} dashboard
              </Typography>
            </Box>

            {/* Dashboard Controls */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Date Range Filter */}
              <Chip
                icon={<DateRange />}
                label={`${dateFilter.startDate?.toLocaleDateString()} - ${dateFilter.endDate?.toLocaleDateString()}`}
                variant="outlined"
                sx={{ 
                  borderColor: '#d1d5db',
                  color: '#374151',
                  '&:hover': { borderColor: '#9ca3af' }
                }}
              />

              {/* Refresh Button */}
              <Tooltip title="Refresh Dashboard">
                <IconButton 
                  onClick={handleRefresh} 
                  disabled={isLoading}
                  sx={{ 
                    bgcolor: '#f1f5f9',
                    color: '#475569',
                    '&:hover': { 
                      bgcolor: '#e2e8f0',
                      color: '#334155'
                    }
                  }}
                >
                  <Refresh />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Paper>

        {/* Dashboard Content */}
        <Box sx={{ flexGrow: 1, px: 3, pb: 3 }}>
          {renderDashboardContent()}
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

// MetricCard Component
interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
  icon: React.ReactElement;
  color: string;
  bgColor: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType,
  icon,
  color,
  bgColor,
}) => {
  return (
    <Card sx={{ 
      height: '100%', 
      borderRadius: '16px', 
      border: '1px solid #e2e8f0',
      bgcolor: '#ffffff',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        transform: 'translateY(-1px)',
      }
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: '12px',
              bgcolor: bgColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {React.cloneElement(icon, { 
              sx: { 
                color: color, 
                fontSize: 24 
              } 
            })}
          </Box>
          <Box display="flex" alignItems="center" gap={0.5}>
            {changeType === 'positive' ? (
              <ArrowUpward sx={{ fontSize: 16, color: '#10b981' }} />
            ) : (
              <ArrowDownward sx={{ fontSize: 16, color: '#ef4444' }} />
            )}
            <Typography 
              variant="body2" 
              sx={{ 
                color: changeType === 'positive' ? '#10b981' : '#ef4444',
                fontWeight: 600,
                fontSize: '0.875rem'
              }}
            >
              {change}
            </Typography>
          </Box>
        </Box>
        
        <Typography 
          variant="h3" 
          component="div"
          fontWeight={700}
          sx={{ 
            color: '#1a202c',
            fontSize: '1.875rem',
            lineHeight: 1.2,
            mb: 0.5
          }}
        >
          {value}
        </Typography>
        
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#64748b',
            fontWeight: 500,
            fontSize: '0.875rem'
          }}
        >
          {title}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default DashboardPage;