// src/pages/users/UserDetailsPage.tsx
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
  Button,
  Chip,
  Grid,
  Card,
  CardContent,
  Avatar,
  Stack,
  Container,
  IconButton,
  Tooltip,
  Badge,
  Skeleton,
  useTheme,
  useMediaQuery,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CardHeader,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  CalendarToday as CalendarIcon,
  Security as SecurityIcon,
  AccountBalance as BankIcon,
  Verified as VerifiedIcon,
  Warning as WarningIcon,
  History as HistoryIcon,
  Business as BusinessIcon,
  Badge as BadgeIcon,
  CreditCard as CreditCardIcon,
  Shield as ShieldIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import {
  useUser,
} from '@hooks/useUser';
import UserActivityPanel from '@components/users/UserActivityPanel';
import { formatDate, formatRelativeDate } from '@utils/helpers';
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
      id={`user-detail-tabpanel-${index}`}
      aria-labelledby={`user-detail-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 0 }}>{children}</Box>}
    </div>
  );
}

const UserDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { id: userId } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState(0);

  // Data fetching hooks
  const { data: user, isLoading, error } = useUser(userId!);

  // Check permissions
  const hasAdminAccess = currentUser?.roles?.includes(USER_ROLES.SUPER_ADMIN);
  const canEditUser = hasAdminAccess || currentUser?.id === userId;

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleEditUser = () => {
    navigate(ROUTES.USER_EDIT.replace(':id', userId!));
  };

  // Utility functions
  const getRoleColor = (role: string) => {
    switch (role) {
      case USER_ROLES.SUPER_ADMIN: return 'error';
      case USER_ROLES.ACCOUNT_MANAGER: return 'warning';
      case USER_ROLES.PROJECT_MANAGER: return 'info';
      case USER_ROLES.EMPLOYEE: return 'default';
      default: return 'default';
    }
  };

  const getUserInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusInfo = (isActive: boolean, accountLocked: boolean) => {
    if (accountLocked) return { label: 'Locked', color: 'error', icon: <CancelIcon /> };
    if (isActive) return { label: 'Active', color: 'success', icon: <CheckCircleIcon /> };
    return { label: 'Inactive', color: 'warning', icon: <WarningIcon /> };
  };

  // Loading state
  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Skeleton variant="text" width={200} height={32} sx={{ mb: 2 }} />
          <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" spacing={3} alignItems="center">
              <Skeleton variant="circular" width={100} height={100} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width={300} height={40} />
                <Skeleton variant="text" width={200} height={24} sx={{ mb: 1 }} />
                <Skeleton variant="rectangular" width={400} height={32} />
              </Box>
            </Stack>
          </Paper>
          <Skeleton variant="rectangular" height={400} />
        </Box>
      </Container>
    );
  }

  // Error states
  if (!userId) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Alert severity="error" variant="filled">Invalid user ID</Alert>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Alert severity="error" variant="filled">
            Failed to load user details. Please try again.
          </Alert>
        </Box>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Alert severity="error" variant="filled">User not found</Alert>
        </Box>
      </Container>
    );
  }

  const statusInfo = getStatusInfo(user.isActive, false); // accountLocked property doesn't exist

  return (
    <Box sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: '#f8fafc',
    }}>
      <Box sx={{ flex: 1, overflow: 'hidden', p: 3 }}>
          {/* Header Section */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              mb: 3, 
              bgcolor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            }}
          >
            {/* Navigation */}
            <Box sx={{ mb: 3 }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Tooltip title="Back to Users">
                  <IconButton 
                    onClick={() => navigate(ROUTES.USERS)}
                    sx={{ 
                      bgcolor: 'action.hover',
                      '&:hover': { bgcolor: 'action.selected' }
                    }}
                  >
                    <ArrowBackIcon />
                  </IconButton>
                </Tooltip>
                
                <Breadcrumbs separator="›">
                  <Link
                    color="inherit"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(ROUTES.DASHBOARD);
                    }}
                    sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
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
                    sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                  >
                    Users
                  </Link>
                  <Typography color="text.primary" fontWeight={500}>
                    {user.fullName}
                  </Typography>
                </Breadcrumbs>
              </Stack>
            </Box>

            {/* User Profile Header */}
            <Stack 
              direction={{ xs: 'column', md: 'row' }} 
              spacing={3} 
              alignItems={{ xs: 'center', md: 'flex-start' }}
              justifyContent="space-between"
            >
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={3} 
                alignItems={{ xs: 'center', sm: 'flex-start' }}
              >
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    <Box sx={{ 
                      bgcolor: statusInfo.color + '.main',
                      borderRadius: '50%',
                      p: 0.5,
                      border: 2,
                      borderColor: 'background.paper'
                    }}>
                      {React.cloneElement(statusInfo.icon, { sx: { fontSize: 16, color: 'white' } })}
                    </Box>
                  }
                >
                  <Avatar
                    src={user.profileImage}
                    sx={{
                      width: 100,
                      height: 100,
                      bgcolor: 'primary.main',
                      fontSize: '2.5rem',
                      fontWeight: 600,
                      boxShadow: 4
                    }}
                  >
                    {getUserInitials(user.fullName)}
                  </Avatar>
                </Badge>

                <Stack spacing={1} sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                  <Typography variant="h3" component="h1" fontWeight={700} color="text.primary">
                    {user.fullName}
                  </Typography>
                  
                  <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent={{ xs: 'center', sm: 'flex-start' }}>
                    <Chip
                      icon={statusInfo.icon}
                      label={statusInfo.label}
                      color={statusInfo.color as any}
                      variant="filled"
                      sx={{ fontWeight: 500 }}
                    />
                    {user.roles?.map((role, index) => (
                      <Chip
                        key={index}
                        label={role.replace('_', ' ')}
                        color={getRoleColor(role) as any}
                        variant="outlined"
                        size="small"
                        sx={{ fontWeight: 500 }}
                      />
                    ))}
                  </Stack>

                  <Stack spacing={0.5}>
                    <Stack direction="row" spacing={1} alignItems="center" justifyContent={{ xs: 'center', sm: 'flex-start' }}>
                      <EmailIcon fontSize="small" color="action" />
                      <Typography variant="body1" color="text.secondary">
                        {user.email}
                      </Typography>
                    </Stack>
                    
                    {user.department && (
                      <Stack direction="row" spacing={1} alignItems="center" justifyContent={{ xs: 'center', sm: 'flex-start' }}>
                        <BusinessIcon fontSize="small" color="action" />
                        <Typography variant="body1" color="text.secondary">
                          {user.department}
                        </Typography>
                      </Stack>
                    )}
                  </Stack>
                </Stack>
              </Stack>

              {canEditUser && (
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={handleEditUser}
                  size="large"
                  sx={{ 
                    minWidth: 140,
                    boxShadow: 2,
                    '&:hover': { boxShadow: 4 }
                  }}
                >
                  Edit User
                </Button>
              )}
            </Stack>
          </Paper>

          {/* Main Content */}
          <Paper 
            elevation={0} 
            sx={{ 
              overflow: 'hidden', 
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            }}
          >
            {/* Navigation Tabs */}
            <Box sx={{ borderBottom: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange} 
                variant={isMobile ? 'scrollable' : 'standard'}
                scrollButtons={isMobile ? 'auto' : false}
                sx={{
                  '& .MuiTab-root': {
                    minHeight: 64,
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    color: '#64748b',
                    '&.Mui-selected': {
                      color: '#3b82f6',
                    },
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#3b82f6',
                  },
                }}
              >
                <Tab 
                  icon={<PersonIcon />} 
                  label="Overview" 
                  iconPosition="start"
                  sx={{ gap: 1 }}
                />
                <Tab 
                  icon={<BadgeIcon />} 
                  label="Personal Info" 
                  iconPosition="start"
                  sx={{ gap: 1 }}
                />
                <Tab 
                  icon={<WorkIcon />} 
                  label="Work Info" 
                  iconPosition="start"
                  sx={{ gap: 1 }}
                />
                <Tab 
                  icon={<BankIcon />} 
                  label="Banking" 
                  iconPosition="start"
                  sx={{ gap: 1 }}
                />
                {hasAdminAccess && (
                  <Tab 
                    icon={<HistoryIcon />} 
                    label="Activity" 
                    iconPosition="start"
                    sx={{ gap: 1 }}
                  />
                )}
              </Tabs>
            </Box>

            {/* Tab Content */}
            <Box sx={{ bgcolor: '#ffffff' }}>
              {/* Overview Tab */}
              <TabPanel value={activeTab} index={0}>
                <Box sx={{ p: 3 }}>
                  <Grid container spacing={3}>
                    {/* Quick Info Cards */}
                    <Grid item xs={12} md={4}>
                      <Card variant="outlined" sx={{ height: '100%' }}>
                        <CardHeader
                          avatar={<PersonIcon color="primary" />}
                          title="Contact Information"
                          titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                        />
                        <CardContent sx={{ pt: 0 }}>
                          <List dense>
                            <ListItem disablePadding sx={{ mb: 1 }}>
                              <ListItemIcon sx={{ minWidth: 36 }}>
                                <EmailIcon fontSize="small" color="action" />
                              </ListItemIcon>
                              <ListItemText 
                                primary={user.email}
                                secondary="Email Address"
                              />
                            </ListItem>
                            
                            {user.phoneNumber && (
                              <ListItem disablePadding sx={{ mb: 1 }}>
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                  <PhoneIcon fontSize="small" color="action" />
                                </ListItemIcon>
                                <ListItemText 
                                  primary={user.phoneNumber}
                                  secondary="Phone Number"
                                />
                              </ListItem>
                            )}

                            {user.department && (
                              <ListItem disablePadding>
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                  <BusinessIcon fontSize="small" color="action" />
                                </ListItemIcon>
                                <ListItemText 
                                  primary={user.department}
                                  secondary="Department"
                                />
                              </ListItem>
                            )}
                          </List>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Account Status */}
                    <Grid item xs={12} md={4}>
                      <Card variant="outlined" sx={{ height: '100%' }}>
                        <CardHeader
                          avatar={<SecurityIcon color="primary" />}
                          title="Account Status"
                          titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                        />
                        <CardContent sx={{ pt: 0 }}>
                          <List dense>
                            <ListItem disablePadding sx={{ mb: 1 }}>
                              <ListItemIcon sx={{ minWidth: 36 }}>
                                {statusInfo.icon}
                              </ListItemIcon>
                              <ListItemText 
                                primary={
                                  <Chip
                                    label={statusInfo.label}
                                    color={statusInfo.color as any}
                                    size="small"
                                    variant="filled"
                                  />
                                }
                                secondary="Account Status"
                              />
                            </ListItem>

                            {user.lastLoginAt && (
                              <ListItem disablePadding sx={{ mb: 1 }}>
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                  <CalendarIcon fontSize="small" color="action" />
                                </ListItemIcon>
                                <ListItemText 
                                  primary={formatDate(user.lastLoginAt)}
                                  secondary="Last Login"
                                />
                              </ListItem>
                            )}

                            <ListItem disablePadding>
                              <ListItemIcon sx={{ minWidth: 36 }}>
                                <ShieldIcon fontSize="small" color="action" />
                              </ListItemIcon>
                              <ListItemText 
                                primary={
                                  <Chip
                                    label={user.accountLocked ? 'Locked' : 'Unlocked'}
                                    color={user.accountLocked ? 'error' : 'success'}
                                    size="small"
                                    variant="outlined"
                                  />
                                }
                                secondary="Security Status"
                              />
                            </ListItem>
                          </List>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Dates & Timeline */}
                    <Grid item xs={12} md={4}>
                      <Card variant="outlined" sx={{ height: '100%' }}>
                        <CardHeader
                          avatar={<CalendarIcon color="primary" />}
                          title="Timeline"
                          titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                        />
                        <CardContent sx={{ pt: 0 }}>
                          <List dense>
                            <ListItem disablePadding sx={{ mb: 1 }}>
                              <ListItemText 
                                primary={user.createdAt ? formatDate(user.createdAt) : 'N/A'}
                                secondary="Account Created"
                              />
                            </ListItem>

                            {user.hireDate && (
                              <ListItem disablePadding sx={{ mb: 1 }}>
                                <ListItemText 
                                  primary={formatDate(user.hireDate)}
                                  secondary="Hire Date"
                                />
                              </ListItem>
                            )}

                            {user.updatedAt && (
                              <ListItem disablePadding>
                                <ListItemText 
                                  primary={formatDate(user.updatedAt)}
                                  secondary="Last Updated"
                                />
                              </ListItem>
                            )}
                          </List>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Roles & Permissions */}
                    {user.roles && user.roles.length > 0 && (
                      <Grid item xs={12}>
                        <Card variant="outlined">
                          <CardHeader
                            avatar={<SecurityIcon color="primary" />}
                            title="Roles & Permissions"
                            titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                          />
                          <CardContent sx={{ pt: 0 }}>
                            <Stack direction="row" spacing={1} flexWrap="wrap">
                              {user.roles.map((role, index) => (
                                <Chip 
                                  key={index}
                                  icon={<VerifiedIcon />}
                                  label={role.replace('_', ' ')} 
                                  color={getRoleColor(role) as any}
                                  variant="filled"
                                  sx={{ fontWeight: 500 }}
                                />
                              ))}
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              </TabPanel>

              {/* Personal Information Tab */}
              <TabPanel value={activeTab} index={1}>
                <Box sx={{ p: 3 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined">
                        <CardHeader
                          avatar={<PersonIcon color="primary" />}
                          title="Personal Details"
                          titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                        />
                        <CardContent sx={{ pt: 0 }}>
                          <Stack spacing={2}>
                            <Box>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                Full Name
                              </Typography>
                              <Typography variant="body1" fontWeight={500}>
                                {user.fullName}
                              </Typography>
                            </Box>
                            
                            <Box>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                Email Address
                              </Typography>
                              <Typography variant="body1" fontWeight={500}>
                                {user.email}
                              </Typography>
                            </Box>

                            {user.phoneNumber && (
                              <Box>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  Phone Number
                                </Typography>
                                <Typography variant="body1" fontWeight={500}>
                                  {user.phoneNumber}
                                </Typography>
                              </Box>
                            )}
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Card variant="outlined">
                        <CardHeader
                          avatar={<BadgeIcon color="primary" />}
                          title="Identification"
                          titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                        />
                        <CardContent sx={{ pt: 0 }}>
                          <Stack spacing={2}>
                            {user.nationalId && (
                              <Box>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  National ID
                                </Typography>
                                <Typography variant="body1" fontWeight={500} sx={{ fontFamily: 'monospace' }}>
                                  {user.nationalId}
                                </Typography>
                              </Box>
                            )}

                            {user.iqamaId && (
                              <Box>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  Iqama ID
                                </Typography>
                                <Typography variant="body1" fontWeight={500} sx={{ fontFamily: 'monospace' }}>
                                  {user.iqamaId}
                                </Typography>
                              </Box>
                            )}
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              </TabPanel>

              {/* Work Information Tab */}
              <TabPanel value={activeTab} index={2}>
                <Box sx={{ p: 3 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined">
                        <CardHeader
                          avatar={<WorkIcon color="primary" />}
                          title="Employment Details"
                          titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                        />
                        <CardContent sx={{ pt: 0 }}>
                          <Stack spacing={2}>
                            {user.department && (
                              <Box>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  Department
                                </Typography>
                                <Typography variant="body1" fontWeight={500}>
                                  {user.department}
                                </Typography>
                              </Box>
                            )}

                            {user.position && (
                              <Box>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  Position
                                </Typography>
                                <Typography variant="body1" fontWeight={500}>
                                  {user.position}
                                </Typography>
                              </Box>
                            )}

                            {user.hireDate && (
                              <Box>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  Hire Date
                                </Typography>
                                <Typography variant="body1" fontWeight={500}>
                                  {formatDate(user.hireDate)}
                                </Typography>
                              </Box>
                            )}
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Card variant="outlined">
                        <CardHeader
                          avatar={<SecurityIcon color="primary" />}
                          title="Account Security"
                          titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                        />
                        <CardContent sx={{ pt: 0 }}>
                          <Stack spacing={2}>
                            <Box>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                Account Status
                              </Typography>
                              <Chip 
                                icon={statusInfo.icon}
                                label={statusInfo.label} 
                                color={statusInfo.color as any}
                                variant="filled"
                              />
                            </Box>

                            <Box>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                Account Locked
                              </Typography>
                              <Chip 
                                label={user.accountLocked ? 'Yes' : 'No'} 
                                color={user.accountLocked ? 'error' : 'success'}
                                variant="outlined"
                                size="small"
                              />
                            </Box>

                            {user.lastLoginAt && (
                              <Box>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  Last Login
                                </Typography>
                                <Typography variant="body1" fontWeight={500}>
                                  {formatDate(user.lastLoginAt)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {formatRelativeDate(user.lastLoginAt)}
                                </Typography>
                              </Box>
                            )}
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              </TabPanel>

              {/* Bank Details Tab */}
              <TabPanel value={activeTab} index={3}>
                <Box sx={{ p: 3 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined">
                        <CardHeader
                          avatar={<BankIcon color="primary" />}
                          title="Banking Information"
                          titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                        />
                        <CardContent sx={{ pt: 0 }}>
                          <Stack spacing={2}>
                            {user.bankName ? (
                              <Box>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  Bank Name
                                </Typography>
                                <Typography variant="body1" fontWeight={500}>
                                  {user.bankName}
                                </Typography>
                              </Box>
                            ) : (
                              <Alert severity="info" variant="outlined">
                                No banking information available
                              </Alert>
                            )}

                            {user.accountNumber && (
                              <Box>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  Account Number
                                </Typography>
                                <Typography variant="body1" fontWeight={500} sx={{ fontFamily: 'monospace' }}>
                                  {user.accountNumber}
                                </Typography>
                              </Box>
                            )}

                            {user.iban && (
                              <Box>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  IBAN
                                </Typography>
                                <Typography variant="body1" fontWeight={500} sx={{ fontFamily: 'monospace' }}>
                                  {user.iban}
                                </Typography>
                              </Box>
                            )}
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Card variant="outlined">
                        <CardHeader
                          avatar={<CreditCardIcon color="primary" />}
                          title="Additional Information"
                          titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                        />
                        <CardContent sx={{ pt: 0 }}>
                          <Stack spacing={2}>
                            {user.beneficiaryName && (
                              <Box>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  Beneficiary Name
                                </Typography>
                                <Typography variant="body1" fontWeight={500}>
                                  {user.beneficiaryName}
                                </Typography>
                              </Box>
                            )}

                            {user.beneficiaryAddress && (
                              <Box>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  Beneficiary Address
                                </Typography>
                                <Typography variant="body1" fontWeight={500}>
                                  {user.beneficiaryAddress}
                                </Typography>
                              </Box>
                            )}

                            {user.swiftCode && (
                              <Box>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  SWIFT Code
                                </Typography>
                                <Typography variant="body1" fontWeight={500} sx={{ fontFamily: 'monospace' }}>
                                  {user.swiftCode}
                                </Typography>
                              </Box>
                            )}
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              </TabPanel>

              {/* Activity Log Tab */}
              {hasAdminAccess && (
                <TabPanel value={activeTab} index={4}>
                  <Box sx={{ p: 3 }}>
                    <Card variant="outlined">
                      <CardHeader
                        avatar={<HistoryIcon color="primary" />}
                        title="User Activity History"
                        titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                      />
                      <CardContent sx={{ pt: 0 }}>
                        <UserActivityPanel userId={userId!} />
                      </CardContent>
                    </Card>
                  </Box>
                </TabPanel>
              )}
            </Box>
          </Paper>
      </Box>
    </Box>
  );
};

export default UserDetailsPage;