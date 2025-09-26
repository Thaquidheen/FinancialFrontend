// src/components/quotations/QuotationBulkActions.tsx
import React, { useState } from 'react';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Alert,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Delete as DeleteIcon,
  Send as SubmitIcon,
  FileDownload as ExportIcon,
  ContentCopy as DuplicateIcon,
} from '@mui/icons-material';
import { QuotationSummary, QuotationStatus } from '@/types/quotation';
import { quotationService } from '@/services/quotation/quotationService';

interface QuotationBulkActionsProps {
  selectedQuotations: QuotationSummary[];
  onActionComplete: () => void;
  onError: (error: string) => void;
}

interface BulkActionDialogProps {
  open: boolean;
  onClose: () => void;
  action: string;
  quotations: QuotationSummary[];
  onConfirm: (data: any) => void;
  loading?: boolean;
}

const BulkActionDialog: React.FC<BulkActionDialogProps> = ({
  open,
  onClose,
  action,
  quotations,
  onConfirm,
  loading = false
}) => {
  const [comments, setComments] = useState('');
  const [reason, setReason] = useState('');

  const getDialogTitle = () => {
    switch (action) {
      case 'approve': return `Approve ${quotations.length} Quotation${quotations.length > 1 ? 's' : ''}`;
      case 'reject': return `Reject ${quotations.length} Quotation${quotations.length > 1 ? 's' : ''}`;
      case 'delete': return `Delete ${quotations.length} Quotation${quotations.length > 1 ? 's' : ''}`;
      case 'submit': return `Submit ${quotations.length} Quotation${quotations.length > 1 ? 's' : ''}`;
      default: return 'Bulk Action';
    }
  };

  const getDialogContent = () => {
    switch (action) {
      case 'approve':
        return (
          <Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              You are about to approve {quotations.length} quotation{quotations.length > 1 ? 's' : ''}. 
              This action cannot be undone.
            </Alert>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Approval Comments (Optional)"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Add any comments about this approval..."
            />
          </Box>
        );
      
      case 'reject':
        return (
          <Box>
            <Alert severity="warning" sx={{ mb: 2 }}>
              You are about to reject {quotations.length} quotation{quotations.length > 1 ? 's' : ''}. 
              This action cannot be undone.
            </Alert>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Rejection Reason *"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide a reason for rejection..."
              required
              error={!reason.trim()}
              helperText={!reason.trim() ? 'Rejection reason is required' : ''}
            />
          </Box>
        );
      
      case 'delete':
        return (
          <Box>
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Warning:</strong> You are about to permanently delete {quotations.length} quotation{quotations.length > 1 ? 's' : ''}. 
                This action cannot be undone and will remove all associated data.
              </Typography>
            </Alert>
            <Typography variant="body2" color="text.secondary">
              Only draft quotations can be deleted. The following quotations will be deleted:
            </Typography>
            <Box sx={{ mt: 1, maxHeight: 200, overflow: 'auto' }}>
              {quotations.map((q) => (
                <Chip
                  key={q.id}
                  label={`${q.description.substring(0, 50)}${q.description.length > 50 ? '...' : ''}`}
                  size="small"
                  sx={{ m: 0.5 }}
                />
              ))}
            </Box>
          </Box>
        );
      
      case 'submit':
        return (
          <Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              You are about to submit {quotations.length} quotation{quotations.length > 1 ? 's' : ''} for approval.
            </Alert>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Submission Notes (Optional)"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Add any notes about this submission..."
            />
          </Box>
        );
      
      default:
        return null;
    }
  };

  const handleConfirm = () => {
    if (action === 'reject' && !reason.trim()) {
      return;
    }
    
    onConfirm({
      action,
      comments: action === 'approve' || action === 'submit' ? comments : undefined,
      reason: action === 'reject' ? reason : undefined
    });
  };

  const isConfirmDisabled = () => {
    if (loading) return true;
    if (action === 'reject' && !reason.trim()) return true;
    return false;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{getDialogTitle()}</DialogTitle>
      <DialogContent>
        {getDialogContent()}
        {loading && <LinearProgress sx={{ mt: 2 }} />}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color={action === 'delete' ? 'error' : action === 'reject' ? 'warning' : 'primary'}
          disabled={isConfirmDisabled()}
        >
          {action === 'approve' ? 'Approve' : 
           action === 'reject' ? 'Reject' :
           action === 'delete' ? 'Delete' :
           action === 'submit' ? 'Submit' : 'Confirm'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const QuotationBulkActions: React.FC<QuotationBulkActionsProps> = ({
  selectedQuotations,
  onActionComplete,
  onError
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleActionClick = (action: string) => {
    setCurrentAction(action);
    setDialogOpen(true);
    handleClose();
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setCurrentAction('');
  };

  const canApprove = selectedQuotations.every(q => q.status === QuotationStatus.PENDING);
  const canReject = selectedQuotations.every(q => q.status === QuotationStatus.PENDING);
  const canDelete = selectedQuotations.every(q => q.status === QuotationStatus.DRAFT);
  const canSubmit = selectedQuotations.every(q => q.status === QuotationStatus.DRAFT);

  const handleBulkAction = async (data: any) => {
    setLoading(true);
    
    try {
      const quotationIds = selectedQuotations.map(q => q.id);
      
      switch (data.action) {
        case 'approve':
          await quotationService.bulkApprove(quotationIds, data.comments);
          break;
        case 'reject':
          await quotationService.bulkReject(quotationIds, data.reason);
          break;
        case 'delete':
          // Delete quotations one by one since there's no bulk delete endpoint
          for (const id of quotationIds) {
            await quotationService.deleteQuotation(id);
          }
          break;
        case 'submit':
          // Submit quotations one by one
          for (const id of quotationIds) {
            await quotationService.submitQuotation(id);
          }
          break;
        default:
          throw new Error('Unknown action');
      }
      
      onActionComplete();
      handleDialogClose();
    } catch (error: any) {
      onError(error.message || 'Failed to perform bulk action');
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'approve': return <ApproveIcon />;
      case 'reject': return <RejectIcon />;
      case 'delete': return <DeleteIcon />;
      case 'submit': return <SubmitIcon />;
      case 'export': return <ExportIcon />;
      case 'duplicate': return <DuplicateIcon />;
      default: return <MoreVertIcon />;
    }
  };


  const actions = [
    { key: 'approve', label: 'Approve Selected', disabled: !canApprove },
    { key: 'reject', label: 'Reject Selected', disabled: !canReject },
    { key: 'submit', label: 'Submit Selected', disabled: !canSubmit },
    { key: 'delete', label: 'Delete Selected', disabled: !canDelete },
    { key: 'export', label: 'Export Selected', disabled: false },
    { key: 'duplicate', label: 'Duplicate Selected', disabled: false }
  ];

  if (selectedQuotations.length === 0) {
    return null;
  }

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Chip
          label={`${selectedQuotations.length} selected`}
          color="primary"
          variant="outlined"
        />
        <Button
          variant="outlined"
          startIcon={<MoreVertIcon />}
          onClick={handleClick}
          size="small"
        >
          Actions
        </Button>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {actions.map((action) => (
          <MenuItem
            key={action.key}
            onClick={() => handleActionClick(action.key)}
            disabled={action.disabled}
          >
            <ListItemIcon>
              {getActionIcon(action.key)}
            </ListItemIcon>
            <ListItemText>{action.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>

      <BulkActionDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        action={currentAction}
        quotations={selectedQuotations}
        onConfirm={handleBulkAction}
        loading={loading}
      />
    </>
  );
};

export default QuotationBulkActions;
