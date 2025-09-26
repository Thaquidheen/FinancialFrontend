// src/components/payments/PaymentQueue/PaymentQueue.tsx

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
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
  LinearProgress,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  FileDownload,
  Refresh,
  FilterList,
  Clear,
  AccountBalance,
  Warning,
  CheckCircle,
  Info
} from '@mui/icons-material';
import { usePaymentQueue } from '../../../hooks/payments/usePaymentQueue';
import { saudiBankService } from '../../../services/api/saudiBankService';
import PaymentQueueTable from './PaymentQueueTable';
import PaymentQueueFilters from './PaymentQueueFilters';
import BankFileGenerationDialog from '../BankFileGeneration/BankFileGenerationDialog';

interface PaymentQueueProps {
  className?: string;
}

const PaymentQueue: React.FC<PaymentQueueProps> = ({ className }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [selectedBank, setSelectedBank] = useState<string>('');
  const [comments, setComments] = useState<string>('');

  const {
    payments,
    totalElements,
    totalPages,
    currentPage,
    pageSize,
    isLoading,
    error,
    selectedPayments,
    filters,
    updateFilters,
    changePage,
    changePageSize,
    changeSorting,
    selectPayment,
    selectAllPayments,
    clearSelection,
    selectPaymentsByBank,
    generateBankFile,
    getPaymentsByBank,
    getAvailableBanks,
    getSelectionStats,
    validateSelection,
    refetch,
    isGeneratingFile,
    fileGenerationError
  } = usePaymentQueue({
    autoRefresh: true,
    refreshInterval: 30000
  });

  const availableBanks = getAvailableBanks();
  const selectionStats = getSelectionStats();
  const validationResult = validateSelection();
  const paymentsByBank = getPaymentsByBank();

  const handleGenerateFiles = () => {
    if (selectedPayments.length === 0) {
      return;
    }

    // If all selected payments are from the same bank, auto-select it
    const selectedBanks = [...new Set(
      payments
        .filter(p => selectedPayments.includes(p.id))
        .map(p => p.bankName)
        .filter(Boolean)
    )];

    if (selectedBanks.length === 1) {
      setSelectedBank(selectedBanks[0]);
    }

    setShowGenerateDialog(true);
  };

  const handleConfirmGeneration = async () => {
    if (!selectedBank) {
      return;
    }

    await generateBankFile(selectedBank, comments || undefined);
    setShowGenerateDialog(false);
    setSelectedBank('');
    setComments('');
  };

  const handleSelectByBank = (bankName: string) => {
    selectPaymentsByBank(bankName);
  };

  const handleCloseGenerateDialog = () => {
    setShowGenerateDialog(false);
    setSelectedBank('');
    setComments('');
  };

  return (
    <Box className={className}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Payment Queue
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {totalElements} payments ready for processing
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Tooltip title="Refresh Queue">
            <IconButton onClick={refetch} disabled={isLoading}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </Button>
          <Button
            variant="contained"
            startIcon={<FileDownload />}
            onClick={handleGenerateFiles}
            disabled={selectedPayments.length === 0 || isGeneratingFile}
          >
            Generate Bank Files ({selectedPayments.length})
          </Button>
        </Box>
      </Box>

      {/* Loading */}
      {isLoading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => {}}>
          {error}
        </Alert>
      )}

      {/* File Generation Error */}
      {fileGenerationError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          File Generation Error: {fileGenerationError}
        </Alert>
      )}

      {/* Selection Stats */}
      {selectedPayments.length > 0 && (
        <Alert 
          severity={validationResult.isValid ? "info" : "warning"} 
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={clearSelection}>
              Clear Selection
            </Button>
          }
        >
          <Typography variant="subtitle2">
            {selectionStats.count} payments selected • {saudiBankService.formatSAR(selectionStats.totalAmount)}
          </Typography>
          {Object.entries(selectionStats.byBank).length > 0 && (
            <Typography variant="body2">
              Banks: {Object.entries(selectionStats.byBank)
                .map(([bank, count]) => `${bank} (${count})`)
                .join(', ')}
            </Typography>
          )}
          {validationResult.errors.map((error, index) => (
            <Typography key={index} variant="body2" color="error">
              • {error}
            </Typography>
          ))}
          {validationResult.warnings.map((warning, index) => (
            <Typography key={index} variant="body2" color="warning.main">
              • {warning}
            </Typography>
          ))}
        </Alert>
      )}

      {/* Bank Distribution Quick Actions */}
      {paymentsByBank.size > 1 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Quick Select by Bank
          </Typography>
          <Box display="flex" gap={1} flexWrap="wrap">
            {Array.from(paymentsByBank.entries()).map(([bankName, bankPayments]) => {
              const bank = saudiBankService.getBankByCode(bankName) || 
                          saudiBankService.getAllBanks().find(b => b.name === bankName);
              
              return (
                <Chip
                  key={bankName}
                  label={`${bankName} (${bankPayments.length})`}
                  icon={<AccountBalance />}
                  onClick={() => handleSelectByBank(bankName)}
                  variant="outlined"
                  sx={{
                    borderColor: bank?.primaryColor || 'primary.main',
                    color: bank?.primaryColor || 'primary.main',
                    '&:hover': {
                      backgroundColor: bank?.primaryColor + '10' || 'primary.light'
                    }
                  }}
                />
              );
            })}
            <Button
              size="small"
              startIcon={<CheckCircle />}
              onClick={selectAllPayments}
              disabled={selectedPayments.length === payments.length}
            >
              Select All
            </Button>
            <Button
              size="small"
              startIcon={<Clear />}
              onClick={clearSelection}
              disabled={selectedPayments.length === 0}
            >
              Clear All
            </Button>
          </Box>
        </Paper>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <PaymentQueueFilters
            filters={filters}
            onFiltersChange={updateFilters}
            availableBanks={availableBanks}
          />
        </Paper>
      )}

      {/* Payment Table */}
      <Paper>
        <PaymentQueueTable
          payments={payments}
          selectedPayments={selectedPayments}
          onSelectPayment={selectPayment}
          onSelectAll={selectAllPayments}
          onClearSelection={clearSelection}
          onPageChange={changePage}
          onPageSizeChange={changePageSize}
          onSortChange={changeSorting}
          currentPage={currentPage}
          pageSize={pageSize}
          totalElements={totalElements}
          totalPages={totalPages}
          sortBy={filters.sortBy}
          sortDirection={filters.sortDirection}
          isLoading={isLoading}
        />
      </Paper>

      {/* Bank File Generation Dialog */}
      <BankFileGenerationDialog
        open={showGenerateDialog}
        onClose={handleCloseGenerateDialog}
        onConfirm={handleConfirmGeneration}
        selectedPayments={payments.filter(p => selectedPayments.includes(p.id))}
        availableBanks={availableBanks}
        selectedBank={selectedBank}
        onBankChange={setSelectedBank}
        comments={comments}
        onCommentsChange={setComments}
        isGenerating={isGeneratingFile}
        validationResult={validationResult}
      />
    </Box>
  );
};

export default PaymentQueue;