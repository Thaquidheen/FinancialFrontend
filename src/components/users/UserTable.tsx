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
    } else {
      setSelected([]);
    }
  };

  const handleSelectClick = (userId: string) => {
    const selectedIndex = selected.indexOf(userId);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, userId);
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
      page: 0,
      size: parseInt(event.target.value, 10),
    });
  };

  const handleActionMenuOpen = (event: React.MouseEvent<HTMLElement>, userId: string) => {
    setActionMenuAnchor({ element: event.currentTarget, userId });
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
  };

  const handleBulkAction = (action: string) => {
    if (onBulkAction && selected.length > 0) {
      onBulkAction(action, selected);
      setSelected([]);
    }
  };

  const isSelected = (userId: string) => selected.indexOf(userId) !== -1;

  const getRoleChips = (roles: string[]) => (
    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
      {roles.map((role) => {
        const roleConfig = {
          [USER_ROLES.SUPER_ADMIN]: { color: 'error' as const, label: 'Super Admin' },
          [USER_ROLES.ACCOUNT_MANAGER]: { color: 'warning' as const, label: 'Account Mgr' },
          [USER_ROLES.PROJECT_MANAGER]: { color: 'info' as const, label: 'Project Mgr' },
          [USER_ROLES.EMPLOYEE]: { color: 'default' as const, label: 'Employee' },
        };

        const config = roleConfig[role as keyof typeof roleConfig] || { color: 'default' as const, label: role as string };

        return (
          <Chip
            key={role}
            label={config.label}
            size="small"
            color={config.color}
            sx={{ fontSize: '0.75rem', height: 20 }}
          />
        );
      })}
    </Box>
  );

  const getStatusChip = (isActive: boolean) => (
    <Chip
      label={isActive ? 'Active' : 'Inactive'}
      size="small"
      color={isActive ? 'success' : 'default'}
      sx={{ minWidth: 70 }}
    />
  );

  const getUserInitials = (fullName: string) => {
    const names = fullName.split(' ');
    return names.length >= 2 ? `${names[0][0]}${names[1][0]}`.toUpperCase() : fullName.slice(0, 2).toUpperCase();
  };

  if (error) {
    return (
      <Paper>
        <Box sx={{ p: 3 }}>
          <Alert severity="error">Failed to load users. Please try again.</Alert>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      {/* Enhanced Toolbar */}
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
          <Typography sx={{ flex: '1 1 100%' }} color="inherit" variant="subtitle1" component="div">
            {selected.length} selected
          </Typography>
        ) : (
          <Typography sx={{ flex: '1 1 100%' }} variant="h6" id="tableTitle" component="div">
            Users
          </Typography>
        )}

        {selected.length > 0 && onBulkAction && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Activate Selected">
              <IconButton onClick={() => handleBulkAction('activate')}>
                <LockOpen />
              </IconButton>
            </Tooltip>
            <Tooltip title="Deactivate Selected">
              <IconButton onClick={() => handleBulkAction('deactivate')}>
                <Lock />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Selected">
              <IconButton onClick={() => handleBulkAction('delete')}>
                <Delete />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Toolbar>

      {/* Table */}
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
                  inputProps={{ 'aria-label': 'select all users' }}
                />
              </TableCell>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  style={{ minWidth: column.minWidth }}
                  sortDirection={searchParams.sortBy === column.id ? searchParams.sortDirection || false : false}
                >
                  {column.sortable ? (
                    <TableSortLabel
                      active={searchParams.sortBy === column.id}
                      direction={searchParams.sortBy === column.id ? searchParams.sortDirection || 'asc' : 'asc'}
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
            {isLoading
              ? Array.from(new Array(10)).map((_, index) => (
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
              : users.map((user) => {
                  const isItemSelected = isSelected(user.id);
                  
                  return (
                    <TableRow
                      hover
                      onClick={() => handleSelectClick(user.id)}
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
                          inputProps={{ 'aria-labelledby': `enhanced-table-checkbox-${user.id}` }}
                        />
                      </TableCell>
                      
                      {/* Full Name with Avatar */}
                      <TableCell component="th" id={`enhanced-table-checkbox-${user.id}`} scope="row">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar
                            src={user.profileImage}
                            sx={{ width: 32, height: 32, fontSize: '0.875rem' }}
                          >
                            {getUserInitials(user.fullName)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {user.fullName}
                            </Typography>
                            {user.position && (
                              <Typography variant="caption" color="text.secondary">
                                {user.position}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Username */}
                      <TableCell>{user.username}</TableCell>

                      {/* Email */}
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {user.email}
                        </Typography>
                      </TableCell>

                      {/* Roles */}
                      <TableCell>{getRoleChips(user.roles)}</TableCell>

                      {/* Department */}
                      <TableCell>{user.department || '-'}</TableCell>

                      {/* Status */}
                      <TableCell>{getStatusChip(user.isActive)}</TableCell>

                      {/* Created Date */}
                      <TableCell>
                        <Tooltip title={formatDate(user.createdAt)}>
                          <Typography variant="body2">
                            {formatRelativeDate(user.createdAt)}
                          </Typography>
                        </Tooltip>
                      </TableCell>

                      {/* Actions */}
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleActionMenuOpen(e, user.id);
                          }}
                        >
                          <MoreVert />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={totalCount}
        rowsPerPage={searchParams.size || 10}
        page={searchParams.page || 0}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Actions Menu */}
      <Menu
        anchorEl={actionMenuAnchor?.element}
        open={Boolean(actionMenuAnchor)}
        onClose={handleActionMenuClose}
        onClick={handleActionMenuClose}
      >
        <MenuItem onClick={() => actionMenuAnchor && onUserView(users.find(u => u.id === actionMenuAnchor.userId)!)}>
          <Visibility fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={() => actionMenuAnchor && onUserEdit(users.find(u => u.id === actionMenuAnchor.userId)!)}>
          <Edit fontSize="small" sx={{ mr: 1 }} />
          Edit User
        </MenuItem>
        <MenuItem onClick={() => actionMenuAnchor && onRoleAssign(users.find(u => u.id === actionMenuAnchor.userId)!)}>
          <Assignment fontSize="small" sx={{ mr: 1 }} />
          Assign Roles
        </MenuItem>
        {actionMenuAnchor && users.find(u => u.id === actionMenuAnchor.userId)?.isActive ? (
          <MenuItem onClick={() => actionMenuAnchor && onUserDeactivate(users.find(u => u.id === actionMenuAnchor.userId)!)}>
            <PersonRemove fontSize="small" sx={{ mr: 1 }} />
            Deactivate
          </MenuItem>
        ) : (
          <MenuItem onClick={() => actionMenuAnchor && onUserActivate(users.find(u => u.id === actionMenuAnchor.userId)!)}>
            <PersonAdd fontSize="small" sx={{ mr: 1 }} />
            Activate
          </MenuItem>
        )}
        <MenuItem 
          onClick={() => actionMenuAnchor && onUserDelete(users.find(u => u.id === actionMenuAnchor.userId)!)}
          sx={{ color: 'error.main' }}
        >
          <Delete fontSize="small" sx={{ mr: 1 }} />
          Delete User
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export default UserTable;