import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Breadcrumbs,
  Link,
  Alert,
  Tabs,
  Tab,
  CircularProgress,
  Avatar,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Container,
  useTheme,
  useMediaQuery,
  Badge,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  AccountBalance as BankIcon,
  Lock as LockIcon,
  History as HistoryIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import {
  useUser,
  useUpdateUser,
  useUpdateUserRoles,
  useUpdateBankDetails,
  useChangePassword,
  useResetPassword,
} from '@hooks/useUser';
import UserForm from '@components/users/UserForm';
import RoleAssignmentPanel from '@components/users/RoleAssignmentPanel';
import BankDetailsPanel from '@components/users/BankDetailsPanel';
import PasswordPanel from '@components/users/PasswordPanel';
import UserActivityPanel from '@components/users/UserActivityPanel';
import {
  UpdateUserRequest,
  UpdateUserRolesRequest,
  UpdateBankDetailsRequest,
  ChangePasswordRequest,
} from '../../types/user';
import { USER_ROLES, ROUTES } from '@constants/app';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`user-tabpanel-${index}`}
      aria-labelledby={`user-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 0 }}>{children}</Box>}
    </div>
  );
}

const EditUserPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { id: userId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { user: currentUser } = useAuth();
  
  // Determine initial tab from URL params
  const initialTab = (() => {
    const tabParam = searchParams.get('tab');
    switch (tabParam) {
      case 'roles': return 1;
      case 'bank': return 2;
      case 'password': return 3;
      case 'activity': return 4;
      default: return 0;
    }
  })();
  
  const [activeTab, setActiveTab] = useState(initialTab);

  // Data fetching hooks
  const { data: user, isLoading, error } = useUser(userId!);

  // Mutation hooks
  const updateUserMutation = useUpdateUser();
  const updateRolesMutation = useUpdateUserRoles();
  const updateBankDetailsMutation = useUpdateBankDetails();
  const changePasswordMutation = useChangePassword();
  const resetPasswordMutation = useResetPassword();

  // Check permissions
  const hasAdminAccess = currentUser?.roles?.includes(USER_ROLES.SUPER_ADMIN);
  const canEditUser = hasAdminAccess || currentUser?.id === userId;
  const canManageRoles = hasAdminAccess;
  const canResetPassword = hasAdminAccess;

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleUserUpdate = async (userData: UpdateUserRequest) => {
    if (!userId) return;

    try {
      await updateUserMutation.mutateAsync({ userId, userData });
      navigate(ROUTES.USERS, {
        state: { 
          message: 'User updated successfully.',
          severity: 'success'
        }
      });
    } catch (error: any) {
      throw error;
    }
  };

  const handleRolesUpdate = async (rolesData: UpdateUserRolesRequest) => {
    if (!userId) return;

    try {
      await updateRolesMutation.mutateAsync({ userId, rolesData });
    } catch (error: any) {
      throw error;
    }
  };

  const handleBankDetailsUpdate = async (bankDetails: UpdateBankDetailsRequest) => {
    if (!userId) return;

    try {
      await updateBankDetailsMutation.mutateAsync({ userId, bankData: bankDetails });
    } catch (error: any) {
      throw error;
    }
  };

  const handlePasswordChange = async (passwordData: ChangePasswordRequest) => {
    if (!userId) return;

    try {
      await changePasswordMutation.mutateAsync(passwordData);
    } catch (error: any) {
      throw error;
    }
  };

  const handlePasswordReset = async (userId: string) => {
    try {
      await resetPasswordMutation.mutateAsync({ 
        userId, 
        email: user?.email || '', 
        sendEmail: true 
      });
    } catch (error: any) {
      throw error;
    }
  };

  const handleCancel = () => {
    navigate(ROUTES.USERS);
  };

  // Get role color for chips
  const getRoleColor = (role: string) => {
    switch (role) {
      case USER_ROLES.SUPER_ADMIN: return 'error';
      case USER_ROLES.ACCOUNT_MANAGER: return 'warning';
      case USER_ROLES.PROJECT_MANAGER: return 'info';
      case USER_ROLES.EMPLOYEE: return 'default';
      default: return 'default';
    }
  };

  // Get user initials for avatar
  const getUserInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map((name: string) => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!canEditUser) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Alert 
            severity="error" 
            variant="filled"
            sx={{ borderRadius: 2 }}
          >
            You don't have permission to edit this user.
          </Alert>
        </Box>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '60vh',
            flexDirection: 'column',
            gap: 2
          }}
        >
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" color="text.secondary">
            Loading user details...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error || !user) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Alert 
            severity="error" 
            variant="filled"
            sx={{ borderRadius: 2 }}
          >
            {(error as Error)?.message || 'User not found'}
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Box sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: '#f8fafc',
    }}>
      <Box sx={{ flex: 1, overflow: 'hidden', p: 3 }}>
          {/* Header Section */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              mb: 3, 
              bgcolor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            }}
          >
            {/* Back Button and Breadcrumbs */}
            <Box sx={{ mb: 3 }}>
              <Stack 
                direction="row" 
                spacing={2} 
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <Tooltip title="Back to Users">
                  <IconButton 
                    onClick={() => navigate(ROUTES.USERS)}
                    sx={{ 
                      bgcolor: 'action.hover',
                      '&:hover': { bgcolor: 'action.selected' }
                    }}
                  >
                    <ArrowBackIcon />
                  </IconButton>
                </Tooltip>
                
                <Breadcrumbs separator="›">
                  <Link
                    color="inherit"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(ROUTES.DASHBOARD);
                    }}
                    sx={{ 
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    Dashboard
                  </Link>
                  <Link
                    color="inherit"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(ROUTES.USERS);
                    }}
                    sx={{ 
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    Users
                  </Link>
                  <Typography color="text.primary" fontWeight={500}>
                    Edit User
                  </Typography>
                </Breadcrumbs>
              </Stack>
            </Box>

            {/* User Header Information */}
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={3} 
              alignItems={{ xs: 'center', sm: 'flex-start' }}
            >
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  user.isActive ? (
                    <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
                  ) : (
                    <WarningIcon sx={{ color: 'warning.main', fontSize: 20 }} />
                  )
                }
              >
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: 'primary.main',
                    fontSize: '2rem',
                    fontWeight: 600,
                    boxShadow: 3
                  }}
                >
                  {user.profilePicture ? (
                    <img 
                      src={user.profilePicture} 
                      alt={user.fullName}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    getUserInitials(user.fullName)
                  )}
                </Avatar>
              </Badge>

              <Stack spacing={1} sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography 
                    variant="h4" 
                    component="h1" 
                    fontWeight={600}
                    color="text.primary"
                  >
                    {user.fullName}
                  </Typography>
                  <Tooltip title="Edit Profile">
                    <IconButton size="small" sx={{ color: 'primary.main' }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>

                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {user.position || 'No position assigned'}
                </Typography>

                <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent={{ xs: 'center', sm: 'flex-start' }}>
                  {user.roles?.map((role) => (
                    <Chip
                      key={role}
                      label={role.replace('_', ' ')}
                      color={getRoleColor(role) as any}
                      variant="filled"
                      size="small"
                      sx={{ fontWeight: 500 }}
                    />
                  ))}
                </Stack>

                <Stack 
                  direction={{ xs: 'column', sm: 'row' }} 
                  spacing={2} 
                  sx={{ mt: 1 }}
                >
                  <Typography variant="body2" color="text.secondary">
                    <strong>Email:</strong> {user.email}
                  </Typography>
                  {user.department && (
                    <Typography variant="body2" color="text.secondary">
                      <strong>Department:</strong> {user.department}
                    </Typography>
                  )}
                </Stack>
              </Stack>
            </Stack>
          </Paper>

          {/* Main Content */}
          <Paper 
            elevation={1} 
            sx={{ 
              overflow: 'hidden',
              borderRadius: 2
            }}
          >
            {/* Navigation Tabs */}
            <Box sx={{ borderBottom: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange} 
                variant={isMobile ? 'scrollable' : 'standard'}
                scrollButtons={isMobile ? 'auto' : false}
                sx={{
                  '& .MuiTab-root': {
                    minHeight: 64,
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    color: '#64748b',
                    '&.Mui-selected': {
                      color: '#3b82f6',
                    },
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#3b82f6',
                  },
                }}
              >
                <Tab 
                  icon={<PersonIcon />} 
                  label="Basic Information" 
                  iconPosition="start"
                  sx={{ gap: 1 }}
                />
                {canManageRoles && (
                  <Tab 
                    icon={<SecurityIcon />} 
                    label="Role Assignment" 
                    iconPosition="start"
                    sx={{ gap: 1 }}
                  />
                )}
                <Tab 
                  icon={<BankIcon />} 
                  label="Bank Details" 
                  iconPosition="start"
                  sx={{ gap: 1 }}
                />
                <Tab 
                  icon={<LockIcon />} 
                  label="Security" 
                  iconPosition="start"
                  sx={{ gap: 1 }}
                />
                {hasAdminAccess && (
                  <Tab 
                    icon={<HistoryIcon />} 
                    label="Activity Log" 
                    iconPosition="start"
                    sx={{ gap: 1 }}
                  />
                )}
              </Tabs>
            </Box>

            {/* Tab Content */}
            <Box sx={{ bgcolor: '#ffffff' }}>
              {/* Basic Information Tab */}
              <TabPanel value={activeTab} index={0}>
                <Box sx={{ p: 3 }}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Typography 
                        variant="h6" 
                        gutterBottom 
                        sx={{ 
                          mb: 3,
                          color: '#1a202c',
                          fontWeight: 600,
                        }}
                      >
                        Personal Information
                      </Typography>
                      <UserForm
                        user={user}
                        onSubmit={handleUserUpdate}
                        onCancel={handleCancel}
                        isLoading={updateUserMutation.isPending}
                        isEditMode={true}
                      />
                      {updateUserMutation.error ? (
                        <Alert 
                          severity="error" 
                          variant="filled" 
                          sx={{ mt: 2, borderRadius: 1 }}
                        >
                          {updateUserMutation.error instanceof Error 
                            ? updateUserMutation.error.message 
                            : 'Failed to update user'}
                        </Alert>
                      ) : null}
                    </CardContent>
                  </Card>
                </Box>
              </TabPanel>

              {/* Role Assignment Tab */}
              {canManageRoles && (
                <TabPanel value={activeTab} index={1}>
                  <Box sx={{ p: 3 }}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Typography 
                          variant="h6" 
                          gutterBottom 
                          sx={{ 
                            mb: 3,
                            color: '#1a202c',
                            fontWeight: 600,
                          }}
                        >
                          Role & Permissions Management
                        </Typography>
                        <RoleAssignmentPanel
                          user={user}
                          onRolesUpdate={handleRolesUpdate}
                          isLoading={updateRolesMutation.isPending}
                          error={updateRolesMutation.error}
                        />
                      </CardContent>
                    </Card>
                  </Box>
                </TabPanel>
              )}

              {/* Bank Details Tab */}
              <TabPanel value={activeTab} index={2}>
                <Box sx={{ p: 3 }}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Typography 
                        variant="h6" 
                        gutterBottom 
                        sx={{ 
                          mb: 3,
                          color: '#1a202c',
                          fontWeight: 600,
                        }}
                      >
                        Banking Information
                      </Typography>
                      <BankDetailsPanel
                        user={user}
                        onBankDetailsUpdate={handleBankDetailsUpdate}
                        isLoading={updateBankDetailsMutation.isPending}
                        error={updateBankDetailsMutation.error as Error | null}
                      />
                    </CardContent>
                  </Card>
                </Box>
              </TabPanel>

              {/* Security Tab */}
              <TabPanel value={activeTab} index={3}>
                <Box sx={{ p: 3 }}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Typography 
                        variant="h6" 
                        gutterBottom 
                        sx={{ 
                          mb: 3,
                          color: '#1a202c',
                          fontWeight: 600,
                        }}
                      >
                        Security Settings
                      </Typography>
                      <PasswordPanel
                        user={user}
                        onPasswordChange={handlePasswordChange}
                        onPasswordReset={canResetPassword ? handlePasswordReset : undefined}
                        isChangingPassword={changePasswordMutation.isPending}
                        isResettingPassword={resetPasswordMutation.isPending}
                        changePasswordError={changePasswordMutation.error as Error | null}
                        resetPasswordError={resetPasswordMutation.error as Error | null}
                      />
                    </CardContent>
                  </Card>
                </Box>
              </TabPanel>

              {/* Activity Log Tab */}
              {hasAdminAccess && (
                <TabPanel value={activeTab} index={4}>
                  <Box sx={{ p: 3 }}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Typography 
                          variant="h6" 
                          gutterBottom 
                          sx={{ 
                            mb: 3,
                            color: '#1a202c',
                            fontWeight: 600,
                          }}
                        >
                          User Activity History
                        </Typography>
                        <UserActivityPanel userId={userId!} />
                      </CardContent>
                    </Card>
                  </Box>
                </TabPanel>
              )}
            </Box>
          </Paper>
      </Box>
    </Box>
  );
};

export default EditUserPage;