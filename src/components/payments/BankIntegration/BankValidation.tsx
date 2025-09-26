// src/components/payments/BankIntegration/BankValidation.tsx

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Typography,
  Button,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Grid,
  Paper,
  Tooltip,
  IconButton,
  Collapse,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Warning,
  Info,
  AccountBalance,
  Search,
  Clear,
  ExpandMore,
  ExpandLess,
  ContentCopy,
  Refresh
} from '@mui/icons-material';
import { saudiBankService } from '../../../services/api/saudiBankService';
import { SaudiIBANValidation, SaudiBankDefinition } from '../../../types/saudiBanking.types';

interface BankValidationProps {
  initialIban?: string;
  onValidationResult?: (result: SaudiIBANValidation & { bankInfo?: SaudiBankDefinition }) => void;
  showBankInfo?: boolean;
  showExamples?: boolean;
  className?: string;
}

const BankValidation: React.FC<BankValidationProps> = ({
  initialIban = '',
  onValidationResult,
  showBankInfo = true,
  showExamples = true,
  className
}) => {
  const [iban, setIban] = useState(initialIban);
  const [validationResult, setValidationResult] = useState<SaudiIBANValidation | null>(null);
  const [bankInfo, setBankInfo] = useState<SaudiBankDefinition | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [showExampleIbans, setShowExampleIbans] = useState(false);
  const [selectedBank, setSelectedBank] = useState('');

  const validateIban = async (ibanToValidate: string = iban) => {
    setIsValidating(true);
    
    // Simulate validation delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const result = saudiBankService.validateSaudiIBAN(ibanToValidate);
    setValidationResult(result);

    // Get bank information if IBAN is valid
    let bank: SaudiBankDefinition | null = null;
    if (result.isValid && result.bankCode) {
      bank = saudiBankService.getBankByCode(result.bankCode);
      setBankInfo(bank);
    } else {
      setBankInfo(null);
    }

    // Call callback if provided
    if (onValidationResult) {
      onValidationResult({ ...result, bankInfo: bank || undefined });
    }

    setIsValidating(false);
  };

  const handleIbanChange = (value: string) => {
    // Auto-format IBAN as user types
    const cleanValue = value.replace(/\s/g, '').toUpperCase();
    const formattedValue = saudiBankService.formatIBAN(cleanValue);
    setIban(formattedValue);
    
    // Auto-validate if IBAN looks complete
    if (cleanValue.length === 24 && cleanValue.startsWith('SA')) {
      validateIban(formattedValue);
    } else if (validationResult) {
      // Clear previous validation if IBAN is being edited
      setValidationResult(null);
      setBankInfo(null);
    }
  };

  const generateSampleIban = (bankCode: string) => {
    const bank = saudiBankService.getBankByCode(bankCode);
    if (bank) {
      // Generate a sample IBAN (not a real account)
      const sampleIban = `SA03${bank.ibanPrefix}000000000000000001`;
      setIban(saudiBankService.formatIBAN(sampleIban));
      validateIban(sampleIban);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const clearIban = () => {
    setIban('');
    setValidationResult(null);
    setBankInfo(null);
  };

  const getValidationIcon = () => {
    if (!validationResult) return null;
    
    if (validationResult.isValid) {
      return <CheckCircle color="success" />;
    } else if (validationResult.errors.length > 0) {
      return <Error color="error" />;
    } else {
      return <Warning color="warning" />;
    }
  };

  const getValidationColor = (): 'success' | 'error' | 'warning' | 'info' => {
    if (!validationResult) return 'info';
    
    if (validationResult.isValid) return 'success';
    if (validationResult.errors.length > 0) return 'error';
    return 'warning';
  };

  const allBanks = saudiBankService.getAllBanks();

  return (
    <Box className={className}>
      {/* IBAN Input */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Saudi IBAN Validation
          </Typography>
          
          <Grid container spacing={2} alignItems="center">
            <Grid item xs>
              <TextField
                fullWidth
                label="Saudi IBAN"
                placeholder="SA03 8000 0000 6080 1016 7519"
                value={iban}
                onChange={(e) => handleIbanChange(e.target.value)}
                inputProps={{ maxLength: 29 }} // 24 digits + 5 spaces
                InputProps={{
                  startAdornment: getValidationIcon(),
                  endAdornment: iban && (
                    <IconButton size="small" onClick={clearIban}>
                      <Clear />
                    </IconButton>
                  )
                }}
                error={validationResult?.errors.length > 0}
                helperText={
                  validationResult?.errors.length > 0 
                    ? validationResult.errors[0]
                    : "Enter a 24-digit Saudi IBAN starting with 'SA'"
                }
              />
            </Grid>
            
            <Grid item>
              <Button
                variant="contained"
                onClick={() => validateIban()}
                disabled={!iban.trim() || isValidating}
                startIcon={isValidating ? <Refresh /> : <Search />}
              >
                {isValidating ? 'Validating...' : 'Validate'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Validation Results */}
      {validationResult && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
              {getValidationIcon()}
              Validation Result
            </Typography>

            <Alert severity={getValidationColor()} sx={{ mb: 2 }}>
              <Typography variant="subtitle2">
                {validationResult.isValid 
                  ? '✓ Valid Saudi IBAN' 
                  : '✗ Invalid IBAN'
                }
              </Typography>
              <Typography variant="body2">
                {validationResult.isValid
                  ? `IBAN is properly formatted and passes checksum validation.`
                  : `Please check the IBAN format and try again.`
                }
              </Typography>
            </Alert>

            {/* IBAN Components */}
            {validationResult.isValid && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      Country Code
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      SA
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      Check Digits
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {validationResult.checkDigits}
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      Bank Code
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {validationResult.bankCode || 'Unknown'}
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      Account Number
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {validationResult.accountNumber?.substring(0, 8)}...
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            )}

            {/* Errors and Warnings */}
            {validationResult.errors.length > 0 && (
              <Box mt={2}>
                <Typography variant="subtitle2" color="error" gutterBottom>
                  Errors Found:
                </Typography>
                <List dense>
                  {validationResult.errors.map((error, index) => (
                    <ListItem key={index} disablePadding>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <Error color="error" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={error} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {validationResult.warnings.length > 0 && (
              <Box mt={2}>
                <Typography variant="subtitle2" color="warning.main" gutterBottom>
                  Warnings:
                </Typography>
                <List dense>
                  {validationResult.warnings.map((warning, index) => (
                    <ListItem key={index} disablePadding>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <Warning color="warning" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={warning} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {validationResult.suggestions.length > 0 && (
              <Box mt={2}>
                <Typography variant="subtitle2" color="info.main" gutterBottom>
                  Suggestions:
                </Typography>
                <List dense>
                  {validationResult.suggestions.map((suggestion, index) => (
                    <ListItem key={index} disablePadding>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <Info color="info" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={suggestion} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Bank Information */}
      {bankInfo && showBankInfo && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
              <AccountBalance />
              Bank Information
            </Typography>

            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Box
                width={48}
                height={48}
                borderRadius="50%"
                bgcolor={bankInfo.primaryColor}
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="white"
                fontWeight="bold"
              >
                {bankInfo.shortName?.substring(0, 2) || bankInfo.name.substring(0, 2)}
              </Box>
              
              <Box>
                <Typography variant="h6">{bankInfo.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {bankInfo.arabicName}
                </Typography>
              </Box>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <List dense>
                  <ListItem disablePadding>
                    <ListItemText
                      primary="IBAN Prefix"
                      secondary={`SA${bankInfo.ibanPrefix}xx`}
                    />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemText
                      primary="Processing Time"
                      secondary={bankInfo.processingTime}
                    />
                  </ListItem>
                </List>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <List dense>
                  <ListItem disablePadding>
                    <ListItemText
                      primary="Cutoff Time"
                      secondary={bankInfo.cutoffTime}
                    />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemText
                      primary="Max Bulk Payments"
                      secondary={bankInfo.maxBulkPayments.toLocaleString()}
                    />
                  </ListItem>
                </List>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <List dense>
                  <ListItem disablePadding>
                    <ListItemText
                      primary="Bulk Payments"
                      secondary={bankInfo.supportsBulkPayments ? 'Supported' : 'Not supported'}
                    />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemText
                      primary="Working Days"
                      secondary={`${bankInfo.workingDays.length} days/week`}
                    />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Sample IBANs */}
      {showExamples && (
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Sample IBANs for Testing
              </Typography>
              <Button
                startIcon={showExampleIbans ? <ExpandLess /> : <ExpandMore />}
                onClick={() => setShowExampleIbans(!showExampleIbans)}
                variant="outlined"
                size="small"
              >
                {showExampleIbans ? 'Hide' : 'Show'} Examples
              </Button>
            </Box>

            <Collapse in={showExampleIbans}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                    <InputLabel>Select Bank</InputLabel>
                    <Select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                    >
                      {allBanks.map(bank => (
                        <MenuItem key={bank.code} value={bank.code}>
                          {bank.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  {selectedBank && (
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => generateSampleIban(selectedBank)}
                    >
                      Generate Sample IBAN
                    </Button>
                  )}
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Select a bank to generate a sample IBAN for testing validation.
                    Note: These are not real account numbers.
                  </Typography>
                </Grid>
              </Grid>

              {/* Quick Examples */}
              <Box mt={2}>
                <Typography variant="subtitle2" gutterBottom>
                  Quick Examples:
                </Typography>
                <Grid container spacing={1}>
                  {allBanks.slice(0, 3).map(bank => {
                    const sampleIban = `SA03${bank.ibanPrefix}000000000000000001`;
                    return (
                      <Grid item xs={12} sm={4} key={bank.code}>
                        <Paper sx={{ p: 1 }} variant="outlined">
                          <Typography variant="caption" color="text.secondary">
                            {bank.shortName}
                          </Typography>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body2" fontFamily="monospace">
                              {saudiBankService.formatIBAN(sampleIban)}
                            </Typography>
                            <Tooltip title="Copy IBAN">
                              <IconButton 
                                size="small"
                                onClick={() => {
                                  copyToClipboard(sampleIban);
                                  setIban(saudiBankService.formatIBAN(sampleIban));
                                }}
                              >
                                <ContentCopy fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            </Collapse>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default BankValidation;