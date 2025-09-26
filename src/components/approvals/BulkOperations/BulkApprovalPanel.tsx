// components/approvals/BulkOperations/BulkApprovalPanel.tsx
import React, { useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  Button,
  IconButton,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Close as CloseIcon,
  CheckCircle as ApproveIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as RejectIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { BulkApprovalResponse } from '../../../types/approval.types';
import { REJECTION_REASONS, NOTIFICATION_MESSAGES } from '../../../constants/approvals/approvalConstants';
import { formatCurrency } from '../../../utils/approvals/approvalUtils';

interface BulkApprovalPanelProps {
  selectedCount: number;
  selectedAmount: number;
  isProcessing: boolean;
  progress: number;
  currentOperation: string;
  results: BulkApprovalResponse | null;
  error: string | null;
  onApprove: (comments?: string) => void;
  onReject: (reason: string) => void;
  onClose: () => void;
}

const BulkApprovalPanel: React.FC<BulkApprovalPanelProps> = ({
  selectedCount,
  selectedAmount,
  isProcessing,
  progress,
  currentOperation,
  results,
  error,
  onApprove,
  onReject,
  onClose,
}) => {
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [approveComments, setApproveComments] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [rejectComments, setRejectComments] = useState('');

  const handleApprove = () => {
    onApprove(approveComments || undefined);
    setShowApproveDialog(false);
    setApproveComments('');
  };

  const handleReject = () => {
    onReject(rejectReason);
    setShowRejectDialog(false);
    setRejectReason('');
    setRejectComments('');
  };

  const renderProcessingState = () => (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Processing Bulk Operation
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="textSecondary">
          {currentOperation}
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={progress} 
          sx={{ mt: 1 }}
        />
        <Typography variant="caption" color="textSecondary">
          {progress}% complete
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mt: 2 }}>
        Please wait while we process your request. Do not close this window.
      </Alert>
    </Box>
  );

  const renderResults = () => {
    if (!results) return null;

    const successCount = results.processedCount;
    const failedCount = results.failedCount;

    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Operation Complete
        </Typography>

        <Alert 
          severity={failedCount === 0 ? 'success' : 'warning'} 
          sx={{ mb: 2 }}
        >
          {failedCount === 0 
            ? NOTIFICATION_MESSAGES.BULK_APPROVAL_SUCCESS(successCount)
            : NOTIFICATION_MESSAGES.BULK_PARTIAL_SUCCESS(successCount, failedCount)
          }
        </Alert>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Summary:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="success" />
              </ListItemIcon>
              <ListItemText 
                primary={`Successfully processed: ${successCount}`}
              />
            </ListItem>
            {failedCount > 0 && (
              <ListItem>
                <ListItemIcon>
                  <WarningIcon color="error" />
                </ListItemIcon>
                <ListItemText 
                  primary={`Failed: ${failedCount}`}
                />
              </ListItem>
            )}
          </List>
        </Box>

        <Button 
          fullWidth 
          variant="contained" 
          onClick={onClose}
        >
          Close
        </Button>
      </Box>
    );
  };

  const renderError = () => (
    <Box sx={{ p: 2 }}>
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
      <Button 
        fullWidth 
        variant="outlined" 
        onClick={onClose}
      >
        Close
      </Button>
    </Box>
  );

  const renderActionPanel = () => (
    <Box sx={{ p: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6">
          Bulk Actions ({selectedCount} selected)
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Selected Amount: <strong>{formatCurrency(selectedAmount)}</strong>
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Selected Items: <strong>{selectedCount}</strong>
        </Typography>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box display="flex" gap={1} sx={{ mb: 2 }}>
        <Button
          variant="contained"
          color="success"
          startIcon={<ApproveIcon />}
          onClick={() => setShowApproveDialog(true)}
          fullWidth
        >
          Bulk Approve
        </Button>
        
        <Button
          variant="contained"
          color="error"
          startIcon={<RejectIcon />}
          onClick={() => setShowRejectDialog(true)}
          fullWidth
        >
          Bulk Reject
        </Button>
      </Box>

      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body2">
          <strong>Note:</strong> Bulk operations will process all selected items with the same action.
          Make sure all items are appropriate for the selected action.
        </Typography>
      </Alert>
    </Box>
  );

  return (
    <>
      <Paper 
        variant="outlined" 
        sx={{ 
          position: 'fixed',
          bottom: 16,
          right: 16,
          width: 400,
          maxHeight: '80vh',
          overflow: 'auto',
          zIndex: 1300,
        }}
      >
        {isProcessing && renderProcessingState()}
        {results && renderResults()}
        {error && renderError()}
        {!isProcessing && !results && !error && renderActionPanel()}
      </Paper>

      {/* Approve Dialog */}
      <Dialog 
        open={showApproveDialog} 
        onClose={() => setShowApproveDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Bulk Approve Quotations
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            You are about to approve {selectedCount} quotations totaling {formatCurrency(selectedAmount)}.
          </Typography>
          
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Comments (Optional)"
            value={approveComments}
            onChange={(e) => setApproveComments(e.target.value)}
            placeholder="Add any comments for the approval..."
            sx={{ mt: 1 }}
          />

          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Warning:</strong> This action cannot be undone. All selected quotations will be approved.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowApproveDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleApprove} 
            variant="contained" 
            color="success"
          >
            Approve All
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog 
        open={showRejectDialog} 
        onClose={() => setShowRejectDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Bulk Reject Quotations
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            You are about to reject {selectedCount} quotations totaling {formatCurrency(selectedAmount)}.
          </Typography>
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Rejection Reason</InputLabel>
            <Select
              value={rejectReason}
              label="Rejection Reason"
              onChange={(e) => setRejectReason(e.target.value)}
            >
              {REJECTION_REASONS.map(reason => (
                <MenuItem key={reason} value={reason}>
                  {reason}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Additional Comments"
            value={rejectComments}
            onChange={(e) => setRejectComments(e.target.value)}
            placeholder="Provide specific feedback for the rejection..."
            required
          />

          <Alert severity="error" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Warning:</strong> This action cannot be undone. All selected quotations will be rejected.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRejectDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleReject} 
            variant="contained" 
            color="error"
            disabled={!rejectReason}
          >
            Reject All
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BulkApprovalPanel;