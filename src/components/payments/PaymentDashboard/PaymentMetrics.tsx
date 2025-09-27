// src/components/payments/PaymentDashboard/PaymentMetrics.tsx

import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  Avatar
} from '@mui/material';
import {
  AttachMoney,
  Schedule,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Info
} from '@mui/icons-material';
import { PaymentStatistics } from '../../../types/payment.types';
import { saudiBankService } from '../../../services/saudiBankService';

interface PaymentMetricsProps {
  statistics?: PaymentStatistics;
  isLoading?: boolean;
  className?: string;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: 'primary' | 'success' | 'warning' | 'error' | 'info';
  trend?: {
    direction: 'up' | 'down';
    percentage: number;
    period: string;
  };
  progress?: {
    current: number;
    target: number;
    label?: string;
  };
  tooltip?: string;
  onClick?: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color,
  trend,
  progress,
  tooltip,
  onClick
}) => {
  const colorMap = {
    primary: '#3b82f6',
    success: '#16a34a',
    warning: '#f59e0b',
    error: '#dc2626',
    info: '#06b6d4'
  };

  return (
    <Card 
      elevation={0}
      sx={{ 
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        bgcolor: '#ffffff',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        '&:hover': onClick ? {
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          transform: 'translateY(-2px)',
          transition: 'all 0.2s ease-in-out',
          borderColor: '#3b82f6'
        } : {}
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Avatar sx={{ bgcolor: colorMap[color], width: 48, height: 48 }}>
            {icon}
          </Avatar>
          {tooltip && (
            <Tooltip title={tooltip}>
              <IconButton size="small">
                <Info fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Typography 
          variant="h4" 
          sx={{ 
            color: '#1a202c',
            fontWeight: 700,
            fontSize: '1.875rem',
            mb: 1
          }}
        >
          {typeof value === 'number' ? (value || 0).toLocaleString() : value}
        </Typography>

        <Typography 
          variant="h6" 
          sx={{ 
            color: '#64748b',
            fontSize: '0.875rem',
            fontWeight: 500,
            mb: subtitle ? 1 : 0
          }}
        >
          {title}
        </Typography>

        {subtitle && (
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#64748b',
              fontSize: '0.75rem',
              mb: 1
            }}
          >
            {subtitle}
          </Typography>
        )}

        {/* Trend Indicator */}
        {trend && (
          <Box display="flex" alignItems="center" gap={0.5} mb={1}>
            {trend.direction === 'up' ? (
              <TrendingUp sx={{ color: '#16a34a', fontSize: 16 }} />
            ) : (
              <TrendingDown sx={{ color: '#dc2626', fontSize: 16 }} />
            )}
            <Typography 
              variant="caption" 
              sx={{ 
                color: trend.direction === 'up' ? '#16a34a' : '#dc2626',
                fontWeight: 500,
                fontSize: '0.75rem'
              }}
            >
              {trend.percentage.toFixed(1)}% {trend.period}
            </Typography>
          </Box>
        )}

        {/* Progress Bar */}
        {progress && (
          <Box mt={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#64748b',
                  fontSize: '0.75rem'
                }}
              >
                {progress.label || 'Progress'}
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#64748b',
                  fontSize: '0.75rem'
                }}
              >
                {((progress.current / progress.target) * 100).toFixed(1)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={(progress.current / progress.target) * 100}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: '#f1f5f9',
                '& .MuiLinearProgress-bar': {
                  bgcolor: colorMap[color],
                  borderRadius: 3
                }
              }}
            />
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#64748b',
                fontSize: '0.75rem',
                mt: 0.5
              }}
            >
              {(progress.current || 0).toLocaleString()} of {(progress.target || 0).toLocaleString()}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const PaymentMetrics: React.FC<PaymentMetricsProps> = ({
  statistics,
  isLoading,
  className
}) => {
  if (isLoading) {
    return (
      <Box className={className}>
        <Grid container spacing={2}>
          {[1, 2, 3, 4, 5, 6].map((index) => (
            <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
              <Card 
                elevation={0}
                sx={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  bgcolor: '#ffffff',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar sx={{ bgcolor: '#f1f5f9', width: 48, height: 48 }}>
                      <Schedule sx={{ color: '#9ca3af' }} />
                    </Avatar>
                  </Box>
                  <LinearProgress sx={{ mb: 2, bgcolor: '#f1f5f9' }} />
                  <LinearProgress sx={{ mb: 1, width: '60%', bgcolor: '#f1f5f9' }} />
                  <LinearProgress sx={{ width: '40%', bgcolor: '#f1f5f9' }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (!statistics) {
    return (
      <Box className={className} textAlign="center" py={4}>
        <Typography variant="h6" color="text.secondary">
          No payment statistics available
        </Typography>
      </Box>
    );
  }

  const totalPayments = (statistics.pendingPayments || 0) + (statistics.processingPayments || 0) + (statistics.completedPayments || 0);
  const totalAmount = (statistics.totalPendingAmount || 0) + (statistics.totalProcessingAmount || 0) + (statistics.totalCompletedAmount || 0);

  return (
    <Box className={className}>
      <Grid container spacing={3}>
        {/* Pending Payments */}
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <MetricCard
            title="Pending Payments"
            value={statistics.pendingPayments || 0}
            subtitle={saudiBankService.formatSAR(statistics.totalPendingAmount || 0)}
            icon={<Schedule />}
            color="warning"
            progress={{
              current: statistics.pendingPayments || 0,
              target: totalPayments,
              label: 'Of Total Payments'
            }}
            tooltip="Payments ready for bank file generation"
          />
        </Grid>

        {/* Processing Payments */}
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <MetricCard
            title="Processing"
            value={statistics.processingPayments || 0}
            subtitle={saudiBankService.formatSAR(statistics.totalProcessingAmount || 0)}
            icon={<AccountBalance />}
            color="info"
            progress={{
              current: statistics.processingPayments || 0,
              target: totalPayments,
              label: 'Of Total Payments'
            }}
            tooltip="Payments currently being processed by banks"
          />
        </Grid>

        {/* Completed Payments */}
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <MetricCard
            title="Completed"
            value={statistics.completedPayments || 0}
            subtitle={saudiBankService.formatSAR(statistics.totalCompletedAmount || 0)}
            icon={<CheckCircle />}
            color="success"
            progress={{
              current: statistics.completedPayments || 0,
              target: totalPayments,
              label: 'Of Total Payments'
            }}
            tooltip="Successfully completed payments"
          />
        </Grid>

        {/* Total Amount */}
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <MetricCard
            title="Total Amount"
            value={saudiBankService.formatSAR(totalAmount)}
            subtitle={`${totalPayments} payments`}
            icon={<AttachMoney />}
            color="primary"
            tooltip="Total value of all payments in the system"
          />
        </Grid>

        {/* Success Rate */}
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <MetricCard
            title="Success Rate"
            value={`${totalPayments > 0 ? (((statistics.completedPayments || 0) / totalPayments) * 100).toFixed(1) : 0}%`}
            subtitle="Payment completion rate"
            icon={<TrendingUp />}
            color="success"
            progress={{
              current: statistics.completedPayments || 0,
              target: totalPayments,
              label: 'Completion Rate'
            }}
            tooltip="Percentage of payments successfully completed"
          />
        </Grid>

        {/* Bank Distribution */}
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <MetricCard
            title="Active Banks"
            value={Object.keys(statistics.paymentsByBank || {}).length}
            subtitle={`${Object.values(statistics.paymentsByBank || {}).reduce((a, b) => a + b, 0)} total`}
            icon={<AccountBalance />}
            color="info"
            tooltip="Number of banks currently processing payments"
          />
        </Grid>
      </Grid>

      {/* Bank Breakdown */}
      {statistics.paymentsByBank && Object.keys(statistics.paymentsByBank).length > 0 && (
        <Box mt={4}>
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{ 
              color: '#1a202c',
              fontWeight: 600,
              fontSize: '1.125rem'
            }}
          >
            Payment Distribution by Bank
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(statistics.paymentsByBank).map(([bankCode, count]) => {
              const bank = saudiBankService.getBankByCode(bankCode);
              const bankName = bank?.name || bankCode;
              const percentage = totalPayments > 0 ? (count / totalPayments) * 100 : 0;

              return (
                <Grid item xs={12} sm={6} md={4} key={bankCode}>
                  <Card 
                    elevation={0}
                    sx={{ 
                      p: 2,
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      bgcolor: '#ffffff',
                      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                      <Typography 
                        variant="subtitle2" 
                        sx={{ 
                          color: '#374151',
                          fontWeight: 500
                        }}
                      >
                        {bankName}
                      </Typography>
                      <Chip 
                        label={count} 
                        size="small" 
                        sx={{ 
                          bgcolor: bank?.primaryColor || '#3b82f6',
                          color: '#ffffff',
                          fontWeight: 500,
                          border: 'none'
                        }}
                      />
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={percentage}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: '#f1f5f9',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: bank?.primaryColor || '#3b82f6',
                          borderRadius: 4
                        }
                      }}
                    />
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: '#64748b',
                        fontSize: '0.75rem',
                        mt: 0.5
                      }}
                    >
                      {percentage.toFixed(1)}% of total payments
                    </Typography>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default PaymentMetrics;