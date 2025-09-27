// src/components/payments/PaymentBatches/BatchDetails.tsx

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Alert,
  TextField,
  Collapse,
  Avatar
} from '@mui/material';
import {
  Close,
  GetApp,
  CheckCircle,
  AccountBalance,
  AttachMoney,
  Person,
  Schedule,
  Description,
  Info,
  ExpandMore,
  ExpandLess,
  CloudUpload,
  Warning,
  Error,
  History
} from '@mui/icons-material';
import { PaymentBatch, PaymentBatchStatus } from '../../../types/payment.types';
import { saudiBankService } from '../../../services/saudiBankService';
import { PAYMENT_BATCH_STATUS_LABELS } from '../../../constants/payments/paymentConstants';
import BatchStatusTracker from './BatchStatusTracker';
import BatchTimeline from './BatchTimeline';

interface BatchDetailsProps {
  batch: PaymentBatch;
  open: boolean;
  onClose: () => void;
  onDownload?: () => void;
  onConfirm?: () => void;
  className?: string;
}

const BatchDetails: React.FC<BatchDetailsProps> = ({
  batch,
  open,
  onClose,
  onDownload,
  onConfirm,
  className
}) => {
  const [showPayments, setShowPayments] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [confirmationNotes, setConfirmationNotes] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const bank = saudiBankService.getBankByCode(batch.bankName);
  const canDownload = batch.fileName && (
    batch.status === PaymentBatchStatus.FILE_GENERATED ||
    batch.status === PaymentBatchStatus.SENT_TO_BANK
  );
  const canConfirm = batch.status === PaymentBatchStatus.PROCESSING ||
                    batch.status === PaymentBatchStatus.SENT_TO_BANK;

  const handleConfirmWithNotes = () => {
    if (onConfirm) {
      onConfirm();
      setShowConfirmDialog(false);
      setConfirmationNotes('');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProcessingDuration = () => {
    if (!batch.processedAt) return null;
    
    const start = new Date(batch.createdAt);
    const end = new Date(batch.processedAt);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    }
    return `${diffMinutes}m`;
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        className={className}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6">
                Batch Details: {batch.batchNumber}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {bank?.name || batch.bankName} • {batch.paymentCount} payments
              </Typography>
            </Box>
            <IconButton onClick={onClose} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          {/* Batch Overview */}
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                    <Info />
                    Batch Information
                  </Typography>
                  
                  <List dense>
                    <ListItem disablePadding>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <Description fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Batch Number"
                        secondary={batch.batchNumber}
                      />
                    </ListItem>
                    
                    <ListItem disablePadding>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <AccountBalance fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Bank"
                        secondary={
                          <Box display="flex" alignItems="center" gap={1}>
                            {bank && (
                              <Avatar
                                sx={{
                                  width: 20,
                                  height: 20,
                                  bgcolor: bank.primaryColor,
                                  fontSize: '0.7rem'
                                }}
                              >
                                {bank.shortName?.substring(0, 2)}
                              </Avatar>
                            )}
                            {bank?.name || batch.bankName}
                          </Box>
                        }
                      />
                    </ListItem>
                    
                    <ListItem disablePadding>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <Person fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Created By"
                        secondary={batch.createdBy}
                      />
                    </ListItem>
                    
                    <ListItem disablePadding>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <Schedule fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Created"
                        secondary={formatDate(batch.createdAt)}
                      />
                    </ListItem>

                    {batch.processedAt && (
                      <ListItem disablePadding>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <CheckCircle fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Processed"
                          secondary={`${formatDate(batch.processedAt)} (${getProcessingDuration()})`}
                        />
                      </ListItem>
                    )}

                    {batch.fileName && (
                      <ListItem disablePadding>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <CloudUpload fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary="File Name"
                          secondary={batch.fileName}
                        />
                      </ListItem>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Financial Summary */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                    <AttachMoney />
                    Financial Summary
                  </Typography>
                  
                  <Box display="flex" justify-content="space-between" alignItems="center" mb={2}>
                    <Typography variant="h4" color="primary" fontWeight="bold">
                      {saudiBankService.formatSAR(batch.totalAmount)}
                    </Typography>
                    <Chip
                      label={`${batch.paymentCount} payments`}
                      color="primary"
                      variant="outlined"
                    />
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box display="flex" justify-content="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      Average Payment
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {saudiBankService.formatSAR(batch.totalAmount / batch.paymentCount)}
                    </Typography>
                  </Box>

                  {batch.payments && batch.payments.length > 0 && (
                    <>
                      <Box display="flex" justify-content="space-between" mb={1}>
                        <Typography variant="body2" color="text.secondary">
                          Largest Payment
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {saudiBankService.formatSAR(Math.max(...batch.payments.map(p => p.amount)))}
                        </Typography>
                      </Box>

                      <Box display="flex" justify-content="space-between" mb={1}>
                        <Typography variant="body2" color="text.secondary">
                          Smallest Payment
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {saudiBankService.formatSAR(Math.min(...batch.payments.map(p => p.amount)))}
                        </Typography>
                      </Box>
                    </>
                  )}

                  {/* Status Alert */}
                  <Alert 
                    severity={
                      batch.status === PaymentBatchStatus.COMPLETED ? 'success' :
                      batch.status === PaymentBatchStatus.FAILED ? 'error' :
                      'info'
                    }
                    sx={{ mt: 2 }}
                  >
                    <Typography variant="body2">
                      Status: {PAYMENT_BATCH_STATUS_LABELS[batch.status]}
                    </Typography>
                  </Alert>
                </CardContent>
              </Card>
            </Grid>

            {/* Status Tracker */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <BatchStatusTracker status={batch.status} />
                </CardContent>
              </Card>
            </Grid>

            {/* Bank Information */}
            {bank && (
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                      <AccountBalance />
                      Bank Details
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <Box textAlign="center" p={2} bgcolor="grey.50" borderRadius={1}>
                          <Typography variant="caption" color="text.secondary">
                            Processing Time
                          </Typography>
                          <Typography variant="h6">
                            {bank.processingTime}
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Box textAlign="center" p={2} bgcolor="grey.50" borderRadius={1}>
                          <Typography variant="caption" color="text.secondary">
                            Cutoff Time
                          </Typography>
                          <Typography variant="h6">
                            {bank.cutoffTime}
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Box textAlign="center" p={2} bgcolor="grey.50" borderRadius={1}>
                          <Typography variant="caption" color="text.secondary">
                            Max Bulk Payments
                          </Typography>
                          <Typography variant="h6">
                            {bank.maxBulkPayments.toLocaleString()}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    {batch.paymentCount > bank.maxBulkPayments && (
                      <Alert severity="warning" sx={{ mt: 2 }}>
                        This batch exceeds the bank's maximum bulk payment limit of {bank.maxBulkPayments}.
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Payments List */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box display="flex" justify-content="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">
                      Payment Details ({batch.paymentCount})
                    </Typography>
                    <Button
                      startIcon={showPayments ? <ExpandLess /> : <ExpandMore />}
                      onClick={() => setShowPayments(!showPayments)}
                      variant="outlined"
                      size="small"
                    >
                      {showPayments ? 'Hide' : 'Show'} Payments
                    </Button>
                  </Box>

                  <Collapse in={showPayments}>
                    {batch.payments && batch.payments.length > 0 ? (
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Employee</TableCell>
                              <TableCell align="right">Amount</TableCell>
                              <TableCell>Project</TableCell>
                              <TableCell>Status</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {batch.payments.slice(0, 10).map((payment) => (
                              <TableRow key={payment.id}>
                                <TableCell>
                                  <Box display="flex" alignItems="center" gap={1}>
                                    <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem' }}>
                                      {payment.employeeName?.charAt(0)}
                                    </Avatar>
                                    <Typography variant="body2">
                                      {payment.employeeName}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell align="right">
                                  <Typography variant="body2" fontWeight="medium">
                                    {saudiBankService.formatSAR(payment.amount)}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">
                                    {payment.projectName || '-'}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip size="small" label={payment.status} />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        {batch.payments.length > 10 && (
                          <Box p={2} textAlign="center" bgcolor="grey.50">
                            <Typography variant="body2" color="text.secondary">
                              ... and {batch.payments.length - 10} more payments
                            </Typography>
                          </Box>
                        )}
                      </TableContainer>
                    ) : (
                      <Alert severity="info">
                        Payment details not available
                      </Alert>
                    )}
                  </Collapse>
                </CardContent>
              </Card>
            </Grid>

            {/* Timeline */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box display="flex" justify-content="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" display="flex" alignItems="center" gap={1}>
                      <History />
                      Processing Timeline
                    </Typography>
                    <Button
                      startIcon={showTimeline ? <ExpandLess /> : <ExpandMore />}
                      onClick={() => setShowTimeline(!showTimeline)}
                      variant="outlined"
                      size="small"
                    >
                      {showTimeline ? 'Hide' : 'Show'} Timeline
                    </Button>
                  </Box>

                  <Collapse in={showTimeline}>
                    <BatchTimeline batch={batch} />
                  </Collapse>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>
            Close
          </Button>
          
          {canDownload && onDownload && (
            <Button
              startIcon={<GetApp />}
              onClick={onDownload}
              variant="outlined"
            >
              Download File
            </Button>
          )}
          
          {canConfirm && onConfirm && (
            <Button
              startIcon={<CheckCircle />}
              onClick={() => setShowConfirmDialog(true)}
              variant="contained"
              color="success"
            >
              Mark as Completed
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Confirm Batch Completion
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to mark batch <strong>{batch.batchNumber}</strong> as completed?
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            This action indicates that all {batch.paymentCount} payments have been successfully processed by the bank.
          </Typography>
          
          <TextField
            fullWidth
            label="Confirmation Notes (Optional)"
            multiline
            rows={3}
            value={confirmationNotes}
            onChange={(e) => setConfirmationNotes(e.target.value)}
            placeholder="Add any notes about the completion..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmWithNotes}
            variant="contained"
            color="success"
            startIcon={<CheckCircle />}
          >
            Confirm Completion
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BatchDetails;