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
  Card,
  CardContent,
  Avatar,
  IconButton,
  Alert,
  Autocomplete,
  InputAdornment,
  CircularProgress,
  Button,
} from '@mui/material';
import {
  PhotoCamera,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  User,
  UserSummary,
  CreateUserRequest,
  UpdateUserRequest,
  SaudiBanks,
  VALIDATION_PATTERNS,
  VALIDATION_MESSAGES,
  Role,
  Department,
} from '../../types/user';
import { useRoles, useDepartments, useManagers, useCheckUsernameAvailability, useCheckEmailAvailability } from '../../hooks/useUser';

interface UserFormProps {
  user?: User;
  onSubmit: (data: CreateUserRequest | UpdateUserRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  isEditMode?: boolean;
}

// Validation schema
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
    .matches(VALIDATION_PATTERNS.SAUDI_MOBILE, VALIDATION_MESSAGES.PHONE_INVALID),
  
  nationalId: yup
    .string()
    .nullable()
    .matches(VALIDATION_PATTERNS.SAUDI_NATIONAL_ID, VALIDATION_MESSAGES.NATIONAL_ID_INVALID),
  
  iqamaId: yup
    .string()
    .nullable()
    .matches(VALIDATION_PATTERNS.IQAMA_ID, VALIDATION_MESSAGES.IQAMA_ID_INVALID),
  
  passportNumber: yup
    .string()
    .nullable()
    .matches(VALIDATION_PATTERNS.PASSPORT, VALIDATION_MESSAGES.PASSPORT_INVALID),
  
  roles: yup
    .array()
    .of(yup.string())
    .min(1, 'At least one role must be selected'),
  
  // Bank details validation
  'bankDetails.bankName': yup
    .string()
    .nullable()
    .when('bankDetails', {
      is: (bankDetails: any) => bankDetails && Object.values(bankDetails).some((value: any) => value && value.toString().trim() !== ''),
      then: (schema) => schema.required('Bank name is required when bank details are provided'),
      otherwise: (schema) => schema.nullable(),
    }),
  
  'bankDetails.iban': yup
    .string()
    .nullable()
    .matches(VALIDATION_PATTERNS.SAUDI_IBAN, VALIDATION_MESSAGES.IBAN_INVALID),
  
  'bankDetails.accountNumber': yup
    .string()
    .nullable()
    .matches(/^[0-9]{10,20}$/, VALIDATION_MESSAGES.ACCOUNT_NUMBER_INVALID),
  
  'bankDetails.beneficiaryAddress': yup
    .string()
    .nullable()
    .max(200, 'Beneficiary address must be less than 200 characters'),
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
  const [profileImage, setProfileImage] = React.useState<string | null>(user?.profileImage || null);

  // Helper function to safely extract error messages
  const getErrorMessage = (error: any): string | undefined => {
    if (typeof error === 'string') return error;
    if (error?.message && typeof error.message === 'string') return error.message;
    return undefined;
  };

