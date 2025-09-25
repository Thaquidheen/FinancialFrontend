import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Breadcrumbs,
  Link,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCreateUser } from '../../hooks/useUser';
import UserForm from '../../components/users/UserForm';
import { CreateUserRequest, UpdateUserRequest } from '../../types/user';
import { ROUTES } from '../../constants/app';
import { USER_ROLES } from '../../types/auth';

const CreateUserPage: React.FC = (): JSX.Element => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const createUserMutation = useCreateUser();

  // Check if current user has admin access
  const hasAdminAccess = Boolean(currentUser?.roles?.includes(USER_ROLES.SUPER_ADMIN));

  const handleSubmit = async (userData: CreateUserRequest | UpdateUserRequest) => {
    try {
      // Type guard to ensure we have a CreateUserRequest
      if (!('password' in userData) || !('roles' in userData)) {
        throw new Error('Invalid user data for creation');
      }
      
      // At this point, TypeScript knows it's a CreateUserRequest
      const createUserData = userData as CreateUserRequest;
      // TEMP: debug log
      // eslint-disable-next-line no-console
      console.log('CreateUserPage -> calling createUser', createUserData);
      const newUser = await createUserMutation.mutateAsync(createUserData);
      
      // Navigate back to user list with success message
      navigate(ROUTES.USERS, {
        state: { 
          message: `User "${newUser.fullName}" has been created successfully.`,
          severity: 'success'
        }
      });
    } catch (error: any) {
      // Error will be handled by the form component
      throw error;
    }
  };

  const handleCancel = () => {
    navigate(ROUTES.USERS);
  };

  return (
    <Box sx={{ p: 3 }}>
      {!hasAdminAccess ? (
        <Alert severity="error">
          You don't have permission to create users.
        </Alert>
      ) : (
        <>
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
            <Typography color="text.primary">Create User</Typography>
          </Breadcrumbs>

          {/* Page Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
              Create New User
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Add a new user to the system with appropriate roles and permissions
            </Typography>
          </Box>

          {/* Form */}
          <Paper sx={{ p: 4 }}>
            <UserForm
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={createUserMutation.isPending}
              isEditMode={false}
            />
          </Paper>

          {/* Error display */}
          {createUserMutation.error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {createUserMutation.error instanceof Error 
                ? createUserMutation.error.message 
                : 'Failed to create user'}
            </Alert>
          )}
        </>
      )}
    </Box>
  );
};

export default CreateUserPage;