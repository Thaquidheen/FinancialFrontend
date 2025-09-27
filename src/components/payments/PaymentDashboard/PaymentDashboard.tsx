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
  Alert,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  FileDownload,
  Queue,
  CheckCircle,
  History,
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

  const statistics: PaymentStatistics | undefined = dashboardData?.statistics || {
    pendingPayments: 0,
    processingPayments: 0,
    completedPayments: 0,
    totalPendingAmount: 0,
    totalProcessingAmount: 0,
    totalCompletedAmount: 0,
    paymentsByBank: {},
    paymentsByStatus: {} as any,
    monthlyTrends: []
  };
  const quickActions: QuickAction[] = dashboardData?.quickActions || [];
  const alerts: PaymentAlert[] = dashboardData?.alerts || [];

  // Debug logging
  console.log('Dashboard Data:', dashboardData);
  console.log('Statistics:', statistics);
  console.log('Quick Actions:', quickActions);

  return (
    <Box className={className} sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: '#f8fafc', // Light gray background
    }}>
      {/* Header Section */}
      <Box 
        sx={{ 
          borderBottom: '1px solid #e2e8f0',
          px: 3,
          py: 2,
          bgcolor: '#ffffff',
          borderRadius: 0,
        }}
      >
        <Box sx={{ mb: 2 }}>
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
            Payment Processing Dashboard
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#64748b',
              fontSize: '0.875rem'
            }}
          >
            Manage and process payments for approved quotations
          </Typography>
        </Box>
      </Box>

      {/* Main Content Area */}
      <Box sx={{ flex: 1, overflow: 'hidden', p: 3 }}>
        {isLoading && <LinearProgress sx={{ mb: 2 }} />}

        {/* Alerts */}
        {alerts.length > 0 && (
          <Box mb={3}>
            {alerts.map((alert) => (
              <Alert
                key={alert.id}
                severity={alert.type.toLowerCase() as any}
                sx={{ 
                  mb: 1,
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  bgcolor: '#ffffff',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                }}
                action={
                  alert.actionUrl && alert.actionText ? (
                    <Button
                      color="inherit"
                      size="small"
                      onClick={() => navigate(alert.actionUrl!)}
                      sx={{
                        borderRadius: '8px',
                        fontWeight: 500
                      }}
                    >
                      {alert.actionText}
                    </Button>
                  ) : undefined
                }
              >
                <Typography 
                  variant="subtitle2"
                  sx={{ 
                    color: '#1a202c',
                    fontWeight: 600
                  }}
                >
                  {alert.title}
                </Typography>
                <Typography 
                  variant="body2"
                  sx={{ 
                    color: '#64748b',
                    fontSize: '0.875rem'
                  }}
                >
                  {alert.message}
                </Typography>
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
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              height: 'fit-content',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              bgcolor: '#ffffff',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            }}
          >
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{ 
                color: '#1a202c',
                fontWeight: 600,
                fontSize: '1.125rem'
              }}
            >
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              {quickActions.map((action) => (
                <Grid item xs={12} key={action.id}>
                  <Card 
                    elevation={0}
                    sx={{ 
                      cursor: action.enabled ? 'pointer' : 'not-allowed',
                      opacity: action.enabled ? 1 : 0.6,
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      bgcolor: '#ffffff',
                      '&:hover': action.enabled ? {
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        transform: 'translateY(-1px)',
                        transition: 'all 0.2s',
                        borderColor: '#3b82f6'
                      } : {}
                    }}
                    onClick={() => action.enabled && handleQuickAction(action.actionType)}
                  >
                    <CardContent sx={{ pb: 1 }}>
                      <Box display="flex" alignItems="center" mb={1}>
                        {action.icon === 'FileSpreadsheet' && <FileDownload sx={{ color: '#3b82f6' }} />}
                        {action.icon === 'Queue' && <Queue sx={{ color: '#3b82f6' }} />}
                        {action.icon === 'CheckCircle' && <CheckCircle sx={{ color: '#3b82f6' }} />}
                        {action.icon === 'History' && <History sx={{ color: '#3b82f6' }} />}
                        <Typography 
                          variant="subtitle1" 
                          sx={{ 
                            ml: 1, 
                            fontWeight: 600,
                            color: '#1a202c',
                            fontSize: '0.875rem'
                          }}
                        >
                          {action.title}
                        </Typography>
                        {action.count !== undefined && action.count > 0 && (
                          <Chip 
                            label={action.count} 
                            size="small" 
                            sx={{ 
                              ml: 'auto',
                              bgcolor: '#dbeafe',
                              color: '#1e40af',
                              fontWeight: 500,
                              border: 'none'
                            }}
                          />
                        )}
                      </Box>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#64748b',
                          fontSize: '0.75rem'
                        }}
                      >
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
          <Paper 
            elevation={0}
            sx={{ 
              p: 3,
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              bgcolor: '#ffffff',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            }}
          >
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
            {statistics?.paymentsByBank && (
              <Box>
                {Object.entries(statistics.paymentsByBank as Record<string, number>).map(([bankCode, count]) => {
                  const bank = saudiBankService.getBankByCode(bankCode);
                  const bankName = bank?.name || bankCode;
                  const percentage = (Number(count) / statistics.pendingPayments) * 100;
                  
                  return (
                    <Box key={bankCode} mb={2}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: '#374151',
                            fontWeight: 500
                          }}
                        >
                          {bankName}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: '#64748b',
                            fontSize: '0.875rem'
                          }}
                        >
                          {Number(count)} payments ({percentage.toFixed(1)}%)
                        </Typography>
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
                    </Box>
                  );
                })}
              </Box>
            )}
            {!statistics?.paymentsByBank && !isLoading && (
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#64748b',
                  fontSize: '0.875rem',
                  textAlign: 'center'
                }}
              >
                No payment data available
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Monthly Trends */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3,
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              bgcolor: '#ffffff',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            }}
          >
            <Typography 
              variant="h6" 
              gutterBottom 
              display="flex" 
              alignItems="center"
              sx={{ 
                color: '#1a202c',
                fontWeight: 600,
                fontSize: '1.125rem'
              }}
            >
              <TrendingUp sx={{ mr: 1, color: '#3b82f6' }} />
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
                    sx={{ borderColor: '#e2e8f0' }}
                  >
                    <Typography 
                      variant="body2"
                      sx={{ 
                        color: '#374151',
                        fontWeight: 500
                      }}
                    >
                      {new Date(trend.month).toLocaleDateString('en-US', { 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </Typography>
                    <Box textAlign="right">
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#1a202c',
                          fontWeight: 600
                        }}
                      >
                        {trend.completed} payments
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: '#64748b',
                          fontSize: '0.75rem'
                        }}
                      >
                        {saudiBankService.formatSAR(trend.amount)}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#64748b',
                  fontSize: '0.875rem',
                  textAlign: 'center'
                }}
              >
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
    </Box>
  );
};

export default PaymentDashboard;