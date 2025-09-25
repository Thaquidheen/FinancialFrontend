// src/components/projects/ProjectForm.tsx
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  Divider,
  Alert,
  CircularProgress,
  InputAdornment,
  Autocomplete
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  AccountBalance as BudgetIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectFormData,
  CURRENCY_OPTIONS
} from '../../types/project';
import { useCreateProject, useUpdateProject } from '@hooks/useProject';
import { useUsers } from '@hooks/useUser';
import { USER_ROLES } from '../../types/auth';

interface ProjectFormProps {
  project?: Project | null;
  onSuccess?: (project: Project) => void;
  onCancel?: () => void;
  mode?: 'create' | 'edit';
}

const validationSchema = Yup.object({
  name: Yup.string()
    .required('Project name is required')
    .min(3, 'Project name must be at least 3 characters')
    .max(100, 'Project name cannot exceed 100 characters'),
  description: Yup.string()
    .max(500, 'Description cannot exceed 500 characters'),
  location: Yup.string()
    .max(100, 'Location cannot exceed 100 characters'),
  allocatedBudget: Yup.number()
    .required('Budget is required')
    .min(0, 'Budget must be positive')
    .max(999999999, 'Budget amount is too large'),
  currency: Yup.string()
    .required('Currency is required')
    .oneOf(['SAR', 'USD', 'EUR'], 'Invalid currency'),
  managerId: Yup.number()
    .nullable()
    .min(1, 'Please select a valid manager'),
  startDate: Yup.date()
    .nullable()
    .min(new Date(), 'Start date cannot be in the past'),
  endDate: Yup.date()
    .nullable()
    .when('startDate', (startDate, schema) => {
      if (startDate && startDate.length > 0) {
        return schema.min(startDate[0], 'End date must be after start date');
      }
      return schema;
    })
});

