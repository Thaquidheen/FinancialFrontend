// src/components/payments/BankFileGeneration/PaymentSelection.tsx

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Alert,
  LinearProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  SelectAll,
  Clear,
  Person,
  AttachMoney,
  AccountBalance,
  Assignment
} from '@mui/icons-material';
import { PaymentSummaryResponse } from '../../../types/payment.types';
import { saudiBankService } from '../../../services/saudiBankService';

interface PaymentSelectionProps {
  payments: PaymentSummaryResponse[];
  selectedPayments: string[];
  onSelectionChange: (paymentIds: string[]) => void;
  isLoading?: boolean;
  className?: string;
}

const PaymentSelection: React.FC<PaymentSelectionProps> = ({
  payments,
  selectedPayments,
  onSelectionChange,
  isLoading = false,
  className
}) => {
  const isAllSelected = payments.length > 0 && selectedPayments.length === payments.length;
  const isIndeterminate = selectedPayments.length > 0 && selectedPayments.length < payments.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(payments.map(p => p.id));
    }
  };

  const handleSelectPayment = (paymentId: string) => {
    if (selectedPayments.includes(paymentId)) {
      onSelectionChange(selectedPayments.filter(id => id !== paymentId));
    } else {
      onSelectionChange([...selectedPayments, paymentId]);
    }
  };

  const handleSelectByBank = (bankCode: string) => {
    const bankPayments = payments.filter(p => p.bankName === bankCode);
    const bankPaymentIds = bankPayments.map(p => p.id);
    
    // If all bank payments are selected, deselect them
    const allBankSelected = bankPaymentIds.every(id => selectedPayments.includes(id));
    
    if (allBankSelected) {
      onSelectionChange(selectedPayments.filter(id => !bankPaymentIds.includes(id)));
    } else {
      // Add bank payments that aren't already selected
      const newSelections = [...selectedPayments];
      bankPaymentIds.forEach(id => {
        if (!newSelections.includes(id)) {
          newSelections.push(id);
        }
      });
      onSelectionChange(newSelections);
    }
  };

  const getPaymentsByBank = () => {
    const bankGroups = payments.reduce((acc, payment) => {
      const bankCode = payment.bankName || 'Unknown';
      if (!acc[bankCode]) {
        acc[bankCode] = [];
      }
      acc[bankCode].push(payment);
      return acc;
    }, {} as Record<string, PaymentSummaryResponse[]>);

    return Object.entries(bankGroups).map(([bankCode, bankPayments]) => ({
      bankCode,
      bankName: saudiBankService.getBankByCode(bankCode)?.name || bankCode,
      payments: bankPayments,
      totalAmount: bankPayments.reduce((sum, p) => sum + p.amount, 0),
      selectedCount: bankPayments.filter(p => selectedPayments.includes(p.id)).length
    }));
  };

  const getSelectionSummary = () => {
    const selectedPaymentData = payments.filter(p => selectedPayments.includes(p.id));
    const totalAmount = selectedPaymentData.reduce((sum, p) => sum + p.amount, 0);
    const banksCount = new Set(selectedPaymentData.map(p => p.bankName)).size;

    return {
      count: selectedPayments.length,
      totalAmount,
      banksCount,
      averageAmount: selectedPayments.length > 0 ? totalAmount / selectedPayments.length : 0
    };
  };

  const summary = getSelectionSummary();
  const paymentsByBank = getPaymentsByBank();

  if (isLoading) {
    return (
      <Box className={className}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <LinearProgress sx={{ flex: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Loading payments...
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (payments.length === 0) {
    return (
      <Box className={className}>
        <Alert severity="info">
          <Typography variant="subtitle2">No Payments Available</Typography>
          <Typography variant="body2">
            There are no payments available for selection. Please check your filters or ensure payments are ready for processing.
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box className={className}>
      {/* Selection Summary */}
      {selectedPayments.length > 0 && (
        <Card sx={{ mb: 3, bgcolor: 'primary.50' }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h6" color="primary.main">
                  {summary.count} Payment{summary.count !== 1 ? 's' : ''} Selected
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total: {saudiBankService.formatSAR(summary.totalAmount)} • 
                  {summary.banksCount} Bank{summary.banksCount !== 1 ? 's' : ''} • 
                  Avg: {saudiBankService.formatSAR(summary.averageAmount)}
                </Typography>
              </Box>
              <Button
                startIcon={<Clear />}
                onClick={() => onSelectionChange([])}
                variant="outlined"
                size="small"
              >
                Clear Selection
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Selection Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Select Payments</Typography>
            <Box display="flex" gap={1}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isAllSelected}
                    indeterminate={isIndeterminate}
                    onChange={handleSelectAll}
                  />
                }
                label="Select All"
              />
            </Box>
          </Box>

          {/* Bank Selection */}
          <Box mb={2}>
            <Typography variant="subtitle2" gutterBottom>
              Quick Select by Bank:
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              {paymentsByBank.map(({ bankCode, bankName, selectedCount, payments: bankPayments }) => (
                <Chip
                  key={bankCode}
                  label={`${bankName} (${selectedCount}/${bankPayments.length})`}
                  variant={selectedCount === bankPayments.length ? "filled" : "outlined"}
                  color={selectedCount === bankPayments.length ? "primary" : "default"}
                  onClick={() => handleSelectByBank(bankCode)}
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Payment Table */}
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={isAllSelected}
                  indeterminate={isIndeterminate}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>Employee</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell>Bank</TableCell>
              <TableCell>Project</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.map((payment) => {
              const isSelected = selectedPayments.includes(payment.id);
              const bank = saudiBankService.getBankByCode(payment.bankName || '');

              return (
                <TableRow 
                  key={payment.id}
                  hover
                  selected={isSelected}
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                  onClick={() => handleSelectPayment(payment.id)}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected}
                      onChange={() => handleSelectPayment(payment.id)}
                    />
                  </TableCell>

                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Person fontSize="small" color="action" />
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {payment.employeeName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {payment.quotationId}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="medium">
                      {saudiBankService.formatSAR(payment.amount)}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <AccountBalance fontSize="small" color="action" />
                      <Box>
                        <Typography variant="body2">
                          {bank?.shortName || bank?.name || payment.bankName || 'Unknown'}
                        </Typography>
                        {bank && (
                          <Typography variant="caption" color="text.secondary">
                            {bank.code}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Assignment fontSize="small" color="action" />
                      <Typography variant="body2">
                        {payment.projectName || 'No Project'}
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Chip
                      size="small"
                      label={payment.status}
                      color={
                        payment.status === 'APPROVED' ? 'success' :
                        payment.status === 'PENDING' ? 'warning' :
                        payment.status === 'REJECTED' ? 'error' :
                        'default'
                      }
                      variant="outlined"
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Selection Tips */}
      {selectedPayments.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            Select payments to include in your bank file. You can select individual payments or use the bank-based quick selection.
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

export default PaymentSelection;