  const { data: roles = [], isLoading: rolesLoading } = useRoles();
  const { data: departments = [], isLoading: departmentsLoading } = useDepartments();
  const { data: managers = [], isLoading: managersLoading } = useManagers();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset,
  } = useForm<any>({
    resolver: yupResolver(isEditMode ? updateUserSchema : createUserSchema),
    defaultValues: {
      username: user?.username || '',
      email: user?.email || '',
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

  // Watch for form changes to trigger validations
  const watchedUsername = watch('username');
  const watchedEmail = watch('email');
  const watchedRoles = watch('roles');

  // Username availability check (debounced)
  const { data: usernameCheck } = useCheckUsernameAvailability(
    watchedUsername,
    user?.id
  );

  // Email availability check (debounced)
  const { data: emailCheck } = useCheckEmailAvailability(
    watchedEmail,
    user?.id
  );

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
      setProfileImage(user.profileImage || null);
    }
  }, [user, reset]);

  const handleFormSubmit = async (data: any) => {
    try {
      // Convert date to string format
      const formattedData = {
        ...data,
        hireDate: data.hireDate ? data.hireDate.toISOString().split('T')[0] : undefined,
        bankDetails: data.bankDetails.bankName ? data.bankDetails : undefined,
      };

      await onSubmit(formattedData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const saudiBankOptions = Object.values(SaudiBanks);
  const departmentOptions = departments.map((dept: Department) => dept.name);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} sx={{ mt: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Profile Image Section */}
          <Box>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Box sx={{ position: 'relative' }}>
                    <Avatar
                      src={profileImage || undefined}
                      sx={{ width: 100, height: 100, fontSize: '2rem' }}
                    >
                      {watch('fullName')?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U'}
                    </Avatar>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="profile-image-upload"
                      type="file"
                      onChange={handleImageUpload}
                    />
                    <label htmlFor="profile-image-upload">
                      <IconButton
                        color="primary"
                        component="span"
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          backgroundColor: 'background.paper',
                          '&:hover': {
                            backgroundColor: 'background.paper',
                          },
                        }}
                      >
                        <PhotoCamera />
                      </IconButton>
                    </label>
                  </Box>
                  <Box>
                    <Typography variant="h6">Profile Picture</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Upload a profile picture for the user
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Basic Information */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Box>

          {/* Username */}
          <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
            <Controller
              name="username"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Username"
                  fullWidth
                  required
                  error={!!errors.username || (usernameCheck && !usernameCheck.available)}
                  helperText={
                    getErrorMessage(errors.username) ||
                    (usernameCheck && !usernameCheck.available ? 'Username is already taken' : '')
                  }
                  disabled={isEditMode} // Username cannot be changed
                />
              )}
            />
          </Box>

          {/* Email */}
          <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
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
                  error={!!errors.email || (emailCheck && !emailCheck.available)}
                  helperText={
                    getErrorMessage(errors.email) ||
                    (emailCheck && !emailCheck.available ? 'Email is already in use' : '')
                  }
                />
              )}
            />
          </Box>

          {/* Password fields (only for create mode) */}
          {!isEditMode && (
            <>
              <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
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
              </Box>

              <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
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
              </Box>
            </>
          )}

          {/* Full Name */}
          <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
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
          </Box>

          {/* Phone Number */}
          <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
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
          </Box>

          {/* Saudi-specific Information */}
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Saudi-specific Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Box>

          {/* National ID */}
          <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
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
          </Box>

          {/* Iqama ID */}
          <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
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
          </Box>

          {/* Passport Number */}
          <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
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
          </Box>

          {/* Employment Information */}
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Employment Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Box>

          {/* Department */}
          <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
            <Controller
              name="department"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  {...field}
                  options={departmentOptions}
                  freeSolo
                  loading={departmentsLoading}
                  onChange={(_, value) => setValue('department', value || '')}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Department"
                      error={!!errors.department}
                      helperText={getErrorMessage(errors.department)}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {departmentsLoading ? <CircularProgress size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
              )}
            />
          </Box>

          {/* Position */}
          <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
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
          </Box>

          {/* Hire Date */}
          <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
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
          </Box>

          {/* Manager */}
          <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
            <Controller
              name="managerId"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.managerId}>
                  <InputLabel>Manager</InputLabel>
                  <Select
                    {...field}
                    label="Manager"
                    displayEmpty
                  >
                    <MenuItem value="">
                      <em>No Manager</em>
                    </MenuItem>
                    {managers.map((manager: UserSummary) => (
                      <MenuItem key={manager.id} value={manager.id}>
                        {manager.fullName} ({manager.username})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Box>

          {/* Role Assignment */}
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Role Assignment
            </Typography>
            <Divider sx={{ mb: 2 }} />
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
                    {roles.map((role: Role) => (
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
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Bank Details
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Box>

          {/* Bank Name */}
          <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
            <Controller
              name="bankDetails.bankName"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors['bankDetails.bankName']}>
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
                </FormControl>
              )}
            />
          </Box>

          {/* Account Number */}
          <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
            <Controller
              name="bankDetails.accountNumber"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Account Number"
                  fullWidth
                  error={!!errors['bankDetails.accountNumber']}
                  helperText={getErrorMessage(errors['bankDetails.accountNumber'])}
                />
              )}
            />
          </Box>

          {/* IBAN */}
          <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
            <Controller
              name="bankDetails.iban"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="IBAN"
                  fullWidth
                  error={!!errors['bankDetails.iban']}
                  helperText={getErrorMessage(errors['bankDetails.iban']) || 'Saudi IBAN format: SA1234567890123456789012'}
                  placeholder="SA1234567890123456789012"
                />
              )}
            />
          </Box>

          {/* Beneficiary Address */}
          <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
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
                  error={!!errors['bankDetails.beneficiaryAddress']}
                  helperText={getErrorMessage(errors['bankDetails.beneficiaryAddress'])}
                />
              )}
            />
          </Box>

          {/* Form Actions */}
          <Box>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
              <Button
                variant="outlined"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting || isLoading}
                startIcon={isSubmitting || isLoading ? <CircularProgress size={20} /> : undefined}
              >
                {isEditMode ? 'Update User' : 'Create User'}
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Validation Summary */}
        {Object.keys(errors).length > 0 && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Please fix the validation errors above before submitting.
          </Alert>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default UserForm;