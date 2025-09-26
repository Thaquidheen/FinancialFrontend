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

  // Auto-save draft functionality
  useEffect(() => {
    const interval = setInterval(() => {
      if (formData.projectId && formData.description) {
        saveDraft();
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(interval);
  }, [formData]);

  const saveDraft = async () => {
    if (!validateCurrentStep()) return;

    try {
      const draftData: CreateQuotationRequest = {
        projectId: formData.projectId!,
        description: formData.description,
        currency: formData.currency,
        items: formData.items.map(item => ({
          description: item.description,
          amount: item.amount,
          currency: item.currency,
          category: item.category,
          accountHead: item.accountHead,
          itemDate: item.itemDate,
          vendorName: item.vendorName,
          vendorContact: item.vendorContact,
          itemOrder: item.itemOrder
        }))
      };

      await quotationService.createQuotation(draftData);
      console.log('Draft saved successfully');
    } catch (error) {
      console.error('Error saving draft:', error);
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
    if (validateCurrentStep()) {
      setActiveStep((prevStep) => prevStep + 1);
      setError(null);
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
        items: formData.items.map(item => ({
          description: item.description,
          amount: item.amount,
          currency: item.currency,
          category: item.category,
          accountHead: item.accountHead,
          itemDate: item.itemDate,
          vendorName: item.vendorName,
          vendorContact: item.vendorContact,
          itemOrder: item.itemOrder
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
        await quotationService.submitQuotation(createdQuotation.id);
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
    <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Quotation
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Follow the steps below to create a new quotation for your project
        </Typography>
      </Box>

      {/* Progress Stepper */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
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
          <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
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
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Step Content */}
      <Paper sx={{ p: 3, mb: 3, minHeight: 400 }}>
        {getStepContent(activeStep)}
      </Paper>

      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          onClick={handleDiscard}
          color="error"
          variant="outlined"
        >
          Discard
        </Button>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
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
              >
                Save as Draft
              </Button>
              <Button
                variant="contained"
                onClick={() => handleSubmit(true)}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                Create & Submit
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
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
  );
};

export default CreateQuotationPage;