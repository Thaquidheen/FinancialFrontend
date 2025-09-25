import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import { useAuth } from '@contexts/AuthContext';
import { ProtectedRouteProps } from '../../types/auth';
import { ROUTES } from '@constants/app';
import authService from '@services/authService';

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  requiredPermissions = [],
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2,
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Loading...
        </Typography>
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate 
        to={ROUTES.LOGIN} 
        state={{ from: location.pathname }}
        replace 
      />
    );
  }

  // Check role-based access
  if (requiredRoles.length > 0) {
    const hasRequiredRole = authService.hasAnyRole(requiredRoles);
    
    if (!hasRequiredRole) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '50vh',
            p: 3,
          }}
        >
          <Alert severity="error" sx={{ maxWidth: 600 }}>
            <Typography variant="h6" gutterBottom>
              Access Denied
            </Typography>
            <Typography variant="body2">
              You don't have the required permissions to access this page.
              Required roles: {requiredRoles.join(', ')}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Your current roles: {user?.roles?.join(', ') || 'None'}
            </Typography>
          </Alert>
        </Box>
      );
    }
  }

  // Check permission-based access
  if (requiredPermissions.length > 0) {
    const hasRequiredPermission = authService.hasAnyPermission(requiredPermissions);
    
    if (!hasRequiredPermission) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '50vh',
            p: 3,
          }}
        >
          <Alert severity="error" sx={{ maxWidth: 600 }}>
            <Typography variant="h6" gutterBottom>
              Access Denied
            </Typography>
            <Typography variant="body2">
              You don't have the required permissions to access this page.
              Required permissions: {requiredPermissions.join(', ')}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Your current permissions: {user?.permissions?.join(', ') || 'None'}
            </Typography>
          </Alert>
        </Box>
      );
    }
  }

  // User has access, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;