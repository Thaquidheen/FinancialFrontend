// src/components/projects/ProjectCard.tsx
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  LinearProgress,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Alert
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Warning as WarningIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  AccountBalance as BudgetIcon
} from '@mui/icons-material';
import { format, differenceInDays } from 'date-fns';
import {
  Project,
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_COLORS
} from '../../types/project';
import { useAuth } from '@contexts/AuthContext';
import { USER_ROLES } from '../../types/auth';

interface ProjectCardProps {
  project: Project;
  onView?: (project: Project) => void;
  onEdit?: (project: Project) => void;
  onAssignManager?: (project: Project) => void;
  onUpdateBudget?: (project: Project) => void;
  onUpdateStatus?: (project: Project) => void;
  variant?: 'standard' | 'compact';
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onView,
  onEdit,
  onAssignManager,
  onUpdateBudget,

  variant = 'standard'
}) => {
  const { user } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const canEdit = user?.roles?.some(role => 
    [USER_ROLES.SUPER_ADMIN, USER_ROLES.ACCOUNT_MANAGER].includes(role as any)
  );

  const canAssign = user?.roles?.some(role => 
    [USER_ROLES.SUPER_ADMIN, USER_ROLES.ACCOUNT_MANAGER].includes(role as any)
  );

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

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

  const getDaysRemaining = () => {
    if (!project.endDate) return null;
    
    const today = new Date();
    const endDate = new Date(project.endDate);
    const daysRemaining = differenceInDays(endDate, today);
    
    if (daysRemaining < 0) {
      return { value: Math.abs(daysRemaining), status: 'overdue' };
    } else if (daysRemaining <= 7) {
      return { value: daysRemaining, status: 'urgent' };
    } else if (daysRemaining <= 30) {
      return { value: daysRemaining, status: 'warning' };
    }
    return { value: daysRemaining, status: 'normal' };
  };

  const daysInfo = getDaysRemaining();

  const handleCardClick = () => {
    if (onView) {
      onView(project);
    }
  };

  if (variant === 'compact') {
    return (
      <Card 
        sx={{ 
          cursor: onView ? 'pointer' : 'default',
          '&:hover': onView ? { elevation: 4 } : {}
        }}
        onClick={handleCardClick}
      >
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
            <Typography variant="subtitle2" fontWeight="medium" noWrap sx={{ flex: 1, mr: 1 }}>
              {project.name}
            </Typography>
            <IconButton size="small" onClick={handleMenuOpen}>
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Chip
              label={PROJECT_STATUS_LABELS[project.status]}
              color={PROJECT_STATUS_COLORS[project.status]}
              size="small"
            />
            {(project.isOverBudget || project.isOverdue) && (
              <WarningIcon 
                color={project.isOverBudget ? 'error' : 'warning'} 
                fontSize="small" 
              />
            )}
          </Box>

          <Typography variant="body2" color="text.secondary" gutterBottom>
            {formatCurrency(project.allocatedBudget, project.currency)}
          </Typography>

          <LinearProgress
            variant="determinate"
            value={Math.min(project.budgetUtilization, 100)}
            color={getBudgetUtilizationColor(project.budgetUtilization)}
            sx={{ height: 6, borderRadius: 3 }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            {project.budgetUtilization.toFixed(1)}% utilized
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: onView ? 'pointer' : 'default',
        '&:hover': onView ? { elevation: 4 } : {},
        position: 'relative'
      }}
      onClick={handleCardClick}
    >
      {/* Status and alerts indicators */}
      <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1 }}>
        {project.isOverBudget && (
          <Tooltip title="Over Budget">
            <WarningIcon color="error" fontSize="small" />
          </Tooltip>
        )}
        {project.isOverdue && (
          <Tooltip title="Overdue">
            <WarningIcon color="warning" fontSize="small" sx={{ ml: 0.5 }} />
          </Tooltip>
        )}
      </Box>

      <CardContent sx={{ flex: 1, pb: 1 }}>
        {/* Project Header */}
        <Box mb={2}>
          <Typography variant="h6" component="h3" gutterBottom noWrap>
            {project.name}
          </Typography>
          
          {project.description && (
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                mb: 1
              }}
            >
              {project.description}
            </Typography>
          )}

          <Chip
            label={PROJECT_STATUS_LABELS[project.status]}
            color={PROJECT_STATUS_COLORS[project.status]}
            size="small"
          />
        </Box>

        {/* Project Details */}
        <Box mb={2}>
          {project.location && (
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <LocationIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {project.location}
              </Typography>
            </Box>
          )}

          {project.managerName ? (
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <PersonIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {project.managerName}
              </Typography>
            </Box>
          ) : (
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <PersonIcon fontSize="small" color="disabled" />
              <Typography variant="body2" color="text.disabled">
                Unassigned
              </Typography>
            </Box>
          )}

          {project.endDate && daysInfo && (
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <CalendarIcon fontSize="small" color="action" />
              <Typography 
                variant="body2" 
                color={
                  daysInfo.status === 'overdue' ? 'error.main' :
                  daysInfo.status === 'urgent' ? 'warning.main' :
                  'text.secondary'
                }
              >
                {daysInfo.status === 'overdue' 
                  ? `${daysInfo.value} days overdue`
                  : `${daysInfo.value} days remaining`
                }
              </Typography>
            </Box>
          )}

          <Box display="flex" alignItems="center" gap={1}>
            <CalendarIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              Created {format(new Date(project.createdDate), 'MMM dd, yyyy')}
            </Typography>
          </Box>
        </Box>

        {/* Budget Information */}
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="body2" color="text.secondary">
              Budget Utilization
            </Typography>
            <Typography 
              variant="body2" 
              fontWeight="medium"
              color={project.budgetUtilization > 100 ? 'error.main' : 'text.primary'}
            >
              {project.budgetUtilization.toFixed(1)}%
            </Typography>
          </Box>

          <LinearProgress
            variant="determinate"
            value={Math.min(project.budgetUtilization, 100)}
            color={getBudgetUtilizationColor(project.budgetUtilization)}
            sx={{ height: 8, borderRadius: 4, mb: 1 }}
          />

          <Box display="flex" justifyContent="space-between">
            <Box>
              <Typography variant="caption" color="text.secondary">
                Allocated
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {formatCurrency(project.allocatedBudget, project.currency)}
              </Typography>
            </Box>
            <Box textAlign="right">
              <Typography variant="caption" color="text.secondary">
                Used
              </Typography>
              <Typography 
                variant="body2" 
                fontWeight="medium"
                color={project.usedBudget > project.allocatedBudget ? 'error.main' : 'text.primary'}
              >
                {formatCurrency(project.usedBudget, project.currency)}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Alerts */}
        {(project.isOverBudget || project.isOverdue) && (
          <Box mt={2}>
            {project.isOverBudget && (
              <Alert severity="error" sx={{ mb: 1 }}>
                <Typography variant="caption">
                  Project is over budget by {formatCurrency(project.usedBudget - project.allocatedBudget, project.currency)}
                </Typography>
              </Alert>
            )}
            {project.isOverdue && daysInfo?.status === 'overdue' && (
              <Alert severity="warning">
                <Typography variant="caption">
                  Project is {daysInfo.value} days overdue
                </Typography>
              </Alert>
            )}
          </Box>
        )}
      </CardContent>

      <CardActions sx={{ pt: 0, px: 2, pb: 2 }}>
        <Box display="flex" justifyContent="space-between" width="100%">
          <Box display="flex" gap={1}>
            <Tooltip title="View Details">
              <IconButton 
                size="small" 
                onClick={(e) => {
                  e.stopPropagation();
                  if (onView) onView(project);
                }}
              >
                <ViewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            
            {canEdit && (
              <Tooltip title="Edit Project">
                <IconButton 
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onEdit) onEdit(project);
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          <IconButton size="small" onClick={handleMenuOpen}>
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Box>
      </CardActions>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem onClick={() => {
          if (onView) onView(project);
          handleMenuClose();
        }}>
          <ViewIcon fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>

        {canEdit && (
          <MenuItem onClick={() => {
            if (onEdit) onEdit(project);
            handleMenuClose();
          }}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            Edit Project
          </MenuItem>
        )}

        {canAssign && (
          <MenuItem onClick={() => {
            if (onAssignManager) onAssignManager(project);
            handleMenuClose();
          }}>
            <PersonIcon fontSize="small" sx={{ mr: 1 }} />
            Assign Manager
          </MenuItem>
        )}

        {canEdit && (
          <MenuItem onClick={() => {
            if (onUpdateBudget) onUpdateBudget(project);
            handleMenuClose();
          }}>
            <BudgetIcon fontSize="small" sx={{ mr: 1 }} />
            Update Budget
          </MenuItem>
        )}
      </Menu>
    </Card>
  );
};

export default ProjectCard;