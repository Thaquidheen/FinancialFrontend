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
    <Box sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: '#f8fafc', // Light gray background
    }}>
      {!hasAdminAccess ? (
        <Box sx={{ p: 3 }}>
          <Alert 
            severity="error"
            sx={{ 
              borderRadius: '12px',
              border: '1px solid #fecaca',
              bgcolor: '#fef2f2',
            }}
          >
            You don't have permission to create users.
          </Alert>
        </Box>
      ) : (
        <>
          {/* Header Section */}
          <Paper 
            elevation={0} 
            sx={{ 
              borderBottom: '1px solid #e2e8f0',
              px: 3,
              py: 2,
              bgcolor: '#ffffff',
              borderRadius: 0,
            }}
          >
            <Box sx={{ mb: 2 }}>
              <Typography 
                variant="h4" 
                component="h1" 
                fontWeight={700}
                sx={{ 
                  color: '#1a202c',
                  fontSize: '1.875rem',
                  letterSpacing: '-0.025em',
                  mb: 0.5
                }}
              >
                Create New User
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#64748b',
                  fontSize: '0.875rem'
                }}
              >
                Add a new user to the system with appropriate roles and permissions
              </Typography>
            </Box>
          </Paper>

          {/* Main Content Area */}
          <Box sx={{ flex: 1, overflow: 'hidden', p: 3 }}>
            {/* Breadcrumbs */}
            <Breadcrumbs sx={{ mb: 3 }}>
              <Link
                sx={{ 
                  color: '#3b82f6',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  '&:hover': {
                    color: '#2563eb',
                    textDecoration: 'underline'
                  }
                }}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate(ROUTES.DASHBOARD);
                }}
              >
                Dashboard
              </Link>
              <Link
                sx={{ 
                  color: '#3b82f6',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  '&:hover': {
                    color: '#2563eb',
                    textDecoration: 'underline'
                  }
                }}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate(ROUTES.USERS);
                }}
              >
                Users
              </Link>
              <Typography 
                sx={{ 
                  color: '#64748b',
                  fontSize: '0.875rem',
                  fontWeight: 500
                }}
              >
                Create User
              </Typography>
            </Breadcrumbs>

            {/* Form */}
            <Paper 
              elevation={0}
              sx={{ 
                p: 4,
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                bgcolor: '#ffffff',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              }}
            >
              <UserForm
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={createUserMutation.isPending}
                isEditMode={false}
              />
            </Paper>

            {/* Error display */}
            {createUserMutation.error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mt: 2,
                  borderRadius: '12px',
                  border: '1px solid #fecaca',
                  bgcolor: '#fef2f2',
                }}
              >
                {createUserMutation.error instanceof Error 
                  ? createUserMutation.error.message 
                  : 'Failed to create user'}
              </Alert>
            )}
          </Box>
        </>
      )}
    </Box>
  );
};

export default CreateUserPage;