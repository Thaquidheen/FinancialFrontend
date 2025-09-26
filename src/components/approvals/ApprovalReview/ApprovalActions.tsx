// components/approvals/ApprovalReview/ApprovalActions.tsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Grid,
  Chip,
  Divider,
  Paper,
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Edit as EditIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { QuotationDetails as QuotationDetailsType, ApprovalItem } from '../../../types/approval.types';
import { REJECTION_REASONS } from '../../../constants/approvals/approvalConstants';
import { formatCurrency } from '../../../utils/approvals/approvalUtils';

interface ApprovalActionsProps {
  quotation: QuotationDetailsType;
  approval: ApprovalItem;
  onApprove: (comments?: string) => void;
  onReject: (reason: string, comments: string) => void;
  onRequestChanges: (comments: string) => void;
  processing: boolean;
}

export const ApprovalActions: React.FC<ApprovalActionsProps> = ({
  quotation,
  approval,
  onApprove,
  onReject,
  onRequestChanges,
  processing,
}) => {
  const [action, setAction] = useState<'approve' | 'reject' | 'changes' | null>(null);
  const [comments, setComments] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  const handleAction = () => {
    if (!action) return;

    switch (action) {
      case 'approve':
        onApprove(comments || undefined);
        break;
      case 'reject':
        onReject(rejectReason, comments);
        break;
      case 'changes':
        onRequestChanges(comments);
        break;
    }
  };

  const renderActionSummary = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Approval Summary
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="body2" color="textSecondary">
                Quotation
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {quotation.quotationNumber}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="body2" color="textSecondary">
                Amount
              </Typography>
              <Typography variant="body1" fontWeight="medium" color="primary">
                {formatCurrency(quotation.totalAmount, quotation.currency)}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="body2" color="textSecondary">
                Project
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {quotation.projectName}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="body2" color="textSecondary">
                Budget Status
              </Typography>
              <Chip 
                label={quotation.budgetInfo.complianceStatus}
                color={
                  quotation.budgetInfo.complianceStatus === 'COMPLIANT' ? 'success' :
                  quotation.budgetInfo.complianceStatus === 'WARNING' ? 'warning' : 'error'
                }
                size="small"
              />
            </Box>
          </Grid>
        </Grid>
        
        {quotation.budgetInfo.wouldExceedBudget && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Budget Warning:</strong> This quotation would exceed the project budget by{' '}
              {formatCurrency(quotation.budgetInfo.excessAmount || 0, quotation.currency)}.
            </Typography>
          </Alert>
        )}
      </CardContent>
    </Card>
  );

  const renderActionSelection = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Select Action
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Paper 
              variant={action === 'approve' ? 'elevation' : 'outlined'}
              sx={{ 
                p: 2, 
                cursor: 'pointer',
                border: action === 'approve' ? '2px solid' : '1px solid',
                borderColor: action === 'approve' ? 'success.main' : 'divider',
                backgroundColor: action === 'approve' ? 'success.50' : 'background.paper',
              }}
              onClick={() => setAction('approve')}
            >
              <Box textAlign="center">
                <ApproveIcon 
                  color={action === 'approve' ? 'success' : 'disabled'} 
                  sx={{ fontSize: 40, mb: 1 }}
                />
                <Typography variant="h6" color={action === 'approve' ? 'success.main' : 'textSecondary'}>
                  Approve
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Approve this quotation for payment processing
                </Typography>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper 
              variant={action === 'reject' ? 'elevation' : 'outlined'}
              sx={{ 
                p: 2, 
                cursor: 'pointer',
                border: action === 'reject' ? '2px solid' : '1px solid',
                borderColor: action === 'reject' ? 'error.main' : 'divider',
                backgroundColor: action === 'reject' ? 'error.50' : 'background.paper',
              }}
              onClick={() => setAction('reject')}
            >
              <Box textAlign="center">
                <RejectIcon 
                  color={action === 'reject' ? 'error' : 'disabled'} 
                  sx={{ fontSize: 40, mb: 1 }}
                />
                <Typography variant="h6" color={action === 'reject' ? 'error.main' : 'textSecondary'}>
                  Reject
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Reject this quotation and return to project manager
                </Typography>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper 
              variant={action === 'changes' ? 'elevation' : 'outlined'}
              sx={{ 
                p: 2, 
                cursor: 'pointer',
                border: action === 'changes' ? '2px solid' : '1px solid',
                borderColor: action === 'changes' ? 'warning.main' : 'divider',
                backgroundColor: action === 'changes' ? 'warning.50' : 'background.paper',
              }}
              onClick={() => setAction('changes')}
            >
              <Box textAlign="center">
                <EditIcon 
                  color={action === 'changes' ? 'warning' : 'disabled'} 
                  sx={{ fontSize: 40, mb: 1 }}
                />
                <Typography variant="h6" color={action === 'changes' ? 'warning.main' : 'textSecondary'}>
                  Request Changes
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Request modifications before approval
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const renderActionDetails = () => {
    if (!action) return null;

    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {action === 'approve' && 'Approval Details'}
            {action === 'reject' && 'Rejection Details'}
            {action === 'changes' && 'Change Request Details'}
          </Typography>
          
          {action === 'reject' && (
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Rejection Reason</InputLabel>
              <Select
                value={rejectReason}
                label="Rejection Reason"
                onChange={(e) => setRejectReason(e.target.value)}
              >
                {REJECTION_REASONS.map(reason => (
                  <MenuItem key={reason} value={reason}>
                    {reason}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          
          <TextField
            fullWidth
            multiline
            rows={4}
            label={
              action === 'approve' ? 'Comments (Optional)' :
              action === 'reject' ? 'Rejection Comments (Required)' :
              'Change Request Details (Required)'
            }
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder={
              action === 'approve' ? 'Add any comments for the approval...' :
              action === 'reject' ? 'Explain why this quotation is being rejected...' :
              'Describe what changes are needed...'
            }
            required={action !== 'approve'}
          />
          
          {action === 'reject' && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Note:</strong> Rejection comments are required and will be sent to the project manager.
              </Typography>
            </Alert>
          )}
          
          {action === 'changes' && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Note:</strong> The project manager will receive your change request and can resubmit the quotation.
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderActionButtons = () => (
    <Box display="flex" justifyContent="center" gap={2}>
      <Button
        variant="contained"
        size="large"
        onClick={handleAction}
        disabled={processing || !action || (action === 'reject' && (!rejectReason || !comments.trim())) || (action === 'changes' && !comments.trim())}
        startIcon={
          action === 'approve' ? <ApproveIcon /> :
          action === 'reject' ? <RejectIcon /> :
          <EditIcon />
        }
        color={
          action === 'approve' ? 'success' :
          action === 'reject' ? 'error' :
          'warning'
        }
        sx={{ minWidth: 200 }}
      >
        {processing ? 'Processing...' : 
         action === 'approve' ? 'Approve Quotation' :
         action === 'reject' ? 'Reject Quotation' :
         'Request Changes'}
      </Button>
    </Box>
  );

  return (
    <Box>
      {renderActionSummary()}
      {renderActionSelection()}
      {renderActionDetails()}
      {renderActionButtons()}
    </Box>
  );
};
