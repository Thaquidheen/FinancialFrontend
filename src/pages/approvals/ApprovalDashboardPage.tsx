// pages/approvals/ApprovalDashboardPage.tsx
import React, { useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Paper,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { useApprovalStats } from '../../hooks/approvals/useApprovalStats';
import { formatCurrency } from '../../utils/approvals/approvalUtils';

const ApprovalDashboardPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');
  
  const {
    statistics,
    loading,
    error,
    lastUpdated,
    loadStatistics,
    refreshStatistics,
    approvalRate,
    averageProcessingTime,
    workloadBalance,
    budgetComplianceRate,
  } = useApprovalStats();

  const renderMetricCard = (
    title: string,
    value: string | number,
    icon: React.ReactNode,
    color: 'primary' | 'success' | 'warning' | 'error' | 'info',
    subtitle?: string
  ) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" color={`${color}.main`}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box color={`${color}.main`}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const renderWorkloadDistribution = () => {
    if (!statistics?.workloadDistribution) return null;

    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Workload Distribution
          </Typography>
          <Box sx={{ mt: 2 }}>
            {statistics.workloadDistribution.map((workload, index) => (
              <Box key={workload.managerId} sx={{ mb: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="body2">
                    {workload.managerName}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {workload.pendingCount} pending
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(workload.pendingCount / Math.max(...statistics.workloadDistribution.map(w => w.pendingCount))) * 100}
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Box display="flex" justifyContent="space-between" sx={{ mt: 0.5 }}>
                  <Typography variant="caption" color="textSecondary">
                    Approved: {workload.approvedCount}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
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
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Approval Trends (Last 7 Days)
          </Typography>
          <Box sx={{ mt: 2 }}>
            {recentTrends.map((trend, index) => (
              <Box key={trend.date} sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  {new Date(trend.date).toLocaleDateString()}
                </Typography>
                <Box display="flex" gap={1} sx={{ mb: 1 }}>
                  <Chip 
                    label={`${trend.approved} approved`} 
                    size="small" 
                    color="success" 
                    icon={<CheckCircleIcon />}
                  />
                  <Chip 
                    label={`${trend.rejected} rejected`} 
                    size="small" 
                    color="error" 
                    icon={<CancelIcon />}
                  />
                  <Chip 
                    label={`${trend.pending} pending`} 
                    size="small" 
                    color="warning" 
                    icon={<ScheduleIcon />}
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
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Budget Compliance
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Box sx={{ mb: 2 }}>
              <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="body2">Compliant</Typography>
                <Typography variant="body2">{compliant}</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(compliant / total) * 100}
                color="success"
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="body2">Warning</Typography>
                <Typography variant="body2">{warning}</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(warning / total) * 100}
                color="warning"
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="body2">Exceeded</Typography>
                <Typography variant="body2">{exceeded}</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(exceeded / total) * 100}
                color="error"
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>

            <Box sx={{ mt: 2, p: 2, backgroundColor: 'background.default', borderRadius: 1 }}>
              <Typography variant="body2" color="textSecondary" align="center">
                Overall Compliance Rate: <strong>{budgetComplianceRate.toFixed(1)}%</strong>
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const renderPerformanceMetrics = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Performance Metrics
        </Typography>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={6}>
            <Box textAlign="center">
              <Typography variant="h4" color="primary">
                {approvalRate.toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Approval Rate
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box textAlign="center">
              <Typography variant="h4" color="info.main">
                {averageProcessingTime}
              </Typography>
              <Typography variant="body2" color="textSecondary">
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
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Approval Dashboard
          </Typography>
          {lastUpdated && (
            <Typography variant="body2" color="textSecondary">
              Last updated: {lastUpdated.toLocaleString()}
            </Typography>
          )}
        </Box>
        
        <Box display="flex" gap={1}>
          <IconButton onClick={refreshStatistics} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
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
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Summary
        </Typography>
        <Typography variant="body2" color="textSecondary">
          The approval dashboard provides real-time insights into the approval workflow performance.
          Monitor pending approvals, track processing times, and ensure budget compliance across all projects.
          Use the refresh button to get the latest data.
        </Typography>
      </Paper>
    </Container>
  );
};

export default ApprovalDashboardPage;