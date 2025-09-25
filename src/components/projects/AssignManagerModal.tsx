// src/components/projects/AssignManagerModal.tsx
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
  Typography,
  Box,
  Alert,
  CircularProgress,
  Avatar,
  Chip,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { Person as PersonIcon } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { Project, AssignManagerRequest } from '@/types/project';
import { useAssignManager } from '@/hooks/useProject';
import { userService } from '@/services/userService';

interface AssignManagerModalProps {
  open: boolean;
  onClose: () => void;
  project: Project;
  onSuccess?: () => void;
}

interface Manager {
  id: number;
  fullName: string;
  email: string;
  department?: string;
  position?: string;
}

const AssignManagerModal: React.FC<AssignManagerModalProps> = ({
  open,
  onClose,
  project,
  onSuccess
}) => {
  const [selectedManagerId, setSelectedManagerId] = useState<string>('');
  const [transferBudget, setTransferBudget] = useState(false);
  const [error, setError] = useState<string>('');

  const assignManagerMutation = useAssignManager();

  // Fetch available project managers
  const { data: managersData, isLoading: managersLoading, error: managersError } = useQuery({
    queryKey: ['users', 'project-managers'],
    queryFn: async () => {
      try {
        const response = await userService.getUsers({
          roles: ['PROJECT_MANAGER'],
          active: true,
          size: 100
        });
        return response.content || [];
      } catch (error) {
        console.error('Error fetching managers:', error);
        return [];
      }
    },
    enabled: open,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const managers: Manager[] = managersData || [];
  const selectedManager = managers.find(m => m.id === parseInt(selectedManagerId));

  const handleSubmit = async () => {
    if (!selectedManagerId) {
      setError('Please select a manager');
      return;
    }

    setError('');

    try {
      const assignData: AssignManagerRequest = {
        managerId: parseInt(selectedManagerId),
        transferBudget
      };

      await assignManagerMutation.mutateAsync({
        projectId: project.id,
        data: assignData
      });

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to assign manager');
    }
  };

  const handleClose = () => {
    if (!assignManagerMutation.isPending) {
      setSelectedManagerId('');
      setTransferBudget(false);
      setError('');
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { minHeight: 400 }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <PersonIcon color="primary" />
          <Box>
            <Typography variant="h6">Assign Project Manager</Typography>
            <Typography variant="body2" color="text.secondary">
              Project: {project.name}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {!!managersError && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            Unable to load managers. Please try again.
          </Alert>
        )}

        {/* Current Manager Info */}
        {project.managerName && (
          <Box mb={3}>
            <Typography variant="subtitle2" gutterBottom>
              Current Manager
            </Typography>
            <Box display="flex" alignItems="center" gap={2} p={2} bgcolor="grey.50" borderRadius={1}>
              <Avatar sx={{ width: 24, height: 24 }}>
                <PersonIcon />
              </Avatar>
              <Box>
                <Typography variant="body2" fontWeight="medium">
                  {project.managerName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {project.managerEmail || 'Manager'}
                </Typography>
              </Box>
              <Chip label="Current" color="info" size="small" />
            </Box>
          </Box>
        )}

        {/* Manager Selection */}
        <FormControl fullWidth margin="normal" disabled={managersLoading || assignManagerMutation.isPending}>
          <InputLabel>Select New Manager</InputLabel>
          <Select
            value={selectedManagerId}
            onChange={(e: SelectChangeEvent<string>) => setSelectedManagerId(e.target.value as string)}
            label="Select New Manager"
          >
            <MenuItem value="">
              <em>Choose a project manager</em>
            </MenuItem>
            {managers
              .filter(manager => manager.id !== project.managerId) // Don't show current manager
              .map((manager) => (
                <MenuItem key={manager.id} value={manager.id.toString()}>
                  <Box display="flex" alignItems="center" gap={2} width="100%">
                    <Avatar sx={{ width: 24, height: 24 }}>
                      <PersonIcon />
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="body2" fontWeight="medium">
                        {manager.fullName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {manager.email} • {manager.position || 'Project Manager'}
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
              ))}
          </Select>
        </FormControl>

        {managersLoading && (
          <Box display="flex" justifyContent="center" mt={2}>
            <CircularProgress size={24} />
            <Typography variant="body2" color="text.secondary" ml={2}>
              Loading managers...
            </Typography>
          </Box>
        )}

        {managers.length === 0 && !managersLoading && !managersError && (
          <Alert severity="info" sx={{ mt: 2 }}>
            No available project managers found.
          </Alert>
        )}

        {/* Selected Manager Preview */}
        {selectedManager && (
          <Box mt={3} p={2} bgcolor="success.50" borderRadius={1}>
            <Typography variant="subtitle2" gutterBottom>
              New Manager Assignment
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar>
                <PersonIcon />
              </Avatar>
              <Box>
                <Typography variant="body2" fontWeight="medium">
                  {selectedManager.fullName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedManager.email}
                </Typography>
                {selectedManager.department && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    Department: {selectedManager.department}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        )}

        {/* Transfer Budget Option */}
        {project.managerId && selectedManagerId && (
          <Box mt={3}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={transferBudget}
                  onChange={(e) => setTransferBudget(e.target.checked)}
                  disabled={assignManagerMutation.isPending}
                />
              }
              label={
                <Box>
                  <Typography variant="body2">
                    Transfer budget responsibility
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Allow the new manager to modify project budget
                  </Typography>
                </Box>
              }
            />
          </Box>
        )}

        {/* Warning for budget impact */}
        {project.isOverBudget && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Budget Warning:</strong> This project is currently over budget. 
              The new manager will inherit budget management responsibilities.
            </Typography>
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
          onClick={handleClose}
          disabled={assignManagerMutation.isPending}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!selectedManagerId || assignManagerMutation.isPending}
          startIcon={assignManagerMutation.isPending ? <CircularProgress size={16} /> : <PersonIcon />}
        >
          {assignManagerMutation.isPending ? 'Assigning...' : 'Assign Manager'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignManagerModal;