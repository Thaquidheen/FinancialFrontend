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
} from '@mui/material';
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
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const EditUserPage: React.FC = () => {
  const navigate = useNavigate();
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
      // Show success message or handle success
    } catch (error: any) {
      throw error;
    }
  };

  const handleBankDetailsUpdate = async (bankDetails: UpdateBankDetailsRequest) => {
    if (!userId) return;

    try {
      await updateBankDetailsMutation.mutateAsync({ userId, bankData: bankDetails });
      // Show success message or handle success
    } catch (error: any) {
      throw error;
    }
  };

  const handlePasswordChange = async (passwordData: ChangePasswordRequest) => {
    if (!userId) return;

    try {
      await changePasswordMutation.mutateAsync(passwordData);
      // Show success message or handle success
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
      // Show temporary password to admin
    } catch (error: any) {
      throw error;
    }
  };

  const handleCancel = () => {
    navigate(ROUTES.USERS);
  };

  if (!canEditUser) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          You don't have permission to edit this user.
        </Alert>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error || !user) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {(error as Error)?.message || 'User not found'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link
          color="inherit"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate(ROUTES.DASHBOARD);
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
        >
          Users
        </Link>
        <Typography color="text.primary">Edit User</Typography>
      </Breadcrumbs>

      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Edit User: {user.fullName}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage user information, roles, and permissions
        </Typography>
      </Box>

      {/* Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="user edit tabs">
            <Tab label="Basic Information" id="user-tab-0" aria-controls="user-tabpanel-0" />
            {canManageRoles && (
              <Tab label="Role Assignment" id="user-tab-1" aria-controls="user-tabpanel-1" />
            )}
            <Tab label="Bank Details" id="user-tab-2" aria-controls="user-tabpanel-2" />
            <Tab label="Password" id="user-tab-3" aria-controls="user-tabpanel-3" />
            {hasAdminAccess && (
              <Tab label="Activity Log" id="user-tab-4" aria-controls="user-tabpanel-4" />
            )}
          </Tabs>
        </Box>

        {/* Basic Information Tab */}
        <TabPanel value={activeTab} index={0}>
          <UserForm
            user={user}
            onSubmit={handleUserUpdate}
            onCancel={handleCancel}
            isLoading={updateUserMutation.isPending}
            isEditMode={true}
          />
          {updateUserMutation.error ? (
            <Alert severity="error" sx={{ mt: 2 }}>
              {(updateUserMutation.error as Error)?.message || 'Failed to update user'}
            </Alert>
          ) : null}
        </TabPanel>

        {/* Role Assignment Tab */}
        {canManageRoles && (
          <TabPanel value={activeTab} index={1}>
            <RoleAssignmentPanel
              user={user}
              onRolesUpdate={handleRolesUpdate}
              isLoading={updateRolesMutation.isPending}
              error={updateRolesMutation.error}
            />
          </TabPanel>
        )}

        {/* Bank Details Tab */}
        <TabPanel value={activeTab} index={2}>
          <BankDetailsPanel
            user={user}
            onBankDetailsUpdate={handleBankDetailsUpdate}
            isLoading={updateBankDetailsMutation.isPending}
            error={updateBankDetailsMutation.error as Error | null}
          />
        </TabPanel>

        {/* Password Tab */}
        <TabPanel value={activeTab} index={3}>
          <PasswordPanel
            user={user}
            onPasswordChange={handlePasswordChange}
            onPasswordReset={canResetPassword ? handlePasswordReset : undefined}
            isChangingPassword={changePasswordMutation.isPending}
            isResettingPassword={resetPasswordMutation.isPending}
            changePasswordError={changePasswordMutation.error as Error | null}
            resetPasswordError={resetPasswordMutation.error as Error | null}
          />
        </TabPanel>

        {/* Activity Log Tab */}
        {hasAdminAccess && (
          <TabPanel value={activeTab} index={4}>
            <UserActivityPanel userId={userId!} />
          </TabPanel>
        )}
      </Paper>
    </Box>
  );
};

export default EditUserPage;