const ProjectForm: React.FC<ProjectFormProps> = ({
  project,
  onSuccess,
  onCancel,
  mode = project ? 'edit' : 'create'
}) => {
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  
  // Get project managers for assignment
  const { data: usersData, isLoading: usersLoading } = useUsers({
    roles: [USER_ROLES.PROJECT_MANAGER],
    active: true,
    size: 100
  });

  const managers = usersData?.data?.content || [];

  const formik = useFormik<ProjectFormData>({
    initialValues: {
      name: project?.name || '',
      description: project?.description || '',
      location: project?.location || '',
      allocatedBudget: project?.allocatedBudget?.toString() || '',
      currency: project?.currency || 'SAR',
      startDate: project?.startDate || null,
      endDate: project?.endDate || null,
      managerId: project?.managerId?.toString() || ''
    },
    validationSchema,
    onSubmit: async (values: ProjectFormData) => {
      setSubmitError(null);
      
      try {
        const projectData: CreateProjectRequest | UpdateProjectRequest = {
          name: values.name,
          description: values.description || undefined,
          location: values.location || undefined,
          allocatedBudget: parseFloat(values.allocatedBudget),
          currency: values.currency,
          startDate: values.startDate || undefined,
          endDate: values.endDate || undefined,
          managerId: values.managerId ? parseInt(values.managerId) : undefined
        };

        let result;
        if (mode === 'create') {
          result = await createProject.mutateAsync(projectData as CreateProjectRequest);
        } else if (project) {
          result = await updateProject.mutateAsync({
            projectId: project.id,
            data: projectData as UpdateProjectRequest
          });
        }

        if (result?.data && onSuccess) {
          onSuccess(result.data);
        }
      } catch (error: any) {
        setSubmitError(
          error.response?.data?.message || 
          `Failed to ${mode} project. Please try again.`
        );
      }
    }
  });

  const isLoading = createProject.isPending || updateProject.isPending;

  const formatBudgetInput = (value: string) => {
    // Remove non-numeric characters except decimal point
    const numericValue = value.replace(/[^\d.]/g, '');
    // Ensure only one decimal point
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    return numericValue;
  };

  const handleBudgetChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatBudgetInput(event.target.value);
    formik.setFieldValue('allocatedBudget', formatted);
  };

  const selectedManager = managers.find((m: any) => m.id === parseInt(formik.values.managerId));

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Card>
        <CardHeader
          title={
            <Typography variant="h6" component="h2">
              {mode === 'create' ? 'Create New Project' : 'Edit Project'}
            </Typography>
          }
          subheader={
            mode === 'edit' && project ? `Project ID: ${project.id}` : undefined
          }
        />
        
        <form onSubmit={formik.handleSubmit}>
          <CardContent>
            {submitError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {submitError}
              </Alert>
            )}

            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                  Basic Information
                </Typography>
              </Grid>

              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  label="Project Name"
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                  required
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Location"
                  name="location"
                  value={formik.values.location}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.location && Boolean(formik.errors.location)}
                  helperText={formik.touched.location && formik.errors.location}
                  placeholder="e.g., Riyadh, Jeddah"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.description && Boolean(formik.errors.description)}
                  helperText={formik.touched.description && formik.errors.description}
                  multiline
                  rows={3}
                  placeholder="Project description, objectives, and scope"
                />
              </Grid>

              <Grid item xs={12}>
                <Divider />
              </Grid>

              {/* Budget Information */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                  Budget Information
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Allocated Budget"
                  name="allocatedBudget"
                  value={formik.values.allocatedBudget}
                  onChange={handleBudgetChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.allocatedBudget && Boolean(formik.errors.allocatedBudget)}
                  helperText={formik.touched.allocatedBudget && formik.errors.allocatedBudget}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BudgetIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        {formik.values.currency}
                      </InputAdornment>
                    )
                  }}
                  placeholder="0.00"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Currency</InputLabel>
                  <Select
                    name="currency"
                    value={formik.values.currency}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.currency && Boolean(formik.errors.currency)}
                    label="Currency"
                  >
                    {CURRENCY_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Divider />
              </Grid>

              {/* Timeline */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                  Timeline
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Start Date"
                  value={formik.values.startDate ? new Date(formik.values.startDate) : null}
                  onChange={(date) => formik.setFieldValue('startDate', date?.toISOString() || null)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: formik.touched.startDate && Boolean(formik.errors.startDate),
                      helperText: formik.touched.startDate && formik.errors.startDate
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <DatePicker
                  label="End Date"
                  value={formik.values.endDate ? new Date(formik.values.endDate) : null}
                  onChange={(date) => formik.setFieldValue('endDate', date?.toISOString() || null)}
                  minDate={formik.values.startDate ? new Date(formik.values.startDate) : undefined}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: formik.touched.endDate && Boolean(formik.errors.endDate),
                      helperText: formik.touched.endDate && formik.errors.endDate
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Divider />
              </Grid>

              {/* Project Manager Assignment */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                  Project Manager
                </Typography>
              </Grid>

              <Grid item xs={12} md={8}>
                <Autocomplete
                  loading={usersLoading}
                  options={managers}
                  getOptionLabel={(option) => `${option.fullName} (${option.email})`}
                  value={selectedManager || null}
                  onChange={(_, newValue) => {
                    formik.setFieldValue('managerId', newValue?.id.toString() || '');
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Assign Project Manager"
                      error={formik.touched.managerId && Boolean(formik.errors.managerId)}
                      helperText={
                        formik.touched.managerId && formik.errors.managerId ||
                        'Optional: You can assign a project manager now or later'
                      }
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {usersLoading ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        )
                      }}
                    />
                  )}
                  renderOption={(props, option: any) => (
                    <Box component="li" {...props}>
                      <Box>
                        <Typography variant="body2">
                          {option.fullName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.email} • {option.department}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  noOptionsText="No project managers available"
                />
              </Grid>

              {selectedManager && (
                <Grid item xs={12} md={4}>
                  <Alert severity="info">
                    <Typography variant="body2">
                      <strong>{selectedManager.fullName}</strong> will be assigned as the project manager.
                    </Typography>
                  </Alert>
                </Grid>
              )}
            </Grid>
          </CardContent>

          <CardActions sx={{ justifyContent: 'flex-end', px: 3, pb: 3 }}>
            <Button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              startIcon={<CancelIcon />}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={16} /> : <SaveIcon />}
            >
              {isLoading 
                ? `${mode === 'create' ? 'Creating' : 'Updating'}...`
                : `${mode === 'create' ? 'Create Project' : 'Update Project'}`
              }
            </Button>
          </CardActions>
        </form>
      </Card>
    </LocalizationProvider>
  );
};

export default ProjectForm;