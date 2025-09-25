// src/components/users/UserTable.tsx
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Toolbar,
  Typography,
  Checkbox,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Avatar,
  Tooltip,
  alpha,
  Skeleton,
  Alert,
} from '@mui/material';
import {
  MoreVert,
  Edit,
  Delete,
  PersonAdd,
  PersonRemove,
  Visibility,
  Lock,
  LockOpen,
  Assignment,
} from '@mui/icons-material';
import { visuallyHidden } from '@mui/utils';
import { User, UserSearchParams } from '../../types/user';
import { formatDate, formatRelativeDate } from '../../utils/helpers';
import { USER_ROLES } from '../../types/auth';

interface UserTableColumn {
  id: keyof User | 'actions';
  label: string;
  minWidth?: number;
  align?: 'left' | 'right' | 'center';
  sortable?: boolean;
}

// ✅ FIXED: Updated column definitions to match backend entity fields
const columns: UserTableColumn[] = [
  { id: 'fullName', label: 'Full Name', minWidth: 200, sortable: true },
  { id: 'username', label: 'Username', minWidth: 150, sortable: true },
  { id: 'email', label: 'Email', minWidth: 200, sortable: true },
  { id: 'roles', label: 'Roles', minWidth: 150 },
  { id: 'department', label: 'Department', minWidth: 120 },
  { id: 'isActive', label: 'Status', minWidth: 100 },
  { id: 'createdAt', label: 'Created', minWidth: 120, sortable: true },
  { id: 'actions', label: 'Actions', minWidth: 120, align: 'center' },
];

