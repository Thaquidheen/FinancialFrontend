// src/components/projects/UpdateStatusModal.tsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  Typography,
  Alert,
  Chip,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import {
  Project,
  ProjectStatus,
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_COLORS,
  UpdateStatusRequest
} from '../../types/project';
import { useUpdateProjectStatus } from '@hooks/useProject';

interface UpdateStatusModalProps {
  open: boolean;
  project: Project | null;
  onClose: () => void;
  onSuccess?: (project: Project) => void;
}

// Status transition rules
const STATUS_TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
  [ProjectStatus.DRAFT]: [ProjectStatus.PLANNING, ProjectStatus.ACTIVE, ProjectStatus.CANCELLED],
  [ProjectStatus.PLANNING]: [ProjectStatus.ACTIVE, ProjectStatus.ON_HOLD, ProjectStatus.CANCELLED],
  [ProjectStatus.ACTIVE]: [ProjectStatus.ON_HOLD, ProjectStatus.COMPLETED, ProjectStatus.CANCELLED],
  [ProjectStatus.ON_HOLD]: [ProjectStatus.ACTIVE, ProjectStatus.CANCELLED],
  [ProjectStatus.COMPLETED]: [], // Cannot change from completed
  [ProjectStatus.CANCELLED]: [ProjectStatus.DRAFT, ProjectStatus.PLANNING] // Can reactivate
};

const STATUS_DESCRIPTIONS: Record<ProjectStatus, string> = {
  [ProjectStatus.DRAFT]: 'Project is in draft state and not yet approved',
  [ProjectStatus.PLANNING]: 'Project is approved and in planning phase',
  [ProjectStatus.ACTIVE]: 'Project is actively being worked on',
  [ProjectStatus.ON_HOLD]: 'Project is temporarily paused',
  [ProjectStatus.COMPLETED]: 'Project has been completed successfully',
  [ProjectStatus.CANCELLED]: 'Project has been cancelled'
};

