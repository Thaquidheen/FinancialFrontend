// src/components/payments/BankFileGeneration/BankFileWizard.tsx

import React, { useState, useEffect } from 'react';
import {
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  Box,
  Typography,
  Button,
  Alert,
  Divider,
  LinearProgress,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  IconButton
} from '@mui/material';
import {
  AccountBalance,
  GetApp,
  CheckCircle,
  Warning,
  Info,
  Close,
  Schedule
} from '@mui/icons-material';
import { PaymentSummaryResponse } from '../../../types/payment.types';
import { SaudiBankDefinition } from '../../../types/saudiBanking.types';
import { saudiBankService } from '../../../services/saudiBankService';
import { usePaymentQueue } from '../../../hooks/payments/usePaymentQueue';
import PaymentSelection from './PaymentSelection';
import PaymentValidation from './PaymentValidation';
import BankFilePreview from './BankFilePreview';

interface BankFileWizardProps {
  open: boolean;
  onClose: () => void;
  onComplete: (result: { batchId: string; fileName: string; fileUrl: string }) => void;
  preselectedPayments?: number[];
  className?: string;
}

interface WizardStep {
  label: string;
  description: string;
  component: React.ReactNode;
  isValid: boolean;
  canSkip?: boolean;
}

const BankFileWizard: React.FC<BankFileWizardProps> = ({
  open,
  onClose,
  onComplete,
  preselectedPayments = [],
  className
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedPayments, setSelectedPayments] = useState<number[]>(preselectedPayments);
  const [selectedBank, setSelectedBank] = useState<string>('');
  const [validationResults, setValidationResults] = useState<Map<string, any>>(new Map());
  const [comments, setComments] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const {
    payments,
    isLoading,
    generateBankFile,
    getAvailableBanks
  } = usePaymentQueue();

  const availableBanks = getAvailableBanks();
  const selectedPaymentData = payments.filter(p => selectedPayments.includes(p.id));

  // Update selected payments when preselected changes
  useEffect(() => {
    if (preselectedPayments.length > 0) {
      setSelectedPayments(preselectedPayments);
    }
  }, [preselectedPayments]);

  const handlePaymentSelection = (paymentIds: number[]) => {
    setSelectedPayments(paymentIds);
  };

  const handleBankSelection = (bankCode: string) => {
    setSelectedBank(bankCode);
  };

  const handleValidationComplete = (results: Map<string, any>) => {
    setValidationResults(results);
  };

  const handleGenerateFile = async () => {
    if (!selectedBank || selectedPayments.length === 0) return;

    setIsGenerating(true);
    setGenerationError(null);

    try {
      await generateBankFile(selectedBank, comments);
      
      // Simulate file generation result
      const result = {
        batchId: `batch-${Date.now()}`,
        fileName: saudiBankService.generateFileName(selectedBank, 'WIZ001'),
        fileUrl: '#' // This would be the actual download URL
      };

      onComplete(result);
    } catch (error: any) {
      setGenerationError(error.message || 'Failed to generate bank file');
    } finally {
      setIsGenerating(false);
    }
  };

  const getStepValidation = (stepIndex: number): boolean => {
    switch (stepIndex) {
      case 0: // Payment Selection
        return selectedPayments.length > 0;
      case 1: // Bank Selection
        return selectedBank !== '' && selectedPayments.length > 0;
      case 2: // Validation
        return validationResults.size > 0 && Array.from(validationResults.values()).every(v => v.isValid);
      case 3: // Preview & Generate
        return true;
      default:
        return false;
    }
  };

  const steps: WizardStep[] = [
    {
      label: 'Select Payments',
      description: 'Choose payments to include in the bank file',
      component: (
        <PaymentSelection
          payments={payments}
          selectedPayments={selectedPayments}
          onSelectionChange={handlePaymentSelection}
          isLoading={isLoading}
        />
      ),
      isValid: getStepValidation(0)
    },
    {
      label: 'Choose Bank',
      description: 'Select the target bank for file generation',
      component: (
        <BankSelector
          banks={availableBanks}
          selectedBank={selectedBank}
          onBankSelect={handleBankSelection}
          selectedPayments={selectedPaymentData}
        />
      ),
      isValid: getStepValidation(1)
    },
    {
      label: 'Validate Data',
      description: 'Verify payment data meets bank requirements',
      component: (
        <PaymentValidation
          payments={selectedPaymentData}
          bankCode={selectedBank}
          onValidationComplete={handleValidationComplete}
        />
      ),
      isValid: getStepValidation(2)
    },
    {
      label: 'Generate File',
      description: 'Review and generate the bank payment file',
      component: (
        <BankFilePreview
          payments={selectedPaymentData}
          bankCode={selectedBank}
          comments={comments}
          onCommentsChange={setComments}
          validationResults={validationResults}
        />
      ),
      isValid: getStepValidation(3)
    }
  ];

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    } else {
      handleGenerateFile();
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setSelectedPayments([]);
    setSelectedBank('');
    setValidationResults(new Map());
    setComments('');
    setGenerationError(null);
  };

  if (!open) return null;

  const isLastStep = activeStep === steps.length - 1;

  return (
    <Paper sx={{ width: '100%', minHeight: 600 }} className={className}>
      {/* Header */}
      <Box p={3} borderBottom={1} borderColor="divider">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" fontWeight="bold">
            Bank File Generation Wizard
          </Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
        <Typography variant="body2" color="text.secondary" mt={1}>
          Generate Excel files for Saudi bank bulk payment processing
        </Typography>
      </Box>

      {/* Progress */}
      {isGenerating && (
        <Box>
          <LinearProgress />
          <Box p={2} bgcolor="primary.50">
            <Typography variant="body2" color="primary.main" textAlign="center">
              Generating bank file... Please wait.
            </Typography>
          </Box>
        </Box>
      )}

      {/* Error Alert */}
      {generationError && (
        <Alert 
          severity="error" 
          sx={{ mx: 3, mt: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => setGenerationError(null)}>
              Dismiss
            </Button>
          }
        >
          <Typography variant="subtitle2">File Generation Failed</Typography>
          <Typography variant="body2">{generationError}</Typography>
        </Alert>
      )}

      {/* Stepper */}
      <Box p={3}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel
                optional={
                  index === steps.length - 1 ? (
                    <Typography variant="caption">Final step</Typography>
                  ) : null
                }
                StepIconProps={{
                  style: {
                    color: step.isValid ? '#4caf50' : index < activeStep ? '#2196f3' : '#9e9e9e'
                  }
                }}
              >
                <Typography variant="h6">{step.label}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {step.description}
                </Typography>
              </StepLabel>
              
              <StepContent>
                <Box my={2}>
                  {step.component}
                </Box>

                {/* Step Actions */}
                <Box display="flex" gap={1} mt={3}>
                  <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    variant="outlined"
                  >
                    Back
                  </Button>
                  
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={!step.isValid || isGenerating}
                    startIcon={isLastStep ? <GetApp /> : undefined}
                  >
                    {isLastStep ? 'Generate File' : 'Continue'}
                  </Button>

                  {/* Step-specific actions */}
                  {index === 0 && selectedPayments.length > 0 && (
                    <Chip
                      label={`${selectedPayments.length} selected`}
                      color="primary"
                      size="small"
                      sx={{ ml: 2 }}
                    />
                  )}

                  {index === 1 && selectedBank && (
                    <Chip
                      label={saudiBankService.getBankByCode(selectedBank)?.shortName || selectedBank}
                      color="primary"
                      size="small"
                      sx={{ ml: 2 }}
                    />
                  )}

                  {index === 2 && validationResults.size > 0 && (
                    <Box display="flex" gap={1} ml={2}>
                      {Array.from(validationResults.values()).every(v => v.isValid) ? (
                        <Chip
                          label="All Valid"
                          color="success"
                          size="small"
                          icon={<CheckCircle />}
                        />
                      ) : (
                        <Chip
                          label="Issues Found"
                          color="warning"
                          size="small"
                          icon={<Warning />}
                        />
                      )}
                    </Box>
                  )}
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>

        {/* Completion */}
        {activeStep === steps.length && (
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Box textAlign="center">
                <CheckCircle color="success" sx={{ fontSize: 64, mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Bank File Generated Successfully!
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Your payment file has been generated and is ready for download.
                </Typography>
                
                <Box display="flex" justifyContent="center" gap={2} mt={3}>
                  <Button variant="contained" startIcon={<GetApp />}>
                    Download File
                  </Button>
                  <Button variant="outlined" onClick={handleReset}>
                    Generate Another
                  </Button>
                  <Button variant="text" onClick={onClose}>
                    Close
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>

      {/* Summary Footer */}
      {activeStep < steps.length && (
        <Box p={3} borderTop={1} borderColor="divider" bgcolor="grey.50">
          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
            Progress: {activeStep + 1} of {steps.length} steps completed
          </Typography>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              {selectedPayments.length > 0 && (
                <Typography variant="body2">
                  <strong>{selectedPayments.length}</strong> payments selected
                  {selectedBank && (
                    <>
                      {' • '}
                      <strong>{saudiBankService.getBankByCode(selectedBank)?.name || selectedBank}</strong>
                    </>
                  )}
                </Typography>
              )}
            </Box>
            
            <Box display="flex" alignItems="center" gap={1}>
              {steps.map((_, index) => (
                <Box
                  key={index}
                  width={8}
                  height={8}
                  borderRadius="50%"
                  bgcolor={
                    index < activeStep ? 'success.main' :
                    index === activeStep ? 'primary.main' :
                    'grey.300'
                  }
                />
              ))}
            </Box>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

// Bank Selector Component
interface BankSelectorProps {
  banks: SaudiBankDefinition[];
  selectedBank: string;
  onBankSelect: (bankCode: string) => void;
  selectedPayments: PaymentSummaryResponse[];
}

const BankSelector: React.FC<BankSelectorProps> = ({
  banks,
  selectedBank,
  onBankSelect,
  selectedPayments
}) => {
  const totalAmount = selectedPayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select Target Bank
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          {selectedPayments.length} payments • Total: {saudiBankService.formatSAR(totalAmount)}
        </Typography>
      </Alert>

      <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={2}>
        {banks.map((bank) => {
          const isSelected = selectedBank === bank.code;
          const canProcessToday = saudiBankService.canProcessToday(bank.code);
          const workingHours = saudiBankService.getBankWorkingHours(bank.code);

          return (
            <Card
              key={bank.code}
              variant={isSelected ? "outlined" : "elevation"}
              sx={{
                cursor: 'pointer',
                border: isSelected ? 2 : 1,
                borderColor: isSelected ? 'primary.main' : 'divider',
                '&:hover': {
                  boxShadow: 3,
                  transform: 'translateY(-1px)'
                }
              }}
              onClick={() => onBankSelect(bank.code)}
            >
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Box
                    width={40}
                    height={40}
                    borderRadius="50%"
                    bgcolor={bank.primaryColor}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color="white"
                    fontWeight="bold"
                  >
                    {bank.shortName?.substring(0, 2) || bank.name.substring(0, 2)}
                  </Box>
                  <Box flex={1}>
                    <Typography variant="h6">{bank.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {bank.arabicName}
                    </Typography>
                  </Box>
                  {isSelected && <CheckCircle color="primary" />}
                </Box>

                <Divider sx={{ my: 2 }} />

                <List dense>
                  <ListItem disablePadding>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Schedule fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Processing Time"
                      secondary={bank.processingTime}
                    />
                  </ListItem>
                  
                  <ListItem disablePadding>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Info fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Cutoff Time"
                      secondary={bank.cutoffTime}
                    />
                  </ListItem>

                  <ListItem disablePadding>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <AccountBalance fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Max Bulk Payments"
                      secondary={bank.maxBulkPayments?.toLocaleString() || 'Unlimited'}
                    />
                  </ListItem>
                </List>

                {workingHours && (
                  <Box mt={2}>
                    <Chip
                      size="small"
                      label={canProcessToday ? "Open Today" : "Closed Today"}
                      color={canProcessToday ? "success" : "warning"}
                      icon={canProcessToday ? <CheckCircle /> : <Warning />}
                    />
                    {workingHours.timeUntilCutoff && canProcessToday && (
                      <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                        {workingHours.timeUntilCutoff} until cutoff
                      </Typography>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
};

export default BankFileWizard;