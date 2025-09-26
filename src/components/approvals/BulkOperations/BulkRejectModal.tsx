// components/approvals/BulkOperations/BulkRejectModal.tsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress
} from '@mui/material';
import { ApprovalItem, BulkApprovalResponse } from '../../../types/approval.types';
import { REJECTION_REASONS } from '../../../constants/approvals/approvalConstants';
import { formatCurrency, generateApprovalSummary } from '../../../utils/approvals/approvalUtils';

interface BulkRejectModalProps {
  isOpen: boolean;
  selectedItems: ApprovalItem[];
  onConfirm: (reason: string, comments?: string) => Promise<BulkApprovalResponse | null>;
  onCancel: () => void;
  isProcessing: boolean;
}

const BulkRejectModal: React.FC<BulkRejectModalProps> = ({
  isOpen,
  selectedItems,
  onConfirm,
  onCancel,
  isProcessing
}) => {
  const [reason, setReason] = useState('');
  const [comments, setComments] = useState('');
  const [error, setError] = useState<string | null>(null);

  const approvalSummary = generateApprovalSummary(selectedItems);

  const handleConfirm = async () => {
    if (!reason) {
      setError('Please select a rejection reason');
      return;
    }

    try {
      setError(null);
      const result = await onConfirm(reason, comments.trim() || undefined);
      if (result) {
        setReason('');
        setComments('');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to process bulk rejection');
    }
  };

  const handleCancel = () => {
    setReason('');
    setComments('');
    setError(null);
    onCancel();
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={handleCancel}
      maxWidth="md" 
      fullWidth
      disableEscapeKeyDown={isProcessing}
    >
      <DialogTitle>
        Bulk Reject Quotations
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Alert severity="warning" sx={{ mb: 3 }}>
          You are about to reject {selectedItems.length} quotations totaling{' '}
          <strong>{formatCurrency(approvalSummary.totalAmount)}</strong>.
          This action cannot be undone.
        </Alert>

        <FormControl fullWidth sx={{ mb: 3 }} required>
          <InputLabel>Rejection Reason</InputLabel>
          <Select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={isProcessing}
          >
            {REJECTION_REASONS.map((reasonOption) => (
              <MenuItem key={reasonOption} value={reasonOption}>
                {reasonOption}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Additional Comments"
          multiline
          rows={4}
          fullWidth
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="Provide additional details for the rejection..."
          disabled={isProcessing}
          required={reason === 'Other (specify in comments)'}
        />

        <Box mt={2}>
          <Typography variant="body2" color="textSecondary">
            This will reject {selectedItems.length} quotations across {approvalSummary.projectsCount} projects.
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={handleCancel} 
          disabled={isProcessing}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleConfirm}
          variant="contained" 
          color="error"
          disabled={isProcessing || !reason}
          startIcon={isProcessing ? <CircularProgress size={20} /> : undefined}
        >
          {isProcessing ? 'Processing...' : `Reject ${selectedItems.length} Quotations`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BulkRejectModal;