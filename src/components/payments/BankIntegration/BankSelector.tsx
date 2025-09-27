// src/components/payments/BankIntegration/BankSelector.tsx

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Chip,
  Button,
  Alert,
  Tooltip,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Checkbox,
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel
} from '@mui/material';
import {
  AccountBalance,
  CheckCircle,
  Schedule,
  Warning,
  Info,
  ExpandMore,
  ExpandLess,
  AccessTime,
  Payment,
  Language
} from '@mui/icons-material';
import { SaudiBankDefinition } from '../../../types/saudiBanking.types';
import { saudiBankService } from '../../../services/saudiBankService';

interface BankSelectorProps {
  banks: SaudiBankDefinition[];
  selectedBank?: string;
  onBankSelect: (bankCode: string) => void;
  multiSelect?: boolean;
  selectedBanks?: string[];
  onMultiSelect?: (bankCodes: string[]) => void;
  showWorkingHours?: boolean;
  showCapabilities?: boolean;
  disabled?: boolean;
  className?: string;
}

const BankSelector: React.FC<BankSelectorProps> = ({
  banks,
  selectedBank,
  onBankSelect,
  multiSelect = false,
  selectedBanks = [],
  onMultiSelect,
  showWorkingHours = true,
  showCapabilities = true,
  disabled = false,
  className
}) => {
  const [expandedBanks, setExpandedBanks] = useState<Set<string>>(new Set());

  const handleSingleSelect = (bankCode: string) => {
    if (!disabled) {
      onBankSelect(bankCode);
    }
  };

  const handleMultiSelect = (bankCode: string, checked: boolean) => {
    if (!disabled && onMultiSelect) {
      const newSelection = checked
        ? [...selectedBanks, bankCode]
        : selectedBanks.filter(code => code !== bankCode);
      onMultiSelect(newSelection);
    }
  };

  const toggleBankExpansion = (bankCode: string) => {
    const newExpanded = new Set(expandedBanks);
    if (newExpanded.has(bankCode)) {
      newExpanded.delete(bankCode);
    } else {
      newExpanded.add(bankCode);
    }
    setExpandedBanks(newExpanded);
  };

  const getBankStatus = (bank: SaudiBankDefinition) => {
    const workingHours = saudiBankService.getBankWorkingHours(bank.code);
    const canProcess = saudiBankService.canProcessToday(bank.code);
    
    return {
      isOpen: workingHours?.isWorkingDay || false,
      canProcess,
      timeUntilCutoff: workingHours?.timeUntilCutoff,
      processingTime: bank.processingTime,
      cutoffTime: bank.cutoffTime
    };
  };

  const renderBankCard = (bank: SaudiBankDefinition) => {
    const isSelected = multiSelect 
      ? selectedBanks.includes(bank.code)
      : selectedBank === bank.code;
    const isExpanded = expandedBanks.has(bank.code);
    const status = getBankStatus(bank);

    return (
      <Card
        key={bank.code}
        variant={isSelected ? "outlined" : "elevation"}
        sx={{
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          border: isSelected ? 2 : 1,
          borderColor: isSelected ? 'primary.main' : 'divider',
          '&:hover': disabled ? {} : {
            boxShadow: 3,
            transform: 'translateY(-2px)',
            transition: 'all 0.2s ease-in-out'
          },
          position: 'relative'
        }}
        onClick={() => {
          if (!multiSelect) {
            handleSingleSelect(bank.code);
          }
        }}
      >
        <CardContent>
          {/* Bank Header */}
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Box display="flex" alignItems="center" gap={2}>
              {multiSelect && (
                <Checkbox
                  checked={isSelected}
                  onChange={(e) => handleMultiSelect(bank.code, e.target.checked)}
                  onClick={(e) => e.stopPropagation()}
                  disabled={disabled}
                />
              )}
              
              <Avatar
                sx={{
                  bgcolor: bank.primaryColor,
                  color: 'white',
                  width: 48,
                  height: 48,
                  fontWeight: 'bold'
                }}
              >
                {bank.logoUrl ? (
                  <img 
                    src={bank.logoUrl} 
                    alt={bank.name}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  bank.shortName?.substring(0, 2) || bank.name.substring(0, 2)
                )}
              </Avatar>

              <Box flex={1}>
                <Typography variant="h6" fontWeight="bold">
                  {bank.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {bank.arabicName}
                </Typography>
              </Box>
            </Box>

            <Box display="flex" alignItems="center" gap={1}>
              {/* Status Indicators */}
              {status.isOpen ? (
                <Tooltip title={`Open today • ${status.timeUntilCutoff || 'Cutoff passed'}`}>
                  <Chip
                    icon={<CheckCircle />}
                    label="Open"
                    color="success"
                    size="small"
                  />
                </Tooltip>
              ) : (
                <Tooltip title="Closed today">
                  <Chip
                    icon={<Schedule />}
                    label="Closed"
                    color="warning"
                    size="small"
                  />
                </Tooltip>
              )}

              {isSelected && !multiSelect && <CheckCircle color="primary" />}
              
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleBankExpansion(bank.code);
                }}
              >
                {isExpanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Box>
          </Box>

          {/* Quick Info */}
          <Box display="flex" gap={2} mb={2} flexWrap="wrap">
            <Chip
              icon={<Payment />}
              label={`Max: ${bank.maxBulkPayments?.toLocaleString() || 'Unlimited'}`}
              size="small"
              variant="outlined"
            />
            <Chip
              icon={<AccessTime />}
              label={bank.processingTime}
              size="small"
              variant="outlined"
            />
            <Chip
              icon={<Schedule />}
              label={`Cutoff: ${bank.cutoffTime}`}
              size="small"
              variant="outlined"
            />
          </Box>

          {/* Working Hours Alert */}
          {showWorkingHours && (
            <Alert 
              severity={status.canProcess ? "info" : "warning"} 
              sx={{ mb: 2 }}
              icon={status.canProcess ? <Info /> : <Warning />}
            >
              <Typography variant="body2">
                {status.canProcess ? (
                  <>
                    Bank is open today.{' '}
                    {status.timeUntilCutoff 
                      ? `${status.timeUntilCutoff} until cutoff.`
                      : 'Cutoff time has passed.'
                    }
                  </>
                ) : (
                  'Bank is closed today. Processing will begin on next working day.'
                )}
              </Typography>
            </Alert>
          )}

          {/* Expanded Details */}
          <Collapse in={isExpanded}>
            <Box mt={2}>
              {showCapabilities && (
                <>
                  <Typography variant="subtitle2" gutterBottom>
                    Bank Capabilities
                  </Typography>
                  <List dense>
                    <ListItem disablePadding>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <Payment fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Bulk Payments"
                        secondary={bank.supportsBulkPayments ? 'Supported' : 'Not supported'}
                      />
                      <Chip
                        size="small"
                        color={bank.supportsBulkPayments ? 'success' : 'error'}
                        label={bank.supportsBulkPayments ? 'Yes' : 'No'}
                      />
                    </ListItem>
                    
                    <ListItem disablePadding>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <AccountBalance fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="IBAN Prefix"
                        secondary={`SA${bank.ibanPrefix}xxxxxxxxxxxxxxxxxxxx`}
                      />
                    </ListItem>

                    <ListItem disablePadding>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <Language fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="File Formats"
                        secondary={bank.fileFormats?.map(f => f.extension).join(', ') || 'TXT, CSV'}
                      />
                    </ListItem>
                  </List>
                </>
              )}

              {/* Working Days */}
              <Box mt={2}>
                <Typography variant="subtitle2" gutterBottom>
                  Working Days
                </Typography>
                <Box display="flex" gap={0.5} flexWrap="wrap">
                  {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                    <Chip
                      key={day}
                      label={day.substring(0, 3)}
                      size="small"
                      color={bank.workingDays?.includes(day) ? 'primary' : 'default'}
                      variant={bank.workingDays?.includes(day) ? 'filled' : 'outlined'}
                    />
                  ))}
                </Box>
              </Box>

              {/* Contact Information */}
              {(bank.website || bank.supportEmail || bank.supportPhone) && (
                <Box mt={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Contact Information
                  </Typography>
                  <List dense>
                    {bank.website && (
                      <ListItem disablePadding>
                        <ListItemText
                          primary="Website"
                          secondary={
                            <Button
                              href={bank.website}
                              target="_blank"
                              size="small"
                              sx={{ p: 0, minWidth: 0 }}
                            >
                              {bank.website}
                            </Button>
                          }
                        />
                      </ListItem>
                    )}
                    {bank.supportEmail && (
                      <ListItem disablePadding>
                        <ListItemText
                          primary="Support Email"
                          secondary={bank.supportEmail}
                        />
                      </ListItem>
                    )}
                    {bank.supportPhone && (
                      <ListItem disablePadding>
                        <ListItemText
                          primary="Support Phone"
                          secondary={bank.supportPhone}
                        />
                      </ListItem>
                    )}
                  </List>
                </Box>
              )}
            </Box>
          </Collapse>
        </CardContent>
      </Card>
    );
  };

  if (banks.length === 0) {
    return (
      <Box className={className} textAlign="center" py={4}>
        <AccountBalance sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No Banks Available
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No supported banks found for payment processing
        </Typography>
      </Box>
    );
  }

  return (
    <Box className={className}>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h6" gutterBottom>
          {multiSelect ? 'Select Banks' : 'Select Bank'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {multiSelect 
            ? 'Choose one or more banks for payment processing'
            : 'Choose the target bank for payment file generation'
          }
        </Typography>
      </Box>

      {/* Selection Mode Toggle */}
      {!multiSelect && (
        <FormControl component="fieldset" sx={{ mb: 3 }}>
          <RadioGroup
            value={selectedBank || ''}
            onChange={(e) => handleSingleSelect(e.target.value)}
          >
            <Grid container spacing={2}>
              {banks.map((bank) => (
                <Grid item xs={12} md={6} lg={4} key={bank.code}>
                  <FormControlLabel
                    value={bank.code}
                    control={<Radio sx={{ display: 'none' }} />}
                    label=""
                    sx={{ m: 0, width: '100%' }}
                  />
                  {renderBankCard(bank)}
                </Grid>
              ))}
            </Grid>
          </RadioGroup>
        </FormControl>
      )}

      {/* Multi-select Mode */}
      {multiSelect && (
        <Grid container spacing={2}>
          {banks.map((bank) => (
            <Grid item xs={12} md={6} lg={4} key={bank.code}>
              {renderBankCard(bank)}
            </Grid>
          ))}
        </Grid>
      )}

      {/* Selection Summary */}
      {multiSelect && selectedBanks.length > 0 && (
        <Box mt={3} p={2} bgcolor="primary.50" borderRadius={1}>
          <Typography variant="subtitle2" gutterBottom>
            Selected Banks ({selectedBanks.length})
          </Typography>
          <Box display="flex" gap={1} flexWrap="wrap">
            {selectedBanks.map(bankCode => {
              const bank = banks.find(b => b.code === bankCode);
              return bank ? (
                <Chip
                  key={bankCode}
                  label={bank.shortName || bank.name}
                  onDelete={() => handleMultiSelect(bankCode, false)}
                  color="primary"
                  size="small"
                />
              ) : null;
            })}
          </Box>
        </Box>
      )}

      {/* Help Text */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Tip:</strong> Banks marked as "Open" can process payments today. 
          Banks marked as "Closed" will process payments on the next working day.
        </Typography>
      </Alert>
    </Box>
  );
};

export default BankSelector;