// src/components/payments/PaymentDashboard/PaymentDashboard.tsx

import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  FileDownload,
  Queue,
  CheckCircle,
  History,
  Refresh,
  TrendingUp
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { paymentService } from '../../../services/paymentService';
import { saudiBankService } from '../../../services/saudiBankService';
import { PaymentStatistics, QuickAction, PaymentAlert } from '../../../types/payment.types';
import PaymentMetrics from './PaymentMetrics';
import PaymentStatusChart from './PaymentStatusChart';
import RecentPaymentsTable from './RecentPaymentsTable';

interface PaymentDashboardProps {
  className?: string;
}

const PaymentDashboard: React.FC<PaymentDashboardProps> = ({ className }) => {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch dashboard data
  const {
    data: dashboardData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['payment-dashboard', refreshKey],
    queryFn: () => paymentService.getDashboard(),
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refresh every minute
  });

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    refetch();
  };

  const handleQuickAction = (actionType: string) => {
    switch (actionType) {
      case 'GENERATE_FILE':
        navigate('/payments/queue');
        break;
      case 'VIEW_QUEUE':
        navigate('/payments/queue');
        break;
      case 'CHECK_STATUS':
        navigate('/payments/batches');
        break;
      case 'VIEW_HISTORY':
        navigate('/payments/history');
        break;
      default:
        break;
    }
  };

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        Failed to load payment dashboard: {error instanceof Error ? error.message : String(error)}
        <Button onClick={handleRefresh} size="small" sx={{ ml: 2 }}>
          Retry
        </Button>
      </Alert>
    );
  }

  const statistics: PaymentStatistics | undefined = dashboardData?.statistics;
  const quickActions: QuickAction[] = dashboardData?.quickActions || [];
  const alerts: PaymentAlert[] = dashboardData?.alerts || [];

  return (
    <Box className={className}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Payment Processing Dashboard
        </Typography>
        <Tooltip title="Refresh Dashboard">
          <IconButton 
            onClick={handleRefresh}
            disabled={isLoading}
            color="primary"
          >
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      {isLoading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Alerts */}
      {alerts.length > 0 && (
        <Box mb={3}>
          {alerts.map((alert) => (
            <Alert
              key={alert.id}
              severity={alert.type.toLowerCase() as any}
              sx={{ mb: 1 }}
              action={
                alert.actionUrl && alert.actionText ? (
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() => navigate(alert.actionUrl!)}
                  >
                    {alert.actionText}
                  </Button>
                ) : undefined
              }
            >
              <Typography variant="subtitle2">{alert.title}</Typography>
              <Typography variant="body2">{alert.message}</Typography>
            </Alert>
          ))}
        </Box>
      )}

      <Grid container spacing={3}>
        {/* Key Metrics */}
        <Grid item xs={12}>
          <PaymentMetrics 
            statistics={statistics} 
            isLoading={isLoading}
          />
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, height: 'fit-content' }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              {quickActions.map((action) => (
                <Grid item xs={12} key={action.id}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      cursor: action.enabled ? 'pointer' : 'not-allowed',
                      opacity: action.enabled ? 1 : 0.6,
                      '&:hover': action.enabled ? {
                        boxShadow: 2,
                        transform: 'translateY(-1px)',
                        transition: 'all 0.2s'
                      } : {}
                    }}
                    onClick={() => action.enabled && handleQuickAction(action.actionType)}
                  >
                    <CardContent sx={{ pb: 1 }}>
                      <Box display="flex" alignItems="center" mb={1}>
                        {action.icon === 'FileSpreadsheet' && <FileDownload color="primary" />}
                        {action.icon === 'Queue' && <Queue color="primary" />}
                        {action.icon === 'CheckCircle' && <CheckCircle color="primary" />}
                        {action.icon === 'History' && <History color="primary" />}
                        <Typography variant="subtitle1" sx={{ ml: 1, fontWeight: 'medium' }}>
                          {action.title}
                        </Typography>
                        {action.count !== undefined && action.count > 0 && (
                          <Chip 
                            label={action.count} 
                            size="small" 
                            color="primary" 
                            sx={{ ml: 'auto' }}
                          />
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {action.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Payment Status Chart */}
        <Grid item xs={12} lg={8}>
          <PaymentStatusChart 
            statistics={statistics}
            isLoading={isLoading}
          />
        </Grid>

        {/* Bank Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Payment Distribution by Bank
            </Typography>
            {statistics?.paymentsByBank && (
              <Box>
                {Object.entries(statistics.paymentsByBank as Record<string, number>).map(([bankCode, count]) => {
                  const bank = saudiBankService.getBankByCode(bankCode);
                  const bankName = bank?.name || bankCode;
                  const percentage = (Number(count) / statistics.pendingPayments) * 100;
                  
                  return (
                    <Box key={bankCode} mb={2}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                        <Typography variant="body2" fontWeight="medium">
                          {bankName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {Number(count)} payments ({percentage.toFixed(1)}%)
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={percentage} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          backgroundColor: 'grey.200',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: bank?.primaryColor || 'primary.main'
                          }
                        }}
                      />
                    </Box>
                  );
                })}
              </Box>
            )}
            {!statistics?.paymentsByBank && !isLoading && (
              <Typography variant="body2" color="text.secondary" textAlign="center">
                No payment data available
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Monthly Trends */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom display="flex" alignItems="center">
              <TrendingUp sx={{ mr: 1 }} />
              Monthly Payment Trends
            </Typography>
            {statistics?.monthlyTrends && statistics.monthlyTrends.length > 0 ? (
              <Box>
                {statistics.monthlyTrends.slice(-6).map((trend, index) => (
                  <Box 
                    key={trend.month} 
                    display="flex" 
                    justifyContent="space-between" 
                    alignItems="center" 
                    py={1}
                    borderBottom={index < statistics.monthlyTrends.length - 1 ? 1 : 0}
                    borderColor="grey.200"
                  >
                    <Typography variant="body2">
                      {new Date(trend.month).toLocaleDateString('en-US', { 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </Typography>
                    <Box textAlign="right">
                      <Typography variant="body2" fontWeight="medium">
                        {trend.completed} payments
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {saudiBankService.formatSAR(trend.amount)}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" textAlign="center">
                No trend data available
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Recent Payments */}
        <Grid item xs={12}>
          <RecentPaymentsTable 
            payments={dashboardData?.recentPayments || []}
            isLoading={isLoading}
            onViewDetails={(paymentId) => navigate(`/payments/${paymentId}`)}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default PaymentDashboard;