// src/components/payments/BankFileGeneration/BankFilePreview.tsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TextField,
  Alert,
  Button,
  IconButton,
  Tooltip,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Grid
} from '@mui/material';
import {
  Visibility,
  Description,
  CheckCircle,
  Warning,
  Info,
  AccountBalance,
  AttachMoney,
  Person,
  Schedule,
  ExpandMore,
  ExpandLess,
  FileDownload
} from '@mui/icons-material';
import { PaymentSummaryResponse } from '../../../types/payment.types';
import { saudiBankService } from '../../../services/saudiBankService';
import { SAUDI_BANK_EXCEL_FORMATS } from '../../../types/saudiBanking.types';

interface BankFilePreviewProps {
  payments: PaymentSummaryResponse[];
  bankCode: string;
  comments: string;
  onCommentsChange: (comments: string) => void;
  validationResults: Map<string, any>;
  className?: string;
}

interface ExcelPreviewData {
  headers: string[];
  rows: (string | number)[][];
  fileName: string;
  sheetName: string;
  totalAmount: number;
  paymentCount: number;
}

const BankFilePreview: React.FC<BankFilePreviewProps> = ({
  payments,
  bankCode,
  comments,
  onCommentsChange,
  validationResults,
  className
}) => {
  const [previewData, setPreviewData] = useState<ExcelPreviewData | null>(null);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [expandedInfo, setExpandedInfo] = useState(false);

  const bank = saudiBankService.getBankByCode(bankCode);
  const bankFormat = SAUDI_BANK_EXCEL_FORMATS[bankCode];

  useEffect(() => {
    if (payments.length > 0 && bankCode) {
      generatePreviewData();
    }
  }, [payments, bankCode]);

  const generatePreviewData = () => {
    if (!bank || !bankFormat) return;

    const fileName = saudiBankService.generateFileName(
      bankCode, 
      `BATCH${Date.now().toString().slice(-4)}`
    );

    // Generate headers based on bank format
    const headers = bankFormat.columns.map(col => col.header);

    // Generate rows based on payments
    const rows = payments.map(payment => {
      const row: (string | number)[] = [];
      
      bankFormat.columns.forEach(col => {
        switch (col.fieldName) {
          case 'bankName':
            row.push(col.defaultValue || bank.name);
            break;
          case 'iban':
            // In a real implementation, this would come from payment data
            row.push(`SA${bank.ibanPrefix}000000000000000001`);
            break;
          case 'amount':
            row.push(payment.amount);
            break;
          case 'employeeName':
            row.push(payment.payeeName);
            break;
          case 'description':
            row.push(comments || `Payment for ${payment.payeeName}`);
            break;
          case 'nationalId':
            // In a real implementation, this would come from employee data
            row.push('1234567890');
            break;
          case 'beneficiaryAddress':
            row.push(col.defaultValue || '');
            break;
          default:
            row.push('');
        }
      });
      
      return row;
    });

    setPreviewData({
      headers,
      rows,
      fileName,
      sheetName: bankFormat.sheetName,
      totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
      paymentCount: payments.length
    });
  };

  const getValidationSummary = () => {
    const results = Array.from(validationResults.values());
    return {
      totalPayments: results.length,
      validPayments: results.filter(r => r.isValid).length,
      paymentsWithWarnings: results.filter(r => r.warnings?.length > 0).length,
      paymentsWithErrors: results.filter(r => r.errors?.length > 0).length
    };
  };

  const validationSummary = getValidationSummary();
  const canGenerate = validationSummary.paymentsWithErrors === 0;

  if (!previewData || !bank) {
    return (
      <Box className={className}>
        <Alert severity="info">
          <Typography variant="body2">
            Generating preview... Please wait.
          </Typography>
        </Alert>
      </Box>
    );
  }

  const displayRows = showFullPreview ? previewData.rows : previewData.rows.slice(0, 5);

  return (
    <Box className={className}>
      {/* File Information */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
            <Description />
            File Information
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <List dense>
                <ListItem disablePadding>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <AccountBalance fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Target Bank"
                    secondary={bank.name}
                  />
                </ListItem>
                
                <ListItem disablePadding>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <Description fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="File Name"
                    secondary={previewData.fileName}
                  />
                </ListItem>
                
                <ListItem disablePadding>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <Info fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Sheet Name"
                    secondary={previewData.sheetName}
                  />
                </ListItem>
              </List>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <List dense>
                <ListItem disablePadding>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <Person fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Payment Count"
                    secondary={`${previewData.paymentCount} payments`}
                  />
                </ListItem>
                
                <ListItem disablePadding>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <AttachMoney fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Total Amount"
                    secondary={saudiBankService.formatSAR(previewData.totalAmount)}
                  />
                </ListItem>
                
                <ListItem disablePadding>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <Schedule fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Generated"
                    secondary={new Date().toLocaleString()}
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>

          {/* Bank-specific info toggle */}
          <Box mt={2}>
            <Button
              startIcon={expandedInfo ? <ExpandLess /> : <ExpandMore />}
              onClick={() => setExpandedInfo(!expandedInfo)}
              size="small"
            >
              Bank Requirements
            </Button>
            
            <Collapse in={expandedInfo}>
              <Box mt={2} p={2} bgcolor="grey.50" borderRadius={1}>
                <Typography variant="subtitle2" gutterBottom>
                  {bank.name} File Format Requirements
                </Typography>
                <List dense>
                  <ListItem disablePadding>
                    <ListItemText
                      primary="Processing Time"
                      secondary={bank.processingTime}
                    />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemText
                      primary="Cutoff Time"
                      secondary={bank.cutoffTime}
                    />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemText
                      primary="Max Bulk Payments"
                      secondary={bank.maxBulkPayments?.toLocaleString() || 'Unlimited'}
                    />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemText
                      primary="File Format"
                      secondary="Microsoft Excel (.xlsx)"
                    />
                  </ListItem>
                </List>
              </Box>
            </Collapse>
          </Box>
        </CardContent>
      </Card>

      {/* Validation Status */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Validation Status
          </Typography>
          
          <Box display="flex" gap={2} mb={2}>
            <Chip
              icon={<CheckCircle />}
              label={`${validationSummary.validPayments} Valid`}
              color="success"
              variant="outlined"
            />
            {validationSummary.paymentsWithWarnings > 0 && (
              <Chip
                icon={<Warning />}
                label={`${validationSummary.paymentsWithWarnings} Warnings`}
                color="warning"
                variant="outlined"
              />
            )}
            {validationSummary.paymentsWithErrors > 0 && (
              <Chip
                icon={<Warning />}
                label={`${validationSummary.paymentsWithErrors} Errors`}
                color="error"
                variant="outlined"
              />
            )}
          </Box>

          {canGenerate ? (
            <Alert severity="success">
              <Typography variant="body2">
                ✓ All validations passed. File is ready for generation.
              </Typography>
            </Alert>
          ) : (
            <Alert severity="error">
              <Typography variant="body2">
                ✗ Please resolve validation errors before generating the file.
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Comments */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Batch Comments
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            placeholder="Add comments or instructions for this payment batch..."
            value={comments}
            onChange={(e) => onCommentsChange(e.target.value)}
            helperText="These comments will be included in the payment description field"
          />
        </CardContent>
      </Card>

      {/* Excel Preview */}
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" display="flex" alignItems="center" gap={1}>
              <Visibility />
              File Preview
            </Typography>
            
            <Box display="flex" gap={1}>
              <Button
                startIcon={showFullPreview ? <ExpandLess /> : <ExpandMore />}
                onClick={() => setShowFullPreview(!showFullPreview)}
                variant="outlined"
                size="small"
              >
                {showFullPreview ? 'Show Less' : 'Show All'}
              </Button>
              
              <Tooltip title="Download sample file">
                <IconButton size="small" color="primary">
                  <FileDownload />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Excel Table Preview */}
          <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  {previewData.headers.map((header, index) => (
                    <TableCell 
                      key={index}
                      sx={{ 
                        backgroundColor: 'primary.main',
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    >
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {displayRows.map((row, rowIndex) => (
                  <TableRow key={rowIndex} hover>
                    {row.map((cell, cellIndex) => (
                      <TableCell key={cellIndex}>
                        {typeof cell === 'number' && bankFormat.columns[cellIndex]?.dataType === 'CURRENCY' 
                          ? saudiBankService.formatSAR(cell)
                          : cell
                        }
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {!showFullPreview && previewData.rows.length > 5 && (
            <Box mt={2} textAlign="center">
              <Typography variant="body2" color="text.secondary">
                Showing 5 of {previewData.rows.length} rows
              </Typography>
              <Button
                size="small"
                onClick={() => setShowFullPreview(true)}
                sx={{ mt: 1 }}
              >
                Show All Rows
              </Button>
            </Box>
          )}

          {/* File Statistics */}
          <Box mt={3} p={2} bgcolor="grey.50" borderRadius={1}>
            <Typography variant="subtitle2" gutterBottom>
              File Statistics
            </Typography>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2">
                <strong>Columns:</strong> {previewData.headers.length}
              </Typography>
              <Typography variant="body2">
                <strong>Rows:</strong> {previewData.rows.length}
              </Typography>
              <Typography variant="body2">
                <strong>Total Amount:</strong> {saudiBankService.formatSAR(previewData.totalAmount)}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Final Confirmation */}
      <Card sx={{ mt: 3, bgcolor: canGenerate ? 'success.50' : 'error.50' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Ready to Generate
          </Typography>
          
          {canGenerate ? (
            <Box>
              <Typography variant="body2" color="success.dark" paragraph>
                ✓ File preview looks good and all validations have passed.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Click "Generate File" to create the Excel file for {bank.name}.
                The file will be automatically downloaded to your device.
              </Typography>
            </Box>
          ) : (
            <Box>
              <Typography variant="body2" color="error.dark" paragraph>
                ✗ Cannot generate file due to validation errors.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Please go back to the validation step and resolve all errors.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default BankFilePreview;