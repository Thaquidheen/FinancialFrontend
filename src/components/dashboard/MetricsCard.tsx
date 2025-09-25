import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  LinearProgress,
  Skeleton,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  InfoOutlined,
} from '@mui/icons-material';
import { formatCurrency, formatNumber } from '@utils/helpers';

interface MetricValue {
  current: number;
  previous?: number;
  target?: number;
  format: 'currency' | 'number' | 'percentage';
}

interface MetricsCardProps {
  title: string;
  value: MetricValue;
  icon: React.ComponentType<any>;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  showProgress?: boolean;
  isLoading?: boolean;
  subtitle?: string;
  helpText?: string;
  onClick?: () => void;
}

export const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  icon: IconComponent,
  color = 'primary',
  showProgress = false,
  isLoading = false,
  subtitle,
  helpText,
  onClick,
}) => {
  const formatValue = (val: number, format: MetricValue['format']): string => {
    switch (format) {
      case 'currency':
        return formatCurrency(val);
      case 'percentage':
        return `${val.toFixed(1)}%`;
      case 'number':
      default:
        return formatNumber(val);
    }
  };

  const getChangeInfo = () => {
    if (!value.previous || value.previous === 0) return null;
    
    const change = value.current - value.previous;
    const changePercentage = (change / value.previous) * 100;
    const isPositive = change > 0;
    const isNeutral = change === 0;

    return {
      change,
      changePercentage,
      isPositive,
      isNeutral,
    };
  };

  const getProgressValue = () => {
    if (!value.target || value.target === 0) return 0;
    return Math.min((value.current / value.target) * 100, 100);
  };

  const changeInfo = getChangeInfo();
  const progressValue = showProgress ? getProgressValue() : 0;

  if (isLoading) {
    return (
      <Card elevation={2}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="60%" height={24} />
              <Skeleton variant="text" width="40%" height={48} />
              <Skeleton variant="text" width="50%" height={20} />
            </Box>
            <Skeleton variant="circular" width={56} height={56} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      elevation={2} 
      sx={{ 
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': onClick ? {
          transform: 'translateY(-2px)',
          boxShadow: 4,
        } : {},
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ flex: 1 }}>
            {/* Title with help icon */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography color="textSecondary" variant="body2">
                {title}
              </Typography>
              {helpText && (
                <Tooltip title={helpText} arrow>
                  <IconButton size="small" sx={{ p: 0.25 }}>
                    <InfoOutlined sx={{ fontSize: 16, color: 'text.secondary' }} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>

            {/* Main value */}
            <Typography variant="h4" component="div" fontWeight="bold" sx={{ mb: 1 }}>
              {formatValue(value.current, value.format)}
            </Typography>

            {/* Subtitle */}
            {subtitle && (
              <Typography variant="caption" color="textSecondary" sx={{ mb: 1, display: 'block' }}>
                {subtitle}
              </Typography>
            )}

            {/* Change indicator */}
            {changeInfo && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                {changeInfo.isNeutral ? (
                  <TrendingFlat sx={{ fontSize: 16, color: 'text.secondary' }} />
                ) : changeInfo.isPositive ? (
                  <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
                ) : (
                  <TrendingDown sx={{ fontSize: 16, color: 'error.main' }} />
                )}
                <Chip
                  label={`${changeInfo.isPositive ? '+' : ''}${changeInfo.changePercentage.toFixed(1)}%`}
                  size="small"
                  color={
                    changeInfo.isNeutral
                      ? 'default'
                      : changeInfo.isPositive
                      ? 'success'
                      : 'error'
                  }
                  sx={{ height: 20, fontSize: '0.75rem' }}
                />
              </Box>
            )}

            {/* Progress bar */}
            {showProgress && value.target && (
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" color="textSecondary">
                    Progress to Target
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {formatValue(value.target, value.format)}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={progressValue}
                  color={progressValue >= 90 ? 'success' : progressValue >= 70 ? 'warning' : 'primary'}
                  sx={{ height: 6, borderRadius: 3 }}
                />
                <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                  {progressValue.toFixed(0)}% completed
                </Typography>
              </Box>
            )}
          </Box>

          {/* Icon */}
          <Avatar
            sx={{
              bgcolor: `${color}.main`,
              width: 56,
              height: 56,
              ml: 2,
            }}
          >
            <IconComponent sx={{ fontSize: 28 }} />
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

// Specialized metric cards for different data types
interface BudgetMetricsProps {
  totalAllocated: number;
  totalSpent: number;
  utilization: number;
  isLoading?: boolean;
  onClick?: () => void;
}

export const BudgetMetrics: React.FC<BudgetMetricsProps> = ({
  totalAllocated,
  totalSpent,
  utilization,
  isLoading,
  onClick,
}) => {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
      <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
        <MetricsCard
          title="Total Budget Allocated"
          value={{
            current: totalAllocated,
            format: 'currency',
          }}
          icon={TrendingUp}
          color="primary"
          isLoading={isLoading}
          onClick={onClick}
          helpText="Total budget allocated across all projects"
        />
      </Box>
      <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
        <MetricsCard
          title="Total Spent"
          value={{
            current: totalSpent,
            format: 'currency',
          }}
          icon={TrendingUp}
          color="success"
          isLoading={isLoading}
          onClick={onClick}
          helpText="Total amount spent across all projects"
        />
      </Box>
      <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
        <MetricsCard
          title="Budget Utilization"
          value={{
            current: utilization,
            target: 100,
            format: 'percentage',
          }}
          icon={TrendingUp}
          color={utilization > 90 ? 'warning' : 'info'}
          showProgress
          isLoading={isLoading}
          onClick={onClick}
          helpText="Percentage of allocated budget that has been spent"
        />
      </Box>
    </Box>
  );
};

interface ApprovalMetricsProps {
  pendingCount: number;
  approvedToday: number;
  avgApprovalTime: number;
  totalPendingAmount: number;
  isLoading?: boolean;
  onPendingClick?: () => void;
}

export const ApprovalMetrics: React.FC<ApprovalMetricsProps> = ({
  pendingCount,
  approvedToday,
  avgApprovalTime,
  totalPendingAmount,
  isLoading,
  onPendingClick,
}) => {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
      <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
        <MetricsCard
          title="Pending Approvals"
          value={{
            current: pendingCount,
            format: 'number',
          }}
          icon={TrendingUp}
          color="warning"
          isLoading={isLoading}
          onClick={onPendingClick}
          helpText="Number of quotations waiting for approval"
        />
      </Box>
      <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
        <MetricsCard
          title="Approved Today"
          value={{
            current: approvedToday,
            format: 'number',
          }}
          icon={TrendingUp}
          color="success"
          isLoading={isLoading}
          helpText="Number of quotations approved today"
        />
      </Box>
      <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
        <MetricsCard
          title="Avg Approval Time"
          value={{
            current: avgApprovalTime,
            format: 'number',
          }}
          icon={TrendingUp}
          color="info"
          isLoading={isLoading}
          subtitle="hours"
          helpText="Average time taken to approve quotations"
        />
      </Box>
      <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
        <MetricsCard
          title="Pending Amount"
          value={{
            current: totalPendingAmount,
            format: 'currency',
          }}
          icon={TrendingUp}
          color="primary"
          isLoading={isLoading}
          helpText="Total value of pending quotations"
        />
      </Box>
    </Box>
  );
};

interface PaymentMetricsProps {
  readyForPayment: number;
  processedToday: number;
  monthlyTotal: number;
  failedPayments: number;
  isLoading?: boolean;
  onReadyClick?: () => void;
}

export const PaymentMetrics: React.FC<PaymentMetricsProps> = ({
  readyForPayment,
  processedToday,
  monthlyTotal,
  failedPayments,
  isLoading,
  onReadyClick,
}) => {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
      <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
        <MetricsCard
          title="Ready for Payment"
          value={{
            current: readyForPayment,
            format: 'currency',
          }}
          icon={TrendingUp}
          color="info"
          isLoading={isLoading}
          onClick={onReadyClick}
          helpText="Total amount ready for payment processing"
        />
      </Box>
      <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
        <MetricsCard
          title="Processed Today"
          value={{
            current: processedToday,
            format: 'currency',
          }}
          icon={TrendingUp}
          color="success"
          isLoading={isLoading}
          helpText="Total amount processed today"
        />
      </Box>
      <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
        <MetricsCard
          title="Monthly Total"
          value={{
            current: monthlyTotal,
            format: 'currency',
          }}
          icon={TrendingUp}
          color="primary"
          isLoading={isLoading}
          helpText="Total payments processed this month"
        />
      </Box>
      <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
        <MetricsCard
          title="Failed Payments"
          value={{
            current: failedPayments,
            format: 'number',
          }}
          icon={TrendingDown}
          color="error"
          isLoading={isLoading}
          helpText="Number of failed payment transactions"
        />
      </Box>
    </Box>
  );
};