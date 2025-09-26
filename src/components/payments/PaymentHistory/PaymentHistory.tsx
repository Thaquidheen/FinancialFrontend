// src/components/payments/PaymentHistory/PaymentHistory.tsx

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Button,
  Alert,
  LinearProgress,
  Grid,
  FormControl,
  InputLabel,
  Select,
  TextField,
  InputAdornment,
  Badge
} from '@mui/material';
import {
  MoreVert,
  Visibility,
  GetApp,
  Search,
  FilterList,
  Clear,
  AccountBalance,
  AttachMoney,
  Person,
  History,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Schedule,
  Error,
  Refresh
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { 
  PaymentSummaryResponse, 
  PaymentStatus 
} from '../../../types/payment.types';
import { usePaymentHistory } from '../../../hooks/payments/usePaymentHistory.ts';
import { saudiBankService } from '../../../services/saudiBankService';
import { PAYMENT_STATUS_LABELS, PAYMENT_STATUS_COLORS } from '../../../constants/payments/paymentConstants';
import PaymentSearch from './PaymentSearch.tsx';
import PaymentDetails from './PaymentDetails.tsx';

interface PaymentHistoryProps {
  className?: string;
}

const PaymentHistory: React.FC<PaymentHistoryProps> = ({ className }) => {
  const [selectedPayment, setSelectedPayment] = useState<PaymentSummaryResponse | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuPaymentId, setMenuPaymentId] = useState<string | null>(null);

  const {
    payments,
    totalElements,
    currentPage,
    pageSize,
    isLoading,
    error,
    filters,
    updateFilters,
    changePage,
    changePageSize,
    changeSorting,
    getPaymentStatistics,
    exportPayments,
    refetch
  } = usePaymentHistory();

  const statistics = getPaymentStatistics();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, paymentId: string) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuPaymentId(paymentId);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuPaymentId(null);
  };

  const handleViewDetails = (payment: PaymentSummaryResponse) => {
    setSelectedPayment(payment);
    setShowDetails(true);
    handleMenuClose();
  };

  const handleExport = async (format: 'csv' | 'excel' | 'pdf' = 'excel') => {
    try {
      await exportPayments(format, filters);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const getStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.COMPLETED:
        return <CheckCircle color="success" fontSize="small" />;
      case PaymentStatus.BANK_PROCESSING:
        return <Schedule color="warning" fontSize="small" />;
      case PaymentStatus.FAILED:
        return <Error color="error" fontSize="small" />;
      default:
        return <Schedule color="action" fontSize="small" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentTrend = () => {
    if (statistics.monthlyTrends && statistics.monthlyTrends.length >= 2) {
      const current = statistics.monthlyTrends[statistics.monthlyTrends.length - 1];
      const previous = statistics.monthlyTrends[statistics.monthlyTrends.length - 2];
      const change = ((current.amount - previous.amount) / previous.amount) * 100;
      return {
        direction: change >= 0 ? 'up' : 'down',
        percentage: Math.abs(change)
      };
    }
    return null;
  };

  const trend = getPaymentTrend();

  return (
    <Box className={className}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Payment History
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Complete record of all processed payments
          </Typography>
        </Box>
        
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={refetch}
            disabled={isLoading}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<GetApp />}
            onClick={() => handleExport('excel')}
          >
            Export
          </Button>
        </Box>
      </Box>

      {/* Loading */}
      {isLoading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Error loading payment history: {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <History />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {statistics.totalPayments.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Payments
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <AttachMoney />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {saudiBankService.formatSAR(statistics.totalAmount)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Amount
                  </Typography>
                  {trend && (
                    <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                      {trend.direction === 'up' ? (
                        <TrendingUp color="success" fontSize="small" />
                      ) : (
                        <TrendingDown color="error" fontSize="small" />
                      )}
                      <Typography 
                        variant="caption" 
                        color={trend.direction === 'up' ? 'success.main' : 'error.main'}
                      >
                        {trend.percentage.toFixed(1)}%
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <AccountBalance />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {Object.keys(statistics.paymentsByBank || {}).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Banks Used
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <Person />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {statistics.uniqueEmployees || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Employees Paid
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justify-content="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              Search & Filter Payments
            </Typography>
            <Button
              startIcon={<FilterList />}
              onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
              variant="outlined"
              size="small"
            >
              {showAdvancedSearch ? 'Hide' : 'Show'} Advanced Search
            </Button>
          </Box>

          {/* Basic Search */}
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by employee, project, or batch number..."
                value={filters.search || ''}
                onChange={(e) => updateFilters({ search: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                  endAdornment: filters.search && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => updateFilters({ search: '' })}
                      >
                        <Clear />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  multiple
                  value={filters.status || []}
                  onChange={(e) => updateFilters({ status: e.target.value as PaymentStatus[] })}
                  renderValue={(selected: unknown) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as PaymentStatus[]).map((value: PaymentStatus) => (
                        <Chip
                          key={value}
                          label={PAYMENT_STATUS_LABELS[value as PaymentStatus]}
                          size="small"
                          color={PAYMENT_STATUS_COLORS[value as PaymentStatus]}
                        />
                      ))}
                    </Box>
                  )}
                >
                  {Object.values(PaymentStatus).map((status: PaymentStatus) => (
                    <MenuItem key={status} value={status}>
                      {PAYMENT_STATUS_LABELS[status as PaymentStatus]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="From Date"
                  value={filters.dateRange?.startDate ? new Date(filters.dateRange.startDate) : null}
                  onChange={(date) => updateFilters({
                    dateRange: {
                      ...filters.dateRange,
                      startDate: date?.toISOString().split('T')[0]
                    }
                  })}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => updateFilters({})}
                startIcon={<Clear />}
                disabled={!filters.search && !filters.status?.length && !filters.dateRange?.startDate}
              >
                Clear
              </Button>
            </Grid>
          </Grid>

          {/* Advanced Search */}
          {showAdvancedSearch && (
            <Box mt={3}>
              <PaymentSearch
                filters={filters}
                onFiltersChange={updateFilters}
                onSearch={() => {}} // Search is handled automatically by filters
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Button
                      startIcon={filters.sortBy === 'employeeName' && filters.sortDirection === 'asc' ? <TrendingUp /> : <TrendingDown />}
                      onClick={() => changeSorting('employeeName', filters.sortDirection === 'asc' ? 'desc' : 'asc')}
                      size="small"
                      color={filters.sortBy === 'employeeName' ? 'primary' : 'inherit'}
                    >
                      Employee
                    </Button>
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      startIcon={filters.sortBy === 'amount' && filters.sortDirection === 'asc' ? <TrendingUp /> : <TrendingDown />}
                      onClick={() => changeSorting('amount', filters.sortDirection === 'asc' ? 'desc' : 'asc')}
                      size="small"
                      color={filters.sortBy === 'amount' ? 'primary' : 'inherit'}
                    >
                      Amount
                    </Button>
                  </TableCell>
                  <TableCell>Bank</TableCell>
                  <TableCell>Project</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>
                    <Button
                      startIcon={filters.sortBy === 'processedAt' && filters.sortDirection === 'asc' ? <TrendingUp /> : <TrendingDown />}
                      onClick={() => changeSorting('processedAt', filters.sortDirection === 'asc' ? 'desc' : 'asc')}
                      size="small"
                      color={filters.sortBy === 'processedAt' ? 'primary' : 'inherit'}
                    >
                      Processed
                    </Button>
                  </TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                      <History sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No Payment History Found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {filters.search || filters.status?.length || filters.dateRange?.startDate
                          ? 'No payments match your current filters'
                          : 'No payments have been processed yet'
                        }
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((payment: PaymentSummaryResponse) => (
                    <TableRow 
                      key={payment.id}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => handleViewDetails(payment)}
                    >
                      {/* Employee */}
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                            {payment.employeeName.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {payment.employeeName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {payment.quotationId}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Amount */}
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="bold">
                          {saudiBankService.formatSAR(payment.amount)}
                        </Typography>
                        {payment.amount > 50000 && (
                          <Badge badgeContent="High" color="warning" sx={{ ml: 1 }} />
                        )}
                      </TableCell>

                      {/* Bank */}
                      <TableCell>
                        {payment.bankName ? (
                          <Box display="flex" alignItems="center" gap={1}>
                            <Avatar
                              sx={{
                                width: 20,
                                height: 20,
                                bgcolor: saudiBankService.getBankByCode(payment.bankName)?.primaryColor || 'grey.400',
                                fontSize: '0.7rem'
                              }}
                            >
                              {saudiBankService.getBankByCode(payment.bankName)?.shortName?.substring(0, 2) || 'UK'}
                            </Avatar>
                            <Typography variant="body2">
                              {saudiBankService.getBankByCode(payment.bankName)?.shortName || payment.bankName}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Not specified
                          </Typography>
                        )}
                      </TableCell>

                      {/* Project */}
                      <TableCell>
                        <Typography variant="body2">
                          {payment.projectName || '-'}
                        </Typography>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          {getStatusIcon(payment.status)}
                          <Chip
                            label={PAYMENT_STATUS_LABELS[payment.status]}
                            color={PAYMENT_STATUS_COLORS[payment.status]}
                            size="small"
                          />
                        </Box>
                      </TableCell>

                      {/* Processed Date */}
                      <TableCell>
                        <Typography variant="body2">
                          {payment.processedAt ? formatDate(payment.processedAt) : formatDate(payment.createdAt)}
                        </Typography>
                      </TableCell>

                      {/* Actions */}
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMenuOpen(e, payment.id);
                          }}
                        >
                          <MoreVert />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {payments.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[10, 25, 50, 100]}
              component="div"
              count={totalElements}
              rowsPerPage={pageSize}
              page={currentPage}
              onPageChange={(_event, newPage) => changePage(newPage)}
              onRowsPerPageChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                changePageSize(parseInt(event.target.value, 10));
              }}
              labelRowsPerPage="Payments per page:"
            />
          )}
        </CardContent>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            const payment = payments.find((p: PaymentSummaryResponse) => p.id === menuPaymentId);
            if (payment) handleViewDetails(payment);
          }}
        >
          <ListItemIcon>
            <Visibility fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            const payment = payments.find((p: PaymentSummaryResponse) => p.id === menuPaymentId);
            if (payment) {
              // Export single payment
              console.log('Export payment:', payment.id);
            }
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <GetApp fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export Payment</ListItemText>
        </MenuItem>
      </Menu>

      {/* Payment Details Modal */}
      {selectedPayment && (
        <PaymentDetails
          payment={selectedPayment}
          open={showDetails}
          onClose={() => {
            setShowDetails(false);
            setSelectedPayment(null);
          }}
        />
      )}
    </Box>
  );
};

export default PaymentHistory;