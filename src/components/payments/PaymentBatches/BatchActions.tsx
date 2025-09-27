// src/components/payments/PaymentBatches/BatchActions.tsx

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  ButtonGroup,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  Divider,
  List,
  ListItem,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Stop,
  Refresh,
  GetApp,
  CheckCircle,
  Error,
  Warning,
  CloudUpload,
  History,
  Edit,
  Delete,
  MoreVert,
  Schedule,
  Info
} from '@mui/icons-material';
import { PaymentBatch, PaymentBatchStatus } from '../../../types/payment.types';
import { PAYMENT_BATCH_STATUS_LABELS } from '../../../constants/payments/paymentConstants';
import { usePaymentBatches } from '../../../hooks/payments/usePaymentBatches';
import { saudiBankService } from '../../../services/saudiBankService';

interface BatchActionsProps {
  batch: PaymentBatch;
  onUpdate?: () => void;
  disabled?: boolean;
  showQuickActions?: boolean;
  className?: string;
}

interface ActionDialogState {
  open: boolean;
  type: 'confirm' | 'notes' | 'status' | 'retry' | 'cancel';
  title: string;
  message: string;
}

const BatchActions: React.FC<BatchActionsProps> = ({
  batch,
  onUpdate,
  disabled = false,
  showQuickActions = true,
  className
}) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [dialogState, setDialogState] = useState<ActionDialogState>({
    open: false,
    type: 'confirm',
    title: '',
    message: ''
  });
  const [actionNotes, setActionNotes] = useState('');
  const [newStatus, setNewStatus] = useState<PaymentBatchStatus>(batch.status);
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    downloadBankFile,
    confirmBatchCompleted,
    markBatchSentToBank,
    markBatchProcessing,
    markBatchCompleted,
    retryBatch,
    updateBatchStatus,
    isDownloading,
    downloadError,
    isConfirming,
    confirmationError
  } = usePaymentBatches();

  const canDownload = batch.fileName && (
    batch.status === PaymentBatchStatus.FILE_GENERATED ||
    batch.status === PaymentBatchStatus.SENT_TO_BANK
  );

  const canMarkSentToBank = batch.status === PaymentBatchStatus.FILE_GENERATED;
  const canMarkProcessing = batch.status === PaymentBatchStatus.SENT_TO_BANK;
  const canComplete = batch.status === PaymentBatchStatus.PROCESSING ||
                     batch.status === PaymentBatchStatus.SENT_TO_BANK;
  const canRetry = batch.status === PaymentBatchStatus.FAILED;

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const openDialog = (
    type: ActionDialogState['type'],
    title: string,
    message: string
  ) => {
    setDialogState({ open: true, type, title, message });
    handleMenuClose();
  };

  const closeDialog = () => {
    setDialogState({ ...dialogState, open: false });
    setActionNotes('');
    setNewStatus(batch.status);
  };

  const handleDownload = async () => {
    try {
      await downloadBankFile(batch);
      onUpdate?.();
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleMarkSentToBank = () => {
    openDialog(
      'confirm',
      'Mark as Sent to Bank',
      'Confirm that you have uploaded the file to the bank portal.'
    );
  };

  const handleMarkProcessing = () => {
    openDialog(
      'confirm', 
      'Mark as Processing',
      'Confirm that the bank has started processing the payments.'
    );
  };

  const handleComplete = () => {
    openDialog(
      'notes',
      'Complete Batch',
      'Mark this batch as completed. All payments have been processed successfully.'
    );
  };

  const handleRetry = () => {
    openDialog(
      'confirm',
      'Retry Failed Batch',
      'This will reset the batch status and allow reprocessing.'
    );
  };

  const handleStatusChange = () => {
    openDialog(
      'status',
      'Change Batch Status',
      'Manually update the batch status. Use with caution.'
    );
  };

  const executeAction = async () => {
    setIsProcessing(true);
    
    try {
      switch (dialogState.type) {
        case 'confirm':
          if (dialogState.title.includes('Sent to Bank')) {
            await markBatchSentToBank(batch.id);
          } else if (dialogState.title.includes('Processing')) {
            await markBatchProcessing(batch.id);
          } else if (dialogState.title.includes('Retry')) {
            await retryBatch(batch.id);
          }
          break;
          
        case 'notes':
          await markBatchCompleted(batch.id, actionNotes);
          break;
          
        case 'status':
          await updateBatchStatus(batch.id, newStatus);
          break;
      }
      
      onUpdate?.();
      closeDialog();
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getQuickActions = () => {
    const actions = [];

    if (canDownload) {
      actions.push({
        label: 'Download',
        icon: <GetApp />,
        onClick: handleDownload,
        loading: isDownloading,
        color: 'primary' as const
      });
    }

    if (canMarkSentToBank) {
      actions.push({
        label: 'Mark Sent',
        icon: <CloudUpload />,
        onClick: handleMarkSentToBank,
        color: 'info' as const
      });
    }

    if (canMarkProcessing) {
      actions.push({
        label: 'Processing',
        icon: <PlayArrow />,
        onClick: handleMarkProcessing,
        color: 'warning' as const
      });
    }

    if (canComplete) {
      actions.push({
        label: 'Complete',
        icon: <CheckCircle />,
        onClick: handleComplete,
        loading: isConfirming,
        color: 'success' as const
      });
    }

    if (canRetry) {
      actions.push({
        label: 'Retry',
        icon: <Refresh />,
        onClick: handleRetry,
        color: 'warning' as const
      });
    }

    return actions;
  };

  const quickActions = getQuickActions();

  return (
    <Box className={className}>
      {/* Quick Actions */}
      {showQuickActions && quickActions.length > 0 && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              Available Actions
            </Typography>
            
            <ButtonGroup variant="outlined" disabled={disabled}>
              {quickActions.slice(0, 3).map((action, index) => (
                <Button
                  key={index}
                  startIcon={action.icon}
                  onClick={action.onClick}
                  disabled={action.loading || isProcessing}
                  color={action.color}
                >
                  {action.loading ? 'Processing...' : action.label}
                </Button>
              ))}
              
              {quickActions.length > 3 && (
                <Button onClick={handleMenuOpen}>
                  <MoreVert />
                </Button>
              )}
            </ButtonGroup>

            {/* Action Descriptions */}
            <Box mt={2}>
              {canDownload && (
                <Alert severity="info" sx={{ mb: 1 }}>
                  <Typography variant="body2">
                    Download the Excel file and upload it to {saudiBankService.getBankByCode(batch.bankName)?.name}'s portal.
                  </Typography>
                </Alert>
              )}
              
              {canComplete && (
                <Alert severity="success" sx={{ mb: 1 }}>
                  <Typography variant="body2">
                    Mark as completed once the bank confirms all payments are processed.
                  </Typography>
                </Alert>
              )}
              
              {canRetry && (
                <Alert severity="warning">
                  <Typography variant="body2">
                    This batch failed processing. You can retry or contact support.
                  </Typography>
                </Alert>
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Status-Specific Guidance */}
      <Card>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom display="flex" alignItems="center" gap={1}>
            <Info />
            Next Steps
          </Typography>
          
          {batch.status === PaymentBatchStatus.CREATED && (
            <Alert severity="info">
              <Typography variant="body2">
                The batch has been created but the bank file has not been generated yet. 
                Generate the file from the Payment Queue to proceed.
              </Typography>
            </Alert>
          )}
          
          {batch.status === PaymentBatchStatus.FILE_GENERATED && (
            <Alert severity="warning">
              <Typography variant="body2">
                <strong>Action Required:</strong> Download the Excel file and upload it to your bank's bulk payment portal. 
                Then mark the batch as "Sent to Bank".
              </Typography>
            </Alert>
          )}
          
          {batch.status === PaymentBatchStatus.SENT_TO_BANK && (
            <Alert severity="info">
              <Typography variant="body2">
                File uploaded to bank. Wait for processing to begin, then update status to "Processing" 
                when the bank starts working on the payments.
              </Typography>
            </Alert>
          )}
          
          {batch.status === PaymentBatchStatus.PROCESSING && (
            <Alert severity="warning">
              <Typography variant="body2">
                <strong>Monitor Bank:</strong> The bank is processing payments. 
                Mark as "Completed" once you receive confirmation that all payments are done.
              </Typography>
            </Alert>
          )}
          
          {batch.status === PaymentBatchStatus.COMPLETED && (
            <Alert severity="success">
              <Typography variant="body2">
                ✓ All payments completed successfully. No further action required.
              </Typography>
            </Alert>
          )}
          
          {batch.status === PaymentBatchStatus.FAILED && (
            <Alert severity="error">
              <Typography variant="body2">
                <strong>Failed:</strong> Processing encountered errors. 
                Review the batch details and retry, or contact support for assistance.
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Error Messages */}
      {downloadError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          Download Error: {downloadError}
        </Alert>
      )}
      
      {confirmationError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          Confirmation Error: {confirmationError}
        </Alert>
      )}

      {/* More Actions Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        {quickActions.slice(3).map((action, index) => (
          <MenuItem key={index} onClick={action.onClick} disabled={action.loading}>
            <ListItemIcon>
              {action.icon}
            </ListItemIcon>
            <ListItemText>
              {action.loading ? 'Processing...' : action.label}
            </ListItemText>
          </MenuItem>
        ))}
        
        <Divider />
        
        <MenuItem onClick={handleStatusChange}>
          <ListItemIcon>
            <Edit />
          </ListItemIcon>
          <ListItemText>Change Status</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => openDialog('confirm', 'View History', 'View batch processing history')}>
          <ListItemIcon>
            <History />
          </ListItemIcon>
          <ListItemText>View History</ListItemText>
        </MenuItem>
      </Menu>

      {/* Action Dialog */}
      <Dialog
        open={dialogState.open}
        onClose={closeDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{dialogState.title}</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            {dialogState.message}
          </Typography>
          
          {/* Batch Info */}
          <Box mt={2} p={2} bgcolor="grey.50" borderRadius={1}>
            <Typography variant="caption" color="text.secondary">
              Batch Details
            </Typography>
            <List dense>
              <ListItem disablePadding>
                <ListItemText
                  primary="Batch Number"
                  secondary={batch.batchNumber}
                />
              </ListItem>
              <ListItem disablePadding>
                <ListItemText
                  primary="Bank"
                  secondary={saudiBankService.getBankByCode(batch.bankName)?.name || batch.bankName}
                />
              </ListItem>
              <ListItem disablePadding>
                <ListItemText
                  primary="Amount"
                  secondary={saudiBankService.formatSAR(batch.totalAmount)}
                />
              </ListItem>
              <ListItem disablePadding>
                <ListItemText
                  primary="Payments"
                  secondary={`${batch.paymentCount} payments`}
                />
              </ListItem>
            </List>
          </Box>

          {/* Notes Input */}
          {dialogState.type === 'notes' && (
            <TextField
              fullWidth
              label="Completion Notes (Optional)"
              multiline
              rows={3}
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              placeholder="Add notes about the completion process..."
              sx={{ mt: 2 }}
              helperText="These notes will be saved in the batch history"
            />
          )}

          {/* Status Selection */}
          {dialogState.type === 'status' && (
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>New Status</InputLabel>
              <Select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as PaymentBatchStatus)}
              >
                {Object.values(PaymentBatchStatus).map(status => (
                  <MenuItem key={status} value={status}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip
                        size="small"
                        label={PAYMENT_BATCH_STATUS_LABELS[status]}
                      />
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={closeDialog} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            onClick={executeAction}
            variant="contained"
            disabled={isProcessing}
            color={
              dialogState.type === 'notes' ? 'success' :
              dialogState.title.includes('Retry') ? 'warning' :
              'primary'
            }
          >
            {isProcessing ? 'Processing...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BatchActions;