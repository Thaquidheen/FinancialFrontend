// components/approvals/ApprovalReview/ApprovalReviewModal.tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  Divider,
  Chip,
  Paper,
} from '@mui/material';
import {
  Close as CloseIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Edit as EditIcon,
  AttachFile as AttachmentIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { ApprovalItem, QuotationDetails, ApprovalHistory } from '../../../types/approval.types';
import { QuotationDetails as QuotationDetailsComponent } from './QuotationDetails';
import { BudgetValidation } from './BudgetValidation';
import { DocumentViewer } from './DocumentViewer';
import { ApprovalActions } from './ApprovalActions';
import { CommentsSection } from './CommentsSection';
import { ApprovalHistory as ApprovalHistoryComponent } from './ApprovalHistory';
import approvalService from '../../../services/approvalService';
import { formatCurrency } from '../../../utils/approvals/approvalUtils';

interface ApprovalReviewModalProps {
  open: boolean;
  onClose: () => void;
  approval: ApprovalItem | null;
  onApprovalProcessed: (approval: ApprovalItem, action: string) => void;
}

const steps = [
  'Review Details',
  'Budget Validation',
  'Documents',
  'Decision',
];

export const ApprovalReviewModal: React.FC<ApprovalReviewModalProps> = ({
  open,
  onClose,
  approval,
  onApprovalProcessed,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [quotationDetails, setQuotationDetails] = useState<QuotationDetails | null>(null);
  const [approvalHistory, setApprovalHistory] = useState<ApprovalHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (open && approval) {
      loadQuotationDetails();
      loadApprovalHistory();
      setActiveStep(0);
      setError(null);
    }
  }, [open, approval]);

  const loadQuotationDetails = async () => {
    if (!approval) return;

    try {
      setLoading(true);
      // This would be implemented with a quotation service
      // const details = await quotationService.getQuotationDetails(approval.quotationId);
      // setQuotationDetails(details);
      
      // Mock data for now
      setQuotationDetails({
        id: approval.id,
        quotationNumber: approval.quotationNumber,
        projectId: approval.projectId,
        projectName: approval.projectName,
        projectManagerId: approval.projectManagerId,
        projectManagerName: approval.projectManagerName,
        totalAmount: approval.totalAmount,
        currency: approval.currency,
        description: approval.description || '',
        submissionDate: approval.submissionDate,
        status: approval.status as any,
        lineItems: [],
        documents: [],
        comments: [],
        budgetInfo: {
          projectBudget: approval.projectBudget || 0,
          spentAmount: 0,
          remainingBudget: approval.remainingBudget || 0,
          budgetUtilization: 0,
          isOverBudget: approval.exceedsBudget || false,
          wouldExceedBudget: approval.exceedsBudget || false,
          totalBudget: approval.projectBudget || 0,
          usedBudget: 0,
          complianceStatus: approval.budgetCompliance,
        },
        createdDate: approval.lastUpdated,
        lastUpdated: approval.lastUpdated,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load quotation details');
    } finally {
      setLoading(false);
    }
  };

  const loadApprovalHistory = async () => {
    if (!approval) return;

    try {
      const history = await approvalService.getApprovalHistory(approval.quotationId);
      setApprovalHistory(history);
    } catch (err: any) {
      console.error('Failed to load approval history:', err);
    }
  };

  const handleNext = () => {
    setActiveStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setActiveStep(prev => Math.max(prev - 1, 0));
  };

  const handleApprove = async (comments?: string) => {
    if (!approval) return;

    try {
      setProcessing(true);
      await approvalService.quickApprove(approval.quotationId, comments);
      onApprovalProcessed(approval, 'APPROVED');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to approve quotation');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (reason: string, comments: string) => {
    if (!approval) return;

    try {
      setProcessing(true);
      await approvalService.quickReject(approval.quotationId, reason);
      onApprovalProcessed(approval, 'REJECTED');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to reject quotation');
    } finally {
      setProcessing(false);
    }
  };

  const handleRequestChanges = async (comments: string) => {
    if (!approval) return;

    try {
      setProcessing(true);
      await approvalService.requestChanges(approval.quotationId, comments);
      onApprovalProcessed(approval, 'CHANGES_REQUESTED');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to request changes');
    } finally {
      setProcessing(false);
    }
  };

  const renderStepContent = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      );
    }

    if (!approval || !quotationDetails) {
      return (
        <Alert severity="warning">
          No quotation details available
        </Alert>
      );
    }

    switch (activeStep) {
      case 0:
        return (
          <QuotationDetailsComponent
            quotation={quotationDetails}
            approval={approval}
          />
        );
      case 1:
        return (
          <BudgetValidation
            quotation={quotationDetails}
            approval={approval}
          />
        );
      case 2:
        return (
          <DocumentViewer
            quotation={quotationDetails}
            approval={approval}
          />
        );
      case 3:
        return (
          <ApprovalActions
            quotation={quotationDetails}
            approval={approval}
            onApprove={handleApprove}
            onReject={handleReject}
            onRequestChanges={handleRequestChanges}
            processing={processing}
          />
        );
      default:
        return null;
    }
  };

  const renderHeader = () => (
    <DialogTitle>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h6">
            Review Quotation: {approval?.quotationNumber}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {approval?.projectName} • {formatCurrency(approval?.totalAmount || 0, approval?.currency)}
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          {approval?.urgencyLevel === 'CRITICAL' && (
            <Chip label="Critical" color="error" size="small" />
          )}
          {approval?.hasDocuments && (
            <AttachmentIcon color="action" />
          )}
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>
    </DialogTitle>
  );

  const renderStepper = () => (
    <Box sx={{ mb: 3 }}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );

  const renderNavigation = () => (
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <Box>
        {activeStep > 0 && (
          <Button onClick={handleBack} disabled={processing}>
            Back
          </Button>
        )}
      </Box>
      
      <Box display="flex" gap={1}>
        {activeStep < steps.length - 1 && (
          <Button 
            variant="contained" 
            onClick={handleNext}
            disabled={processing}
          >
            Next
          </Button>
        )}
        
        <Button 
          onClick={onClose}
          disabled={processing}
        >
          Close
        </Button>
      </Box>
    </Box>
  );

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { minHeight: '80vh' }
      }}
    >
      {renderHeader()}
      
      <DialogContent sx={{ pb: 1 }}>
        {renderStepper()}
        {renderStepContent()}
        
        {approvalHistory.length > 0 && (
          <>
            <Divider sx={{ my: 3 }} />
            <ApprovalHistoryComponent history={approvalHistory} />
          </>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        {renderNavigation()}
      </DialogActions>
    </Dialog>
  );
};