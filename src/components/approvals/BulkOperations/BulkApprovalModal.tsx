// components/approvals/BulkOperations/BulkApprovalModal.tsx
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
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import { ApprovalItem, BulkApprovalResponse } from '../../../types/approval.types';
import { formatCurrency, generateApprovalSummary } from '../../../utils/approvals/approvalUtils';

interface BulkApprovalModalProps {
  isOpen: boolean;
  selectedItems: ApprovalItem[];
  onConfirm: (comments?: string) => Promise<BulkApprovalResponse | null>;
  onCancel: () => void;
  isProcessing: boolean;
}

const BulkApprovalModal: React.FC<BulkApprovalModalProps> = ({
  isOpen,
  selectedItems,
  onConfirm,
  onCancel,
  isProcessing
}) => {
  const [comments, setComments] = useState('');
  const [error, setError] = useState<string | null>(null);

  const approvalSummary = generateApprovalSummary(selectedItems);

  const handleConfirm = async () => {
    try {
      setError(null);
      const result = await onConfirm(comments.trim() || undefined);
      if (result) {
        setComments('');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to process bulk approval');
    }
  };

  const handleCancel = () => {
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
        Bulk Approve Quotations
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            Approval Summary
          </Typography>
          <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={2}>
            <Box>
              <Typography variant="body2" color="textSecondary">
                Total Quotations:
              </Typography>
              <Typography variant="h6">
                {approvalSummary.totalSelected}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="textSecondary">
                Total Amount:
              </Typography>
              <Typography variant="h6" color="primary">
                {formatCurrency(approvalSummary.totalAmount)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="textSecondary">
                Projects Affected:
              </Typography>
              <Typography variant="h6">
                {approvalSummary.projectsCount}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="textSecondary">
                Project Managers:
              </Typography>
              <Typography variant="h6">
                {approvalSummary.managersCount}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            Quotations to Approve
          </Typography>
          <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
            <List dense>
              {selectedItems.slice(0, 10).map((item) => (
                <ListItem key={item.id}>
                  <ListItemText
                    primary={`${item.quotationNumber} - ${item.projectName}`}
                    secondary={`${formatCurrency(item.totalAmount)} • ${item.projectManagerName}`}
                  />
                </ListItem>
              ))}
              {selectedItems.length > 10 && (
                <ListItem>
                  <ListItemText
                    secondary={`... and ${selectedItems.length - 10} more quotations`}
                  />
                </ListItem>
              )}
            </List>
          </Box>
        </Box>

        <TextField
          label="Comments (Optional)"
          multiline
          rows={3}
          fullWidth
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="Add any comments for this bulk approval..."
          disabled={isProcessing}
        />
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
          color="success"
          disabled={isProcessing}
          startIcon={isProcessing ? <CircularProgress size={20} /> : undefined}
        >
          {isProcessing ? 'Processing...' : `Approve ${selectedItems.length} Quotations`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BulkApprovalModal;