interface UserTableProps {
  users: User[];
  totalCount: number;
  isLoading: boolean;
  error?: any;
  searchParams: UserSearchParams;
  onSearchParamsChange: (params: UserSearchParams) => void;
  onUserEdit: (user: User) => void;
  onUserView: (user: User) => void;
  onUserDelete: (user: User) => void;
  onUserActivate: (user: User) => void;
  onUserDeactivate: (user: User) => void;
  onRoleAssign: (user: User) => void;
  onBulkAction?: (action: string, userIds: string[]) => void;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  totalCount,
  isLoading,
  error,
  searchParams,
  onSearchParamsChange,
  onUserEdit,
  onUserView,
  onUserDelete,
  onUserActivate,
  onUserDeactivate,
  onRoleAssign,
  onBulkAction,
}) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [actionMenuAnchor, setActionMenuAnchor] = useState<{ element: HTMLElement; userId: string } | null>(null);

  const handleRequestSort = (property: keyof User) => {
    const isAsc = searchParams.sortBy === property && searchParams.sortDirection === 'asc';
    onSearchParamsChange({
      ...searchParams,
      sortBy: property as string,
      sortDirection: isAsc ? 'desc' : 'asc',
    });
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = users.map((user) => user.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleSelectClick = (_event: React.MouseEvent<unknown>, id: string) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    onSearchParamsChange({
      ...searchParams,
      page: newPage,
    });
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSearchParamsChange({
      ...searchParams,
      size: parseInt(event.target.value, 10),
      page: 0,
    });
  };

  const handleActionMenuOpen = (event: React.MouseEvent<HTMLElement>, userId: string) => {
    setActionMenuAnchor({ element: event.currentTarget, userId });
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
  };

  const isSelected = (id: string) => selected.indexOf(id) !== -1;

  const getRoleChips = (roles: string[]) => {
    return roles.map((role) => (
      <Chip 
        key={role} 
        label={role.replace('_', ' ')} 
        size="small" 
        sx={{ mr: 0.5, mb: 0.5 }}
        color={
          role === USER_ROLES.SUPER_ADMIN ? 'error' :
          role === USER_ROLES.ACCOUNT_MANAGER ? 'warning' :
          role === USER_ROLES.PROJECT_MANAGER ? 'info' :
          'default'
        }
      />
    ));
  };

  const getStatusChip = (user: User) => {
    if (!user.isActive) {
      return <Chip label="Inactive" color="default" size="small" />;
    }
    // accountLocked not part of the current User type; backend may include it but we won't type-check it here
    return <Chip label="Active" color="success" size="small" />;
  };

  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (error) {
    return (
      <Paper sx={{ p: 2 }}>
        <Alert severity="error">
          {error.message || 'Failed to load users'}
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ width: '100%', mb: 2 }}>
      <Toolbar
        sx={{
          pl: { sm: 2 },
          pr: { xs: 1, sm: 1 },
          ...(selected.length > 0 && {
            bgcolor: (theme) =>
              alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
          }),
        }}
      >
        {selected.length > 0 ? (
          <Typography
            sx={{ flex: '1 1 100%' }}
            color="inherit"
            variant="subtitle1"
            component="div"
          >
            {selected.length} selected
          </Typography>
        ) : (
          <Typography
            sx={{ flex: '1 1 100%' }}
            variant="h6"
            id="tableTitle"
            component="div"
          >
            Users ({totalCount})
          </Typography>
        )}

        {selected.length > 0 && onBulkAction && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Activate Selected">
              <IconButton onClick={() => onBulkAction('activate', selected)}>
                <PersonAdd />
              </IconButton>
            </Tooltip>
            <Tooltip title="Deactivate Selected">
              <IconButton onClick={() => onBulkAction('deactivate', selected)}>
                <PersonRemove />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Toolbar>

      <TableContainer>
        <Table stickyHeader aria-labelledby="tableTitle">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  color="primary"
                  indeterminate={selected.length > 0 && selected.length < users.length}
                  checked={users.length > 0 && selected.length === users.length}
                  onChange={handleSelectAllClick}
                  inputProps={{
                    'aria-label': 'select all users',
                  }}
                />
              </TableCell>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                  sortDirection={searchParams.sortBy === column.id ? searchParams.sortDirection : false}
                >
                  {column.sortable ? (
                    <TableSortLabel
                      active={searchParams.sortBy === column.id}
                      direction={searchParams.sortBy === column.id ? searchParams.sortDirection : 'asc'}
                      onClick={() => handleRequestSort(column.id as keyof User)}
                    >
                      {column.label}
                      {searchParams.sortBy === column.id ? (
                        <Box component="span" sx={visuallyHidden}>
                          {searchParams.sortDirection === 'desc' ? 'sorted descending' : 'sorted ascending'}
                        </Box>
                      ) : null}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: searchParams.size || 10 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell padding="checkbox">
                    <Skeleton variant="rectangular" width={20} height={20} />
                  </TableCell>
                  {columns.map((column) => (
                    <TableCell key={column.id}>
                      <Skeleton variant="text" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No users found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                const isItemSelected = isSelected(user.id);
                const labelId = `enhanced-table-checkbox-${user.id}`;

                return (
                  <TableRow
                    hover
                    onClick={(event) => handleSelectClick(event, user.id)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={user.id}
                    selected={isItemSelected}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isItemSelected}
                        inputProps={{
                          'aria-labelledby': labelId,
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar>
                          {getInitials(user.fullName || user.username)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {user.fullName || user.username}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {user.id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell>{user.username}</TableCell>

                    <TableCell>{user.email}</TableCell>

                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                        {getRoleChips(user.roles || [])}
                      </Box>
                    </TableCell>

                    <TableCell>{user.department || 'N/A'}</TableCell>

                    <TableCell>{getStatusChip(user)}</TableCell>

                    <TableCell>
                      {user.createdAt ? (
                        <Tooltip title={formatDate(user.createdAt)}>
                          <Typography variant="body2">
                            {formatRelativeDate(user.createdAt)}
                          </Typography>
                        </Tooltip>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>

                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleActionMenuOpen(event, user.id);
                        }}
                      >
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={totalCount}
        rowsPerPage={searchParams.size || 10}
        page={searchParams.page || 0}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchor?.element}
        open={Boolean(actionMenuAnchor)}
        onClose={handleActionMenuClose}
        onClick={handleActionMenuClose}
      >
        <MenuItem onClick={() => {
          const user = users.find(u => u.id === actionMenuAnchor?.userId);
          if (user) onUserView(user);
        }}>
          <Visibility sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={() => {
          const user = users.find(u => u.id === actionMenuAnchor?.userId);
          if (user) onUserEdit(user);
        }}>
          <Edit sx={{ mr: 1 }} />
          Edit User
        </MenuItem>
        <MenuItem onClick={() => {
          const user = users.find(u => u.id === actionMenuAnchor?.userId);
          if (user) onRoleAssign(user);
        }}>
          <Assignment sx={{ mr: 1 }} />
          Manage Roles
        </MenuItem>
        {(() => {
          const user = users.find(u => u.id === actionMenuAnchor?.userId);
          if (user?.isActive) {
            return (
              <MenuItem onClick={() => {
                if (user) onUserDeactivate(user);
              }}>
                <Lock sx={{ mr: 1 }} />
                Deactivate
              </MenuItem>
            );
          } else {
            return (
              <MenuItem onClick={() => {
                if (user) onUserActivate(user);
              }}>
                <LockOpen sx={{ mr: 1 }} />
                Activate
              </MenuItem>
            );
          }
        })()}
        <MenuItem 
          onClick={() => {
            const user = users.find(u => u.id === actionMenuAnchor?.userId);
            if (user) onUserDelete(user);
          }}
          sx={{ color: 'error.main' }}
        >
          <Delete sx={{ mr: 1 }} />
          Delete User
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export default UserTable;