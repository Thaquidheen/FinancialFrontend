// src/components/quotations/forms/QuotationBasicInfo.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  FormHelperText,
  Autocomplete,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Currency } from '@/types/quotation';
import { Project } from '@/types/project';
import { useMyProjects } from '@hooks/useProject';

interface QuotationBasicInfoProps {
  projectId: number | null;
  description: string;
  currency: Currency;
  dueDate?: string;
  errors: Record<string, string>;
  onProjectChange: (projectId: number | null) => void;
  onDescriptionChange: (description: string) => void;
  onCurrencyChange: (currency: Currency) => void;
  onDueDateChange?: (dueDate: string | null) => void;
}

const QuotationBasicInfo: React.FC<QuotationBasicInfoProps> = ({
  projectId,
  description,
  currency,
  dueDate,
  errors,
  onProjectChange,
  onDescriptionChange,
  onCurrencyChange,
  onDueDateChange
}) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [dueDateValue, setDueDateValue] = useState<Date | null>(null);

  // Fetch user's projects
  const { data: projectsResponse, isLoading: projectsLoading, error: projectsError } = useMyProjects();
  // Handle both wrapped and unwrapped responses
  const projects = Array.isArray(projectsResponse) 
    ? projectsResponse 
    : (projectsResponse?.data ?? []);

  // Debug logging
  useEffect(() => {
    console.log('Projects Debug:', {
      projectsResponse,
      projects,
      projectsLoading,
      projectsError,
      projectsLength: projects.length,
      projectsResponseType: typeof projectsResponse,
      isProjectsResponseArray: Array.isArray(projectsResponse),
      projectsResponseKeys: projectsResponse && typeof projectsResponse === 'object' ? Object.keys(projectsResponse) : null,
      projectsResponseData: projectsResponse?.data,
      projectsResponseDataType: typeof projectsResponse?.data,
      projectsResponseDataLength: Array.isArray(projectsResponse?.data) ? projectsResponse.data.length : 'not array',
      firstProject: Array.isArray(projects) && projects.length > 0 ? projects[0] : null
    });
  }, [projectsResponse, projects, projectsLoading, projectsError]);

  // Initialize selected project when projectId changes
  useEffect(() => {
    if (projectId && projects.length > 0) {
      const project = projects.find((p: Project) => p.id === projectId);
      setSelectedProject(project || null);
    } else if (!projectId) {
      setSelectedProject(null);
    }
  }, [projectId, projects]);

  // Initialize due date
  useEffect(() => {
    if (dueDate) {
      setDueDateValue(new Date(dueDate));
    }
  }, [dueDate]);

  const handleProjectChange = (_event: any, newValue: Project | null) => {
    setSelectedProject(newValue);
    onProjectChange(newValue?.id || null);
  };

  const handleDueDateChange = (date: Date | null) => {
    setDueDateValue(date);
    onDueDateChange?.(date ? date.toISOString().split('T')[0] : null);
  };

  const currencyOptions = Object.values(Currency);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
          Basic Information
        </Typography>

        {/* Project Selection */}
        <Box sx={{ mb: 3 }}>
          <Autocomplete
            value={selectedProject}
            onChange={handleProjectChange}
            options={projects}
            getOptionLabel={(option) => {
              console.log('getOptionLabel called with:', option);
              console.log('Project properties:', {
                id: option.id,
                name: option.name,
                allocatedBudget: option.allocatedBudget,
                usedBudget: option.usedBudget,
                remainingBudget: option.remainingBudget,
                currency: option.currency,
                managerName: option.managerName
              });
              return `${option.name} (${option.id})`;
            }}
            isOptionEqualToValue={(option, value) => {
              console.log('isOptionEqualToValue called with:', { option, value });
              return option.id === value.id;
            }}
            loading={projectsLoading}
            disabled={projectsLoading}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Project *"
                error={!!errors.projectId}
                helperText={errors.projectId || 'Choose the project for this quotation'}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {projectsLoading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            renderOption={(props, option) => {
              const { key, ...otherProps } = props;
              return (
                <Box component="li" key={key} {...otherProps}>
                <Box>
                  <Typography variant="body1" fontWeight="medium">
                    {option.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ID: {option.id} • {option.managerName || 'No Manager'} • {(option.allocatedBudget || 0).toLocaleString()} {option.currency}
                  </Typography>
                  {option.description && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      {option.description}
                    </Typography>
                  )}
                </Box>
              </Box>
              );
            }}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={option.id}
                  label={`${option.name} (${option.id})`}
                  size="small"
                />
              ))
            }
          />
          
          {!!projectsError && (
            <Alert severity="error" sx={{ mt: 1 }}>
              Failed to load projects. Please try again.
            </Alert>
          )}
        </Box>

        {/* Project Details Display */}
        {selectedProject && (
          <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Project Details
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Manager: {selectedProject.managerName || 'No Manager'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Status: {selectedProject.status}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Budget: {(selectedProject.allocatedBudget || 0).toLocaleString()} {selectedProject.currency}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Used: {(selectedProject.usedBudget || 0).toLocaleString()} {selectedProject.currency}
                </Typography>
              </Box>
            </Box>
            {(selectedProject.remainingBudget || 0) < 0 && (
              <Alert severity="warning" sx={{ mt: 1 }}>
                This project has exceeded its budget by {Math.abs(selectedProject.remainingBudget || 0).toLocaleString()} {selectedProject.currency}
              </Alert>
            )}
          </Box>
        )}

        {/* Description */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Description *"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            error={!!errors.description}
            helperText={errors.description || 'Provide a detailed description of the quotation (minimum 10 characters)'}
            placeholder="Enter a comprehensive description of what this quotation covers..."
            inputProps={{
              maxLength: 1000
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            {description.length}/1000 characters
          </Typography>
        </Box>

        {/* Currency and Due Date Row */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 3 }}>
          {/* Currency */}
          <FormControl fullWidth error={!!errors.currency}>
            <InputLabel>Currency *</InputLabel>
            <Select
              value={currency}
              onChange={(e) => onCurrencyChange(e.target.value as Currency)}
              label="Currency *"
            >
              {currencyOptions.map((curr) => (
                <MenuItem key={curr} value={curr}>
                  {curr}
                </MenuItem>
              ))}
            </Select>
            {errors.currency && <FormHelperText>{errors.currency}</FormHelperText>}
          </FormControl>

          {/* Due Date */}
          <DatePicker
            label="Due Date (Optional)"
            value={dueDateValue}
            onChange={handleDueDateChange}
            slotProps={{
              textField: {
                fullWidth: true,
                helperText: 'Set a deadline for this quotation'
              }
            }}
            minDate={new Date()}
          />
        </Box>

        {/* Summary */}
        {selectedProject && description && (
          <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.50', borderRadius: 1, border: '1px solid', borderColor: 'primary.200' }}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              Quotation Summary
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You are creating a quotation for <strong>{selectedProject.name}</strong> in <strong>{currency}</strong> currency.
              {dueDateValue && (
                <> The quotation is due on <strong>{dueDateValue.toLocaleDateString()}</strong>.</>
              )}
            </Typography>
          </Box>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default QuotationBasicInfo;
