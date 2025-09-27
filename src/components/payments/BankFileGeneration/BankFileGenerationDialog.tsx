

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  AccountBalance,
  CheckCircle,
  ExpandMore
} from '@mui/icons-material';
import { PaymentSummaryResponse } from '../../../types/payment.types';
import { SaudiBankDefinition } from '../../../types/saudiBanking.types';
import { saudiBankService } from '../../../services/saudiBankService';

interface BankFileGenerationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedPayments: PaymentSummaryResponse[];
  availableBanks: SaudiBankDefinition[];
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
  const totalAmount = selectedPayments.reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <AccountBalance />
          Generate Bank File
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box mb={3}>
          <Typography variant="body2" color="text.secondary">
            Generate Excel file for {selectedPayments.length} payments
          </Typography>
        </Box>

        {/* Bank Selection */}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Select Bank</InputLabel>
          <Select
            value={selectedBank}
            onChange={(e) => onBankChange(e.target.value)}
            label="Select Bank"
          >
            {availableBanks.map((bank) => (
              <MenuItem key={bank.code} value={bank.code}>
                {bank.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Comments */}
        <TextField
          fullWidth
          label="Comments (Optional)"
          multiline
          rows={3}
          value={comments}
          onChange={(e) => onCommentsChange(e.target.value)}
          sx={{ mb: 3 }}
        />

        {/* Validation Results */}
        {validationResult.errors.length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Errors:
            </Typography>
            {validationResult.errors.map((error, index) => (
              <Typography key={index} variant="body2">
                • {error}
              </Typography>
            ))}
          </Alert>
        )}

        {validationResult.warnings.length > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Warnings:
            </Typography>
            {validationResult.warnings.map((warning, index) => (
              <Typography key={index} variant="body2">
                • {warning}
              </Typography>
            ))}
          </Alert>
        )}

        {/* Payment Summary */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle1">
              Payment Summary ({selectedPayments.length} payments)
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Bank</TableCell>
                    <TableCell>Project</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{payment.employeeName}</TableCell>
                      <TableCell align="right">
                        {saudiBankService.formatSAR(payment.amount)}
                      </TableCell>
                      <TableCell>{payment.bankName || 'N/A'}</TableCell>
                      <TableCell>{payment.projectName || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <Box mt={2} p={2} bgcolor="primary.50" borderRadius={1}>
              <Typography variant="h6" align="right">
                Total: {saudiBankService.formatSAR(totalAmount)}
              </Typography>
            </Box>
          </AccordionDetails>
        </Accordion>

        {isGenerating && (
          <Box mt={2}>
            <LinearProgress />
            <Typography variant="body2" align="center" sx={{ mt: 1 }}>
              Generating bank file...
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isGenerating}>
          Cancel
        </Button>
        <Button 
          onClick={onConfirm} 
          variant="contained"
          disabled={!validationResult.isValid || isGenerating || !selectedBank}
          startIcon={<CheckCircle />}
        >
          Generate File
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BankFileGenerationDialog;