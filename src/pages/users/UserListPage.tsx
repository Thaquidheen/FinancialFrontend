// src/pages/users/UserListPage.tsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  IconButton,
  Tooltip,
  Stack,
  Grid,
  Collapse,
  Divider,
  Paper,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  GetApp as ExportIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  useUsers,
  useUserStats,
  useRoles,
  useDeleteUser,
  useActivateUser,
  useDeactivateUser,
  useExportUsers,
  useRefreshUsers,
} from '../../hooks/useUser';
import { useAuth } from '@contexts/AuthContext';
import UserTable from '@components/users/UserTable';
import { MetricsCard } from '@components/dashboard/MetricsCard';
import { User, UserSearchParams, UserFilters } from '../../types/user';
import { ROUTES } from '@constants/app';
import { USER_ROLES } from '../../types/auth';

const UserListPage: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const [searchParams, setSearchParams] = useState<UserSearchParams>({
    page: 0,
    size: 10,
    sortBy: 'createdDate',
    sortDirection: 'desc',
  });
  
  const [filters, setFilters] = useState<UserFilters>({
    roles: [],
    departments: [],
    status: 'all',
    managers: [],
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    action: () => void;
  } | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'info' });

  // Data fetching hooks
  const { data: usersData, isLoading, error } = useUsers(searchParams);
  const { data: userStats } = useUserStats();
  const { data: roles = [] } = useRoles();

  // Mutations
  const deleteUserMutation = useDeleteUser();
  const activateUserMutation = useActivateUser();
  const deactivateUserMutation = useDeactivateUser();
  const exportUsersMutation = useExportUsers();
  const { refreshAll } = useRefreshUsers();

  // Event Handlers
  const handleSearchParamsChange = (params: UserSearchParams) => {
    setSearchParams(params);
  };

  const handleSearch = () => {
    setSearchParams(prev => ({
      ...prev,
      search: searchQuery,
      page: 0,
    }));
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchParams(prev => ({
      ...prev,
      search: undefined,
      page: 0,
    }));
  };

  const handleFilterChange = (newFilters: UserFilters) => {
    setFilters(newFilters);
    setSearchParams(prev => ({
      ...prev,
      roles: newFilters.roles,
      departments: newFilters.departments,
      isActive: newFilters.status === 'all' ? undefined : newFilters.status === 'active',
      page: 0,
    }));
  };

  // User Actions
  const handleUserEdit = (user: User) => {
    navigate(ROUTES.USER_EDIT.replace(':id', user.id));
  };

  const handleUserView = (user: User) => {
    navigate(ROUTES.USER_DETAIL.replace(':id', user.id));
  };

  const handleUserDelete = (user: User) => {
    setConfirmDialog({
      open: true,
      title: 'Delete User',
      message: `Are you sure you want to delete "${user.fullName}"? This action cannot be undone.`,
      action: () => {
        deleteUserMutation.mutate(user.id, {
          onSuccess: () => {
            setSnackbar({
              open: true,
              message: 'User deleted successfully',
              severity: 'success',
            });
          },
          onError: () => {
            setSnackbar({
              open: true,
              message: 'Failed to delete user',
              severity: 'error',
            });
          },
        });
        setConfirmDialog(null);
      },
    });
  };

  const handleUserActivate = (user: User) => {
    activateUserMutation.mutate(user.id, {
      onSuccess: () => {
        setSnackbar({
          open: true,
          message: 'User activated successfully',
          severity: 'success',
        });
      },
      onError: () => {
        setSnackbar({
          open: true,
          message: 'Failed to activate user',
          severity: 'error',
        });
      },
    });
  };

  const handleUserDeactivate = (user: User) => {
    deactivateUserMutation.mutate(user.id, {
      onSuccess: () => {
        setSnackbar({
          open: true,
          message: 'User deactivated successfully',
          severity: 'success',
        });
      },
      onError: () => {
        setSnackbar({
          open: true,
          message: 'Failed to deactivate user',
          severity: 'error',
        });
      },
    });
  };

  const handleRoleAssign = (_user: User) => {
    // Roles management route not defined; implement when backend/UI ready
  };

  const handleExport = () => {
    exportUsersMutation.mutate(searchParams, {
      onSuccess: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        setSnackbar({
          open: true,
          message: 'Users exported successfully',
          severity: 'success',
        });
      },
      onError: () => {
        setSnackbar({
          open: true,
          message: 'Failed to export users',
          severity: 'error',
        });
      },
    });
  };

  // Check permissions
  const canCreateUser = currentUser?.roles.includes(USER_ROLES.SUPER_ADMIN);
  const canExportUsers = currentUser?.roles.includes(USER_ROLES.SUPER_ADMIN) || 
                        currentUser?.roles.includes(USER_ROLES.ACCOUNT_MANAGER);

  return (
    <Box sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: '#f8fafc', // Light gray background
    }}>
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
        <Stack 
          direction="row" 
          justifyContent="space-between" 
          alignItems="center"
        >
          <Box>
            <Typography 
              variant="h4" 
              component="h1" 
              fontWeight={700}
              sx={{ 
                color: '#1a202c',
                fontSize: '1.875rem',
                letterSpacing: '-0.025em'
              }}
            >
              User Management
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                mt: 0.5,
                color: '#64748b',
                fontSize: '0.875rem'
              }}
            >
              Manage users, roles, and permissions
            </Typography>
          </Box>

          <Stack direction="row" spacing={1}>
            <Tooltip title="Refresh Data">
              <IconButton 
                onClick={() => refreshAll()}
                disabled={isLoading}
                sx={{ 
                  bgcolor: '#f1f5f9',
                  color: '#475569',
                  '&:hover': { 
                    bgcolor: '#e2e8f0',
                    color: '#334155'
                  }
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            
            {canExportUsers && (
              <Button
                variant="outlined"
                startIcon={<ExportIcon />}
                onClick={handleExport}
                disabled={exportUsersMutation.isLoading}
                sx={{ 
                  minWidth: 100,
                  borderColor: '#d1d5db',
                  color: '#374151',
                  '&:hover': {
                    borderColor: '#9ca3af',
                    backgroundColor: '#f9fafb'
                  }
                }}
              >
                Export
              </Button>
            )}
            
            {canCreateUser && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate(ROUTES.USER_CREATE)}
                sx={{ 
                  minWidth: 120,
                  bgcolor: '#3b82f6',
                  color: '#ffffff',
                  fontWeight: 600,
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                  '&:hover': { 
                    bgcolor: '#2563eb',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }
                }}
              >
                Add User
              </Button>
            )}
          </Stack>
        </Stack>
      </Paper>

      {/* Main Content Area */}
      <Box sx={{ flex: 1, overflow: 'hidden', p: 3 }}>
        <Stack spacing={3} sx={{ height: '100%' }}>
          {/* Statistics Cards */}
          {userStats && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <MetricsCard
                  title="Total Users"
                  value={userStats.totalUsers}
                  color="primary"
                  icon={AddIcon}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <MetricsCard
                  title="Active Users"
                  value={userStats.activeUsers}
                  color="success"
                  icon={AddIcon}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <MetricsCard
                  title="Pending Approvals"
                  value={userStats.pendingUsers}
                  color="warning"
                  icon={AddIcon}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <MetricsCard
                  title="This Month"
                  value={userStats.newUsersThisMonth}
                  color="info"
                  icon={AddIcon}
                />
              </Grid>
            </Grid>
          )}

          {/* Search and Filters Card */}
          <Card 
            elevation={0}
            sx={{
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              bgcolor: '#ffffff',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            }}
          >
            <CardContent sx={{ pb: showFilters ? 2 : 1, p: 3 }}>
              {/* Search Row */}
              <Stack 
                direction={{ xs: 'column', md: 'row' }} 
                spacing={2} 
                alignItems={{ md: 'center' }}
                sx={{ mb: showFilters ? 2 : 0 }}
              >
                <TextField
                  placeholder="Search by name, email, or username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{ 
                    flex: 1,
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
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#9ca3af' }} />
                      </InputAdornment>
                    ),
                    endAdornment: searchQuery && (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={handleClearSearch}
                          edge="end"
                          sx={{ color: '#9ca3af' }}
                        >
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                />
                
                <Stack direction="row" spacing={1}>
                  <Button 
                    variant="contained" 
                    onClick={handleSearch}
                    disabled={!searchQuery.trim()}
                    sx={{ 
                      minWidth: 100,
                      bgcolor: '#3b82f6',
                      color: '#ffffff',
                      fontWeight: 600,
                      borderRadius: '8px',
                      '&:hover': { 
                        bgcolor: '#2563eb',
                      },
                      '&:disabled': {
                        bgcolor: '#e5e7eb',
                        color: '#9ca3af'
                      }
                    }}
                  >
                    Search
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<FilterListIcon />}
                    endIcon={showFilters ? <ExpandLess /> : <ExpandMore />}
                    onClick={() => setShowFilters(!showFilters)}
                    sx={{ 
                      minWidth: 100,
                      borderColor: '#d1d5db',
                      color: '#374151',
                      borderRadius: '8px',
                      '&:hover': {
                        borderColor: '#9ca3af',
                        backgroundColor: '#f9fafb'
                      }
                    }}
                  >
                    Filters
                  </Button>
                </Stack>
              </Stack>

              {/* Filters Section */}
              <Collapse in={showFilters}>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Roles</InputLabel>
                      <Select
                        multiple
                        value={filters.roles}
                        onChange={(e) => handleFilterChange({ 
                          ...filters, 
                          roles: e.target.value as string[] 
                        })}
                        input={<OutlinedInput label="Roles" />}
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => (
                              <Chip 
                                key={value} 
                                label={value.replace('_', ' ')} 
                                size="small"
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        )}
                      >
                        {roles.map((role) => (
                          <MenuItem key={role.id} value={role.name}>
                            {role.displayName || role.name.replace('_', ' ')}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={filters.status}
                        label="Status"
                        onChange={(e) => handleFilterChange({ 
                          ...filters, 
                          status: e.target.value as 'all' | 'active' | 'inactive' 
                        })}
                      >
                        <MenuItem value="all">All Status</MenuItem>
                        <MenuItem value="active">Active Only</MenuItem>
                        <MenuItem value="inactive">Inactive Only</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          setFilters({
                            roles: [],
                            departments: [],
                            status: 'all',
                            managers: [],
                          });
                          handleFilterChange({
                            roles: [],
                            departments: [],
                            status: 'all',
                            managers: [],
                          });
                        }}
                      >
                        Clear Filters
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </Collapse>
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <Alert 
              severity="error" 
              variant="filled"
              sx={{ borderRadius: 2 }}
            >
              {(error as any).message || 'Failed to load users'}
            </Alert>
          )}

          {/* Users Table Container */}
          <Card 
            elevation={0}
            sx={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column',
              overflow: 'hidden',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              bgcolor: '#ffffff',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            }}
          >
            <UserTable
              users={usersData?.content || []}
              totalCount={usersData?.totalElements || 0}
              isLoading={isLoading}
              error={error}
              searchParams={searchParams}
              onSearchParamsChange={handleSearchParamsChange}
              onUserEdit={handleUserEdit}
              onUserView={handleUserView}
              onUserDelete={handleUserDelete}
              onUserActivate={handleUserActivate}
              onUserDeactivate={handleUserDeactivate}
              onRoleAssign={handleRoleAssign}
            />
          </Card>
        </Stack>
      </Box>

      {/* Confirmation Dialog */}
      {confirmDialog && (
        <Dialog 
          open={confirmDialog.open} 
          onClose={() => setConfirmDialog(null)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Typography variant="h6" component="div">
              {confirmDialog.title}
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Typography color="text.secondary">
              {confirmDialog.message}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button 
              onClick={() => setConfirmDialog(null)}
              variant="outlined"
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmDialog.action} 
              color="error" 
              variant="contained"
              sx={{ minWidth: 100 }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Snackbar Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity={snackbar.severity}
          variant="filled"
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserListPage;