// src/components/payments/PaymentHistory/PaymentReports.tsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  LinearProgress
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
  ResponsiveContainer
} from 'recharts';
import {
  GetApp,
  Analytics,
  TrendingUp,
  AccountBalance,
  Person,
  DateRange,
  Print
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { paymentService } from '../../../services/paymentService';

interface PaymentReportsProps {
  className?: string;
}

interface ReportData {
  monthlyTrends: {
    month: string;
    totalAmount: number;
    paymentCount: number;
    avgAmount: number;
  }[];
  statusDistribution: {
    status: string;
    count: number;
    amount: number;
    color: string;
  }[];
  bankDistribution: {
    bankName: string;
    count: number;
    amount: number;
    percentage: number;
  }[];
  employeePayments: {
    employeeName: string;
    paymentCount: number;
    totalAmount: number;
    avgAmount: number;
    department?: string;
  }[];
  projectPayments: {
    projectName: string;
    paymentCount: number;
    totalAmount: number;
    percentage: number;
  }[];
  dailyVolume: {
    date: string;
    count: number;
    amount: number;
  }[];
  processingMetrics: {
    avgProcessingTime: number;
    successRate: number;
    failureRate: number;
    onTimeRate: number;
  };
}

interface ExportFilters {
  dateRange: {
    startDate: string;
    endDate: string;
  };
  reportType: 'summary' | 'detailed' | 'bankwise' | 'employee' | 'project';
  format: 'pdf' | 'excel' | 'csv';
  includeCharts: boolean;
  includeDetails: boolean;
}


const PaymentReports: React.FC<PaymentReportsProps> = ({ className }) => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1), // Start of year
    endDate: new Date() // Today
  });
  
  // Export dialog state
  const [exportDialog, setExportDialog] = useState(false);
  const [exportFilters, setExportFilters] = useState<ExportFilters>({
    dateRange: {
      startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    },
    reportType: 'summary',
    format: 'pdf',
    includeCharts: true,
    includeDetails: false
  });
  const [exporting, setExporting] = useState(false);

  const loadReportData = async () => {
    try {
      setLoading(true);
      setError(null);

      // In a real implementation, you'd call a dedicated reports API
      // For now, we'll use the statistics API and simulate some data
      const statistics = await paymentService.getStatistics();
      
      // Simulate report data based on statistics
      const mockReportData: ReportData = {
        monthlyTrends: generateMonthlyTrends(),
        statusDistribution: [
          { status: 'PAID', count: statistics.completedPayments, amount: statistics.totalCompletedAmount, color: '#4CAF50' },
          { status: 'PENDING', count: statistics.pendingPayments, amount: statistics.totalPendingAmount, color: '#FF9800' },
          { status: 'PROCESSING', count: statistics.processingPayments, amount: statistics.totalProcessingAmount, color: '#2196F3' },
          { status: 'FAILED', count: 0, amount: 0, color: '#F44336' }
        ],
        bankDistribution: generateBankDistribution(),
        employeePayments: generateEmployeePayments(),
        projectPayments: generateProjectPayments(),
        dailyVolume: generateDailyVolume(),
        processingMetrics: {
          avgProcessingTime: 1.5, // days
          successRate: 95.2,
          failureRate: 4.8,
          onTimeRate: 89.3
        }
      };

      setReportData(mockReportData);
    } catch (err: any) {
      console.error('Error loading report data:', err);
      setError(err.message || 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const generateMonthlyTrends = () => {
    const months = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      months.push({
        month,
        totalAmount: Math.floor(Math.random() * 500000) + 100000,
        paymentCount: Math.floor(Math.random() * 200) + 50,
        avgAmount: Math.floor(Math.random() * 10000) + 2000
      });
    }
    return months;
  };

  const generateBankDistribution = () => {
    return [
      { bankName: 'Al Rajhi Bank', count: 45, amount: 750000, percentage: 35.2 },
      { bankName: 'National Commercial Bank', count: 38, amount: 620000, percentage: 29.1 },
      { bankName: 'Saudi British Bank', count: 25, amount: 410000, percentage: 19.2 },
      { bankName: 'Riyad Bank', count: 18, amount: 280000, percentage: 13.8 },
      { bankName: 'Alinma Bank', count: 6, amount: 65000, percentage: 2.7 }
    ];
  };

  const generateEmployeePayments = () => {
    return [
      { employeeName: 'Ahmed Al-Rashid', paymentCount: 12, totalAmount: 45000, avgAmount: 3750, department: 'Construction' },
      { employeeName: 'Sara Al-Ahmed', paymentCount: 8, totalAmount: 32000, avgAmount: 4000, department: 'Engineering' },
      { employeeName: 'Mohammed Al-Sayed', paymentCount: 15, totalAmount: 52500, avgAmount: 3500, department: 'Operations' },
      { employeeName: 'Fatima Al-Zahra', paymentCount: 6, totalAmount: 24000, avgAmount: 4000, department: 'Finance' },
      { employeeName: 'Omar Al-Farisi', paymentCount: 10, totalAmount: 37500, avgAmount: 3750, department: 'Maintenance' }
    ];
  };

  const generateProjectPayments = () => {
    return [
      { projectName: 'B2S Tawai Project', paymentCount: 28, totalAmount: 145000, percentage: 42.1 },
      { projectName: 'Al-Noor Complex', paymentCount: 19, totalAmount: 98000, percentage: 28.4 },
      { projectName: 'Riyadh Tower Phase 2', paymentCount: 14, totalAmount: 72000, percentage: 20.9 },
      { projectName: 'Maintenance Services', paymentCount: 8, totalAmount: 29500, percentage: 8.6 }
    ];
  };

  const generateDailyVolume = () => {
    const days = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      days.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: Math.floor(Math.random() * 15) + 2,
        amount: Math.floor(Math.random() * 50000) + 10000
      });
    }
    return days;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      
      // Call the export API with filters
      const blob = await paymentService.generateReport(
        exportFilters.reportType,
        {
          dateRange: {
            from: exportFilters.dateRange.startDate,
            to: exportFilters.dateRange.endDate
          }
        },
        exportFilters.format
      );

      // Download the file
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `payment-report-${exportFilters.reportType}-${new Date().toISOString().split('T')[0]}.${exportFilters.format}`;
      link.click();
      window.URL.revokeObjectURL(url);

      setExportDialog(false);
    } catch (err: any) {
      console.error('Export failed:', err);
      setError('Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    loadReportData();
  }, [dateRange]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        {error}
      </Alert>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box className={className} p={3}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" fontWeight="bold" display="flex" alignItems="center" gap={2}>
            <Analytics color="primary" />
            Payment Analytics & Reports
          </Typography>
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<GetApp />}
              onClick={() => setExportDialog(true)}
            >
              Export Report
            </Button>
            <Button
              variant="outlined"
              startIcon={<Print />}
              onClick={() => window.print()}
            >
              Print
            </Button>
          </Box>
        </Box>

        {/* Date Range Selector */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={3}>
              <Typography variant="h6" display="flex" alignItems="center" gap={1}>
                <DateRange color="primary" />
                Report Period
              </Typography>
              <DatePicker
                label="Start Date"
                value={dateRange.startDate}
                onChange={(date) => date && setDateRange(prev => ({ ...prev, startDate: date }))}
                slotProps={{ textField: { size: 'small' } }}
              />
              <DatePicker
                label="End Date"
                value={dateRange.endDate}
                onChange={(date) => date && setDateRange(prev => ({ ...prev, endDate: date }))}
                slotProps={{ textField: { size: 'small' } }}
              />
              <Button
                variant="contained"
                onClick={loadReportData}
                startIcon={<Analytics />}
              >
                Generate Report
              </Button>
            </Box>
          </CardContent>
        </Card>

        {reportData && (
          <Grid container spacing={3}>
            {/* Key Metrics */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                    <TrendingUp color="primary" />
                    Key Performance Metrics
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box textAlign="center" p={2} bgcolor="success.light" borderRadius={2}>
                        <Typography variant="h3" fontWeight="bold" color="success.dark">
                          {reportData.processingMetrics.successRate}%
                        </Typography>
                        <Typography variant="body2" color="success.dark">
                          Success Rate
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box textAlign="center" p={2} bgcolor="info.light" borderRadius={2}>
                        <Typography variant="h3" fontWeight="bold" color="info.dark">
                          {reportData.processingMetrics.avgProcessingTime}
                        </Typography>
                        <Typography variant="body2" color="info.dark">
                          Avg Days to Process
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box textAlign="center" p={2} bgcolor="warning.light" borderRadius={2}>
                        <Typography variant="h3" fontWeight="bold" color="warning.dark">
                          {reportData.processingMetrics.onTimeRate}%
                        </Typography>
                        <Typography variant="body2" color="warning.dark">
                          On-Time Rate
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box textAlign="center" p={2} bgcolor="error.light" borderRadius={2}>
                        <Typography variant="h3" fontWeight="bold" color="error.dark">
                          {reportData.processingMetrics.failureRate}%
                        </Typography>
                        <Typography variant="body2" color="error.dark">
                          Failure Rate
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Monthly Trends Chart */}
            <Grid item xs={12} lg={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Monthly Payment Trends
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={reportData.monthlyTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="totalAmount" 
                        stroke="#2196F3" 
                        fill="#2196F3" 
                        fillOpacity={0.3}
                        name="Total Amount"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Status Distribution */}
            <Grid item xs={12} lg={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Payment Status Distribution
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={reportData.statusDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ status, count }) => `${status}: ${count}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {reportData.statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Bank Distribution */}
            <Grid item xs={12} lg={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                    <AccountBalance color="primary" />
                    Bank Distribution
                  </Typography>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={reportData.bankDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="bankName" 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Bar dataKey="amount" fill="#4CAF50" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Daily Volume */}
            <Grid item xs={12} lg={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Daily Payment Volume (Last 30 Days)
                  </Typography>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={reportData.dailyVolume}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="count" 
                        stroke="#FF9800" 
                        strokeWidth={2}
                        name="Payment Count"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Top Employees */}
            <Grid item xs={12} lg={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                    <Person color="primary" />
                    Top Paid Employees
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Employee</TableCell>
                          <TableCell align="right">Payments</TableCell>
                          <TableCell align="right">Total Amount</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {reportData.employeePayments.map((employee) => (
                          <TableRow key={employee.employeeName}>
                            <TableCell>
                              <Box display="flex" alignItems="center" gap={2}>
                                <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem' }}>
                                  {employee.employeeName.charAt(0)}
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" fontWeight="bold">
                                    {employee.employeeName}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {employee.department}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              <Chip 
                                label={employee.paymentCount} 
                                size="small" 
                                color="primary" 
                                variant="outlined" 
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight="bold">
                                {formatCurrency(employee.totalAmount)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Project Distribution */}
            <Grid item xs={12} lg={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Payments by Project
                  </Typography>
                  <Box>
                    {reportData.projectPayments.map((project) => (
                      <Box key={project.projectName} mb={2}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <Typography variant="body2" fontWeight="bold">
                            {project.projectName}
                          </Typography>
                          <Typography variant="body2">
                            {formatCurrency(project.totalAmount)}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={project.percentage}
                          color="primary"
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                        <Box display="flex" justifyContent="space-between" mt={1}>
                          <Typography variant="caption" color="text.secondary">
                            {project.paymentCount} payments
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {project.percentage}%
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Export Dialog */}
        <Dialog open={exportDialog} onClose={() => setExportDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Export Payment Report</DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Start Date"
                  value={new Date(exportFilters.dateRange.startDate)}
                  onChange={(date) => date && setExportFilters(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, startDate: date.toISOString().split('T')[0] }
                  }))}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="End Date"
                  value={new Date(exportFilters.dateRange.endDate)}
                  onChange={(date) => date && setExportFilters(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, endDate: date.toISOString().split('T')[0] }
                  }))}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Report Type</InputLabel>
                  <Select
                    value={exportFilters.reportType}
                    onChange={(e) => setExportFilters(prev => ({ ...prev, reportType: e.target.value as any }))}
                    label="Report Type"
                  >
                    <MenuItem value="summary">Summary Report</MenuItem>
                    <MenuItem value="detailed">Detailed Report</MenuItem>
                    <MenuItem value="bankwise">Bank-wise Analysis</MenuItem>
                    <MenuItem value="employee">Employee Report</MenuItem>
                    <MenuItem value="project">Project Report</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Export Format</InputLabel>
                  <Select
                    value={exportFilters.format}
                    onChange={(e) => setExportFilters(prev => ({ ...prev, format: e.target.value as any }))}
                    label="Export Format"
                  >
                    <MenuItem value="pdf">PDF Document</MenuItem>
                    <MenuItem value="excel">Excel Spreadsheet</MenuItem>
                    <MenuItem value="csv">CSV File</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setExportDialog(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleExport}
              disabled={exporting}
              startIcon={exporting ? <CircularProgress size={20} /> : <GetApp />}
            >
              {exporting ? 'Exporting...' : 'Export Report'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default PaymentReports;