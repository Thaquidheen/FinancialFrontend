
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';

interface BankFileGenerationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedPayments: any[];
  availableBanks: any[];
  selectedBank: string;
  onBankChange: (bank: string) => void;
  comments: string;
  onCommentsChange: (comments: string) => void;
  isGenerating: boolean;
  validationResult: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  };
}

const BankFileGenerationDialog: React.FC<BankFileGenerationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  selectedPayments,
  availableBanks,
  selectedBank,
  onBankChange,
  comments,
  onCommentsChange,
  isGenerating,
  validationResult
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Generate Bank File</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Generate bank file for {selectedPayments.length} selected payment{selectedPayments.length !== 1 ? 's' : ''}
          </Typography>

          <FormControl fullWidth>
            <InputLabel>Select Bank</InputLabel>
            <Select
              value={selectedBank}
              onChange={(e) => onBankChange(e.target.value)}
              label="Select Bank"
            >
              {availableBanks.map((bank) => (
                <MenuItem key={bank.code} value={bank.name}>
                  {bank.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Comments (Optional)"
            multiline
            rows={3}
            value={comments}
            onChange={(e) => onCommentsChange(e.target.value)}
            placeholder="Add any comments for this payment batch..."
          />

          {/* Validation Messages */}
          {!validationResult.isValid && (
            <Alert severity="error">
              <Typography variant="subtitle2">Validation Errors:</Typography>
              {validationResult.errors.map((error, index) => (
                <Typography key={index} variant="body2">• {error}</Typography>
              ))}
            </Alert>
          )}

          {validationResult.warnings.length > 0 && (
            <Alert severity="warning">
              <Typography variant="subtitle2">Warnings:</Typography>
              {validationResult.warnings.map((warning, index) => (
                <Typography key={index} variant="body2">• {warning}</Typography>
              ))}
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isGenerating}>
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          disabled={!selectedBank || !validationResult.isValid || isGenerating}
          startIcon={isGenerating ? <CircularProgress size={16} /> : undefined}
        >
          {isGenerating ? 'Generating...' : 'Generate File'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BankFileGenerationDialog;