const UpdateStatusModal: React.FC<UpdateStatusModalProps> = ({
  open,
  project,
  onClose,
  onSuccess
}) => {
  const [selectedStatus, setSelectedStatus] = useState<ProjectStatus | ''>('');
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateStatusMutation = useUpdateProjectStatus();

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (open && project) {
      setSelectedStatus('');
      setReason('');
      setErrors({});
    }
  }, [open, project]);

  const getAvailableStatuses = (): ProjectStatus[] => {
    if (!project) return [];
    return STATUS_TRANSITIONS[project.status] || [];
  };

  const getStatusChangeImpact = (newStatus: ProjectStatus): string => {
    if (!project) return '';

    switch (newStatus) {
      case ProjectStatus.COMPLETED:
        return 'This will mark the project as completed and may affect budget calculations.';
      case ProjectStatus.CANCELLED:
        return 'This will cancel the project and may release allocated budget.';
      case ProjectStatus.ON_HOLD:
        return 'This will pause the project. Team members may be reassigned.';
      case ProjectStatus.ACTIVE:
        return project.status === ProjectStatus.ON_HOLD 
          ? 'This will resume the project and reactivate all workflows.'
          : 'This will activate the project and make it available for work.';
      default:
        return '';
    }
  };

  const isStatusChangeRestricted = (newStatus: ProjectStatus): boolean => {
    if (!project) return false;

    // Add business logic restrictions here
    if (newStatus === ProjectStatus.COMPLETED && project.budgetUtilization < 50) {
      return true; // Don't allow completion if less than 50% budget used
    }

    return false;
  };

  const getStatusRestrictionMessage = (newStatus: ProjectStatus): string => {
    if (newStatus === ProjectStatus.COMPLETED && project && project.budgetUtilization < 50) {
      return 'Cannot complete project with less than 50% budget utilization. Please review the project scope.';
    }
    return '';
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedStatus) {
      newErrors.status = 'Please select a new status';
    }

    if (selectedStatus && isStatusChangeRestricted(selectedStatus as ProjectStatus)) {
      newErrors.status = getStatusRestrictionMessage(selectedStatus as ProjectStatus);
    }

    // Require reason for critical status changes
    if (selectedStatus === ProjectStatus.CANCELLED || selectedStatus === ProjectStatus.COMPLETED) {
      if (!reason.trim()) {
        newErrors.reason = 'Reason is required for this status change';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!project || !validateForm()) return;

    const updateData: UpdateStatusRequest = {
      status: selectedStatus as ProjectStatus,
      reason: reason.trim() || undefined
    };

    try {
      await updateStatusMutation.mutateAsync({
        projectId: project.id,
        data: updateData
      });

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess({
          ...project,
          status: selectedStatus as ProjectStatus
        });
      }

      onClose();
    } catch (error) {
      console.error('Failed to update project status:', error);
      setErrors({
        submit: 'Failed to update project status. Please try again.'
      });
    }
  };

  const handleClose = () => {
    if (updateStatusMutation.isPending) return; // Prevent closing while loading
    onClose();
  };

  if (!project) return null;

  const availableStatuses = getAvailableStatuses();
  const hasAvailableStatuses = availableStatuses.length > 0;

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" component="div">
          Update Project Status
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {project.name}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {/* Current Status */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Current Status
          </Typography>
          <Chip
            label={PROJECT_STATUS_LABELS[project.status]}
            color={PROJECT_STATUS_COLORS[project.status]}
            size="medium"
            sx={{ fontWeight: 'medium' }}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Status Selection */}
        {hasAvailableStatuses ? (
          <>
            <FormControl fullWidth margin="normal" error={!!errors.status}>
              <InputLabel id="status-select-label">New Status</InputLabel>
              <Select
                labelId="status-select-label"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as ProjectStatus)}
                label="New Status"
                disabled={updateStatusMutation.isPending}
              >
                {availableStatuses.map((status) => (
                  <MenuItem 
                    key={status} 
                    value={status}
                    disabled={isStatusChangeRestricted(status)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={PROJECT_STATUS_LABELS[status]}
                        color={PROJECT_STATUS_COLORS[status]}
                        size="small"
                      />
                      {isStatusChangeRestricted(status) && (
                        <WarningIcon color="warning" fontSize="small" />
                      )}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              {errors.status && (
                <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                  {errors.status}
                </Typography>
              )}
            </FormControl>

            {/* Status Description */}
            {selectedStatus && (
              <Alert 
                severity="info" 
                sx={{ mt: 2 }}
                icon={<CheckCircleIcon />}
              >
                <Typography variant="body2">
                  {STATUS_DESCRIPTIONS[selectedStatus as ProjectStatus]}
                </Typography>
                {getStatusChangeImpact(selectedStatus as ProjectStatus) && (
                  <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                    <strong>Impact:</strong> {getStatusChangeImpact(selectedStatus as ProjectStatus)}
                  </Typography>
                )}
              </Alert>
            )}

            {/* Reason Field */}
            <TextField
              fullWidth
              margin="normal"
              label={
                (selectedStatus === ProjectStatus.CANCELLED || selectedStatus === ProjectStatus.COMPLETED)
                  ? "Reason (Required)"
                  : "Reason (Optional)"
              }
              multiline
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              error={!!errors.reason}
              helperText={errors.reason || "Provide additional context for this status change"}
              disabled={updateStatusMutation.isPending}
              placeholder="Enter reason for status change..."
            />

            {/* Submit Error */}
            {errors.submit && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {errors.submit}
              </Alert>
            )}
          </>
        ) : (
          <Alert 
            severity="info" 
            icon={<WarningIcon />}
          >
            No status changes are available for projects with "{PROJECT_STATUS_LABELS[project.status]}" status.
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={handleClose}
          disabled={updateStatusMutation.isPending}
          startIcon={<CancelIcon />}
        >
          Cancel
        </Button>
        
        {hasAvailableStatuses && (
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={updateStatusMutation.isPending || !selectedStatus}
            startIcon={
              updateStatusMutation.isPending 
                ? <CircularProgress size={16} /> 
                : <SaveIcon />
            }
          >
            {updateStatusMutation.isPending ? 'Updating...' : 'Update Status'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default UpdateStatusModal;