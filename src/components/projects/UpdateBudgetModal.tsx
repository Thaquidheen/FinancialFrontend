// src/components/projects/UpdateBudgetModal.tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  CircularProgress,
  InputAdornment,
  Paper,
  Divider,
  Chip
} from '@mui/material';
import {
  AccountBalance as BudgetIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Project, UpdateBudgetRequest } from '@/types/project';
import { useUpdateProjectBudget } from '@/hooks/useProject';

interface UpdateBudgetModalProps {
  open: boolean;
  onClose: () => void;
  project: Project;
  onSuccess?: () => void;
}

const validationSchema = Yup.object({
  allocatedBudget: Yup.number()
    .required('Budget is required')
    .min(0, 'Budget must be positive')
    .max(999999999, 'Budget amount is too large'),
  reason: Yup.string()
    .max(500, 'Reason must be less than 500 characters')
});

const UpdateBudgetModal: React.FC<UpdateBudgetModalProps> = ({
  open,
  onClose,
  project,
  onSuccess
}) => {
  const [submitError, setSubmitError] = useState<string>('');
  const updateBudgetMutation = useUpdateProjectBudget();

  const formik = useFormik<UpdateBudgetRequest>({
    initialValues: {
      allocatedBudget: project.allocatedBudget,
      reason: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      setSubmitError('');
      
      try {
        await updateBudgetMutation.mutateAsync({
          projectId: project.id,
          data: values
        });

        if (onSuccess) {
          onSuccess();
        }
        onClose();
      } catch (error: any) {
        setSubmitError(error.response?.data?.message || 'Failed to update budget');
      }
    }
  });

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      formik.resetForm({
        values: {
          allocatedBudget: project.allocatedBudget,
          reason: ''
        }
      });
      setSubmitError('');
    }
  }, [open, project.allocatedBudget]);

  const handleClose = () => {
    if (!updateBudgetMutation.isPending) {
      formik.resetForm();
      setSubmitError('');
      onClose();
    }
  };

  const formatCurrency = (amount: number, currency: string = 'SAR') => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const budgetDifference = formik.values.allocatedBudget - project.allocatedBudget;
  const newUtilization = formik.values.allocatedBudget > 0 
    ? (project.usedBudget / formik.values.allocatedBudget) * 100
    : 0;

  const getBudgetChangeColor = () => {
    if (budgetDifference > 0) return 'success';
    if (budgetDifference < 0) return 'error';
    return 'default';
  };

  const getBudgetChangeIcon = () => {
    if (budgetDifference > 0) return <TrendingUpIcon />;
    if (budgetDifference < 0) return <WarningIcon />;
    return <BudgetIcon />;
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: 500 }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <BudgetIcon color="primary" />
          <Box>
            <Typography variant="h6">Update Project Budget</Typography>
            <Typography variant="body2" color="text.secondary">
              {project.name}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          {submitError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {submitError}
            </Alert>
          )}

          {/* Current Budget Overview */}
          <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
              Current Budget Status
            </Typography>
            
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Box textAlign="center">
                <Typography variant="caption" color="text.secondary">
                  Allocated Budget
                </Typography>
                <Typography variant="h6" color="primary">
                  {formatCurrency(project.allocatedBudget, project.currency)}
                </Typography>
              </Box>
              
              <Box textAlign="center">
                <Typography variant="caption" color="text.secondary">
                  Used Budget
                </Typography>
                <Typography variant="h6" color={project.usedBudget > project.allocatedBudget ? 'error' : 'text.primary'}>
                  {formatCurrency(project.usedBudget, project.currency)}
                </Typography>
              </Box>
              
              <Box textAlign="center">
                <Typography variant="caption" color="text.secondary">
                  Remaining Budget
                </Typography>
                <Typography variant="h6" color={project.remainingBudget < 0 ? 'error' : 'success'}>
                  {formatCurrency(project.remainingBudget, project.currency)}
                </Typography>
              </Box>
              
              <Box textAlign="center">
                <Typography variant="caption" color="text.secondary">
                  Utilization
                </Typography>
                <Typography variant="h6" color={project.budgetUtilization > 100 ? 'error' : 'info'}>
                  {project.budgetUtilization.toFixed(1)}%
                </Typography>
              </Box>
            </Box>

            {project.isOverBudget && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Project is currently over budget by {formatCurrency(project.usedBudget - project.allocatedBudget, project.currency)}
              </Alert>
            )}
          </Paper>

          {/* New Budget Input */}
          <Box mb={3}>
            <TextField
              fullWidth
              label="New Allocated Budget"
              name="allocatedBudget"
              type="number"
              value={formik.values.allocatedBudget}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.allocatedBudget && Boolean(formik.errors.allocatedBudget)}
              helperText={formik.touched.allocatedBudget && formik.errors.allocatedBudget}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BudgetIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    {project.currency}
                  </InputAdornment>
                )
              }}
              disabled={updateBudgetMutation.isPending}
            />
          </Box>

          {/* Budget Change Preview */}
          {budgetDifference !== 0 && (
            <Paper variant="outlined" sx={{ p: 3, mb: 3, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" gutterBottom>
                Budget Change Preview
              </Typography>
              
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                {getBudgetChangeIcon()}
                <Box>
                  <Typography variant="body2">
                    <strong>Change:</strong> {budgetDifference > 0 ? '+' : ''}{formatCurrency(budgetDifference, project.currency)}
                  </Typography>
                  <Chip 
                    label={budgetDifference > 0 ? 'Budget Increase' : 'Budget Decrease'} 
                    color={getBudgetChangeColor() as any}
                    size="small"
                  />
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box display="flex" justifyContent="space-between">
                <Box textAlign="center">
                  <Typography variant="caption" color="text.secondary">
                    New Utilization
                  </Typography>
                  <Typography variant="body2" fontWeight="medium" color={newUtilization > 100 ? 'error' : 'info'}>
                    {newUtilization.toFixed(1)}%
                  </Typography>
                </Box>
                
                <Box textAlign="center">
                  <Typography variant="caption" color="text.secondary">
                    New Remaining
                  </Typography>
                  <Typography 
                    variant="body2" 
                    fontWeight="medium"
                    color={formik.values.allocatedBudget - project.usedBudget < 0 ? 'error' : 'success'}
                  >
                    {formatCurrency(formik.values.allocatedBudget - project.usedBudget, project.currency)}
                  </Typography>
                </Box>
              </Box>

              {/* Warnings */}
              {formik.values.allocatedBudget < project.usedBudget && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Warning:</strong> New budget is less than already spent amount. 
                    This will put the project over budget.
                  </Typography>
                </Alert>
              )}

              {budgetDifference < 0 && formik.values.allocatedBudget >= project.usedBudget && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Budget reduction will be applied. Ensure no pending expenses exceed the new limit.
                </Alert>
              )}
            </Paper>
          )}

          {/* Reason for Change */}
          <TextField
            fullWidth
            label="Reason for Budget Change"
            name="reason"
            multiline
            rows={3}
            value={formik.values.reason}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.reason && Boolean(formik.errors.reason)}
            helperText={
              formik.touched.reason && formik.errors.reason ||
              'Please provide a brief explanation for this budget change'
            }
            placeholder="e.g., Additional scope requirements, cost optimization, market changes..."
            disabled={updateBudgetMutation.isPending}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={handleClose}
            disabled={updateBudgetMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={updateBudgetMutation.isPending || !formik.isValid}
            startIcon={updateBudgetMutation.isPending ? <CircularProgress size={16} /> : <BudgetIcon />}
          >
            {updateBudgetMutation.isPending ? 'Updating...' : 'Update Budget'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default UpdateBudgetModal;