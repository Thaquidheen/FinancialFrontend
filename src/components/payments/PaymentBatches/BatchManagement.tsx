// src/components/payments/PaymentBatches/BatchManagement.tsx

import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Alert,
  LinearProgress,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  MoreVert,
  Visibility,
  GetApp,
  CheckCircle,
  Schedule,
  Error,
  Refresh,
  FilterList,
  Search,
  Description,
  History,
  PlayArrow,
  CloudUpload
} from '@mui/icons-material';
import { PaymentBatch, PaymentBatchStatus } from '../../../types/payment.types';
import { PAYMENT_BATCH_STATUS_LABELS, PAYMENT_BATCH_STATUS_COLORS } from '../../../constants/payments/paymentConstants';
import { usePaymentBatches } from '../../../hooks/payments/usePaymentBatches';
import { saudiBankService } from '../../../services/saudiBankService';
import BatchStatusTracker from './BatchStatusTracker';
import BatchDetails from './BatchDetails';

interface BatchManagementProps {
  className?: string;
}

const BatchManagement: React.FC<BatchManagementProps> = ({ className }) => {
  const [selectedBatch, setSelectedBatch] = useState<PaymentBatch | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuBatchId, setMenuBatchId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<PaymentBatchStatus | 'all'>('all');
  const [filterBank, setFilterBank] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const {
    batches,
    totalElements,
    currentPage,
    pageSize,
    isLoading,
    error,
    changePage,
    changePageSize,
    downloadBankFile,
    confirmBatchCompleted,
    getBatchStatistics,
    getDownloadableBatches,
    getConfirmableBatches,
    refetch
  } = usePaymentBatches({ autoRefresh: true });

  const statistics = getBatchStatistics();
  const downloadableBatches = getDownloadableBatches();
  const confirmableBatches = getConfirmableBatches();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, batchId: string) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuBatchId(batchId);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuBatchId(null);
  };

  const handleViewDetails = (batch: PaymentBatch) => {
    setSelectedBatch(batch);
    setShowDetails(true);
    handleMenuClose();
  };

  const handleDownloadFile = async (batch: PaymentBatch) => {
    try {
      await downloadBankFile(batch);
      handleMenuClose();
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleConfirmCompleted = async (batch: PaymentBatch) => {
    try {
      await confirmBatchCompleted(batch);
      handleMenuClose();
    } catch (error) {
      console.error('Confirmation failed:', error);
    }
  };

  const getStatusIcon = (status: PaymentBatchStatus) => {
    switch (status) {
      case PaymentBatchStatus.CREATED:
        return <Schedule color="action" />;
      case PaymentBatchStatus.FILE_GENERATED:
        return <Description color="primary" />;
      case PaymentBatchStatus.SENT_TO_BANK:
        return <CloudUpload color="info" />;
      case PaymentBatchStatus.PROCESSING:
        return <PlayArrow color="warning" />;
      case PaymentBatchStatus.COMPLETED:
        return <CheckCircle color="success" />;
      case PaymentBatchStatus.FAILED:
        return <Error color="error" />;
      default:
        return <Schedule color="action" />;
    }
  };

  const filteredBatches = batches.filter(batch => {
    const statusMatch = filterStatus === 'all' || batch.status === filterStatus;
    const bankMatch = filterBank === 'all' || batch.bankName === filterBank;
    const searchMatch = searchTerm === '' || 
      batch.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.createdBy.toString().toLowerCase().includes(searchTerm.toLowerCase());
    
    return statusMatch && bankMatch && searchMatch;
  });

  const uniqueBanks = [...new Set(batches.map(batch => batch.bankName))];

  return (
    <Box className={className}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Payment Batches
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Monitor and manage payment batch processing
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={() => refetch()}
          disabled={isLoading}
        >
          Refresh
        </Button>
      </Box>

      {/* Loading */}
      {isLoading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Error loading batches: {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <Description />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {statistics.totalBatches}
                  </Typography>
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
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <Schedule />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {statistics.pendingBatches}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending
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
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <PlayArrow />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {statistics.processingBatches}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Processing
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
                  <Typography variant="h4" fontWeight="bold">
                    {statistics.completedBatches}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      {(downloadableBatches.length > 0 || confirmableBatches.length > 0) && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="subtitle2">Action Required</Typography>
              <Typography variant="body2">
                {downloadableBatches.length > 0 && 
                  `${downloadableBatches.length} batch(es) ready for download. `
                }
                {confirmableBatches.length > 0 && 
                  `${confirmableBatches.length} batch(es) awaiting confirmation.`
                }
              </Typography>
            </Box>
            <Box display="flex" gap={1}>
              {downloadableBatches.length > 0 && (
                <Button size="small" startIcon={<GetApp />}>
                  Download Files
                </Button>
              )}
              {confirmableBatches.length > 0 && (
                <Button size="small" startIcon={<CheckCircle />}>
                  Mark Complete
                </Button>
              )}
            </Box>
          </Box>
        </Alert>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search batches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as PaymentBatchStatus | 'all')}
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  {Object.values(PaymentBatchStatus).map(status => (
                    <MenuItem key={status} value={status}>
                      {PAYMENT_BATCH_STATUS_LABELS[status]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Bank</InputLabel>
                <Select
                  value={filterBank}
                  onChange={(e) => setFilterBank(e.target.value)}
                >
                  <MenuItem value="all">All Banks</MenuItem>
                  {uniqueBanks.map(bank => (
                    <MenuItem key={bank} value={bank}>
                      {saudiBankService.getBankByCode(bank)?.name || bank}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => {
                  setFilterStatus('all');
                  setFilterBank('all');
                  setSearchTerm('');
                }}
              >
                Clear
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Batch Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Batch</TableCell>
                  <TableCell>Bank</TableCell>
                  <TableCell align="center">Payments</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Progress</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredBatches.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography variant="h6" color="text.secondary">
                        No batches found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {batches.length === 0 
                          ? 'No payment batches have been created yet'
                          : 'Try adjusting your filters'
                        }
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBatches.map((batch) => (
                    <TableRow 
                      key={batch.id}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => handleViewDetails(batch)}
                    >
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {batch.batchNumber}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {batch.fileName || 'No file'}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar
                            sx={{
                              width: 24,
                              height: 24,
                              bgcolor: saudiBankService.getBankByCode(batch.bankName)?.primaryColor || 'grey.400',
                              fontSize: '0.7rem'
                            }}
                          >
                            {saudiBankService.getBankByCode(batch.bankName)?.shortName?.substring(0, 2) || 'UK'}
                          </Avatar>
                          <Typography variant="body2">
                            {saudiBankService.getBankByCode(batch.bankName)?.shortName || batch.bankName}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell align="center">
                        <Typography variant="body2" fontWeight="medium">
                          {batch.paymentCount}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="medium">
                          {saudiBankService.formatSAR(batch.totalAmount)}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          {getStatusIcon(batch.status)}
                          <Chip
                            label={PAYMENT_BATCH_STATUS_LABELS[batch.status]}
                            color={PAYMENT_BATCH_STATUS_COLORS[batch.status]}
                            size="small"
                          />
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            {new Date(batch.createdDate).toLocaleDateString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            by {batch.createdBy}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell sx={{ width: 120 }}>
                        <BatchStatusTracker
                          status={batch.status}
                          compact
                        />
                      </TableCell>

                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMenuOpen(e, batch.id);
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
          {filteredBatches.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[10, 25, 50]}
              component="div"
              count={totalElements}
              rowsPerPage={pageSize}
              page={currentPage}
              onPageChange={(_, newPage) => changePage(newPage)}
              onRowsPerPageChange={(event) => {
                changePageSize(parseInt(event.target.value, 10));
              }}
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
            const batch = batches.find(b => b.id === menuBatchId);
            if (batch) handleViewDetails(batch);
          }}
        >
          <ListItemIcon>
            <Visibility fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>

        {menuBatchId && downloadableBatches.some(b => b.id === menuBatchId) && (
          <MenuItem
            onClick={() => {
              const batch = batches.find(b => b.id === menuBatchId);
              if (batch) handleDownloadFile(batch);
            }}
          >
            <ListItemIcon>
              <GetApp fontSize="small" />
            </ListItemIcon>
            <ListItemText>Download File</ListItemText>
          </MenuItem>
        )}

        {menuBatchId && confirmableBatches.some(b => b.id === menuBatchId) && (
          <MenuItem
            onClick={() => {
              const batch = batches.find(b => b.id === menuBatchId);
              if (batch) handleConfirmCompleted(batch);
            }}
          >
            <ListItemIcon>
              <CheckCircle fontSize="small" />
            </ListItemIcon>
            <ListItemText>Mark as Completed</ListItemText>
          </MenuItem>
        )}

        <MenuItem
          onClick={() => {
            const batch = batches.find(b => b.id === menuBatchId);
            if (batch) {
              // Navigate to batch history
              console.log('View history for batch:', batch.id);
            }
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <History fontSize="small" />
          </ListItemIcon>
          <ListItemText>View History</ListItemText>
        </MenuItem>
      </Menu>

      {/* Batch Details Dialog */}
      {selectedBatch && (
        <BatchDetails
          batch={selectedBatch}
          open={showDetails}
          onClose={() => {
            setShowDetails(false);
            setSelectedBatch(null);
          }}
          onDownload={() => handleDownloadFile(selectedBatch)}
          onConfirm={() => handleConfirmCompleted(selectedBatch)}
        />
      )}
    </Box>
  );
};

export default BatchManagement;