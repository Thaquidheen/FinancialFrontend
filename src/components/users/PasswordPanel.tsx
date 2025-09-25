import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Grid,
  LinearProgress,
  Chip,
  IconButton,
  InputAdornment,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Lock,
  Security,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  RestartAlt,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { User, ChangePasswordRequest } from '@types/user';

// Password strength validation
const passwordSchema = yup.object().shape({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup
    .string()
    .required('New password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain uppercase, lowercase, number, and special character'
    ),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('newPassword')], 'Passwords must match'),
});

interface PasswordPanelProps {
  user?: User;
  onPasswordChange: (data: ChangePasswordRequest) => Promise<void>;
  onPasswordReset?: (userId: string) => Promise<void>;
  isChangingPassword?: boolean;
  isResettingPassword?: boolean;
  changePasswordError?: Error | null;
  resetPasswordError?: Error | null;
}

interface PasswordStrength {
  score: number;
  label: string;
  color: 'error' | 'warning' | 'info' | 'success';
  feedback: string[];
}

const PasswordPanel: React.FC<PasswordPanelProps> = ({
  user,
  onPasswordChange,
  onPasswordReset,
  isChangingPassword = false,
  isResettingPassword = false,
  changePasswordError,
  resetPasswordError,
}) => {
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty, isValid },
  } = useForm<ChangePasswordRequest>({
    resolver: yupResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  const newPassword = watch('newPassword');

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const calculatePasswordStrength = (password: string): PasswordStrength => {
    if (!password) {
      return { score: 0, label: '', color: 'error', feedback: [] };
    }

    let score = 0;
    const feedback: string[] = [];

    // Length check
    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('At least 8 characters');
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('One uppercase letter');
    }

    // Lowercase check
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('One lowercase letter');
    }

    // Number check
    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('One number');
    }

    // Special character check
    if (/[@$!%*?&]/.test(password)) {
      score += 1;
    } else {
      feedback.push('One special character (@$!%*?&)');
    }

    // Determine strength level
    let label: string;
    let color: 'error' | 'warning' | 'info' | 'success';

    if (score <= 2) {
      label = 'Weak';
      color = 'error';
    } else if (score <= 3) {
      label = 'Fair';
      color = 'warning';
    } else if (score <= 4) {
      label = 'Good';
      color = 'info';
    } else {
      label = 'Strong';
      color = 'success';
    }

    return { score, label, color, feedback };
  };

  const passwordStrength = calculatePasswordStrength(newPassword);

  const handlePasswordSubmit = async (data: ChangePasswordRequest) => {
    try {
      await onPasswordChange(data);
      setSuccessMessage('Password updated successfully!');
      reset();
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      // Error handling is managed by parent component
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.id || !onPasswordReset) return;

    try {
      await onPasswordReset(user.id);
      setResetDialogOpen(false);
      setSuccessMessage('Password reset successfully! User will receive new credentials via email.');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      // Error handling is managed by parent component
    }
  };

  const getPasswordIcon = () => {
    if (user?.passwordExpired) {
      return <ErrorIcon color="error" />;
    }
    if (user?.lastLoginDate) {
      return <CheckCircle color="success" />;
    }
    return <Warning color="warning" />;
  };

  const getPasswordStatus = () => {
    if (user?.passwordExpired) {
      return { label: 'Password Expired', color: 'error' as const };
    }
    if (user?.lastLoginDate) {
      return { label: 'Active', color: 'success' as const };
    }
    return { label: 'Never Logged In', color: 'warning' as const };
  };

  if (!user) {
    return null;
  }

  const passwordStatus = getPasswordStatus();

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Lock />
        Password Management for {user.fullName}
      </Typography>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}

      {changePasswordError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {changePasswordError.message || 'Failed to change password'}
        </Alert>
      )}

      {resetPasswordError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {resetPasswordError.message || 'Failed to reset password'}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Password Status Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                {getPasswordIcon()}
                <Typography variant="subtitle1" fontWeight="bold">
                  Password Status
                </Typography>
              </Box>

              <Box mb={2}>
                <Chip
                  label={passwordStatus.label}
                  color={passwordStatus.color}
                  size="small"
                />
              </Box>

              <Typography variant="body2" color="text.secondary" mb={1}>
                Last Login
              </Typography>
              <Typography variant="body2" mb={2}>
                {user.lastLoginDate
                  ? new Date(user.lastLoginDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Never logged in'}
              </Typography>

              {onPasswordReset && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Button
                    variant="outlined"
                    color="warning"
                    fullWidth
                    startIcon={<RestartAlt />}
                    onClick={() => setResetDialogOpen(true)}
                    disabled={isResettingPassword}
                  >
                    {isResettingPassword ? 'Resetting...' : 'Reset Password'}
                  </Button>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Admin only: Generate new password for user
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Change Password Form */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={3}>
                <Security />
                <Typography variant="subtitle1" fontWeight="bold">
                  Change Password
                </Typography>
              </Box>

              <form onSubmit={handleSubmit(handlePasswordSubmit)}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Controller
                      name="currentPassword"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          type={showPasswords.current ? 'text' : 'password'}
                          label="Current Password"
                          fullWidth
                          error={!!errors.currentPassword}
                          helperText={errors.currentPassword?.message}
                          disabled={isChangingPassword}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => togglePasswordVisibility('current')}
                                  edge="end"
                                >
                                  {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Controller
                      name="newPassword"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          type={showPasswords.new ? 'text' : 'password'}
                          label="New Password"
                          fullWidth
                          error={!!errors.newPassword}
                          helperText={errors.newPassword?.message}
                          disabled={isChangingPassword}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => togglePasswordVisibility('new')}
                                  edge="end"
                                >
                                  {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    />

                    {/* Password Strength Indicator */}
                    {newPassword && (
                      <Box mt={1}>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <Typography variant="caption" color="text.secondary">
                            Password Strength:
                          </Typography>
                          <Chip
                            label={passwordStrength.label}
                            color={passwordStrength.color}
                            size="small"
                          />
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={(passwordStrength.score / 5) * 100}
                          color={passwordStrength.color}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                        {passwordStrength.feedback.length > 0 && (
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                            Missing: {passwordStrength.feedback.join(', ')}
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Grid>

                  <Grid item xs={12}>
                    <Controller
                      name="confirmPassword"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          type={showPasswords.confirm ? 'text' : 'password'}
                          label="Confirm New Password"
                          fullWidth
                          error={!!errors.confirmPassword}
                          helperText={errors.confirmPassword?.message}
                          disabled={isChangingPassword}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => togglePasswordVisibility('confirm')}
                                  edge="end"
                                >
                                  {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    />
                  </Grid>
                </Grid>

                <Box display="flex" gap={2} justifyContent="flex-end" mt={3}>
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={() => reset()}
                    disabled={isChangingPassword || !isDirty}
                  >
                    Reset Form
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isChangingPassword || !isDirty || !isValid}
                    startIcon={<Security />}
                  >
                    {isChangingPassword ? 'Updating...' : 'Update Password'}
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Password Reset Confirmation Dialog */}
      <Dialog open={resetDialogOpen} onClose={() => setResetDialogOpen(false)}>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to reset the password for <strong>{user.fullName}</strong>?
            <br /><br />
            This will generate a new temporary password and send it to the user's email address ({user.email}).
            The user will be required to change it on their next login.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialogOpen(false)} disabled={isResettingPassword}>
            Cancel
          </Button>
          <Button
            onClick={handlePasswordReset}
            color="warning"
            variant="contained"
            disabled={isResettingPassword}
          >
            {isResettingPassword ? 'Resetting...' : 'Reset Password'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PasswordPanel;