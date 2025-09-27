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
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Grid,
  Card,
  CardContent,
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
} from '@mui/icons-material';
import { usePaymentBatches } from '../../../hooks/payments/usePaymentBatches';
import { PaymentBatch, PaymentBatchStatus } from '../../../types/payment.types';
import { PAYMENT_BATCH_STATUS_LABELS, PAYMENT_BATCH_STATUS_COLORS } from '../../../constants/payments/paymentConstants';
import { saudiBankService } from '../../../services/saudiBankService';
import BatchDetails from './BatchDetails';

interface PaymentBatchesProps {
  className?: string;
}

const PaymentBatches: React.FC<PaymentBatchesProps> = ({ className }) => {
  const [selectedBatch, setSelectedBatch] = useState<PaymentBatch | null>(null);
  const [showBatchDetails, setShowBatchDetails] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<keyof PaymentBatch>('createdDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const {
    batches,
    totalElements,
    isLoading,
    error,
    refetch,
    downloadBankFile,
    confirmBatchCompleted
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

  const handleRetryBatch = async (batch: PaymentBatch) => {
    // TODO: Implement retry functionality
    console.log('Retry batch:', batch.id);
    handleMenuClose();
  };

  const handleCancelBatch = async (batch: PaymentBatch) => {
    // TODO: Implement cancel functionality
    console.log('Cancel batch:', batch.id);
    handleMenuClose();
  };

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
      <Box>
        <LinearProgress sx={{ mb: 2 }} />
        <Typography variant="body2" color="text.secondary">
          Loading payment batches...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        Error loading payment batches: {error}
      </Alert>
    );
  }

  return (
    <Box className={className}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Payment Batches
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {totalElements} generated bank files and payment batches
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Tooltip title="Refresh">
            <span>
              <IconButton onClick={() => refetch()} disabled={isLoading}>
                <Refresh />
              </IconButton>
            </span>
          </Tooltip>
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={() => {/* TODO: Implement filters */}}
          >
            Filters
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <History />
                </Avatar>
                <Box>
                  <Typography variant="h6">{totalElements}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Batches
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
                  <CheckCircle />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {batches.filter(b => b.status === PaymentBatchStatus.COMPLETED).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed
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
                  <Schedule />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {batches.filter(b => b.status === PaymentBatchStatus.FILE_GENERATED).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ready to Send
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
                <Avatar sx={{ bgcolor: 'error.main' }}>
                  <Error />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {batches.filter(b => b.status === PaymentBatchStatus.FAILED).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Failed
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Batches Table */}
      <Paper>
        <TableContainer>
          <Table>
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
        />
      </Paper>

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
              
              {batch.status === PaymentBatchStatus.FILE_GENERATED && (
                <MenuItem onClick={() => handleConfirmCompleted(batch)}>
                  <ListItemIcon>
                    <CheckCircle fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Mark as Completed</ListItemText>
                </MenuItem>
              )}
              
              {batch.status === PaymentBatchStatus.FAILED && (
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
    </Box>
  );
};

export default PaymentBatches;
