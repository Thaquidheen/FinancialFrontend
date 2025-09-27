// src/components/payments/BankFileGeneration/PaymentValidation.tsx

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Alert,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  LinearProgress,
  Chip,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Warning,
  ExpandMore,
  Refresh,
  Person,
  AccountBalance,
  Info
} from '@mui/icons-material';
import { PaymentSummaryResponse } from '../../../types/payment.types';
import { saudiBankService } from '../../../services/saudiBankService';

interface ValidationResult {
  paymentId: string;
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  validatedFields: {
    payeeName: boolean;
    amount: boolean;
    bankDetails: boolean;
    nationalId: boolean;
  };
}

interface ValidationSummary {
  totalPayments: number;
  validPayments: number;
  paymentsWithErrors: number;
  paymentsWithWarnings: number;
  criticalErrors: string[];
  commonWarnings: string[];
}

interface PaymentValidationProps {
  payments: PaymentSummaryResponse[];
  bankCode: string;
  onValidationComplete: (results: Map<string, ValidationResult>) => void;
  className?: string;
}

const PaymentValidation: React.FC<PaymentValidationProps> = ({
  payments,
  bankCode,
  onValidationComplete,
  className
}) => {
  const [validationResults, setValidationResults] = useState<Map<string, ValidationResult>>(new Map());
  const [isValidating, setIsValidating] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['summary']);

  const bank = saudiBankService.getBankByCode(bankCode);

  useEffect(() => {
    if (payments.length > 0 && bankCode) {
      validatePayments();
    }
  }, [payments, bankCode]);

  const validatePayments = async () => {
    setIsValidating(true);
    const results = new Map<string, ValidationResult>();

    // Simulate validation delay for realistic UX
    await new Promise(resolve => setTimeout(resolve, 1000));

    payments.forEach(payment => {
      const result = validateSinglePayment(payment);
      results.set(payment.id.toString(), result);
    });

    setValidationResults(results);
    onValidationComplete(results);
    setIsValidating(false);
  };

  const validateSinglePayment = (payment: PaymentSummaryResponse): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];
    const validatedFields = {
      payeeName: true,
      amount: true,
      bankDetails: true,
      nationalId: true
    };

    // Employee Name Validation
    if (!payment.payeeName || payment.payeeName.trim().length < 2) {
      errors.push('Payee name is required and must be at least 2 characters');
      validatedFields.payeeName = false;
    } else if (payment.payeeName.length > 100) {
      errors.push('Payee name cannot exceed 100 characters');
      validatedFields.payeeName = false;
    }

    // Amount Validation
    if (!payment.amount || payment.amount <= 0) {
      errors.push('Payment amount must be greater than 0');
      validatedFields.amount = false;
    } else if (payment.amount > 999999999.99) {
      errors.push('Payment amount exceeds maximum limit');
      validatedFields.amount = false;
    } else if (payment.amount < 1) {
      warnings.push('Very small payment amount');
    }

    // Bank-specific validations
    if (bank) {
      if (payment.amount > 50000) {
        warnings.push('High-value payment may require additional verification');
      }
      
      if (bank.maxBulkPayments && payments.length > bank.maxBulkPayments) {
        errors.push(`Exceeds bank limit of ${bank.maxBulkPayments} payments per batch`);
      }
    }

    // Bank Details Validation
    if (!payment.bankName) {
      warnings.push('Bank information not specified');
      suggestions.push('Assign bank details before processing');
    } else if (payment.bankName !== bankCode) {
      const paymentBank = saudiBankService.getBankByCode(payment.bankName);
      if (paymentBank && paymentBank.code !== bankCode) {
        errors.push(`Payment assigned to different bank (${paymentBank.name})`);
        validatedFields.bankDetails = false;
      }
    }

    // Project validation
    if (!payment.projectName) {
      warnings.push('No project assigned');
    }

    // Generate suggestions
    if (warnings.length > 0 && errors.length === 0) {
      suggestions.push('Review warnings before processing');
    }
    
    if (payment.amount > 10000) {
      suggestions.push('Consider reviewing high-value payments');
    }

    return {
      paymentId: payment.id.toString(),
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      validatedFields
    };
  };

  const getValidationSummary = (): ValidationSummary => {
    const results = Array.from(validationResults.values());
    const allErrors = results.flatMap(r => r.errors);
    const allWarnings = results.flatMap(r => r.warnings);

    // Count occurrences to find common issues
    const errorCounts = allErrors.reduce((acc, error) => {
      acc[error] = (acc[error] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const warningCounts = allWarnings.reduce((acc, warning) => {
      acc[warning] = (acc[warning] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalPayments: results.length,
      validPayments: results.filter(r => r.isValid).length,
      paymentsWithErrors: results.filter(r => r.errors.length > 0).length,
      paymentsWithWarnings: results.filter(r => r.warnings.length > 0).length,
      criticalErrors: Object.entries(errorCounts)
        .filter(([_, count]) => count >= 2)
        .map(([error]) => error),
      commonWarnings: Object.entries(warningCounts)
        .filter(([_, count]) => count >= 2)
        .map(([warning]) => warning)
    };
  };

  const handleSectionToggle = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const getPaymentsByStatus = () => {
    const results = Array.from(validationResults.values());
    return {
      valid: results.filter(r => r.isValid && r.warnings.length === 0),
      withWarnings: results.filter(r => r.isValid && r.warnings.length > 0),
      withErrors: results.filter(r => !r.isValid)
    };
  };

  if (isValidating) {
    return (
      <Box className={className}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Box>
                <Typography variant="h6">Validating Payments...</Typography>
                <Typography variant="body2" color="text.secondary">
                  Checking {payments.length} payments against {bank?.name || bankCode} requirements
                </Typography>
              </Box>
            </Box>
            <LinearProgress sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Please wait while we validate payment data and bank requirements.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const summary = getValidationSummary();
  const paymentsByStatus = getPaymentsByStatus();
  const canProceed = summary.paymentsWithErrors === 0;

  return (
    <Box className={className}>
      {/* Validation Summary */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Validation Results</Typography>
            <Button
              startIcon={<Refresh />}
              onClick={validatePayments}
              variant="outlined"
              size="small"
            >
              Re-validate
            </Button>
          </Box>

          {/* Status Overview */}
          <Box display="flex" gap={2} mb={3}>
            <Chip
              icon={<CheckCircle />}
              label={`${summary.validPayments} Valid`}
              color="success"
              variant="outlined"
            />
            {summary.paymentsWithWarnings > 0 && (
              <Chip
                icon={<Warning />}
                label={`${summary.paymentsWithWarnings} Warnings`}
                color="warning"
                variant="outlined"
              />
            )}
            {summary.paymentsWithErrors > 0 && (
              <Chip
                icon={<Error />}
                label={`${summary.paymentsWithErrors} Errors`}
                color="error"
                variant="outlined"
              />
            )}
          </Box>

          {/* Overall Status */}
          {canProceed ? (
            <Alert severity="success">
              <Typography variant="subtitle2">Ready for Processing</Typography>
              <Typography variant="body2">
                All payments have passed validation and can be processed.
                {summary.paymentsWithWarnings > 0 && ' Please review warnings before proceeding.'}
              </Typography>
            </Alert>
          ) : (
            <Alert severity="error">
              <Typography variant="subtitle2">Validation Failed</Typography>
              <Typography variant="body2">
                {summary.paymentsWithErrors} payment(s) have critical errors that must be resolved.
              </Typography>
            </Alert>
          )}

          {/* Progress Bar */}
          <Box mt={2}>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2" color="text.secondary">
                Validation Progress
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {summary.validPayments}/{summary.totalPayments}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={(summary.validPayments / summary.totalPayments) * 100}
              color={canProceed ? "success" : "error"}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Critical Errors */}
      {summary.criticalErrors.length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="subtitle2">Critical Issues Found</Typography>
          <List dense>
            {summary.criticalErrors.map((error, index) => (
              <ListItem key={index} disablePadding>
                <ListItemIcon sx={{ minWidth: 28 }}>
                  <Error color="error" fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={error}
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
            ))}
          </List>
        </Alert>
      )}

      {/* Common Warnings */}
      {summary.commonWarnings.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="subtitle2">Common Warnings</Typography>
          <List dense>
            {summary.commonWarnings.map((warning, index) => (
              <ListItem key={index} disablePadding>
                <ListItemIcon sx={{ minWidth: 28 }}>
                  <Warning color="warning" fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={warning}
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
            ))}
          </List>
        </Alert>
      )}

      {/* Detailed Results */}
      <Accordion 
        expanded={expandedSections.includes('details')}
        onChange={() => handleSectionToggle('details')}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="subtitle1">
            Payment Details ({validationResults.size} payments)
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Issues</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.map((payment) => {
                  const result = validationResults.get(payment.id.toString());
                  if (!result) return null;

                  return (
                    <TableRow 
                      key={payment.id}
                      sx={{ 
                        backgroundColor: 
                          !result.isValid ? 'error.50' :
                          result.warnings.length > 0 ? 'warning.50' :
                          'success.50'
                      }}
                    >
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Person fontSize="small" color="action" />
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {payment.payeeName}
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
                        <Chip
                          size="small"
                          icon={
                            !result.isValid ? <Error /> :
                            result.warnings.length > 0 ? <Warning /> :
                            <CheckCircle />
                          }
                          label={
                            !result.isValid ? 'Error' :
                            result.warnings.length > 0 ? 'Warning' :
                            'Valid'
                          }
                          color={
                            !result.isValid ? 'error' :
                            result.warnings.length > 0 ? 'warning' :
                            'success'
                          }
                        />
                      </TableCell>

                      <TableCell>
                        <Box>
                          {result.errors.map((error, index) => (
                            <Typography key={index} variant="caption" color="error" display="block">
                              • {error}
                            </Typography>
                          ))}
                          {result.warnings.map((warning, index) => (
                            <Typography key={index} variant="caption" color="warning.main" display="block">
                              • {warning}
                            </Typography>
                          ))}
                          {result.errors.length === 0 && result.warnings.length === 0 && (
                            <Typography variant="caption" color="success.main">
                              All validations passed
                            </Typography>
                          )}
                        </Box>
                      </TableCell>

                      <TableCell align="center">
                        {result.suggestions.length > 0 && (
                          <Tooltip
                            title={
                              <Box>
                                <Typography variant="subtitle2" gutterBottom>
                                  Suggestions:
                                </Typography>
                                {result.suggestions.map((suggestion, index) => (
                                  <Typography key={index} variant="body2">
                                    • {suggestion}
                                  </Typography>
                                ))}
                              </Box>
                            }
                          >
                            <IconButton size="small">
                              <Info fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>

      {/* Validation Categories */}
      <Box mt={3}>
        <Typography variant="h6" gutterBottom>
          Validation Categories
        </Typography>
        
        <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={2}>
          {/* Valid Payments */}
          <Card variant="outlined">
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <CheckCircle color="success" />
                <Typography variant="h6" color="success.main">
                  Valid Payments
                </Typography>
                <Chip
                  label={paymentsByStatus.valid.length}
                  color="success"
                  size="small"
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                Payments that passed all validation checks without any issues.
              </Typography>
            </CardContent>
          </Card>

          {/* Payments with Warnings */}
          {paymentsByStatus.withWarnings.length > 0 && (
            <Card variant="outlined">
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Warning color="warning" />
                  <Typography variant="h6" color="warning.main">
                    With Warnings
                  </Typography>
                  <Chip
                    label={paymentsByStatus.withWarnings.length}
                    color="warning"
                    size="small"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Payments with minor issues that don't prevent processing but should be reviewed.
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* Payments with Errors */}
          {paymentsByStatus.withErrors.length > 0 && (
            <Card variant="outlined">
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Error color="error" />
                  <Typography variant="h6" color="error.main">
                    With Errors
                  </Typography>
                  <Chip
                    label={paymentsByStatus.withErrors.length}
                    color="error"
                    size="small"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Payments with critical errors that must be resolved before processing.
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>

      {/* Bank-Specific Requirements */}
      {bank && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
              <AccountBalance />
              {bank.name} Requirements
            </Typography>
            
            <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={2}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Processing Time
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {bank.processingTime}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Cutoff Time
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {bank.cutoffTime}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Max Bulk Payments
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {bank.maxBulkPayments?.toLocaleString() || 'Unlimited'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  IBAN Format
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  SA{bank.ibanPrefix}xxxxxxxxxxxxxxxxxxxx
                </Typography>
              </Box>
            </Box>

            {bank.maxBulkPayments && payments.length > bank.maxBulkPayments && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Your batch ({payments.length} payments) exceeds the bank limit of {bank.maxBulkPayments} payments. 
                  Consider splitting into multiple batches.
                </Typography>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Action Summary */}
      <Card sx={{ mt: 3, bgcolor: canProceed ? 'success.50' : 'error.50' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Next Steps
          </Typography>
          
          {canProceed ? (
            <Box>
              <Typography variant="body2" color="success.dark" paragraph>
                ✓ All payments have passed validation and are ready for bank file generation.
              </Typography>
              {summary.paymentsWithWarnings > 0 && (
                <Typography variant="body2" color="warning.dark" paragraph>
                  ⚠ Review {summary.paymentsWithWarnings} warning(s) before proceeding.
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary">
                Click "Continue" to proceed to file generation and preview.
              </Typography>
            </Box>
          ) : (
            <Box>
              <Typography variant="body2" color="error.dark" paragraph>
                ✗ {summary.paymentsWithErrors} payment(s) have critical errors that must be resolved.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Please fix the errors above before proceeding with file generation.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default PaymentValidation;