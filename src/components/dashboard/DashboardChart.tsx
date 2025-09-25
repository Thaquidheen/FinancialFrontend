import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  useTheme,
  Skeleton,
  Alert,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from 'recharts';
import { formatCurrency } from '@utils/helpers';

// Chart color palette
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

interface ChartWrapperProps {
  title: string;
  children: React.ReactNode;
  isLoading?: boolean;
  error?: any;
  height?: number;
}

const ChartWrapper: React.FC<ChartWrapperProps> = ({
  title,
  children,
  isLoading = false,
  error,
  height = 300,
}) => {
  return (
    <Card elevation={2}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Box sx={{ width: '100%', height }}>
          {isLoading ? (
            <Skeleton variant="rectangular" width="100%" height={height - 20} />
          ) : error ? (
            <Alert severity="error">Failed to load chart data</Alert>
          ) : (
            children
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

// Budget Utilization Chart
interface BudgetUtilizationData {
  name: string;
  budget: number;
  spent: number;
  remaining: number;
}

interface BudgetUtilizationChartProps {
  data: BudgetUtilizationData[];
  isLoading?: boolean;
  error?: any;
}

export const BudgetUtilizationChart: React.FC<BudgetUtilizationChartProps> = ({
  data,
  isLoading,
  error,
}) => {
  const theme = useTheme();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            backgroundColor: 'background.paper',
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            p: 1.5,
            boxShadow: 3,
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {label}
          </Typography>
          {payload.map((entry: any, index: number) => (
            <Typography key={index} variant="body2" sx={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </Typography>
          ))}
        </Box>
      );
    }
    return null;
  };

  return (
    <ChartWrapper title="Budget Utilization by Project" isLoading={isLoading} error={error}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis 
            dataKey="name" 
            stroke={theme.palette.text.secondary}
            fontSize={12}
          />
          <YAxis 
            stroke={theme.palette.text.secondary}
            fontSize={12}
            tickFormatter={(value) => formatCurrency(value).replace('SAR ', '')}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar 
            dataKey="budget" 
            fill={theme.palette.primary.main} 
            name="Budget"
            radius={[2, 2, 0, 0]}
          />
          <Bar 
            dataKey="spent" 
            fill={theme.palette.success.main} 
            name="Spent"
            radius={[2, 2, 0, 0]}
          />
          <Bar 
            dataKey="remaining" 
            fill={theme.palette.warning.main} 
            name="Remaining"
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

// Spending Trends Chart
interface SpendingTrendData {
  period: string;
  actual: number;
  budget: number;
  projected?: number;
}

interface SpendingTrendsChartProps {
  data: SpendingTrendData[];
  isLoading?: boolean;
  error?: any;
}

export const SpendingTrendsChart: React.FC<SpendingTrendsChartProps> = ({
  data,
  isLoading,
  error,
}) => {
  const theme = useTheme();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            backgroundColor: 'background.paper',
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            p: 1.5,
            boxShadow: 3,
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {label}
          </Typography>
          {payload.map((entry: any, index: number) => (
            <Typography key={index} variant="body2" sx={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </Typography>
          ))}
        </Box>
      );
    }
    return null;
  };

  return (
    <ChartWrapper title="Monthly Spending Trends" isLoading={isLoading} error={error}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={theme.palette.success.main} stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="period" 
            stroke={theme.palette.text.secondary}
            fontSize={12}
          />
          <YAxis 
            stroke={theme.palette.text.secondary}
            fontSize={12}
            tickFormatter={(value) => formatCurrency(value).replace('SAR ', '')}
          />
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="budget"
            stroke={theme.palette.success.main}
            fillOpacity={1}
            fill="url(#colorBudget)"
            name="Budget"
          />
          <Area
            type="monotone"
            dataKey="actual"
            stroke={theme.palette.primary.main}
            fillOpacity={1}
            fill="url(#colorActual)"
            name="Actual Spending"
          />
          <Legend />
        </AreaChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

// Category Spending Pie Chart
interface CategorySpendingData {
  name: string;
  value: number;
  percentage: number;
  [key: string]: any; // Index signature for Recharts compatibility
}

interface CategorySpendingChartProps {
  data: CategorySpendingData[];
  isLoading?: boolean;
  error?: any;
}

export const CategorySpendingChart: React.FC<CategorySpendingChartProps> = ({
  data,
  isLoading,
  error,
}) => {
  const theme = useTheme();

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box
          sx={{
            backgroundColor: 'background.paper',
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            p: 1.5,
            boxShadow: 3,
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
            {data.name}
          </Typography>
          <Typography variant="body2">
            Amount: {formatCurrency(data.value)}
          </Typography>
          <Typography variant="body2">
            Percentage: {data.percentage.toFixed(1)}%
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <ChartWrapper title="Spending by Category" isLoading={isLoading} error={error}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

// Approval Metrics Chart
interface ApprovalMetricsData {
  week: string;
  approved: number;
  rejected: number;
  pending: number;
}

interface ApprovalMetricsChartProps {
  data: ApprovalMetricsData[];
  isLoading?: boolean;
  error?: any;
}

export const ApprovalMetricsChart: React.FC<ApprovalMetricsChartProps> = ({
  data,
  isLoading,
  error,
}) => {
  const theme = useTheme();

  return (
    <ChartWrapper title="Weekly Approval Metrics" isLoading={isLoading} error={error}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis 
            dataKey="week" 
            stroke={theme.palette.text.secondary}
            fontSize={12}
          />
          <YAxis 
            stroke={theme.palette.text.secondary}
            fontSize={12}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 4,
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="approved"
            stroke={theme.palette.success.main}
            strokeWidth={2}
            name="Approved"
            dot={{ fill: theme.palette.success.main, strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="rejected"
            stroke={theme.palette.error.main}
            strokeWidth={2}
            name="Rejected"
            dot={{ fill: theme.palette.error.main, strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="pending"
            stroke={theme.palette.warning.main}
            strokeWidth={2}
            name="Pending"
            dot={{ fill: theme.palette.warning.main, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

// Payment Processing Chart
interface PaymentProcessingData {
  month: string;
  totalAmount: number;
  transactionCount: number;
}

interface PaymentProcessingChartProps {
  data: PaymentProcessingData[];
  isLoading?: boolean;
  error?: any;
}

export const PaymentProcessingChart: React.FC<PaymentProcessingChartProps> = ({
  data,
  isLoading,
  error,
}) => {
  const theme = useTheme();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            backgroundColor: 'background.paper',
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            p: 1.5,
            boxShadow: 3,
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {label}
          </Typography>
          <Typography variant="body2" sx={{ color: payload[0].color }}>
            Total Amount: {formatCurrency(payload[0].value)}
          </Typography>
          <Typography variant="body2" sx={{ color: payload[1]?.color }}>
            Transactions: {payload[1]?.value || 0}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <ChartWrapper title="Monthly Payment Processing" isLoading={isLoading} error={error}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis 
            dataKey="month" 
            stroke={theme.palette.text.secondary}
            fontSize={12}
          />
          <YAxis 
            yAxisId="amount"
            stroke={theme.palette.text.secondary}
            fontSize={12}
            tickFormatter={(value) => formatCurrency(value).replace('SAR ', '')}
          />
          <YAxis 
            yAxisId="count"
            orientation="right"
            stroke={theme.palette.text.secondary}
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar
            yAxisId="amount"
            dataKey="totalAmount"
            fill={theme.palette.primary.main}
            name="Total Amount"
            radius={[2, 2, 0, 0]}
          />
          <Bar
            yAxisId="count"
            dataKey="transactionCount"
            fill={theme.palette.secondary.main}
            name="Transaction Count"
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};