// src/components/projects/ProjectList.tsx
import React, { useState } from 'react';
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Checkbox,
  IconButton,
  Chip,
  Typography,
  Tooltip,
  LinearProgress,
  Menu,
  MenuItem,
  Alert,
  Skeleton
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Person as PersonIcon,
  AccountBalance as BudgetIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import {
  Project,
  ProjectFilters,
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_COLORS
} from '@/types/project';
import { useProjectsManager } from '@hooks/useProject';
import { useAuth } from '@contexts/AuthContext';
import { USER_ROLES } from '@/types/auth';

interface ProjectListProps {
  onEditProject?: (project: Project) => void;
  onViewProject?: (project: Project) => void;
  onAssignManager?: (project: Project) => void;
  onUpdateBudget?: (project: Project) => void;
  filters?: ProjectFilters;
}

const ProjectList: React.FC<ProjectListProps> = ({
  onEditProject,
  onViewProject,
  onAssignManager,
  onUpdateBudget,
  filters: externalFilters = {}
}) => {
  const { user } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const {
    projects,
    totalElements,
    filters,
    selectedProjects,
    isLoading,
    error,
    handlePageChange,
    handleSelectProject,
    handleSelectAllProjects,
    updateFilters
  } = useProjectsManager(externalFilters);

  const canEdit = user?.roles?.some(role => 
    [USER_ROLES.SUPER_ADMIN, USER_ROLES.ACCOUNT_MANAGER].includes(role as any)
  );

  const canAssign = user?.roles?.some(role => 
    [USER_ROLES.SUPER_ADMIN, USER_ROLES.ACCOUNT_MANAGER].includes(role as any)
  );

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, project: Project) => {
    setAnchorEl(event.currentTarget);
    setSelectedProject(project);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProject(null);
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

  if (error) {
    return (
      <Alert severity="error">
        Failed to load projects. Please try again.
      </Alert>
    );
  }

  return (
    <Card>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={
                    selectedProjects.length > 0 && selectedProjects.length < projects.length
                  }
                  checked={projects.length > 0 && selectedProjects.length === projects.length}
                  onChange={() => handleSelectAllProjects(projects)}
                />
              </TableCell>
              <TableCell>Project Name</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Manager</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Budget</TableCell>
              <TableCell align="center">Utilization</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton width={24} height={24} /></TableCell>
                  <TableCell><Skeleton width={200} /></TableCell>
                  <TableCell><Skeleton width={120} /></TableCell>
                  <TableCell><Skeleton width={150} /></TableCell>
                  <TableCell><Skeleton width={80} /></TableCell>
                  <TableCell align="right"><Skeleton width={100} /></TableCell>
                  <TableCell><Skeleton width={80} /></TableCell>
                  <TableCell><Skeleton width={100} /></TableCell>
                  <TableCell><Skeleton width={50} /></TableCell>
                </TableRow>
              ))
            ) : projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <Typography variant="body2" color="text.secondary" py={4}>
                    No projects found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              projects.map((project) => (
                <TableRow 
                  key={project.id}
                  hover
                  selected={selectedProjects.includes(project.id)}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedProjects.includes(project.id)}
                      onChange={() => handleSelectProject(project.id)}
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" fontWeight="medium">
                        {project.name}
                      </Typography>
                      {project.isOverBudget && (
                        <Tooltip title="Over Budget">
                          <WarningIcon color="error" fontSize="small" />
                        </Tooltip>
                      )}
                      {project.isOverdue && (
                        <Tooltip title="Overdue">
                          <WarningIcon color="warning" fontSize="small" />
                        </Tooltip>
                      )}
                    </Box>
                    {project.description && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        {project.description.length > 60 
                          ? `${project.description.substring(0, 60)}...`
                          : project.description
                        }
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2">
                      {project.location || '-'}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    {project.managerName ? (
                      <Box display="flex" alignItems="center" gap={1}>
                        <PersonIcon fontSize="small" color="action" />
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
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Unassigned
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={PROJECT_STATUS_LABELS[project.status]}
                      color={PROJECT_STATUS_COLORS[project.status]}
                      size="small"
                    />
                  </TableCell>

                  <TableCell align="right">
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {formatCurrency(project.allocatedBudget, project.currency)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Used: {formatCurrency(project.usedBudget, project.currency)}
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell align="center">
                    <Box width={80}>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(project.budgetUtilization, 100)}
                        color={getBudgetUtilizationColor(project.budgetUtilization)}
                        sx={{ mb: 0.5 }}
                      />
                      <Typography variant="caption">
                        {project.budgetUtilization.toFixed(1)}%
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2">
                      {format(new Date(project.createdDate), 'MMM dd, yyyy')}
                    </Typography>
                  </TableCell>

                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, project)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={totalElements}
        page={filters.page || 0}
        onPageChange={(_, page) => handlePageChange(page)}
        rowsPerPage={filters.size || 20}
        onRowsPerPageChange={(e) => updateFilters({ size: parseInt(e.target.value), page: 0 })}
        rowsPerPageOptions={[10, 20, 50, 100]}
        labelDisplayedRows={({ from, to, count }) => 
          `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`
        }
      />

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          if (selectedProject && onViewProject) {
            onViewProject(selectedProject);
          }
          handleMenuClose();
        }}>
          <ViewIcon fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>

        {canEdit && (
          <MenuItem onClick={() => {
            if (selectedProject && onEditProject) {
              onEditProject(selectedProject);
            }
            handleMenuClose();
          }}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            Edit Project
          </MenuItem>
        )}

        {canAssign && (
          <MenuItem onClick={() => {
            if (selectedProject && onAssignManager) {
              onAssignManager(selectedProject);
            }
            handleMenuClose();
          }}>
            <PersonIcon fontSize="small" sx={{ mr: 1 }} />
            Assign Manager
          </MenuItem>
        )}

        {canEdit && (
          <MenuItem onClick={() => {
            if (selectedProject && onUpdateBudget) {
              onUpdateBudget(selectedProject);
            }
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

export default ProjectList;