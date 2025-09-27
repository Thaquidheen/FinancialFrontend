// src/components/payments/PaymentBatches/PaymentBatches.tsx

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Alert,
  LinearProgress,
  Tooltip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Grid,
  Card,
  CardContent,
  Stack,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  Collapse,
  Divider,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
} from '@mui/material';
import {
  FileDownload,
  Refresh,
  FilterList,
  MoreVert,
  Visibility,
  CheckCircle,
  Schedule,
  Error,
  AccountBalance,
  History,
  CloudUpload,
  PlayArrow,
  Search,
  Clear,
  ExpandLess,
  ExpandMore,
  GetApp,
  Add,
} from '@mui/icons-material';
import { usePaymentBatches } from '../../../hooks/payments/usePaymentBatches';
import { PaymentBatch, PaymentBatchStatus } from '../../../types/payment.types';
import { PAYMENT_BATCH_STATUS_LABELS, PAYMENT_BATCH_STATUS_COLORS } from '../../../constants/payments/paymentConstants';
import { saudiBankService } from '../../../services/saudiBankService';
import BatchDetails from './BatchDetails';
import { MetricsCard } from '@components/dashboard/MetricsCard';

interface PaymentBatchesProps {
  className?: string;
}

const PaymentBatches: React.FC<PaymentBatchesProps> = () => {
  const [selectedBatch, setSelectedBatch] = useState<PaymentBatch | null>(null);
  const [showBatchDetails, setShowBatchDetails] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<keyof PaymentBatch>('createdDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<PaymentBatchStatus | 'all'>('all');
  const [bankFilter, setBankFilter] = useState<string>('all');
  
  // Dialog and notification states
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    action: () => void;
  } | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'info' });

  const {
    batches,
    totalElements,
    isLoading,
    error,
    refetch,
    downloadBankFile,
    confirmBatchCompleted,
    markBatchSentToBank,
    markBatchProcessing,
    markBatchCompleted,
    retryBatch
  } = usePaymentBatches({
    autoRefresh: true,
    refreshInterval: 30000
  });

  const handleViewBatch = (batch: PaymentBatch) => {
    setSelectedBatch(batch);
    setShowBatchDetails(true);
  };

  const handleDownloadFile = async (batch: PaymentBatch) => {
    if (batch.fileName) {
      await downloadBankFile(batch);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, batchId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedBatchId(batchId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedBatchId(null);
  };

  const handleConfirmCompleted = async (batch: PaymentBatch) => {
    await confirmBatchCompleted(batch, undefined, 'Marked as completed');
    handleMenuClose();
  };

  const handleMarkSentToBank = async (batch: PaymentBatch) => {
    await markBatchSentToBank(batch.id);
    handleMenuClose();
  };

  const handleMarkProcessing = async (batch: PaymentBatch) => {
    await markBatchProcessing(batch.id);
    handleMenuClose();
  };

  const handleMarkCompleted = async (batch: PaymentBatch) => {
    // Use confirmBatchCompleted instead of markBatchCompleted
    // This ensures quotation status is also updated to PAID
    await confirmBatchCompleted(batch, undefined, 'Marked as completed via UI');
    handleMenuClose();
  };

  const handleRetryBatch = async (batch: PaymentBatch) => {
    await retryBatch(batch.id);
    handleMenuClose();
  };

  const handleCancelBatch = async (batch: PaymentBatch) => {
    // TODO: Implement cancel functionality
    console.log('Cancel batch:', batch.id);
    handleMenuClose();
  };

  // Search and filter handlers
  const handleSearch = () => {
    // TODO: Implement search functionality
    console.log('Search:', searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleStatusFilterChange = (status: PaymentBatchStatus | 'all') => {
    setStatusFilter(status);
  };

  const handleBankFilterChange = (bank: string) => {
    setBankFilter(bank);
  };

  const handleClearFilters = () => {
    setStatusFilter('all');
    setBankFilter('all');
  };

  // Notification handlers - available for future use

  // Statistics calculation
  const getBatchStatistics = () => {
    const stats = {
      totalBatches: batches.length,
      completedBatches: batches.filter(b => b.status === PaymentBatchStatus.COMPLETED).length,
      processingBatches: batches.filter(b => 
        b.status === PaymentBatchStatus.SENT_TO_BANK || 
        b.status === PaymentBatchStatus.PROCESSING
      ).length,
      failedBatches: batches.filter(b => b.status === PaymentBatchStatus.FAILED).length,
      totalAmount: batches.reduce((sum, batch) => sum + batch.totalAmount, 0),
      totalPayments: batches.reduce((sum, batch) => sum + batch.paymentCount, 0)
    };
    return stats;
  };

  const stats = getBatchStatistics();

  const handleSort = (property: keyof PaymentBatch) => {
    const isAsc = sortBy === property && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortBy(property);
  };

  const getStatusIcon = (status: PaymentBatchStatus) => {
    switch (status) {
      case PaymentBatchStatus.CREATED:
        return <Schedule color="warning" />;
      case PaymentBatchStatus.FILE_GENERATED:
        return <CheckCircle color="success" />;
      case PaymentBatchStatus.SENT_TO_BANK:
        return <AccountBalance color="info" />;
      case PaymentBatchStatus.COMPLETED:
        return <CheckCircle color="success" />;
      case PaymentBatchStatus.FAILED:
        return <Error color="error" />;
      default:
        return <History color="inherit" />;
    }
  };

  const canDownload = (batch: PaymentBatch) => {
    return batch.fileName && (
      batch.status === PaymentBatchStatus.FILE_GENERATED ||
      batch.status === PaymentBatchStatus.SENT_TO_BANK ||
      batch.status === PaymentBatchStatus.COMPLETED
    );
  };

  const canMarkSentToBank = (batch: PaymentBatch) => {
    return batch.status === PaymentBatchStatus.FILE_GENERATED;
  };

  const canMarkProcessing = (batch: PaymentBatch) => {
    return batch.status === PaymentBatchStatus.SENT_TO_BANK;
  };

  const canMarkCompleted = (batch: PaymentBatch) => {
    return batch.status === PaymentBatchStatus.PROCESSING ||
           batch.status === PaymentBatchStatus.SENT_TO_BANK;
  };

  const canRetry = (batch: PaymentBatch) => {
    return batch.status === PaymentBatchStatus.FAILED;
  };

  const columns = [
    { id: 'batchNumber', label: 'Batch Number', minWidth: 150, sortable: true },
    { id: 'bankName', label: 'Bank', minWidth: 120, sortable: true },
    { id: 'paymentCount', label: 'Payments', minWidth: 100, sortable: true },
    { id: 'totalAmount', label: 'Total Amount', minWidth: 120, sortable: true },
    { id: 'status', label: 'Status', minWidth: 120, sortable: true },
    { id: 'createdDate', label: 'Created', minWidth: 120, sortable: true },
    { id: 'actions', label: 'Actions', minWidth: 100, sortable: false }
  ];

  const sortedBatches = [...batches].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });

  const paginatedBatches = sortedBatches.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (isLoading) {
    return (
      <Box sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#f8fafc',
      }}>
        <LinearProgress sx={{ mb: 2 }} />
        <Box sx={{ p: 3 }}>
          <Skeleton variant="text" width="60%" height={40} />
          <Skeleton variant="text" width="40%" height={20} sx={{ mt: 1 }} />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#f8fafc',
        p: 3
      }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          Error loading payment batches: {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: '#f8fafc',
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
        <Stack 
          direction="row" 
          justifyContent="space-between" 
          alignItems="center"
        >
          <Box>
            <Typography 
              variant="h4" 
              component="h1" 
              fontWeight={700}
              sx={{ 
                color: '#1a202c',
                fontSize: '1.875rem',
                letterSpacing: '-0.025em'
              }}
            >
              Payment Batches
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                mt: 0.5,
                color: '#64748b',
                fontSize: '0.875rem'
              }}
            >
              Manage bank files and payment batch processing
            </Typography>
          </Box>

          <Stack direction="row" spacing={1}>
            <Tooltip title="Refresh Data">
              <IconButton 
                onClick={() => refetch()}
                disabled={isLoading}
                sx={{ 
                  bgcolor: '#f1f5f9',
                  color: '#475569',
                  '&:hover': { 
                    bgcolor: '#e2e8f0',
                    color: '#334155'
                  }
                }}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
            
            <Button
              variant="outlined"
              startIcon={<GetApp />}
              onClick={() => {/* TODO: Implement export */}}
              sx={{ 
                minWidth: 100,
                borderColor: '#d1d5db',
                color: '#374151',
                '&:hover': {
                  borderColor: '#9ca3af',
                  backgroundColor: '#f9fafb'
                }
              }}
            >
              Export
            </Button>
            
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {/* TODO: Navigate to payment queue */}}
              sx={{ 
                minWidth: 120,
                bgcolor: '#3b82f6',
                color: '#ffffff',
                fontWeight: 600,
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                '&:hover': { 
                  bgcolor: '#2563eb',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }
              }}
            >
              Generate File
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Main Content Area */}
      <Box sx={{ flex: 1, overflow: 'hidden', p: 3 }}>
        <Stack spacing={3} sx={{ height: '100%' }}>
          {/* Statistics Cards */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <MetricsCard
                title="Total Batches"
                value={{ current: stats.totalBatches, format: 'number' }}
                color="primary"
                icon={AccountBalance}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricsCard
                title="Completed"
                value={{ current: stats.completedBatches, format: 'number' }}
                color="success"
                icon={CheckCircle}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricsCard
                title="Processing"
                value={{ current: stats.processingBatches, format: 'number' }}
                color="warning"
                icon={Schedule}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricsCard
                title="Total Amount"
                value={{ current: stats.totalAmount, format: 'currency' }}
                color="info"
                icon={GetApp}
              />
            </Grid>
          </Grid>

          {/* Search and Filters Card */}
          <Card 
            elevation={0}
            sx={{
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              bgcolor: '#ffffff',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            }}
          >
            <CardContent sx={{ pb: showFilters ? 2 : 1, p: 3 }}>
              {/* Search Row */}
              <Stack 
                direction={{ xs: 'column', md: 'row' }} 
                spacing={2} 
                alignItems={{ md: 'center' }}
                sx={{ mb: showFilters ? 2 : 0 }}
              >
                <TextField
                  placeholder="Search by batch number, bank name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{ 
                    flex: 1,
                    '& .MuiOutlinedInput-root': {
                      bgcolor: '#ffffff',
                      borderColor: '#d1d5db',
                      borderRadius: '8px',
                      '&:hover': {
                        borderColor: '#9ca3af',
                      },
                      '&.Mui-focused': {
                        borderColor: '#3b82f6',
                        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                      }
                    },
                    '& .MuiInputBase-input': {
                      color: '#374151',
                      fontSize: '0.875rem',
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: '#9ca3af' }} />
                      </InputAdornment>
                    ),
                    endAdornment: searchQuery && (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={handleClearSearch}
                          edge="end"
                          sx={{ color: '#9ca3af' }}
                        >
                          <Clear />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                />
                
                <Stack direction="row" spacing={1}>
                  <Button 
                    variant="contained" 
                    onClick={handleSearch}
                    disabled={!searchQuery.trim()}
                    sx={{ 
                      minWidth: 100,
                      bgcolor: '#3b82f6',
                      color: '#ffffff',
                      fontWeight: 600,
                      borderRadius: '8px',
                      '&:hover': { 
                        bgcolor: '#2563eb',
                      },
                      '&:disabled': {
                        bgcolor: '#e5e7eb',
                        color: '#9ca3af'
                      }
                    }}
                  >
                    Search
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<FilterList />}
                    endIcon={showFilters ? <ExpandLess /> : <ExpandMore />}
                    onClick={() => setShowFilters(!showFilters)}
                    sx={{ 
                      minWidth: 100,
                      borderColor: '#d1d5db',
                      color: '#374151',
                      borderRadius: '8px',
                      '&:hover': {
                        borderColor: '#9ca3af',
                        backgroundColor: '#f9fafb'
                      }
                    }}
                  >
                    Filters
                  </Button>
                </Stack>
              </Stack>

              {/* Filters Section */}
              <Collapse in={showFilters}>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={statusFilter}
                        onChange={(e) => handleStatusFilterChange(e.target.value as PaymentBatchStatus | 'all')}
                        input={<OutlinedInput label="Status" />}
                      >
                        <MenuItem value="all">All Status</MenuItem>
                        {Object.values(PaymentBatchStatus).map((status) => (
                          <MenuItem key={status} value={status}>
                            {PAYMENT_BATCH_STATUS_LABELS[status]}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Bank</InputLabel>
                      <Select
                        value={bankFilter}
                        onChange={(e) => handleBankFilterChange(e.target.value)}
                        input={<OutlinedInput label="Bank" />}
                      >
                        <MenuItem value="all">All Banks</MenuItem>
                        {Array.from(new Set(batches.map(b => b.bankName))).map((bank) => (
                          <MenuItem key={bank} value={bank}>
                            {bank}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={handleClearFilters}
                      >
                        Clear Filters
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </Collapse>
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <Alert 
              severity="error" 
              variant="filled"
              sx={{ borderRadius: 2 }}
            >
              {(error as any).message || 'Failed to load payment batches'}
            </Alert>
          )}

          {/* Payment Batches Table Container */}
          <Card 
            elevation={0}
            sx={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column',
              overflow: 'hidden',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              bgcolor: '#ffffff',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            }}
          >
            <TableContainer sx={{ flex: 1 }}>
              <Table stickyHeader>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    style={{ minWidth: column.minWidth }}
                    sortDirection={sortBy === column.id ? sortDirection : false}
                  >
                    {column.sortable ? (
                      <TableSortLabel
                        active={sortBy === column.id}
                        direction={sortBy === column.id ? sortDirection : 'asc'}
                        onClick={() => handleSort(column.id as keyof PaymentBatch)}
                      >
                        {column.label}
                      </TableSortLabel>
                    ) : (
                      column.label
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedBatches.map((batch) => (
                <TableRow key={batch.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {batch.batchNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <AccountBalance fontSize="small" color="primary" />
                      <Typography variant="body2">
                        {batch.bankName}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`${batch.paymentCount} payments`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {saudiBankService.formatSAR(batch.totalAmount)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      {getStatusIcon(batch.status)}
                      <Chip
                        label={PAYMENT_BATCH_STATUS_LABELS[batch.status]}
                        size="small"
                        color={PAYMENT_BATCH_STATUS_COLORS[batch.status]}
                        variant="outlined"
                      />
                      {/* Status Flow Indicator */}
                      <Box display="flex" alignItems="center" gap={0.5} ml={1}>
                        {[
                          PaymentBatchStatus.FILE_GENERATED,
                          PaymentBatchStatus.SENT_TO_BANK,
                          PaymentBatchStatus.PROCESSING,
                          PaymentBatchStatus.COMPLETED
                        ].map((status, index) => (
                          <Box
                            key={status}
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              bgcolor: batch.status === status ? 'primary.main' :
                                       [PaymentBatchStatus.FILE_GENERATED, PaymentBatchStatus.SENT_TO_BANK, PaymentBatchStatus.PROCESSING, PaymentBatchStatus.COMPLETED]
                                         .indexOf(batch.status) > index ? 'success.main' : 'grey.300',
                              opacity: batch.status === status ? 1 : 0.6
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(batch.createdDate).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleViewBatch(batch)}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      
                      {canDownload(batch) && (
                        <Tooltip title="Download File">
                          <IconButton
                            size="small"
                            onClick={() => handleDownloadFile(batch)}
                          >
                            <FileDownload />
                          </IconButton>
                        </Tooltip>
                      )}

                      {canMarkSentToBank(batch) && (
                        <Tooltip title="Mark as Sent to Bank">
                          <IconButton
                            size="small"
                            onClick={() => handleMarkSentToBank(batch)}
                            color="info"
                          >
                            <AccountBalance />
                          </IconButton>
                        </Tooltip>
                      )}

                      {canMarkProcessing(batch) && (
                        <Tooltip title="Mark as Processing">
                          <IconButton
                            size="small"
                            onClick={() => handleMarkProcessing(batch)}
                            color="warning"
                          >
                            <Schedule />
                          </IconButton>
                        </Tooltip>
                      )}

                      {canMarkCompleted(batch) && (
                        <Tooltip title="Mark as Completed">
                          <IconButton
                            size="small"
                            onClick={() => handleMarkCompleted(batch)}
                            color="success"
                          >
                            <CheckCircle />
                          </IconButton>
                        </Tooltip>
                      )}

                      {canRetry(batch) && (
                        <Tooltip title="Retry Batch">
                          <IconButton
                            size="small"
                            onClick={() => handleRetryBatch(batch)}
                            color="warning"
                          >
                            <Refresh />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, batch.id)}
                      >
                        <MoreVert />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={totalElements}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(parseInt(event.target.value, 10));
                setPage(0);
              }}
              sx={{
                borderTop: '1px solid #e2e8f0',
                bgcolor: '#f8fafc',
              }}
            />
          </Card>
        </Stack>
      </Box>

      {/* Batch Details Dialog */}
      {selectedBatch && (
        <BatchDetails
          batch={selectedBatch}
          open={showBatchDetails}
          onClose={() => {
            setShowBatchDetails(false);
            setSelectedBatch(null);
          }}
          onDownload={() => handleDownloadFile(selectedBatch)}
          onConfirm={() => handleConfirmCompleted(selectedBatch)}
        />
      )}

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {selectedBatchId && (() => {
          const batch = batches.find(b => b.id === selectedBatchId);
          if (!batch) return null;
          
          return (
            <>
              <MenuItem onClick={() => handleViewBatch(batch)}>
                <ListItemIcon>
                  <Visibility fontSize="small" />
                </ListItemIcon>
                <ListItemText>View Details</ListItemText>
              </MenuItem>
              
              {canDownload(batch) && (
                <MenuItem onClick={() => handleDownloadFile(batch)}>
                  <ListItemIcon>
                    <FileDownload fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Download File</ListItemText>
                </MenuItem>
              )}

              {canMarkSentToBank(batch) && (
                <MenuItem onClick={() => handleMarkSentToBank(batch)}>
                  <ListItemIcon>
                    <CloudUpload fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Mark as Sent to Bank</ListItemText>
                </MenuItem>
              )}

              {canMarkProcessing(batch) && (
                <MenuItem onClick={() => handleMarkProcessing(batch)}>
                  <ListItemIcon>
                    <PlayArrow fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Mark as Processing</ListItemText>
                </MenuItem>
              )}

              {canMarkCompleted(batch) && (
                <MenuItem onClick={() => handleMarkCompleted(batch)}>
                  <ListItemIcon>
                    <CheckCircle fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Mark as Completed</ListItemText>
                </MenuItem>
              )}
              
              {canRetry(batch) && (
                <MenuItem onClick={() => handleRetryBatch(batch)}>
                  <ListItemIcon>
                    <Refresh fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Retry Batch</ListItemText>
                </MenuItem>
              )}
              
              {(batch.status === PaymentBatchStatus.CREATED || batch.status === PaymentBatchStatus.FILE_GENERATED) && (
                <MenuItem onClick={() => handleCancelBatch(batch)}>
                  <ListItemIcon>
                    <Error fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Cancel Batch</ListItemText>
                </MenuItem>
              )}
            </>
          );
        })()}
      </Menu>

      {/* Confirmation Dialog */}
      {confirmDialog && (
        <Dialog 
          open={confirmDialog.open} 
          onClose={() => setConfirmDialog(null)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Typography variant="h6" component="div">
              {confirmDialog.title}
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Typography color="text.secondary">
              {confirmDialog.message}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button 
              onClick={() => setConfirmDialog(null)}
              variant="outlined"
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmDialog.action} 
              color="error" 
              variant="contained"
              sx={{ minWidth: 100 }}
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Snackbar Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity={snackbar.severity}
          variant="filled"
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PaymentBatches;
