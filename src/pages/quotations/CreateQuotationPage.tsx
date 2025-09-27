// src/pages/quotations/CreateQuotationPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { quotationService } from '../../services/quotation/quotationService';
import { 
  CreateQuotationRequest, 
  Currency,
  QuotationFormData
} from '../../types/quotation';

// Import step components
import QuotationBasicInfo from '../../components/quotations/forms/QuotationBasicInfo';
import QuotationLineItems from '../../components/quotations/forms/QuotationLineItems';
import QuotationDocuments from '../../components/quotations/forms/QuotationDocuments';
import QuotationReview from '../../components/quotations/forms/QuotationReview';

const steps = [
  'Basic Information',
  'Line Items',
  'Documents',
  'Review & Submit'
];


const CreateQuotationPage: React.FC = () => {
  const navigate = useNavigate();
  const { } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);

  const [formData, setFormData] = useState<QuotationFormData>({
    projectId: null,
    description: '',
    currency: Currency.SAR,
    items: [],
    documents: []
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Auto-save draft functionality - TEMPORARILY DISABLED
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     // Only auto-save if we have basic info and at least one item
  //     if (formData.projectId && formData.description && formData.items.length > 0) {
  //       console.log('Auto-save interval triggered');
  //       saveDraft();
  //     }
  //   }, 30000); // Auto-save every 30 seconds

  //   return () => clearInterval(interval);
  // }, [formData.projectId, formData.description, formData.items.length]); // Only depend on essential fields

  const saveDraft = async () => {
    // Only save draft if we have basic info and at least one item
    if (!formData.projectId || !formData.description || formData.items.length === 0) {
      return;
    }

    try {
      const draftData: CreateQuotationRequest = {
        projectId: formData.projectId!,
        description: formData.description,
        currency: formData.currency,
        items: formData.items.map((item, index) => ({
          description: item.description,
          amount: Number(item.amount), // Ensure it's a number
          currency: item.currency,
          category: item.category,
          accountHead: item.accountHead,
          itemDate: item.itemDate,
          itemOrder: index + 1,
          vendorName: item.vendorName || undefined,
          vendorContact: item.vendorContact || undefined
        }))
      };

      console.log('Auto-saving draft with data:', draftData);
      await quotationService.createQuotation(draftData);
      console.log('Draft saved successfully');
    } catch (error) {
      console.error('Error saving draft:', error);
      // Don't show error to user for auto-save failures
    }
  };

  const validateCurrentStep = (): boolean => {
    const errors: Record<string, string> = {};

    switch (activeStep) {
      case 0: // Basic Information
        if (!formData.projectId) {
          errors.projectId = 'Project is required';
        }
        if (!formData.description.trim()) {
          errors.description = 'Description is required';
        }
        if (formData.description.trim().length < 10) {
          errors.description = 'Description must be at least 10 characters';
        }
        break;

      case 1: // Line Items
        if (formData.items.length === 0) {
          errors.items = 'At least one line item is required';
        }
        formData.items.forEach((item, index) => {
          if (!item.description.trim()) {
            errors[`item_${index}_description`] = 'Description is required';
          }
          if (!item.amount || item.amount <= 0) {
            errors[`item_${index}_amount`] = 'Amount must be greater than 0';
          }
          if (!item.accountHead.trim()) {
            errors[`item_${index}_accountHead`] = 'Account head is required';
          }
          if (!item.itemDate) {
            errors[`item_${index}_itemDate`] = 'Date is required';
          }
        });
        break;

      case 2: // Documents (optional)
        // Documents are optional, so no validation needed
        break;

      case 3: // Review
        // Final validation before submission
        if (!formData.projectId || !formData.description.trim() || formData.items.length === 0) {
          errors.general = 'Please complete all required steps';
        }
        break;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    console.log('handleNext called, current step:', activeStep);
    console.log('Form data:', formData);
    
    if (validateCurrentStep()) {
      console.log('Validation passed, moving to next step');
      setActiveStep((prevStep) => prevStep + 1);
      setError(null);
    } else {
      console.log('Validation failed, staying on current step');
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError(null);
  };

  const handleSubmit = async (submitForApproval: boolean = false) => {
    if (!validateCurrentStep()) return;

    setLoading(true);
    setError(null);

    try {
      const quotationData: CreateQuotationRequest = {
        projectId: formData.projectId!,
        description: formData.description,
        currency: formData.currency,
        items: formData.items.map((item, index) => ({
          description: item.description,
          amount: Number(item.amount), // Ensure it's a number
          currency: item.currency,
          category: item.category,
          accountHead: item.accountHead,
          itemDate: item.itemDate,
          itemOrder: index + 1,
          vendorName: item.vendorName || undefined,
          vendorContact: item.vendorContact || undefined
        }))
      };

      const createdQuotation = await quotationService.createQuotation(quotationData);

      // Upload documents if any
      if (formData.documents.length > 0) {
        // TODO: Implement document upload
        console.log('Documents to upload:', formData.documents);
      }

      // Submit for approval if requested
      if (submitForApproval) {
        await quotationService.submitQuotation(createdQuotation.id, {});
      }

      navigate(`/quotations/${createdQuotation.id}`, {
        state: { 
          message: submitForApproval 
            ? 'Quotation created and submitted for approval successfully!' 
            : 'Quotation created successfully!' 
        }
      });
    } catch (error: any) {
      setError(error.message || 'Failed to create quotation');
      console.error('Error creating quotation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDiscard = () => {
    setDiscardDialogOpen(true);
  };

  const confirmDiscard = () => {
    navigate('/quotations');
  };

  const updateFormData = (updates: Partial<QuotationFormData>) => {
    setFormData(prev => ({
      ...prev,
      ...updates
    }));
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <QuotationBasicInfo
            projectId={formData.projectId}
            description={formData.description}
            currency={formData.currency}
            errors={formErrors}
            onProjectChange={(projectId) => updateFormData({ projectId })}
            onDescriptionChange={(description) => updateFormData({ description })}
            onCurrencyChange={(currency) => updateFormData({ currency })}
          />
        );
      case 1:
        return (
          <QuotationLineItems
            items={formData.items}
            currency={formData.currency}
            errors={formErrors}
            onItemsChange={(items) => updateFormData({ items })}
          />
        );
      case 2:
        return (
          <QuotationDocuments
            documents={formData.documents}
            onDocumentsChange={(documents) => updateFormData({ documents })}
          />
        );
      case 3:
        return (
          <QuotationReview
            formData={formData}
            onEdit={(step) => setActiveStep(step)}
          />
        );
      default:
        return null;
    }
  };

  const getTotalAmount = () => {
    return formData.items.reduce((total, item) => total + item.amount, 0);
  };

  return (
    <Box sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: '#f8fafc', // Light gray background
    }}>
      {/* Header Section */}
      <Paper 
        elevation={0} 
        sx={{ 
          borderBottom: '1px solid #e2e8f0',
          px: 3,
          py: 2,
          bgcolor: '#ffffff',
          borderRadius: 0,
        }}
      >
        <Box sx={{ mb: 2 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            fontWeight={700}
            sx={{ 
              color: '#1a202c',
              fontSize: '1.875rem',
              letterSpacing: '-0.025em',
              mb: 0.5
            }}
          >
            Create New Quotation
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#64748b',
              fontSize: '0.875rem'
            }}
          >
            Follow the steps below to create a new quotation for your project
          </Typography>
        </Box>
      </Paper>

      {/* Main Content Area */}
      <Box sx={{ flex: 1, overflow: 'hidden', p: 3 }}>
        {/* Progress Stepper */}
        <Paper 
          elevation={0}
          sx={{ 
            p: 3, 
            mb: 3,
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            bgcolor: '#ffffff',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          }}
        >
          <Stepper 
            activeStep={activeStep} 
            alternativeLabel
            sx={{
              '& .MuiStepLabel-root .MuiStepLabel-label': {
                color: '#64748b',
                fontSize: '0.875rem',
                fontWeight: 500,
              },
              '& .MuiStepLabel-root .MuiStepLabel-label.Mui-active': {
                color: '#3b82f6',
                fontWeight: 600,
              },
              '& .MuiStepLabel-root .MuiStepLabel-label.Mui-completed': {
                color: '#16a34a',
                fontWeight: 600,
              },
              '& .MuiStep-root .MuiStepConnector-root .MuiStepConnector-line': {
                borderColor: '#e2e8f0',
              },
              '& .MuiStep-root .MuiStepConnector-root.Mui-active .MuiStepConnector-line': {
                borderColor: '#3b82f6',
              },
              '& .MuiStep-root .MuiStepConnector-root.Mui-completed .MuiStepConnector-line': {
                borderColor: '#16a34a',
              },
            }}
          >
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel
                  error={activeStep === index && Object.keys(formErrors).length > 0}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Summary Information */}
          {formData.projectId && (
            <Box 
              sx={{ 
                mt: 3, 
                p: 2, 
                bgcolor: '#f8fafc', 
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
              }}
            >
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#64748b',
                  fontSize: '0.875rem',
                  '& strong': {
                    color: '#1a202c',
                    fontWeight: 600,
                  }
                }}
              >
                Total Amount: <strong>{getTotalAmount().toLocaleString()} {formData.currency}</strong>
                {' • '}
                Items: <strong>{formData.items.length}</strong>
                {' • '}
                Documents: <strong>{formData.documents.length}</strong>
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Error Alert */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: '12px',
              border: '1px solid #fecaca',
              bgcolor: '#fef2f2',
            }}
          >
            {error}
          </Alert>
        )}

        {/* Step Content */}
        <Paper 
          elevation={0}
          sx={{ 
            p: 3, 
            mb: 3, 
            minHeight: 400,
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            bgcolor: '#ffffff',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          }}
        >
          {getStepContent(activeStep)}
        </Paper>

        {/* Navigation Buttons */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            bgcolor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            p: 3,
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          }}
        >
          <Button
            onClick={handleDiscard}
            variant="outlined"
            sx={{
              borderColor: '#fecaca',
              color: '#dc2626',
              borderRadius: '8px',
              '&:hover': {
                borderColor: '#fca5a5',
                backgroundColor: '#fef2f2',
              }
            }}
          >
            Discard
          </Button>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="outlined"
              sx={{
                borderColor: '#d1d5db',
                color: '#374151',
                borderRadius: '8px',
                '&:hover': {
                  borderColor: '#9ca3af',
                  backgroundColor: '#f9fafb',
                },
                '&:disabled': {
                  borderColor: '#e5e7eb',
                  color: '#9ca3af',
                }
              }}
            >
              Back
            </Button>

            {activeStep === steps.length - 1 ? (
              <>
                <Button
                  variant="outlined"
                  onClick={() => handleSubmit(false)}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                  sx={{
                    borderColor: '#d1d5db',
                    color: '#374151',
                    borderRadius: '8px',
                    '&:hover': {
                      borderColor: '#9ca3af',
                      backgroundColor: '#f9fafb',
                    },
                    '&:disabled': {
                      borderColor: '#e5e7eb',
                      color: '#9ca3af',
                    }
                  }}
                >
                  Save as Draft
                </Button>
                <Button
                  variant="contained"
                  onClick={() => handleSubmit(true)}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                  sx={{
                    bgcolor: '#3b82f6',
                    color: '#ffffff',
                    fontWeight: 600,
                    borderRadius: '8px',
                    '&:hover': {
                      bgcolor: '#2563eb',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    },
                    '&:disabled': {
                      bgcolor: '#e5e7eb',
                      color: '#9ca3af',
                    }
                  }}
                >
                  Create & Submit
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                sx={{
                  bgcolor: '#3b82f6',
                  color: '#ffffff',
                  fontWeight: 600,
                  borderRadius: '8px',
                  '&:hover': {
                    bgcolor: '#2563eb',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }
                }}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>

        {/* Discard Confirmation Dialog */}
        <Dialog open={discardDialogOpen} onClose={() => setDiscardDialogOpen(false)}>
          <DialogTitle>Discard Changes?</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to discard this quotation? All entered data will be lost.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDiscardDialogOpen(false)}>
              Continue Editing
            </Button>
            <Button onClick={confirmDiscard} color="error" variant="contained">
              Discard
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default CreateQuotationPage;