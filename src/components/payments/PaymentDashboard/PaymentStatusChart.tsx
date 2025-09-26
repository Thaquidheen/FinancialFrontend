// src/components/payments/PaymentDashboard/PaymentStatusChart.tsx

import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  FormControl,
  Select,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  Grid
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import {
  DonutLarge,
  BarChart as BarChartIcon,
  TrendingUp,
  Refresh,
  Info
} from '@mui/icons-material';
import { PaymentStatistics, PaymentStatus } from '../../../types/payment.types';
import { PAYMENT_STATUS_LABELS } from '../../../constants/payments/paymentConstants';
import { saudiBankService } from '../../../services/saudiBankService';

interface PaymentStatusChartProps {
  statistics?: PaymentStatistics;
  isLoading?: boolean;
  className?: string;
  onRefresh?: () => void;
}

type ChartType = 'pie' | 'bar' | 'trend';
type ViewType = 'count' | 'amount';

const PaymentStatusChart: React.FC<PaymentStatusChartProps> = ({
  statistics,
  isLoading,
  className,
  onRefresh
}) => {
  const [chartType, setChartType] = useState<ChartType>('pie');
  const [viewType, setViewType] = useState<ViewType>('count');

  const handleChartTypeChange = (
    event: React.MouseEvent<HTMLElement>,
    newType: ChartType | null
  ) => {
    if (newType !== null) {
      setChartType(newType);
    }
  };

  const handleViewTypeChange = (event: any) => {
    setViewType(event.target.value as ViewType);
  };

  if (isLoading) {
    return (
      <Paper sx={{ p: 3 }} className={className}>
        <Typography variant="h6" gutterBottom>
          Payment Status Distribution
        </Typography>
        <Box height={400} display="flex" alignItems="center" justifyContent="center">
          <LinearProgress sx={{ width: '50%' }} />
        </Box>
      </Paper>
    );
  }

  if (!statistics) {
    return (
      <Paper sx={{ p: 3 }} className={className}>
        <Typography variant="h6" gutterBottom>
          Payment Status Distribution
        </Typography>
        <Box height={400} display="flex" alignItems="center" justifyContent="center">
          <Typography variant="body2" color="text.secondary">
            No payment data available
          </Typography>
        </Box>
      </Paper>
    );
  }

  // Prepare data based on viewType
  const getStatusData = () => {
    const statusData = [
      {
        status: PaymentStatus.READY_FOR_PAYMENT,
        label: PAYMENT_STATUS_LABELS[PaymentStatus.READY_FOR_PAYMENT],
        count: statistics.pendingPayments,
        amount: statistics.totalPendingAmount,
        color: '#ed6c02' // warning
      },
      {
        status: PaymentStatus.BANK_PROCESSING,
        label: PAYMENT_STATUS_LABELS[PaymentStatus.BANK_PROCESSING],
        count: statistics.processingPayments,
        amount: statistics.totalProcessingAmount,
        color: '#0288d1' // info
      },
      {
        status: PaymentStatus.COMPLETED,
        label: PAYMENT_STATUS_LABELS[PaymentStatus.COMPLETED],
        count: statistics.completedPayments,
        amount: statistics.totalCompletedAmount,
        color: '#2e7d32' // success
      }
    ];

    return statusData.filter(item => 
      viewType === 'count' ? item.count > 0 : item.amount > 0
    );
  };

  const getTrendData = () => {
    if (!statistics.monthlyTrends) return [];
    
    return statistics.monthlyTrends.slice(-6).map(trend => ({
      month: new Date(trend.month).toLocaleDateString('en-US', { 
        month: 'short',
        year: '2-digit'
      }),
      completed: trend.completed,
      amount: trend.amount / 1000, // Convert to thousands for readability
      formattedAmount: saudiBankService.formatSAR(trend.amount)
    }));
  };

  const statusData = getStatusData();
  const trendData = getTrendData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Paper sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle2" gutterBottom>
            {label || data.label}
          </Typography>
          {viewType === 'count' ? (
            <>
              <Typography variant="body2" color="text.secondary">
                Count: {data.count?.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Amount: {saudiBankService.formatSAR(data.amount)}
              </Typography>
            </>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary">
                Amount: {saudiBankService.formatSAR(data.amount)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Count: {data.count?.toLocaleString()}
              </Typography>
            </>
          )}
        </Paper>
      );
    }
    return null;
  };

  const renderPieChart = () => (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={statusData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ label, percent }) => `${label}: ${(percent * 100).toFixed(1)}%`}
          outerRadius={120}
          fill="#8884d8"
          dataKey={viewType === 'count' ? 'count' : 'amount'}
        >
          {statusData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <RechartsTooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={statusData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="label" 
          angle={-45}
          textAnchor="end"
          height={80}
          interval={0}
        />
        <YAxis />
        <RechartsTooltip content={<CustomTooltip />} />
        <Bar 
          dataKey={viewType === 'count' ? 'count' : 'amount'} 
          fill="#1976d2"
          radius={[4, 4, 0, 0]}
        >
          {statusData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );

  const renderTrendChart = () => {
    if (!trendData || trendData.length === 0) {
      return (
        <Box height={350} display="flex" alignItems="center" justifyContent="center">
          <Typography variant="body2" color="text.secondary">
            No trend data available
          </Typography>
        </Box>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={350}>
        {viewType === 'count' ? (
          <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <RechartsTooltip 
              formatter={(value: any, name: string) => [
                name === 'completed' ? `${value} payments` : saudiBankService.formatSAR(value * 1000),
                name === 'completed' ? 'Completed Payments' : 'Total Amount'
              ]}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="completed" 
              stroke="#2e7d32" 
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Completed Payments"
            />
          </LineChart>
        ) : (
          <AreaChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <RechartsTooltip 
              formatter={(value: any) => [saudiBankService.formatSAR(value * 1000), 'Amount']}
            />
            <Area 
              type="monotone" 
              dataKey="amount" 
              stroke="#1976d2" 
              fill="#1976d2"
              fillOpacity={0.3}
            />
          </AreaChart>
        )}
      </ResponsiveContainer>
    );
  };

  return (
    <Paper sx={{ p: 3 }} className={className}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">
          Payment Status Distribution
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select value={viewType} onChange={handleViewTypeChange}>
              <MenuItem value="count">By Count</MenuItem>
              <MenuItem value="amount">By Amount</MenuItem>
            </Select>
          </FormControl>
          
          <ToggleButtonGroup
            value={chartType}
            exclusive
            onChange={handleChartTypeChange}
            size="small"
          >
            <ToggleButton value="pie">
              <DonutLarge />
            </ToggleButton>
            <ToggleButton value="bar">
              <BarChartIcon />
            </ToggleButton>
            <ToggleButton value="trend">
              <TrendingUp />
            </ToggleButton>
          </ToggleButtonGroup>

          {onRefresh && (
            <Tooltip title="Refresh Data">
              <IconButton onClick={onRefresh} size="small">
                <Refresh />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Chart Content */}
      <Box>
        {chartType === 'pie' && renderPieChart()}
        {chartType === 'bar' && renderBarChart()}
        {chartType === 'trend' && renderTrendChart()}
      </Box>

      {/* Legend for Pie Chart */}
      {chartType === 'pie' && (
        <Box display="flex" flexWrap="wrap" justifyContent="center" gap={2} mt={2}>
          {statusData.map((item) => (
            <Chip
              key={item.status}
              label={`${item.label}: ${viewType === 'count' ? item.count : saudiBankService.formatSAR(item.amount)}`}
              sx={{
                backgroundColor: item.color,
                color: 'white',
                fontWeight: 'medium'
              }}
            />
          ))}
        </Box>
      )}

      {/* Summary Stats */}
      {chartType !== 'trend' && (
        <Box mt={3} p={2} bgcolor="grey.50" borderRadius={1}>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Typography variant="caption" color="text.secondary">
                Total Payments
              </Typography>
              <Typography variant="h6">
                {statusData.reduce((sum, item) => sum + item.count, 0)}
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="caption" color="text.secondary">
                Total Amount
              </Typography>
              <Typography variant="h6">
                {saudiBankService.formatSAR(statusData.reduce((sum, item) => sum + item.amount, 0))}
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="caption" color="text.secondary">
                Completion Rate
              </Typography>
              <Typography variant="h6">
                {statusData.length > 0 ? 
                  (((statusData.find(item => item.status === PaymentStatus.COMPLETED)?.count || 0) / 
                    statusData.reduce((sum, item) => sum + item.count, 0)) * 100).toFixed(1) : 0
                }%
              </Typography>
            </Grid>
          </Grid>
        </Box>
      )}
    </Paper>
  );
};

export default PaymentStatusChart;