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
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  GetApp as ExportIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  useUsers,
  useUserStats,
  useRoles,
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
  
  // FIX: Use 'createdDate' instead of 'createdAt' to match backend entity
  const [searchParams, setSearchParams] = useState<UserSearchParams>({
    page: 0,
    size: 10,
    sortBy: 'createdDate', // ✅ Fixed: Changed from 'createdAt' to 'createdDate'
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
  // Removed unused selectedUser state
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
  const bulkOperationMutation = useBulkUserOperation();
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
      page: 0, // Reset to first page
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
      ...newFilters,
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

  const handleBulkAction = (action: string, userIds: string[]) => {
    bulkOperationMutation.mutate({ 
      userIds, 
      operation: action as 'activate' | 'deactivate' 
    }, {
      onSuccess: () => {
        setSnackbar({
          open: true,
          message: `Bulk ${action} completed successfully`,
          severity: 'success',
        });
      },
      onError: () => {
        setSnackbar({
          open: true,
          message: `Failed to ${action} selected users`,
          severity: 'error',
        });
      },
    });
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
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          User Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={() => refreshAll()}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          {canExportUsers && (
            <Button
              variant="outlined"
              startIcon={<ExportIcon />}
              onClick={handleExport}
              disabled={exportUsersMutation.isLoading}
            >
              Export
            </Button>
          )}
          {canCreateUser && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate(ROUTES.USER_CREATE)}
            >
              Add User
            </Button>
          )}
        </Box>
      </Box>

      {/* Statistics Cards */}
      {userStats && (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2, mb: 3 }}>
          <MetricsCard
            title="Total Users"
            value={userStats.totalUsers}
            color="primary"
            icon={AddIcon}
          />
          <MetricsCard
            title="Active Users"
            value={userStats.activeUsers}
            color="success"
            icon={AddIcon}
          />
          <MetricsCard
            title="Pending Approvals"
            value={userStats.pendingUsers}
            color="warning"
            icon={AddIcon}
          />
          <MetricsCard
            title="This Month"
            value={userStats.newUsersThisMonth}
            color="info"
            icon={AddIcon}
          />
        </Box>
      )}

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
            <TextField
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ flex: 1 }}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
            <Button variant="contained" onClick={handleSearch}>
              Search
            </Button>
            <Button variant="outlined" onClick={handleClearSearch}>
              Clear
            </Button>
            <Button variant="text" onClick={() => setShowFilters(!showFilters)}>
              {showFilters ? 'Hide' : 'Show'} Filters
            </Button>
          </Box>

          {/* Filters */}
          {showFilters && (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
              <FormControl size="small">
                <InputLabel>Roles</InputLabel>
                <Select
                  multiple
                  value={filters.roles}
                  onChange={(e) => handleFilterChange({ ...filters, roles: e.target.value as string[] })}
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
                      {role.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Departments filter removed (no backend support) */}

              <FormControl size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  onChange={(e) => handleFilterChange({ ...filters, status: e.target.value as 'all' | 'active' | 'inactive' })}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {(error as any).message || 'Failed to load users'}
        </Alert>
      )}

      {/* Users Table */}
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
        onBulkAction={handleBulkAction}
      />

      {/* Confirmation Dialog */}
      {confirmDialog && (
        <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog(null)}>
          <DialogTitle>{confirmDialog.title}</DialogTitle>
          <DialogContent>
            <Typography>{confirmDialog.message}</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDialog(null)}>Cancel</Button>
            <Button onClick={confirmDialog.action} color="error" variant="contained">
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserListPage;