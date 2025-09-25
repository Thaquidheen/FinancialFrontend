import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Divider,
  IconButton,
  Skeleton,
  Alert,
  Button,
  useTheme,
} from '@mui/material';
import {
  Person,
  Work,
  RequestQuote,
  Payment,
  Approval,
  CheckCircle,
  Cancel,
  Schedule,
  Warning,
  TrendingUp,
  Assignment,
  AccountBalance,
  Refresh,
  MoreVert,
} from '@mui/icons-material';
import { formatRelativeDate } from '@utils/helpers';
import { RecentActivity, ActivityType } from '../../types/dashboard';

interface ActivityFeedProps {
  activities: RecentActivity[];
  isLoading?: boolean;
  error?: any;
  maxItems?: number;
  showHeader?: boolean;
  onRefresh?: () => void;
  onViewAll?: () => void;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  isLoading = false,
  error,
  maxItems = 10,
  showHeader = true,
  onRefresh,
  onViewAll,
}) => {
  const theme = useTheme();

  const getActivityIcon = (type: ActivityType) => {
    const iconMap: Record<ActivityType, React.ReactElement> = {
      [ActivityType.USER_CREATED]: <Person />,
      [ActivityType.USER_UPDATED]: <Person />,
      [ActivityType.PROJECT_CREATED]: <Work />,
      [ActivityType.PROJECT_UPDATED]: <Work />,
      [ActivityType.PROJECT_COMPLETED]: <CheckCircle />,
      [ActivityType.QUOTATION_CREATED]: <RequestQuote />,
      [ActivityType.QUOTATION_SUBMITTED]: <RequestQuote />,
      [ActivityType.QUOTATION_APPROVED]: <CheckCircle />,
      [ActivityType.QUOTATION_REJECTED]: <Cancel />,
      [ActivityType.PAYMENT_PROCESSED]: <Payment />,
      [ActivityType.PAYMENT_COMPLETED]: <CheckCircle />,
      [ActivityType.APPROVAL_PENDING]: <Schedule />,
      [ActivityType.APPROVAL_COMPLETED]: <Approval />,
      [ActivityType.DOCUMENT_UPLOADED]: <Assignment />,
      [ActivityType.BUDGET_ALERT]: <Warning />,
      [ActivityType.SYSTEM_MAINTENANCE]: <AccountBalance />,
    };

    return iconMap[type] || <TrendingUp />;
  };

  const getActivityColor = (type: ActivityType): string => {
    const colorMap: Record<ActivityType, string> = {
      [ActivityType.USER_CREATED]: theme.palette.primary.main,
      [ActivityType.USER_UPDATED]: theme.palette.info.main,
      [ActivityType.PROJECT_CREATED]: theme.palette.success.main,
      [ActivityType.PROJECT_UPDATED]: theme.palette.info.main,
      [ActivityType.PROJECT_COMPLETED]: theme.palette.success.main,
      [ActivityType.QUOTATION_CREATED]: theme.palette.primary.main,
      [ActivityType.QUOTATION_SUBMITTED]: theme.palette.warning.main,
      [ActivityType.QUOTATION_APPROVED]: theme.palette.success.main,
      [ActivityType.QUOTATION_REJECTED]: theme.palette.error.main,
      [ActivityType.PAYMENT_PROCESSED]: theme.palette.info.main,
      [ActivityType.PAYMENT_COMPLETED]: theme.palette.success.main,
      [ActivityType.APPROVAL_PENDING]: theme.palette.warning.main,
      [ActivityType.APPROVAL_COMPLETED]: theme.palette.success.main,
      [ActivityType.DOCUMENT_UPLOADED]: theme.palette.info.main,
      [ActivityType.BUDGET_ALERT]: theme.palette.error.main,
      [ActivityType.SYSTEM_MAINTENANCE]: theme.palette.grey[600],
    };

    return colorMap[type] || theme.palette.primary.main;
  };

  const getActivitySeverity = (type: ActivityType): 'low' | 'medium' | 'high' => {
    const highSeverity = [
      ActivityType.BUDGET_ALERT,
      ActivityType.QUOTATION_REJECTED,
      ActivityType.SYSTEM_MAINTENANCE,
    ];
    
    const mediumSeverity = [
      ActivityType.APPROVAL_PENDING,
      ActivityType.QUOTATION_SUBMITTED,
      ActivityType.PAYMENT_PROCESSED,
    ];

    if (highSeverity.includes(type)) return 'high';
    if (mediumSeverity.includes(type)) return 'medium';
    return 'low';
  };

  const getSeverityChip = (severity: 'low' | 'medium' | 'high') => {
    const config = {
      low: { color: 'default' as const, label: '' },
      medium: { color: 'warning' as const, label: 'Important' },
      high: { color: 'error' as const, label: 'Urgent' },
    };

    const { color, label } = config[severity];
    
    if (!label) return null;

    return (
      <Chip
        size="small"
        label={label}
        color={color}
        sx={{ ml: 1, height: 20, fontSize: '0.75rem' }}
      />
    );
  };

  const displayActivities = activities.slice(0, maxItems);

  if (error) {
    return (
      <Card elevation={2}>
        <CardContent>
          <Alert severity="error" action={
            onRefresh && (
              <IconButton color="inherit" size="small" onClick={onRefresh}>
                <Refresh />
              </IconButton>
            )
          }>
            Failed to load recent activities
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1, pb: 1 }}>
        {showHeader && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">
              Recent Activities
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {onRefresh && (
                <IconButton size="small" onClick={onRefresh} disabled={isLoading}>
                  <Refresh />
                </IconButton>
              )}
              <IconButton size="small">
                <MoreVert />
              </IconButton>
            </Box>
          </Box>
        )}

        {isLoading ? (
          <List sx={{ pt: 0 }}>
            {Array.from({ length: 5 }).map((_, index) => (
              <ListItem key={index} sx={{ px: 0, py: 1 }}>
                <ListItemAvatar>
                  <Skeleton variant="circular" width={40} height={40} />
                </ListItemAvatar>
                <ListItemText
                  primary={<Skeleton variant="text" width="80%" />}
                  secondary={<Skeleton variant="text" width="60%" />}
                />
              </ListItem>
            ))}
          </List>
        ) : displayActivities.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 4,
              textAlign: 'center',
            }}
          >
            <TrendingUp sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Recent Activities
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Activities will appear here as they happen
            </Typography>
          </Box>
        ) : (
          <List sx={{ pt: 0, flex: 1, overflow: 'auto' }}>
            {displayActivities.map((activity, index) => {
              const severity = getActivitySeverity(activity.type);
              
              return (
                <React.Fragment key={activity.id}>
                  <ListItem
                    sx={{
                      px: 0,
                      py: 1.5,
                      alignItems: 'flex-start',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                        borderRadius: 1,
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          bgcolor: getActivityColor(activity.type),
                          width: 36,
                          height: 36,
                        }}
                      >
                        {getActivityIcon(activity.type)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                          <Typography variant="body2" sx={{ flex: 1 }}>
                            {activity.message}
                          </Typography>
                          {getSeverityChip(severity)}
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            {formatRelativeDate(activity.timestamp)}
                          </Typography>
                          {activity.userName && (
                            <Typography variant="caption" color="primary.main">
                              by {activity.userName}
                            </Typography>
                          )}
                        </Box>
                      }
                      primaryTypographyProps={{ component: 'div' }}
                      secondaryTypographyProps={{ component: 'div' }}
                    />
                  </ListItem>
                  {index < displayActivities.length - 1 && (
                    <Divider variant="inset" component="li" sx={{ ml: 5 }} />
                  )}
                </React.Fragment>
              );
            })}
          </List>
        )}
      </CardContent>

      {/* Footer with view all button */}
      {onViewAll && activities.length > maxItems && (
        <>
          <Divider />
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Button
              variant="text"
              color="primary"
              onClick={onViewAll}
              size="small"
            >
              View All Activities ({activities.length})
            </Button>
          </Box>
        </>
      )}
    </Card>
  );
};

export default ActivityFeed;