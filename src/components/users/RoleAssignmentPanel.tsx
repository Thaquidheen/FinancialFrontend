import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  Alert,
  Divider,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import {
  Security,
  Assignment,
  CheckCircle,
  Warning,
} from '@mui/icons-material';
import { useRoles } from '../../hooks/useUser';
import { User, UpdateUserRolesRequest, Role } from '../../types/user';
import { USER_ROLES } from '../../types/auth';

interface RoleAssignmentPanelProps {
  user: User;
  onRolesUpdate: (rolesData: UpdateUserRolesRequest) => Promise<void>;
  isLoading?: boolean;
  error?: any;
}

const RoleAssignmentPanel: React.FC<RoleAssignmentPanelProps> = ({
  user,
  onRolesUpdate,
  isLoading = false,
  error,
}) => {
  const { data: availableRoles = [] } = useRoles();
  const [selectedRoles, setSelectedRoles] = useState<string[]>(user.roles || []);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    newRoles: string[];
  }>({ open: false, newRoles: [] });
  const [hasChanges, setHasChanges] = useState(false);

  const handleRoleChange = (roleName: string, checked: boolean) => {
    let newRoles: string[];
    
    if (checked) {
      newRoles = [...selectedRoles, roleName];
    } else {
      newRoles = selectedRoles.filter(role => role !== roleName);
    }
    
    setSelectedRoles(newRoles);
    setHasChanges(JSON.stringify(newRoles.sort()) !== JSON.stringify(user.roles.sort()));
  };

  const handleSave = () => {
    // Check for critical role changes that need confirmation
    const hasAdminRole = selectedRoles.includes(USER_ROLES.SUPER_ADMIN);
    const hadAdminRole = user.roles.includes(USER_ROLES.SUPER_ADMIN);
    const removingAdminRole = hadAdminRole && !hasAdminRole;
    const addingAdminRole = !hadAdminRole && hasAdminRole;

    if (removingAdminRole || addingAdminRole) {
      setConfirmDialog({ open: true, newRoles: selectedRoles });
    } else {
      submitRoleChanges(selectedRoles);
    }
  };

  const submitRoleChanges = async (roles: string[]) => {
    try {
      await onRolesUpdate({ roles });
      setHasChanges(false);
    } catch (error) {
      // Error handling is done by the parent component
    }
  };

  const handleConfirmRoleChange = () => {
    submitRoleChanges(confirmDialog.newRoles);
    setConfirmDialog({ open: false, newRoles: [] });
  };

  const handleCancelChanges = () => {
    setSelectedRoles(user.roles);
    setHasChanges(false);
  };

  const getRoleColor = (roleName: string) => {
    const roleColors = {
      [USER_ROLES.SUPER_ADMIN]: 'error' as const,
      [USER_ROLES.ACCOUNT_MANAGER]: 'warning' as const,
      [USER_ROLES.PROJECT_MANAGER]: 'info' as const,
      [USER_ROLES.EMPLOYEE]: 'default' as const,
    };
    return roleColors[roleName as keyof typeof roleColors] || 'default';
  };

  const getRoleIcon = (roleName: string) => {
    const roleIcons = {
      [USER_ROLES.SUPER_ADMIN]: <Security />,
      [USER_ROLES.ACCOUNT_MANAGER]: <Assignment />,
      [USER_ROLES.PROJECT_MANAGER]: <Assignment />,
      [USER_ROLES.EMPLOYEE]: <CheckCircle />,
    };
    return roleIcons[roleName as keyof typeof roleIcons] || <CheckCircle />;
  };

  const getPermissionsList = (roleName: string) => {
    const permissions = {
      [USER_ROLES.SUPER_ADMIN]: [
        'Full system access',
        'User management',
        'System configuration',
        'All reports and analytics',
        'Financial oversight',
      ],
      [USER_ROLES.ACCOUNT_MANAGER]: [
        'Quotation approval',
        'Payment processing',
        'Financial reports',
        'Budget oversight',
        'Bank file generation',
      ],
      [USER_ROLES.PROJECT_MANAGER]: [
        'Project management',
        'Quotation creation',
        'Team management',
        'Project reports',
        'Budget tracking',
      ],
      [USER_ROLES.EMPLOYEE]: [
        'Quotation requests',
        'Document upload',
        'View own data',
        'Basic reports',
      ],
    };
    return permissions[roleName as keyof typeof permissions] || [];
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Role Assignment for {user.fullName}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error.message || 'Failed to update roles'}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Current Roles */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Current Roles
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {user.roles.map(role => (
                  <Chip
                    key={role}
                    label={role.replace('_', ' ')}
                    color={getRoleColor(role)}
                    icon={getRoleIcon(role)}
                  />
                ))}
              </Box>
              {user.roles.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No roles assigned
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* New Roles (if changes made) */}
        {hasChanges && (
          <Grid item xs={12} md={6}>
            <Card sx={{ border: 2, borderColor: 'warning.main' }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  New Roles (Pending)
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {selectedRoles.map(role => (
                    <Chip
                      key={role}
                      label={role.replace('_', ' ')}
                      color={getRoleColor(role)}
                      icon={getRoleIcon(role)}
                      variant="outlined"
                    />
                  ))}
                </Box>
                {selectedRoles.length === 0 && (
                  <Typography variant="body2" color="warning.main">
                    No roles selected - user will have no access
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Role Selection */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Available Roles
              </Typography>
              <FormGroup>
                {availableRoles.map((role: Role) => (
                  <Box key={role.id} sx={{ mb: 2 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedRoles.includes(role.name)}
                          onChange={(e) => handleRoleChange(role.name, e.target.checked)}
                          disabled={isLoading}
                        />
                      }
                      label={
                        <Box sx={{ ml: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getRoleIcon(role.name)}
                            <Typography variant="body1" fontWeight="medium">
                              {role.displayName || role.name.replace('_', ' ')}
                            </Typography>
                            <Chip
                              label={role.name.replace('_', ' ')}
                              size="small"
                              color={getRoleColor(role.name)}
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {role.description}
                          </Typography>
                        </Box>
                      }
                    />
                    
                    {selectedRoles.includes(role.name) && (
                      <Box sx={{ ml: 4, mt: 1 }}>
                        <Typography variant="caption" color="text.secondary" gutterBottom>
                          Permissions:
                        </Typography>
                        <List dense>
                          {getPermissionsList(role.name).map((permission, index) => (
                            <ListItem key={index} sx={{ py: 0.25, pl: 0 }}>
                              <ListItemIcon sx={{ minWidth: 20 }}>
                                <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                              </ListItemIcon>
                              <ListItemText
                                primary={permission}
                                primaryTypographyProps={{ variant: 'caption' }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}
                    <Divider />
                  </Box>
                ))}
              </FormGroup>
            </CardContent>
          </Card>
        </Grid>

        {/* Action Buttons */}
        <Grid item xs={12}>
          {hasChanges && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                You have unsaved changes. Click "Save Changes" to apply the new roles.
              </Typography>
            </Alert>
          )}
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={handleCancelChanges}
              disabled={!hasChanges || isLoading}
            >
              Cancel Changes
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={!hasChanges || isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : undefined}
            >
              Save Changes
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, newRoles: [] })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Warning color="warning" />
            Confirm Role Changes
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            You are about to make significant role changes:
          </Typography>
          
          {user.roles.includes(USER_ROLES.SUPER_ADMIN) && 
           !confirmDialog.newRoles.includes(USER_ROLES.SUPER_ADMIN) && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Removing Super Admin role</strong> - This user will lose all administrative privileges.
              </Typography>
            </Alert>
          )}
          
          {!user.roles.includes(USER_ROLES.SUPER_ADMIN) && 
           confirmDialog.newRoles.includes(USER_ROLES.SUPER_ADMIN) && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Adding Super Admin role</strong> - This user will gain full system access.
              </Typography>
            </Alert>
          )}

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Current Roles:
            </Typography>
            <Box sx={{ mb: 2 }}>
              {user.roles.map(role => (
                <Chip key={role} label={role.replace('_', ' ')} size="small" sx={{ mr: 1, mb: 1 }} />
              ))}
            </Box>

            <Typography variant="subtitle2" gutterBottom>
              New Roles:
            </Typography>
            <Box>
              {confirmDialog.newRoles.map(role => (
                <Chip 
                  key={role} 
                  label={role.replace('_', ' ')} 
                  size="small" 
                  color="primary"
                  sx={{ mr: 1, mb: 1 }} 
                />
              ))}
            </Box>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Are you sure you want to proceed with these changes?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, newRoles: [] })}>
            Cancel
          </Button>
          <Button onClick={handleConfirmRoleChange} variant="contained" color="warning">
            Confirm Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RoleAssignmentPanel;