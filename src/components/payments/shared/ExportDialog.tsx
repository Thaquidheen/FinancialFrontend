import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { GetApp } from '@mui/icons-material';
import { paymentExportService, ExportOptions } from '../../../services/paymentExportService';
import { PaymentSummaryResponse, PaymentSearchParams } from '../../../types/payment.types';

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  payments?: PaymentSummaryResponse[];
  filters?: PaymentSearchParams;
  useBackendExport?: boolean;
}

const ExportDialog: React.FC<ExportDialogProps> = ({
  open,
  onClose,
  payments,
  filters,
  useBackendExport = true
}) => {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'excel',
    includeDetails: true,
    includeTimeline: false,
    dateFormat: 'US',
    currencyFormat: 'SAR'
  });
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setError(null);

      if (useBackendExport && filters) {
        // Use backend export service
        await paymentExportService.exportViaBackend(filters, exportOptions.format);
      } else if (payments) {
        // Use client-side export
        if (exportOptions.format === 'excel') {
          await paymentExportService.exportToExcel(payments, exportOptions);
        } else if (exportOptions.format === 'csv') {
          await paymentExportService.exportToCSV(payments, exportOptions);
        }
      }

      onClose();
    } catch (err: any) {
      setError(err.message || 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Export Payments</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={3} py={2}>
          <FormControl fullWidth>
            <InputLabel>Export Format</InputLabel>
            <Select
              value={exportOptions.format}
              onChange={(e) => setExportOptions(prev => ({ 
                ...prev, 
                format: e.target.value as any 
              }))}
              label="Export Format"
            >
              <MenuItem value="excel">Excel Spreadsheet (.xlsx)</MenuItem>
              <MenuItem value="csv">CSV File (.csv)</MenuItem>
              {useBackendExport && <MenuItem value="pdf">PDF Report (.pdf)</MenuItem>}
            </Select>
          </FormControl>

          <FormGroup>
            <Typography variant="subtitle2" gutterBottom>
              Include Options
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={exportOptions.includeDetails}
                  onChange={(e) => setExportOptions(prev => ({ 
                    ...prev, 
                    includeDetails: e.target.checked 
                  }))}
                />
              }
              label="Include detailed information"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={exportOptions.includeTimeline}
                  onChange={(e) => setExportOptions(prev => ({ 
                    ...prev, 
                    includeTimeline: e.target.checked 
                  }))}
                />
              }
              label="Include payment timeline"
            />
          </FormGroup>

          <FormControl fullWidth>
            <InputLabel>Date Format</InputLabel>
            <Select
              value={exportOptions.dateFormat}
              onChange={(e) => setExportOptions(prev => ({ 
                ...prev, 
                dateFormat: e.target.value as any 
              }))}
              label="Date Format"
            >
              <MenuItem value="US">US Format (MM/DD/YYYY)</MenuItem>
              <MenuItem value="UK">UK Format (DD/MM/YYYY)</MenuItem>
              <MenuItem value="ISO">ISO Format (YYYY-MM-DD)</MenuItem>
            </Select>
          </FormControl>

          {error && (
            <Alert severity="error">
              {error}
            </Alert>
          )}

          {payments && (
            <Alert severity="info">
              Exporting {payments.length} payment records
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isExporting}>
          Cancel
        </Button>
        <Button
          onClick={handleExport}
          variant="contained"
          disabled={isExporting}
          startIcon={isExporting ? <CircularProgress size={20} /> : <GetApp />}
        >
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportDialog;