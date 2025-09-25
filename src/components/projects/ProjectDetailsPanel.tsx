// src/components/projects/ProjectDetailsPanel.tsx
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  LinearProgress,
  Divider,
  Button,
  IconButton,
  Tabs,
  Tab,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tooltip,
  Skeleton
} from '@mui/material';
import {
  Edit as EditIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  AccountBalance as BudgetIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  Close as CloseIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { format, differenceInDays } from 'date-fns';
import {
  Project,
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_COLORS,
  ProjectStatus
} from '../../types/project';
import { useProject } from '@hooks/useProject';
import { useAuth } from '@contexts/AuthContext';
import { USER_ROLES } from '../../types/auth';

interface ProjectDetailsPanelProps {
  projectId: number;
  onClose?: () => void;
  onEdit?: (project: Project) => void;
  onAssignManager?: (project: Project) => void;
  onUpdateBudget?: (project: Project) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index} style={{ paddingTop: 16 }}>
      {value === index && children}
    </div>
  );
};

const ProjectDetailsPanel: React.FC<ProjectDetailsPanelProps> = ({
  projectId,
  onClose,
  onEdit,
  onAssignManager,
  onUpdateBudget
}) => {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState(0);
  const { data: projectData, isLoading, error } = useProject(projectId);

  const project = projectData?.data;

  const canEdit = user?.roles?.some(role => 
    [USER_ROLES.SUPER_ADMIN, USER_ROLES.ACCOUNT_MANAGER].includes(role as any)
  );

  const canAssign = user?.roles?.some(role => 
    [USER_ROLES.SUPER_ADMIN, USER_ROLES.ACCOUNT_MANAGER].includes(role as any)
  );

  const formatCurrency = (amount: number, currency: string = 'SAR') => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getBudgetUtilizationColor = (utilization: number) => {
    if (utilization > 100) return 'error';
    if (utilization > 80) return 'warning';
    if (utilization > 60) return 'info';
    return 'success';
  };

  const getDaysInfo = () => {
    if (!project?.endDate) return null;
    
    const today = new Date();
    const endDate = new Date(project.endDate);
    const daysRemaining = differenceInDays(endDate, today);
    
    if (daysRemaining < 0) {
      return { value: Math.abs(daysRemaining), status: 'overdue', label: 'days overdue' };
    } else if (daysRemaining <= 7) {
      return { value: daysRemaining, status: 'urgent', label: 'days remaining' };
    } else if (daysRemaining <= 30) {
      return { value: daysRemaining, status: 'warning', label: 'days remaining' };
    }
    return { value: daysRemaining, status: 'normal', label: 'days remaining' };
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">
            Failed to load project details. Please try again.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (isLoading || !project) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Skeleton variant="text" width={300} height={32} />
            <Skeleton variant="circular" width={40} height={40} />
          </Box>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Skeleton variant="rectangular" height={200} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Skeleton variant="rectangular" height={200} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  }

  const daysInfo = getDaysInfo();

  return (
    <Card>
      {/* Header */}
      <CardContent sx={{ pb: 0 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
          <Box flex={1}>
            <Box display="flex" alignItems="center" gap={2} mb={1}>
              <Typography variant="h5" component="h2">
                {project.name}
              </Typography>
              {(project.isOverBudget || project.isOverdue) && (
                <Box display="flex" gap={0.5}>
                  {project.isOverBudget && (
                    <Tooltip title="Over Budget">
                      <WarningIcon color="error" />
                    </Tooltip>
                  )}
                  {project.isOverdue && (
                    <Tooltip title="Overdue">
                      <WarningIcon color="warning" />
                    </Tooltip>
                  )}
                </Box>
              )}
            </Box>
            
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Chip
                label={PROJECT_STATUS_LABELS[project.status as ProjectStatus]}
                color={PROJECT_STATUS_COLORS[project.status as ProjectStatus]}
              />
              <Typography variant="body2" color="text.secondary">
                ID: {project.id}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Created: {format(new Date(project.createdDate), 'MMM dd, yyyy')}
              </Typography>
            </Box>

            {project.description && (
              <Typography variant="body1" color="text.secondary" mb={2}>
                {project.description}
              </Typography>
            )}
          </Box>

          <Box display="flex" gap={1}>
            {canEdit && (
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => onEdit && onEdit(project)}
              >
                Edit
              </Button>
            )}
            {onClose && (
              <IconButton onClick={onClose}>
                <CloseIcon />
              </IconButton>
            )}
          </Box>
        </Box>

        {/* Alerts */}
        {(project.isOverBudget || project.isOverdue) && (
          <Box mb={3}>
            {project.isOverBudget && (
              <Alert severity="error" sx={{ mb: 1 }}>
                <Typography variant="body2">
                  <strong>Over Budget:</strong> This project has exceeded its allocated budget by{' '}
                  {formatCurrency(project.usedBudget - project.allocatedBudget, project.currency)}
                </Typography>
              </Alert>
            )}
            {project.isOverdue && daysInfo?.status === 'overdue' && (
              <Alert severity="warning">
                <Typography variant="body2">
                  <strong>Overdue:</strong> This project is {daysInfo.value} days past its deadline
                </Typography>
              </Alert>
            )}
          </Box>
        )}

        {/* Quick Stats */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} md={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <BudgetIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
                <Typography variant="h6">
                  {formatCurrency(project.allocatedBudget, project.currency)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Allocated Budget
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <MoneyIcon color="success" sx={{ fontSize: 32, mb: 1 }} />
                <Typography variant="h6">
                  {formatCurrency(project.usedBudget, project.currency)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Used Budget
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <TrendingUpIcon color="info" sx={{ fontSize: 32, mb: 1 }} />
                <Typography variant="h6" color={project.budgetUtilization > 100 ? 'error' : 'text.primary'}>
                  {project.budgetUtilization.toFixed(1)}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Utilization
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <CalendarIcon color="warning" sx={{ fontSize: 32, mb: 1 }} />
                <Typography variant="h6">
                  {daysInfo ? daysInfo.value : '-'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {daysInfo ? daysInfo.label : 'No deadline'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab label="Overview" />
          <Tab label="Budget" />
          <Tab label="Timeline" />
          <Tab label="Team" />
          <Tab label="Documents" />
          <Tab label="Activity" />
        </Tabs>
      </CardContent>

      <Divider />

      {/* Tab Panels */}
      <CardContent>
        <TabPanel value={currentTab} index={0}>
          {/* Overview Tab */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Project Details
              </Typography>
              
              <List dense>
                {project.location && (
                  <ListItem>
                    <ListItemIcon>
                      <LocationIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Location"
                      secondary={project.location}
                    />
                  </ListItem>
                )}

                <ListItem>
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Project Manager"
                    secondary={
                      project.managerName ? (
                        <Box>
                          <Typography variant="body2">
                            {project.managerName}
                          </Typography>
                          {project.managerEmail && (
                            <Typography variant="caption" color="text.secondary">
                              {project.managerEmail}
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2" color="text.secondary">
                            Unassigned
                          </Typography>
                          {canAssign && (
                            <Button
                              size="small"
                              onClick={() => onAssignManager && onAssignManager(project)}
                            >
                              Assign
                            </Button>
                          )}
                        </Box>
                      )
                    }
                  />
                </ListItem>

                {project.startDate && (
                  <ListItem>
                    <ListItemIcon>
                      <CalendarIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Start Date"
                      secondary={format(new Date(project.startDate), 'MMM dd, yyyy')}
                    />
                  </ListItem>
                )}

                {project.endDate && (
                  <ListItem>
                    <ListItemIcon>
                      <CalendarIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="End Date"
                      secondary={format(new Date(project.endDate), 'MMM dd, yyyy')}
                    />
                  </ListItem>
                )}
              </List>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Budget Overview
              </Typography>

              <Box mb={2}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Budget Utilization</Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {project.budgetUtilization.toFixed(1)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(project.budgetUtilization, 100)}
                  color={getBudgetUtilizationColor(project.budgetUtilization)}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>

              <Box display="flex" justifyContent="space-between" mb={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Allocated
                  </Typography>
                  <Typography variant="h6">
                    {formatCurrency(project.allocatedBudget, project.currency)}
                  </Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="body2" color="text.secondary">
                    Used
                  </Typography>
                  <Typography variant="h6" color={project.usedBudget > project.allocatedBudget ? 'error' : 'text.primary'}>
                    {formatCurrency(project.usedBudget, project.currency)}
                  </Typography>
                </Box>
                <Box textAlign="right">
                  <Typography variant="body2" color="text.secondary">
                    Remaining
                  </Typography>
                  <Typography variant="h6" color={project.remainingBudget < 0 ? 'error' : 'success.main'}>
                    {formatCurrency(project.remainingBudget, project.currency)}
                  </Typography>
                </Box>
              </Box>

              {canEdit && (
                <Button
                  variant="outlined"
                  startIcon={<BudgetIcon />}
                  onClick={() => onUpdateBudget && onUpdateBudget(project)}
                  fullWidth
                >
                  Update Budget
                </Button>
              )}
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          {/* Budget Tab */}
          <Typography variant="h6" gutterBottom>
            Budget Details
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Detailed budget breakdown and spending history will be displayed here.
          </Typography>
        </TabPanel>

        <TabPanel value={currentTab} index={2}>
          {/* Timeline Tab */}
          <Typography variant="h6" gutterBottom>
            Project Timeline
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Project milestones and timeline will be displayed here.
          </Typography>
        </TabPanel>

        <TabPanel value={currentTab} index={3}>
          {/* Team Tab */}
          <Typography variant="h6" gutterBottom>
            Project Team
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Team members and their roles will be displayed here.
          </Typography>
        </TabPanel>

        <TabPanel value={currentTab} index={4}>
          {/* Documents Tab */}
          <Typography variant="h6" gutterBottom>
            Project Documents
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Project documents and attachments will be displayed here.
          </Typography>
        </TabPanel>

        <TabPanel value={currentTab} index={5}>
          {/* Activity Tab */}
          <Typography variant="h6" gutterBottom>
            Recent Activity
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Project activity log and history will be displayed here.
          </Typography>
        </TabPanel>
      </CardContent>
    </Card>
  );
};

export default ProjectDetailsPanel;