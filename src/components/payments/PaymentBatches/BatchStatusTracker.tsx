// src/components/payments/PaymentBatches/BatchStatusTracker.tsx

import React from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  Typography,
  LinearProgress,
  Chip,
  Tooltip,
  styled
} from '@mui/material';
import {
  Schedule,
  Description,
  CloudUpload,
  AccountBalance,
  CheckCircle,
  Error,
  Warning
} from '@mui/icons-material';
import { PaymentBatchStatus } from '../../../types/payment.types';
import { PAYMENT_BATCH_STATUS_LABELS, PAYMENT_BATCH_STATUS_COLORS } from '../../../constants/payments/paymentConstants';

interface BatchStatusTrackerProps {
  status: PaymentBatchStatus;
  compact?: boolean;
  showLabels?: boolean;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

const CustomConnector = styled(StepConnector)(({ theme }) => ({
  '&.Mui-active': {
    '& .MuiStepConnector-line': {
      borderColor: theme.palette.primary.main,
    },
  },
  '&.Mui-completed': {
    '& .MuiStepConnector-line': {
      borderColor: theme.palette.success.main,
    },
  },
}));

const BatchStatusTracker: React.FC<BatchStatusTrackerProps> = ({
  status,
  compact = false,
  showLabels = true,
  orientation = 'horizontal',
  className
}) => {
  const statusSteps = [
    {
      key: PaymentBatchStatus.CREATED,
      label: 'Created',
      shortLabel: 'Created',
      icon: Schedule,
      description: 'Batch created and ready for file generation'
    },
    {
      key: PaymentBatchStatus.FILE_GENERATED,
      label: 'File Generated',
      shortLabel: 'Generated',
      icon: Description,
      description: 'Bank file generated and ready for download'
    },
    {
      key: PaymentBatchStatus.SENT_TO_BANK,
      label: 'Sent to Bank',
      shortLabel: 'Sent',
      icon: CloudUpload,
      description: 'File uploaded to bank portal'
    },
    {
      key: PaymentBatchStatus.PROCESSING,
      label: 'Processing',
      shortLabel: 'Processing',
      icon: AccountBalance,
      description: 'Bank is processing the payments'
    },
    {
      key: PaymentBatchStatus.COMPLETED,
      label: 'Completed',
      shortLabel: 'Done',
      icon: CheckCircle,
      description: 'All payments completed successfully'
    }
  ];

  const getCurrentStepIndex = () => {
    if (status === PaymentBatchStatus.FAILED) {
      // Find the last valid step before failure
      const stepIndex = statusSteps.findIndex(step => step.key === PaymentBatchStatus.PROCESSING);
      return stepIndex >= 0 ? stepIndex : 0;
    }
    
    const stepIndex = statusSteps.findIndex(step => step.key === status);
    return stepIndex >= 0 ? stepIndex : 0;
  };

  const getStepStatus = (stepIndex: number) => {
    const currentIndex = getCurrentStepIndex();
    
    if (status === PaymentBatchStatus.FAILED && stepIndex >= currentIndex) {
      return 'error';
    }
    
    if (stepIndex < currentIndex) {
      return 'completed';
    } else if (stepIndex === currentIndex) {
      return 'active';
    } else {
      return 'inactive';
    }
  };

  const getStepIcon = (step: typeof statusSteps[0], stepIndex: number) => {
    const stepStatus = getStepStatus(stepIndex);
    const IconComponent = step.icon;
    
    let color: any = 'action';
    if (stepStatus === 'completed') color = 'success';
    else if (stepStatus === 'active') color = 'primary';
    else if (stepStatus === 'error') color = 'error';
    
    return <IconComponent color={color} />;
  };

  const getProgressPercentage = () => {
    const currentIndex = getCurrentStepIndex();
    const totalSteps = statusSteps.length;
    
    if (status === PaymentBatchStatus.FAILED) {
      return (currentIndex / (totalSteps - 1)) * 100;
    }
    
    if (status === PaymentBatchStatus.COMPLETED) {
      return 100;
    }
    
    return (currentIndex / (totalSteps - 1)) * 100;
  };

  // Compact version for table rows
  if (compact) {
    const progress = getProgressPercentage();
    const currentStep = statusSteps[getCurrentStepIndex()];
    
    return (
      <Box className={className}>
        <Tooltip title={`${progress.toFixed(0)}% Complete - ${currentStep.description}`}>
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
              <Typography variant="caption" color="text.secondary">
                {currentStep.shortLabel}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {progress.toFixed(0)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              color={
                status === PaymentBatchStatus.FAILED ? 'error' :
                status === PaymentBatchStatus.COMPLETED ? 'success' :
                'primary'
              }
              sx={{ height: 4, borderRadius: 2 }}
            />
            {status === PaymentBatchStatus.FAILED && (
              <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                <Error color="error" sx={{ fontSize: 12 }} />
                <Typography variant="caption" color="error">
                  Failed
                </Typography>
              </Box>
            )}
          </Box>
        </Tooltip>
      </Box>
    );
  }

  // Full version for detailed views
  return (
    <Box className={className}>
      {/* Current Status Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h6">
          Batch Progress
        </Typography>
        <Chip
          label={PAYMENT_BATCH_STATUS_LABELS[status]}
          color={PAYMENT_BATCH_STATUS_COLORS[status]}
          icon={
            status === PaymentBatchStatus.FAILED ? <Error /> :
            status === PaymentBatchStatus.COMPLETED ? <CheckCircle /> :
            <Schedule />
          }
        />
      </Box>

      {/* Progress Bar */}
      <Box mb={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="body2" color="text.secondary">
            Overall Progress
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {getProgressPercentage().toFixed(0)}% Complete
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={getProgressPercentage()}
          color={
            status === PaymentBatchStatus.FAILED ? 'error' :
            status === PaymentBatchStatus.COMPLETED ? 'success' :
            'primary'
          }
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Box>

      {/* Status Steps */}
      <Stepper
        activeStep={getCurrentStepIndex()}
        orientation={orientation}
        connector={<CustomConnector />}
      >
        {statusSteps.map((step, index) => {
          const stepStatus = getStepStatus(index);
          const isError = status === PaymentBatchStatus.FAILED && index >= getCurrentStepIndex();
          
          return (
            <Step key={step.key}>
              <StepLabel
                StepIconComponent={() => (
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor:
                        stepStatus === 'completed' ? 'success.main' :
                        stepStatus === 'active' ? 'primary.main' :
                        isError ? 'error.main' :
                        'grey.300',
                      color: stepStatus === 'inactive' && !isError ? 'text.secondary' : 'white'
                    }}
                  >
                    {getStepIcon(step, index)}
                  </Box>
                )}
                error={isError}
              >
                {showLabels && (
                  <Box>
                    <Typography
                      variant="subtitle2"
                      color={
                        stepStatus === 'completed' ? 'success.main' :
                        stepStatus === 'active' ? 'primary.main' :
                        isError ? 'error.main' :
                        'text.secondary'
                      }
                    >
                      {step.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {step.description}
                    </Typography>
                    
                    {/* Step-specific status indicators */}
                    {stepStatus === 'active' && (
                      <Chip
                        label="In Progress"
                        size="small"
                        color="primary"
                        sx={{ mt: 0.5 }}
                      />
                    )}
                    {stepStatus === 'completed' && (
                      <Chip
                        label="Completed"
                        size="small"
                        color="success"
                        sx={{ mt: 0.5 }}
                      />
                    )}
                    {isError && (
                      <Chip
                        label="Failed"
                        size="small"
                        color="error"
                        sx={{ mt: 0.5 }}
                      />
                    )}
                  </Box>
                )}
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>

      {/* Failure Message */}
      {status === PaymentBatchStatus.FAILED && (
        <Box mt={3}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Error color="error" />
            <Typography variant="subtitle2" color="error">
              Processing Failed
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            The batch encountered an error during processing. Please contact support or try reprocessing.
          </Typography>
        </Box>
      )}

      {/* Next Steps */}
      {status !== PaymentBatchStatus.COMPLETED && status !== PaymentBatchStatus.FAILED && (
        <Box mt={3} p={2} bgcolor="grey.50" borderRadius={1}>
          <Typography variant="subtitle2" gutterBottom>
            Next Steps:
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {status === PaymentBatchStatus.CREATED && 
              "Generate the bank file to proceed with payment processing."
            }
            {status === PaymentBatchStatus.FILE_GENERATED && 
              "Download the file and upload it to your bank's portal."
            }
            {status === PaymentBatchStatus.SENT_TO_BANK && 
              "Wait for the bank to begin processing the payments."
            }
            {status === PaymentBatchStatus.PROCESSING && 
              "Monitor bank confirmation and mark as completed when done."
            }
          </Typography>
        </Box>
      )}

      {/* Completion Message */}
      {status === PaymentBatchStatus.COMPLETED && (
        <Box mt={3} p={2} bgcolor="success.50" borderRadius={1}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <CheckCircle color="success" />
            <Typography variant="subtitle2" color="success.dark">
              Batch Completed Successfully
            </Typography>
          </Box>
          <Typography variant="body2" color="success.dark">
            All payments in this batch have been processed successfully by the bank.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default BatchStatusTracker;