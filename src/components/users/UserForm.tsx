import React, { useEffect } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Typography,
  Divider,
  Alert,
  InputAdornment,
  Button,
  CircularProgress,
  Grid,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  SaudiBanks,
  VALIDATION_PATTERNS,
  VALIDATION_MESSAGES,
  Role,
} from '../../types/user';
import { useRoles } from '../../hooks/useUser';

interface UserFormProps {
  user?: User;
  onSubmit: (data: CreateUserRequest | UpdateUserRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  isEditMode?: boolean;
}

// Fixed validation schema with proper nested object structure
const createUserSchema = yup.object({
  username: yup
    .string()
    .required(VALIDATION_MESSAGES.REQUIRED)
    .min(3, VALIDATION_MESSAGES.USERNAME_MIN_LENGTH)
    .max(50, VALIDATION_MESSAGES.USERNAME_MAX_LENGTH)
    .matches(/^[a-zA-Z0-9._-]+$/, 'Username can only contain letters, numbers, dots, underscores, and hyphens'),
  
  email: yup
    .string()
    .required(VALIDATION_MESSAGES.REQUIRED)
    .email(VALIDATION_MESSAGES.EMAIL_INVALID),
  
  password: yup
    .string()
    .required(VALIDATION_MESSAGES.REQUIRED)
    .min(8, VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH)
    .matches(/^(?=.*[0-9])(?=.*[!@#$%^&*])/, VALIDATION_MESSAGES.PASSWORD_REQUIREMENTS),
  
  confirmPassword: yup
    .string()
    .required(VALIDATION_MESSAGES.REQUIRED)
    .oneOf([yup.ref('password')], 'Passwords must match'),
  
  fullName: yup
    .string()
    .required(VALIDATION_MESSAGES.REQUIRED)
    .min(2, 'Full name must be at least 2 characters'),
  
  phoneNumber: yup
    .string()
    .nullable()
    .optional()
    .transform((value) => (value === '' ? null : value))
    .matches(VALIDATION_PATTERNS.SAUDI_MOBILE, {
      message: VALIDATION_MESSAGES.PHONE_INVALID,
      excludeEmptyString: true,
    }),
  
  nationalId: yup
    .string()
    .nullable()
    .optional()
    .transform((value) => (value === '' ? null : value))
    .matches(VALIDATION_PATTERNS.SAUDI_NATIONAL_ID, {
      message: VALIDATION_MESSAGES.NATIONAL_ID_INVALID,
      excludeEmptyString: true,
    }),
  
  iqamaId: yup
    .string()
    .nullable()
    .optional()
    .transform((value) => (value === '' ? null : value))
    .matches(VALIDATION_PATTERNS.IQAMA_ID, {
      message: VALIDATION_MESSAGES.IQAMA_ID_INVALID,
      excludeEmptyString: true,
    }),
  
  passportNumber: yup
    .string()
    .nullable()
    .optional()
    .transform((value) => (value === '' ? null : value))
    .matches(VALIDATION_PATTERNS.PASSPORT, {
      message: VALIDATION_MESSAGES.PASSPORT_INVALID,
      excludeEmptyString: true,
    }),
  
  department: yup
    .string()
    .nullable()
    .optional()
    .max(50, 'Department must not exceed 50 characters'),
  
  position: yup
    .string()
    .nullable()
    .optional()
    .max(50, 'Position must not exceed 50 characters'),
  
  hireDate: yup
    .date()
    .nullable()
    .optional(),
  
  managerId: yup
    .number()
    .nullable()
    .optional()
    .transform((value) => (value === '' || isNaN(value) ? null : value)),
  
  roles: yup
    .array()
    .of(yup.string())
    .min(1, 'At least one role must be selected')
    .required('At least one role must be selected'),
  
  // Fixed nested bankDetails validation
  bankDetails: yup.object({
    bankName: yup
      .string()
      .nullable()
      .optional()
      .when(['accountNumber', 'iban', 'beneficiaryAddress'], {
        is: (accountNumber: any, iban: any, beneficiaryAddress: any) => 
          accountNumber || iban || beneficiaryAddress,
        then: (schema) => schema.required('Bank name is required when other bank details are provided'),
        otherwise: (schema) => schema.nullable(),
      }),
    
    accountNumber: yup
      .string()
      .nullable()
      .optional()
      .transform((value) => (value === '' ? null : value))
      .matches(/^[0-9]{10,20}$/, {
        message: VALIDATION_MESSAGES.ACCOUNT_NUMBER_INVALID,
        excludeEmptyString: true,
      }),
    
    iban: yup
      .string()
      .nullable()
      .optional()
      .transform((value) => (value === '' ? null : value))
      .matches(VALIDATION_PATTERNS.SAUDI_IBAN, {
        message: VALIDATION_MESSAGES.IBAN_INVALID,
        excludeEmptyString: true,
      }),
    
    beneficiaryAddress: yup
      .string()
      .nullable()
      .optional()
      .max(200, 'Beneficiary address must be less than 200 characters'),
  }).optional().nullable(),
});

const updateUserSchema = createUserSchema.omit(['password', 'confirmPassword']);

const UserForm: React.FC<UserFormProps> = ({
  user,
  onSubmit,
  onCancel,
  isLoading = false,
  isEditMode = false,
}) => {
  const [showPassword, setShowPassword] = React.useState(false);

  // Helper function to safely extract error messages
  const getErrorMessage = (error: any): string | undefined => {
    if (typeof error === 'string') return error;
    if (error?.message && typeof error.message === 'string') return error.message;
    return undefined;
  };

  const { data: roles = [] } = useRoles();
  const fallbackRoles: Role[] = [
    { id: 'SUPER_ADMIN', name: 'SUPER_ADMIN', displayName: 'Super Admin', description: '', permissions: [], isActive: true },
    { id: 'PROJECT_MANAGER', name: 'PROJECT_MANAGER', displayName: 'Project Manager', description: '', permissions: [], isActive: true },
    { id: 'ACCOUNT_MANAGER', name: 'ACCOUNT_MANAGER', displayName: 'Account Manager', description: '', permissions: [], isActive: true },
    { id: 'EMPLOYEE', name: 'EMPLOYEE', displayName: 'Employee', description: '', permissions: [], isActive: true },
  ];
  const availableRoles: Role[] = roles.length > 0 ? roles as Role[] : fallbackRoles;

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    clearErrors,
  } = useForm<any>({
    resolver: yupResolver(isEditMode ? updateUserSchema : createUserSchema),
    mode: 'onChange', // This will validate on change
    defaultValues: {
      username: user?.username || '',
      email: user?.email || '',
      password: '',
      confirmPassword: '',
      fullName: user?.fullName || '',
      phoneNumber: user?.phoneNumber || '',
      nationalId: user?.nationalId || '',
      iqamaId: user?.iqamaId || '',
      passportNumber: user?.passportNumber || '',
      department: user?.department || '',
      position: user?.position || '',
      hireDate: user?.hireDate ? new Date(user.hireDate) : null,
      managerId: user?.manager?.id || '',
      roles: user?.roles || [],
      bankDetails: {
        bankName: user?.bankDetails?.bankName || '',
        accountNumber: user?.bankDetails?.accountNumber || '',
        iban: user?.bankDetails?.iban || '',
        beneficiaryAddress: user?.bankDetails?.beneficiaryAddress || '',
      },
    },
  });

  // Reset form when user changes
  useEffect(() => {
    if (user) {
      reset({
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber || '',
        nationalId: user.nationalId || '',
        iqamaId: user.iqamaId || '',
        passportNumber: user.passportNumber || '',
        department: user.department || '',
        position: user.position || '',
        hireDate: user.hireDate ? new Date(user.hireDate) : null,
        managerId: user.manager?.id || '',
        roles: user.roles,
        bankDetails: {
          bankName: user.bankDetails?.bankName || '',
          accountNumber: user.bankDetails?.accountNumber || '',
          iban: user.bankDetails?.iban || '',
          beneficiaryAddress: user.bankDetails?.beneficiaryAddress || '',
        },
      });
      clearErrors(); // Clear any existing errors when resetting
    }
  }, [user, reset, clearErrors]);

  const handleFormSubmit = async (data: any) => {
    try {
      // Convert date to string format
      const formattedData = {
        ...data,
        hireDate: data.hireDate ? data.hireDate.toISOString().split('T')[0] : undefined,
        managerId: data.managerId ? Number(data.managerId) : undefined,
        // Only include bankDetails if at least one field is filled
        bankDetails: (data.bankDetails?.bankName || data.bankDetails?.accountNumber || 
                    data.bankDetails?.iban || data.bankDetails?.beneficiaryAddress) 
                    ? data.bankDetails : undefined,
      };
      
      console.log('CreateUser submit payload:', formattedData);
      await onSubmit(formattedData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const saudiBankOptions = Object.values(SaudiBanks);

  // Function to check if there are any actual validation errors
  const hasValidationErrors = () => {
    const errorKeys = Object.keys(errors);
    return errorKeys.length > 0 && errorKeys.some(key => {
      const error = errors[key];
      return error && (error.message || typeof error === 'string');
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} sx={{ mt: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Basic Information */}
          <Box>
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{ 
                color: '#1a202c',
                fontWeight: 600,
                fontSize: '1.125rem'
              }}
            >
              Basic Information
            </Typography>
            <Divider sx={{ mb: 2, borderColor: '#e2e8f0' }} />
          </Box>

          {/* Basic Information Grid */}
          <Grid container spacing={2}>
          
          {/* Username */}
          <Grid item xs={12} md={6}>
            <Controller
              name="username"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Username"
                  fullWidth
                  required
                  error={!!errors.username}
                  helperText={getErrorMessage(errors.username)}
                  disabled={isEditMode} // Username cannot be changed
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: '#ffffff',
                      borderColor: '#d1d5db',
                      borderRadius: '8px',
                      '&:hover': {
                        borderColor: '#9ca3af',
                      },
                      '&.Mui-focused': {
                        borderColor: '#3b82f6',
                        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                      }
                    },
                    '& .MuiInputBase-input': {
                      color: '#374151',
                      fontSize: '0.875rem',
                    },
                    '& .MuiInputLabel-root': {
                      color: '#64748b',
                      fontSize: '0.875rem',
                    }
                  }}
                />
              )}
            />
          </Grid>

          {/* Email */}
          <Grid item xs={12} md={6}>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Email Address"
                  type="email"
                  fullWidth
                  required
                  error={!!errors.email}
                  helperText={getErrorMessage(errors.email)}
                />
              )}
            />
          </Grid>

          {/* Password fields (only for create mode) */}
          {!isEditMode && (
            <>
              <Grid item xs={12} md={6}>
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      fullWidth
                      required
                      error={!!errors.password}
                      helperText={getErrorMessage(errors.password)}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="confirmPassword"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Confirm Password"
                      type={showPassword ? 'text' : 'password'}
                      fullWidth
                      required
                      error={!!errors.confirmPassword}
                      helperText={getErrorMessage(errors.confirmPassword)}
                    />
                  )}
                />
              </Grid>
            </>
          )}

          {/* Full Name */}
          <Grid item xs={12} md={6}>
            <Controller
              name="fullName"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Full Name"
                  fullWidth
                  required
                  error={!!errors.fullName}
                  helperText={getErrorMessage(errors.fullName)}
                />
              )}
            />
          </Grid>

          {/* Phone Number */}
          <Grid item xs={12} md={6}>
            <Controller
              name="phoneNumber"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Phone Number"
                  fullWidth
                  error={!!errors.phoneNumber}
                  helperText={getErrorMessage(errors.phoneNumber) || 'Saudi mobile format: 05XXXXXXXX'}
                  placeholder="05XXXXXXXX"
                />
              )}
            />
          </Grid>

          </Grid>

          {/* Saudi-specific Information */}
          <Box>
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                mt: 2,
                color: '#1a202c',
                fontWeight: 600,
                fontSize: '1.125rem'
              }}
            >
              Saudi-specific Information
            </Typography>
            <Divider sx={{ mb: 2, borderColor: '#e2e8f0' }} />
          </Box>

          <Grid container spacing={2}>
          {/* National ID */}
          <Grid item xs={12} md={4}>
            <Controller
              name="nationalId"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="National ID (Saudi)"
                  fullWidth
                  error={!!errors.nationalId}
                  helperText={getErrorMessage(errors.nationalId) || 'For Saudi nationals only'}
                  placeholder="1XXXXXXXXX or 2XXXXXXXXX"
                />
              )}
            />
          </Grid>

          {/* Iqama ID */}
          <Grid item xs={12} md={4}>
            <Controller
              name="iqamaId"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Iqama ID"
                  fullWidth
                  error={!!errors.iqamaId}
                  helperText={getErrorMessage(errors.iqamaId) || 'For expatriates working in Saudi'}
                  placeholder="1XXXXXXXXX or 2XXXXXXXXX"
                />
              )}
            />
          </Grid>

          {/* Passport Number */}
          <Grid item xs={12} md={4}>
            <Controller
              name="passportNumber"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Passport Number"
                  fullWidth
                  error={!!errors.passportNumber}
                  helperText={getErrorMessage(errors.passportNumber)}
                  placeholder="A12345678"
                />
              )}
            />
          </Grid>
          </Grid>

          {/* Employment Information */}
          <Box>
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                mt: 2,
                color: '#1a202c',
                fontWeight: 600,
                fontSize: '1.125rem'
              }}
            >
              Employment Information
            </Typography>
            <Divider sx={{ mb: 2, borderColor: '#e2e8f0' }} />
          </Box>

          <Grid container spacing={2}>
          {/* Department (free text) */}
          <Grid item xs={12} md={6}>
            <Controller
              name="department"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Department"
                  fullWidth
                  error={!!errors.department}
                  helperText={getErrorMessage(errors.department)}
                />
              )}
            />
          </Grid>

          {/* Position */}
          <Grid item xs={12} md={6}>
            <Controller
              name="position"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Position/Job Title"
                  fullWidth
                  error={!!errors.position}
                  helperText={getErrorMessage(errors.position)}
                />
              )}
            />
          </Grid>

          {/* Hire Date */}
          <Grid item xs={12} md={6}>
            <Controller
              name="hireDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  {...field}
                  label="Hire Date"
                  maxDate={new Date()}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.hireDate,
                      helperText: getErrorMessage(errors.hireDate),
                    },
                  }}
                />
              )}
            />
          </Grid>

          {/* Manager ID (numeric) */}
          <Grid item xs={12} md={6}>
            <Controller
              name="managerId"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Manager ID"
                  type="number"
                  fullWidth
                  error={!!errors.managerId}
                  helperText={getErrorMessage(errors.managerId)}
                />
              )}
            />
          </Grid>
          </Grid>

          {/* Role Assignment */}
          <Box>
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                mt: 2,
                color: '#1a202c',
                fontWeight: 600,
                fontSize: '1.125rem'
              }}
            >
              Role Assignment
            </Typography>
            <Divider sx={{ mb: 2, borderColor: '#e2e8f0' }} />
          </Box>

          <Box>
            <Controller
              name="roles"
              control={control}
              render={({ field }) => (
                <FormControl error={!!errors.roles} fullWidth>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Select User Roles *
                  </Typography>
                  <FormGroup row>
                    {availableRoles.map((role: Role) => (
                      <FormControlLabel
                        key={role.id}
                        control={
                          <Checkbox
                            checked={field.value?.includes(role.name) || false}
                            onChange={(e) => {
                              const currentRoles = field.value || [];
                              if (e.target.checked) {
                                field.onChange([...currentRoles, role.name]);
                              } else {
                                field.onChange(currentRoles.filter((r: string) => r !== role.name));
                              }
                            }}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {role.displayName || role.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {role.description}
                            </Typography>
                          </Box>
                        }
                      />
                    ))}
                  </FormGroup>
                  {errors.roles && (
                    <Typography variant="caption" color="error">
                      {getErrorMessage(errors.roles)}
                    </Typography>
                  )}
                </FormControl>
              )}
            />
          </Box>

          {/* Bank Details */}
          <Box>
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                mt: 2,
                color: '#1a202c',
                fontWeight: 600,
                fontSize: '1.125rem'
              }}
            >
              Bank Details
            </Typography>
            <Divider sx={{ mb: 2, borderColor: '#e2e8f0' }} />
          </Box>

          <Grid container spacing={2}>
          {/* Bank Name */}
          <Grid item xs={12} md={6}>
            <Controller
              name="bankDetails.bankName"
              control={control}
              render={({ field }) => (
                 <FormControl fullWidth error={!!(errors.bankDetails as any)?.bankName}>
                  <InputLabel>Bank Name</InputLabel>
                  <Select
                    {...field}
                    label="Bank Name"
                    displayEmpty
                  >
                    <MenuItem value="">
                      <em>Select Bank</em>
                    </MenuItem>
                    {saudiBankOptions.map((bank) => (
                      <MenuItem key={bank} value={bank}>
                        {bank}
                      </MenuItem>
                    ))}
                  </Select>
                   {(errors.bankDetails as any)?.bankName && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                       {getErrorMessage((errors.bankDetails as any).bankName)}
                    </Typography>
                  )}
                </FormControl>
              )}
            />
          </Grid>

          {/* Account Number */}
          <Grid item xs={12} md={6}>
            <Controller
              name="bankDetails.accountNumber"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Account Number"
                  fullWidth
                  error={!!(errors.bankDetails as any)?.accountNumber}
                  helperText={getErrorMessage((errors.bankDetails as any)?.accountNumber)}
                />
              )}
            />
          </Grid>

          {/* IBAN */}
          <Grid item xs={12} md={6}>
            <Controller
              name="bankDetails.iban"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="IBAN"
                  fullWidth
                  error={!!(errors.bankDetails as any)?.iban}
                  helperText={getErrorMessage((errors.bankDetails as any)?.iban) || 'Saudi IBAN format: SA1234567890123456789012'}
                  placeholder="SA1234567890123456789012"
                />
              )}
            />
          </Grid>

          {/* Beneficiary Address */}
          <Grid item xs={12}>
            <Controller
              name="bankDetails.beneficiaryAddress"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Beneficiary Address"
                  fullWidth
                  multiline
                  rows={2}
                  error={!!(errors.bankDetails as any)?.beneficiaryAddress}
                  helperText={getErrorMessage((errors.bankDetails as any)?.beneficiaryAddress)}
                />
              )}
            />
          </Grid>
          </Grid>

          {/* Form Actions */}
          <Box>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
              <Button
                variant="outlined"
                onClick={onCancel}
                disabled={isSubmitting}
                sx={{
                  borderColor: '#d1d5db',
                  color: '#374151',
                  borderRadius: '8px',
                  fontWeight: 500,
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
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting || isLoading}
                startIcon={isSubmitting || isLoading ? <CircularProgress size={20} /> : undefined}
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
                {isEditMode ? 'Update User' : 'Create User'}
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Validation Summary - Fixed condition */}
        {hasValidationErrors() && (
          <Alert 
            severity="error" 
            sx={{ 
              mt: 2,
              borderRadius: '12px',
              border: '1px solid #fecaca',
              bgcolor: '#fef2f2',
            }}
          >
            Please fix the validation errors above before submitting.
          </Alert>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default UserForm;