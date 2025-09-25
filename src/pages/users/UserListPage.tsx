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
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  GetApp as ExportIcon,
  Upload as ImportIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  useUsers,
  useUserStats,
  useRoles,
  useDepartments,
  useDeleteUser,
  useActivateUser,
  useDeactivateUser,
  useBulkUserOperation,
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
    sortBy: 'createdAt',
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
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
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
  const { data: usersData, isLoading, error, refetch } = useUsers(searchParams);
  const { data: userStats } = useUserStats();
  const { data: roles = [] } = useRoles();
  const { data: departments = [] } = useDepartments();
  const { refreshAll } = useRefreshUsers();

  // Mutation hooks
  const deleteUserMutation = useDeleteUser();
  const activateUserMutation = useActivateUser();
  const deactivateUserMutation = useDeactivateUser();
  const bulkOperationMutation = useBulkUserOperation();
  const exportUsersMutation = useExportUsers();

  const users = (usersData as any)?.content || [];
  const totalCount = (usersData as any)?.totalElements || 0;

  // Check if current user has admin access
  const hasAdminAccess = currentUser?.roles?.includes(USER_ROLES.SUPER_ADMIN);

  const handleSearchParamsChange = (newParams: UserSearchParams) => {
    setSearchParams(newParams);
  };

  const handleSearch = () => {
    setSearchParams({
      ...searchParams,
      search: searchQuery,
      page: 0,
    });
  };

  const handleFilterChange = (newFilters: UserFilters) => {
    setFilters(newFilters);
    setSearchParams({
      ...searchParams,
      roles: newFilters.roles,
      departments: newFilters.departments,
      isActive: newFilters.status === 'all' ? undefined : newFilters.status === 'active',
      page: 0,
    });
  };

  const handleCreateUser = () => {
    navigate(ROUTES.USER_CREATE);
  };

  const handleUserView = (user: User) => {
    navigate(ROUTES.USER_DETAIL.replace(':id', user.id));
  };

  const handleUserEdit = (user: User) => {
    navigate(ROUTES.USER_EDIT.replace(':id', user.id));
  };

  const handleUserDelete = (user: User) => {
    setConfirmDialog({
      open: true,
      title: 'Delete User',
      message: `Are you sure you want to delete "${user.fullName}"? This action cannot be undone.`,
      action: () => confirmDeleteUser(user),
    });
  };

  const confirmDeleteUser = async (user: User) => {
    try {
      await deleteUserMutation.mutateAsync(user.id);
      setSnackbar({
        open: true,
        message: 'User deleted successfully',
        severity: 'success',
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to delete user',
        severity: 'error',
      });
    }
  };

  const handleUserActivate = async (user: User) => {
    try {
      await activateUserMutation.mutateAsync(user.id);
      setSnackbar({
        open: true,
        message: 'User activated successfully',
        severity: 'success',
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to activate user',
        severity: 'error',
      });
    }
  };

  const handleUserDeactivate = async (user: User) => {
    try {
      await deactivateUserMutation.mutateAsync(user.id);
      setSnackbar({
        open: true,
        message: 'User deactivated successfully',
        severity: 'success',
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to deactivate user',
        severity: 'error',
      });
    }
  };

  const handleRoleAssign = (user: User) => {
    // Navigate to role assignment page or open role assignment dialog
    navigate(ROUTES.USER_EDIT.replace(':id', user.id) + '?tab=roles');
  };

  const handleBulkAction = async (action: string, userIds: string[]) => {
    try {
      await bulkOperationMutation.mutateAsync({
        userIds,
        operation: action as any,
      });
      setSnackbar({
        open: true,
        message: `Bulk ${action} completed successfully`,
        severity: 'success',
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || `Failed to perform bulk ${action}`,
        severity: 'error',
      });
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportUsersMutation.mutateAsync(searchParams);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSnackbar({
        open: true,
        message: 'Users exported successfully',
        severity: 'success',
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to export users',
        severity: 'error',
      });
    }
  };

  const handleRefresh = async () => {
    await refreshAll();
    await refetch();
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleConfirmDialogClose = () => {
    setConfirmDialog(null);
  };

  if (!hasAdminAccess) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          You don't have permission to access user management.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            User Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage system users, roles, and permissions
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tooltip title="Import Users">
            <IconButton>
              <ImportIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export Users">
            <IconButton onClick={handleExport} disabled={exportUsersMutation.isPending}>
              <ExportIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateUser}
          >
            Add User
          </Button>
        </Box>
      </Box>

      {/* User Statistics */}
      {userStats && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
          <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
            <MetricsCard
              title="Total Users"
              value={{ current: userStats.totalUsers, format: 'number' }}
              icon={AddIcon}
              color="primary"
            />
          </Box>
          <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
            <MetricsCard
              title="Active Users"
              value={{ current: userStats.activeUsers, format: 'number' }}
              icon={AddIcon}
              color="success"
            />
          </Box>
          <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
            <MetricsCard
              title="Recently Added"
              value={{ current: userStats.recentlyUpdated, format: 'number' }}
              icon={AddIcon}
              color="info"
            />
          </Box>
          <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
            <MetricsCard
              title="Inactive Users"
              value={{ current: userStats.inactiveUsers, format: 'number' }}
              icon={AddIcon}
              color="warning"
            />
          </Box>
            </Box>
      )}

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
              <TextField
                fullWidth
                placeholder="Search by name, username, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                InputProps={{
                  endAdornment: (
                    <IconButton onClick={handleSearch}>
                      <SearchIcon />
                    </IconButton>
                  ),
                }}
              />
            </Box>
            <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status}
                    label="Status"
                    onChange={(e) => handleFilterChange({ ...filters, status: e.target.value as any })}
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Roles</InputLabel>
                  <Select
                    multiple
                    value={filters.roles}
                    label="Roles"
                    onChange={(e) => {
                      const value = typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value;
                      handleFilterChange({ ...filters, roles: value });
                    }}
                    input={<OutlinedInput label="Roles" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {roles.map((role) => (
                      <MenuItem key={role.id} value={role.name}>
                        {role.displayName || role.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Department</InputLabel>
                  <Select
                    multiple
                    value={filters.departments}
                    label="Department"
                    onChange={(e) => {
                      const value = typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value;
                      handleFilterChange({ ...filters, departments: value });
                    }}
                    input={<OutlinedInput label="Department" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {departments.map((dept) => (
                      <MenuItem key={dept.id} value={dept.name}>
                        {dept.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* User Table */}
      <UserTable
        users={users}
        totalCount={totalCount}
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
        onBulkAction={handleBulkAction}
      />

      {/* Confirmation Dialog */}
      <Dialog
        open={!!confirmDialog}
        onClose={handleConfirmDialogClose}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <DialogTitle id="confirm-dialog-title">
          {confirmDialog?.title}
        </DialogTitle>
        <DialogContent>
          <Typography id="confirm-dialog-description">
            {confirmDialog?.message}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmDialogClose}>Cancel</Button>
          <Button
            onClick={() => {
              confirmDialog?.action();
              handleConfirmDialogClose();
            }}
            color="error"
            variant="contained"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserListPage;