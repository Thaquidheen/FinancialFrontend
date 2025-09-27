// pages/approvals/ApprovalDashboardPage.tsx
import React from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useApprovalStats } from '../../hooks/approvals/useApprovalStats';

const ApprovalDashboardPage: React.FC = () => {
  const {
    statistics,
    loading,
    error,
    lastUpdated,
    refreshStatistics,
    approvalRate,
    averageProcessingTime,
    budgetComplianceRate,
  } = useApprovalStats();

  const renderMetricCard = (
    title: string,
    value: string | number,
    icon: React.ReactNode,
    color: 'primary' | 'success' | 'warning' | 'error' | 'info',
    subtitle?: string
  ) => {
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
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          bgcolor: '#ffffff',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        }}
      >
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography 
                sx={{ 
                  color: '#64748b',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  mb: 1
                }} 
                gutterBottom 
                variant="body2"
              >
                {title}
              </Typography>
              <Typography 
                variant="h4" 
                sx={{ 
                  color: colorMap[color],
                  fontWeight: 700,
                  fontSize: '1.875rem',
                  mb: subtitle ? 0.5 : 0
                }}
              >
                {value}
              </Typography>
              {subtitle && (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#64748b',
                    fontSize: '0.75rem'
                  }}
                >
                  {subtitle}
                </Typography>
              )}
            </Box>
            <Box sx={{ color: colorMap[color] }}>
              {icon}
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const renderWorkloadDistribution = () => {
    if (!statistics?.workloadDistribution) return null;

    return (
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
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{ 
              color: '#1a202c',
              fontWeight: 600,
              fontSize: '1.125rem'
            }}
          >
            Workload Distribution
          </Typography>
          <Box sx={{ mt: 2 }}>
            {statistics.workloadDistribution.map((workload) => (
              <Box key={workload.managerId} sx={{ mb: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography 
                    variant="body2"
                    sx={{ 
                      color: '#374151',
                      fontWeight: 500
                    }}
                  >
                    {workload.managerName}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#64748b',
                      fontSize: '0.875rem'
                    }}
                  >
                    {workload.pendingCount} pending
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(workload.pendingCount / Math.max(...statistics.workloadDistribution.map(w => w.pendingCount))) * 100}
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    bgcolor: '#f1f5f9',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: '#3b82f6',
                      borderRadius: 4
                    }
                  }}
                />
                <Box display="flex" justifyContent="space-between" sx={{ mt: 0.5 }}>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: '#64748b',
                      fontSize: '0.75rem'
                    }}
                  >
                    Approved: {workload.approvedCount}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: '#64748b',
                      fontSize: '0.75rem'
                    }}
                  >
                    Avg: {workload.averageTime}h
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    );
  };

  const renderApprovalTrends = () => {
    if (!statistics?.approvalTrends) return null;

    const recentTrends = statistics.approvalTrends.slice(-7); // Last 7 days

    return (
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
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{ 
              color: '#1a202c',
              fontWeight: 600,
              fontSize: '1.125rem'
            }}
          >
            Approval Trends (Last 7 Days)
          </Typography>
          <Box sx={{ mt: 2 }}>
            {recentTrends.map((trend) => (
              <Box key={trend.date} sx={{ mb: 2 }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#64748b',
                    fontSize: '0.875rem',
                    mb: 1
                  }} 
                  gutterBottom
                >
                  {new Date(trend.date).toLocaleDateString()}
                </Typography>
                <Box display="flex" gap={1} sx={{ mb: 1 }}>
                  <Chip 
                    label={`${trend.approved} approved`} 
                    size="small" 
                    sx={{
                      bgcolor: '#dcfce7',
                      color: '#166534',
                      fontWeight: 500,
                      border: 'none'
                    }}
                    icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
                  />
                  <Chip 
                    label={`${trend.rejected} rejected`} 
                    size="small" 
                    sx={{
                      bgcolor: '#fef2f2',
                      color: '#dc2626',
                      fontWeight: 500,
                      border: 'none'
                    }}
                    icon={<CancelIcon sx={{ fontSize: 16 }} />}
                  />
                  <Chip 
                    label={`${trend.pending} pending`} 
                    size="small" 
                    sx={{
                      bgcolor: '#fef3c7',
                      color: '#d97706',
                      fontWeight: 500,
                      border: 'none'
                    }}
                    icon={<ScheduleIcon sx={{ fontSize: 16 }} />}
                  />
                </Box>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    );
  };

  const renderBudgetCompliance = () => {
    if (!statistics?.budgetComplianceStats) return null;

    const { compliant, warning, exceeded, total } = statistics.budgetComplianceStats;

    return (
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
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{ 
              color: '#1a202c',
              fontWeight: 600,
              fontSize: '1.125rem'
            }}
          >
            Budget Compliance
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Box sx={{ mb: 2 }}>
              <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography 
                  variant="body2"
                  sx={{ 
                    color: '#374151',
                    fontWeight: 500
                  }}
                >
                  Compliant
                </Typography>
                <Typography 
                  variant="body2"
                  sx={{ 
                    color: '#1a202c',
                    fontWeight: 600
                  }}
                >
                  {compliant}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(compliant / total) * 100}
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  bgcolor: '#f1f5f9',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: '#16a34a',
                    borderRadius: 4
                  }
                }}
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography 
                  variant="body2"
                  sx={{ 
                    color: '#374151',
                    fontWeight: 500
                  }}
                >
                  Warning
                </Typography>
                <Typography 
                  variant="body2"
                  sx={{ 
                    color: '#1a202c',
                    fontWeight: 600
                  }}
                >
                  {warning}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(warning / total) * 100}
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  bgcolor: '#f1f5f9',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: '#f59e0b',
                    borderRadius: 4
                  }
                }}
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography 
                  variant="body2"
                  sx={{ 
                    color: '#374151',
                    fontWeight: 500
                  }}
                >
                  Exceeded
                </Typography>
                <Typography 
                  variant="body2"
                  sx={{ 
                    color: '#1a202c',
                    fontWeight: 600
                  }}
                >
                  {exceeded}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(exceeded / total) * 100}
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  bgcolor: '#f1f5f9',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: '#dc2626',
                    borderRadius: 4
                  }
                }}
              />
            </Box>

            <Box 
              sx={{ 
                mt: 2, 
                p: 2, 
                bgcolor: '#f8fafc', 
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}
            >
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#64748b',
                  fontSize: '0.875rem',
                  textAlign: 'center'
                }}
              >
                Overall Compliance Rate: <strong style={{ color: '#1a202c' }}>{budgetComplianceRate.toFixed(1)}%</strong>
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const renderPerformanceMetrics = () => (
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
        <Typography 
          variant="h6" 
          gutterBottom
          sx={{ 
            color: '#1a202c',
            fontWeight: 600,
            fontSize: '1.125rem'
          }}
        >
          Performance Metrics
        </Typography>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={6}>
            <Box textAlign="center">
              <Typography 
                variant="h4" 
                sx={{ 
                  color: '#3b82f6',
                  fontWeight: 700,
                  fontSize: '1.875rem'
                }}
              >
                {approvalRate.toFixed(1)}%
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#64748b',
                  fontSize: '0.875rem',
                  fontWeight: 500
                }}
              >
                Approval Rate
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box textAlign="center">
              <Typography 
                variant="h4" 
                sx={{ 
                  color: '#06b6d4',
                  fontWeight: 700,
                  fontSize: '1.875rem'
                }}
              >
                {averageProcessingTime}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#64748b',
                  fontSize: '0.875rem',
                  fontWeight: 500
                }}
              >
                Avg Processing Time
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  if (loading && !statistics) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={refreshStatistics}>
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: '#f8fafc', // Light gray background
    }}>
      {/* Header Section */}
      <Paper 
        elevation={0} 
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
            Approval Dashboard
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#64748b',
              fontSize: '0.875rem'
            }}
          >
            Real-time insights into approval workflow performance
            {lastUpdated && (
              <span style={{ marginLeft: '16px' }}>
                Last updated: {lastUpdated.toLocaleString()}
              </span>
            )}
          </Typography>
        </Box>
      </Paper>

      {/* Main Content Area */}
      <Box sx={{ flex: 1, overflow: 'hidden', p: 3 }}>
        {/* Key Metrics */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            {renderMetricCard(
              'Total Pending',
              statistics?.totalPending || 0,
              <ScheduleIcon sx={{ fontSize: 40 }} />,
              'warning',
              'Awaiting review'
            )}
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            {renderMetricCard(
              'Urgent Approvals',
              statistics?.totalUrgent || 0,
              <WarningIcon sx={{ fontSize: 40 }} />,
              'error',
              '>3 days pending'
            )}
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            {renderMetricCard(
              'Approved Today',
              statistics?.approvedToday || 0,
              <CheckCircleIcon sx={{ fontSize: 40 }} />,
              'success',
              'Completed approvals'
            )}
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            {renderMetricCard(
              'Rejected Today',
              statistics?.rejectedToday || 0,
              <CancelIcon sx={{ fontSize: 40 }} />,
              'error',
              'Rejected quotations'
            )}
          </Grid>
        </Grid>

        {/* Charts and Analytics */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            {renderWorkloadDistribution()}
          </Grid>
          
          <Grid item xs={12} md={6}>
            {renderApprovalTrends()}
          </Grid>
          
          <Grid item xs={12} md={6}>
            {renderBudgetCompliance()}
          </Grid>
          
          <Grid item xs={12} md={6}>
            {renderPerformanceMetrics()}
          </Grid>
        </Grid>

        {/* Summary */}
        <Paper 
          elevation={0}
          sx={{ 
            p: 3, 
            mt: 3,
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
            Summary
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#64748b',
              fontSize: '0.875rem',
              lineHeight: 1.6
            }}
          >
            The approval dashboard provides real-time insights into the approval workflow performance.
            Monitor pending approvals, track processing times, and ensure budget compliance across all projects.
            Use the refresh button to get the latest data.
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default ApprovalDashboardPage;