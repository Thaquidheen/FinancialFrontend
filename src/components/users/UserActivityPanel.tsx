import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Chip,
  TextField,
  MenuItem,
  Button,
  Grid,
  Divider,
  CircularProgress,
  Alert,
  Pagination,
  Paper,
} from '@mui/material';
import {
  Login,
  Logout,
  Edit,
  Add,
  Delete,
  Visibility,
  Security,
  AccountBalance,
  Assignment,
  FilterList,
  History,
  Schedule,
  Computer,
  Smartphone,
  Tablet,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

// Types for activity data
interface UserActivity {
  id: string;
  userId: string;
  action: string;
  description: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  deviceType?: 'desktop' | 'mobile' | 'tablet';
  status: 'success' | 'failed' | 'warning';
  metadata?: Record<string, any>;
}

interface ActivityFilters {
  dateFrom?: Date | null;
  dateTo?: Date | null;
  actionType?: string;
  status?: string;
  deviceType?: string;
}

interface UserActivityPanelProps {
  userId: string;
}

// Mock data - In real implementation, this would come from your backend
const generateMockActivities = (userId: string): UserActivity[] => [
  {
    id: '1',
    userId,
    action: 'LOGIN',
    description: 'User logged in successfully',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    deviceType: 'desktop',
    status: 'success',
  },
  {
    id: '2',
    userId,
    action: 'PASSWORD_CHANGE',
    description: 'Password changed successfully',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    ipAddress: '192.168.1.100',
    deviceType: 'desktop',
    status: 'success',
  },
  {
    id: '3',
    userId,
    action: 'PROFILE_UPDATE',
    description: 'Updated bank details',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    ipAddress: '10.0.0.50',
    deviceType: 'mobile',
    status: 'success',
  },
  {
    id: '4',
    userId,
    action: 'LOGIN_FAILED',
    description: 'Failed login attempt - invalid password',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    ipAddress: '203.0.113.10',
    deviceType: 'desktop',
    status: 'failed',
  },
  {
    id: '5',
    userId,
    action: 'QUOTATION_CREATE',
    description: 'Created quotation for Project Alpha',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    ipAddress: '192.168.1.100',
    deviceType: 'desktop',
    status: 'success',
  },
  {
    id: '6',
    userId,
    action: 'LOGOUT',
    description: 'User logged out',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    ipAddress: '192.168.1.100',
    deviceType: 'desktop',
    status: 'success',
  },
];

const UserActivityPanel: React.FC<UserActivityPanelProps> = ({ userId }) => {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ActivityFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Load activities (mock implementation)
  useEffect(() => {
    const loadActivities = async () => {
      setLoading(true);
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockActivities = generateMockActivities(userId);
        setActivities(mockActivities);
        setFilteredActivities(mockActivities);
      } catch (err) {
        setError('Failed to load user activities');
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
  }, [userId]);

  // Apply filters
  useEffect(() => {
    let filtered = activities;

    if (filters.dateFrom) {
      filtered = filtered.filter(activity => activity.timestamp >= filters.dateFrom!);
    }

    if (filters.dateTo) {
      const endOfDay = new Date(filters.dateTo);
      endOfDay.setHours(23, 59, 59, 999);
      filtered = filtered.filter(activity => activity.timestamp <= endOfDay);
    }

    if (filters.actionType) {
      filtered = filtered.filter(activity => activity.action === filters.actionType);
    }

    if (filters.status) {
      filtered = filtered.filter(activity => activity.status === filters.status);
    }

    if (filters.deviceType) {
      filtered = filtered.filter(activity => activity.deviceType === filters.deviceType);
    }

    setFilteredActivities(filtered);
    setCurrentPage(1);
  }, [activities, filters]);

  const getActivityIcon = (action: string) => {
    const icons: Record<string, React.ReactElement> = {
      LOGIN: <Login color="success" />,
      LOGOUT: <Logout color="action" />,
      LOGIN_FAILED: <Security color="error" />,
      PASSWORD_CHANGE: <Security color="primary" />,
      PROFILE_UPDATE: <Edit color="primary" />,
      BANK_DETAILS_UPDATE: <AccountBalance color="primary" />,
      QUOTATION_CREATE: <Add color="success" />,
      QUOTATION_UPDATE: <Edit color="primary" />,
      QUOTATION_DELETE: <Delete color="error" />,
      ROLE_ASSIGNED: <Assignment color="info" />,
      VIEW_DOCUMENT: <Visibility color="action" />,
    };
    return icons[action] || <History color="action" />;
  };

  const getStatusColor = (status: string): "success" | "error" | "warning" | "default" => {
    switch (status) {
      case 'success': return 'success';
      case 'failed': return 'error';
      case 'warning': return 'warning';
      default: return 'default';
    }
  };

  const getDeviceIcon = (deviceType?: string) => {
    switch (deviceType) {
      case 'desktop': return <Computer fontSize="small" />;
      case 'mobile': return <Smartphone fontSize="small" />;
      case 'tablet': return <Tablet fontSize="small" />;
      default: return <Computer fontSize="small" />;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    if (isToday(timestamp)) {
      return `Today at ${format(timestamp, 'h:mm a')}`;
    } else if (isYesterday(timestamp)) {
      return `Yesterday at ${format(timestamp, 'h:mm a')}`;
    } else {
      return format(timestamp, 'MMM d, yyyy h:mm a');
    }
  };

  const clearFilters = () => {
    setFilters({});
  };

  const hasActiveFilters = Object.values(filters).some(value => value);

  // Pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedActivities = filteredActivities.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <History />
        User Activity Log
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <FilterList />
          <Typography variant="subtitle2">Filters</Typography>
          {hasActiveFilters && (
            <Button size="small" onClick={clearFilters}>
              Clear All
            </Button>
          )}
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <DatePicker
              label="From Date"
              value={filters.dateFrom}
              onChange={(date) => setFilters(prev => ({ ...prev, dateFrom: date }))}
              slotProps={{
                textField: { size: 'small', fullWidth: true }
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <DatePicker
              label="To Date"
              value={filters.dateTo}
              onChange={(date) => setFilters(prev => ({ ...prev, dateTo: date }))}
              slotProps={{
                textField: { size: 'small', fullWidth: true }
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <TextField
              select
              label="Action Type"
              value={filters.actionType || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, actionType: e.target.value || undefined }))}
              size="small"
              fullWidth
            >
              <MenuItem value="">All Actions</MenuItem>
              <MenuItem value="LOGIN">Login</MenuItem>
              <MenuItem value="LOGOUT">Logout</MenuItem>
              <MenuItem value="LOGIN_FAILED">Failed Login</MenuItem>
              <MenuItem value="PASSWORD_CHANGE">Password Change</MenuItem>
              <MenuItem value="PROFILE_UPDATE">Profile Update</MenuItem>
              <MenuItem value="QUOTATION_CREATE">Create Quotation</MenuItem>
              <MenuItem value="QUOTATION_UPDATE">Update Quotation</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <TextField
              select
              label="Status"
              value={filters.status || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value || undefined }))}
              size="small"
              fullWidth
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="success">Success</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
              <MenuItem value="warning">Warning</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <TextField
              select
              label="Device"
              value={filters.deviceType || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, deviceType: e.target.value || undefined }))}
              size="small"
              fullWidth
            >
              <MenuItem value="">All Devices</MenuItem>
              <MenuItem value="desktop">Desktop</MenuItem>
              <MenuItem value="mobile">Mobile</MenuItem>
              <MenuItem value="tablet">Tablet</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Activity Summary */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {filteredActivities.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Activities
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {filteredActivities.filter(a => a.status === 'success').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Successful Actions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error.main">
                {filteredActivities.filter(a => a.status === 'failed').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Failed Actions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Activities List */}
      <Card>
        <CardContent>
          {filteredActivities.length === 0 ? (
            <Box textAlign="center" py={4}>
              <History sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No activities found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {hasActiveFilters ? 'Try adjusting your filters' : 'No activities recorded for this user'}
              </Typography>
            </Box>
          ) : (
            <>
              <List>
                {paginatedActivities.map((activity, index) => (
                  <React.Fragment key={activity.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemIcon sx={{ mt: 1 }}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {getActivityIcon(activity.action)}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                            <Typography variant="subtitle2">
                              {activity.description}
                            </Typography>
                            <Chip
                              label={activity.status}
                              color={getStatusColor(activity.status)}
                              size="small"
                            />
                            {activity.deviceType && (
                              <Box display="flex" alignItems="center" gap={0.5}>
                                {getDeviceIcon(activity.deviceType)}
                                <Typography variant="caption" color="text.secondary">
                                  {activity.deviceType}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        }
                        secondary={
                          <Box mt={1}>
                            <Typography variant="body2" color="text.secondary">
                              <Schedule fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                              {formatTimestamp(activity.timestamp)}
                              {' • '}
                              {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                            </Typography>
                            {activity.ipAddress && (
                              <Typography variant="caption" color="text.secondary" display="block">
                                IP: {activity.ipAddress}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < paginatedActivities.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>

              {/* Pagination */}
              {totalPages > 1 && (
                <Box display="flex" justifyContent="center" mt={3}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={(_, page) => setCurrentPage(page)}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default UserActivityPanel;