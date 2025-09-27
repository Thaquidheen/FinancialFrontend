// src/pages/projects/ProjectListPage.tsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  Card,
  CardContent,
  ToggleButton,
  ToggleButtonGroup,
  useMediaQuery,
  useTheme,
  Fab,
  Stack,
  InputAdornment,
  Collapse,
  Divider,
  Alert,
  Skeleton,
  Tooltip,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  ExpandMore,
  ExpandLess,
  TrendingUp,
  CheckCircle,
  Schedule,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  ProjectStatus,
  ProjectFilters,
  PROJECT_STATUS_LABELS,
  DEFAULT_PROJECT_FILTERS
} from '../../types/project';
import type { Project } from '../../types/project';
import { useProjectsManager, useProjectStatistics } from '../../hooks/useProject';
import { useAuth } from '../../contexts/AuthContext';
import { USER_ROLES } from '../../types/auth';
import ProjectList from '../../components/projects/ProjectList';
import ProjectCard from '../../components/projects/ProjectCard';
import AssignManagerModal from '../../components/projects/AssignManagerModal';
import UpdateBudgetModal from '../../components/projects/UpdateBudgetModal';
import UpdateStatusModal from '../../components/projects/UpdateStatusModal';

const ProjectListPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();

  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [actionProject, setActionProject] = useState<Project | null>(null);

  const {
    projects,
    filters,
    isLoading,
    error,
    updateFilters,
    resetFilters,
    refetch
  } = useProjectsManager(DEFAULT_PROJECT_FILTERS);

  const { data: statsData, isLoading: statsLoading } = useProjectStatistics();
  const stats = statsData?.data;

  const canCreate = user?.roles?.some(role => 
    [USER_ROLES.SUPER_ADMIN].includes(role as any)
  );

  const canExport = user?.roles?.some(role => 
    [USER_ROLES.SUPER_ADMIN, USER_ROLES.ACCOUNT_MANAGER].includes(role as any)
  );

  // Event Handlers
  const handleSearch = () => {
    updateFilters({ name: searchTerm.trim() || undefined, page: 0 });
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    updateFilters({ name: undefined, page: 0 });
  };

  const handleStatusFilter = (status: ProjectStatus | 'ALL') => {
    updateFilters({ status: status === 'ALL' ? undefined : status, page: 0 });
  };

  const handleViewProject = (project: any) => {
    navigate(`/projects/${project.id}`);
  };

  const handleEditProject = (project: any) => {
    navigate(`/projects/${project.id}/edit`);
  };

  const handleAssignManager = (project: Project) => {
    setActionProject(project);
    setAssignModalOpen(true);
  };

  const handleUpdateBudget = (project: Project) => {
    setActionProject(project);
    setBudgetModalOpen(true);
  };

  const handleUpdateStatus = (project: Project) => {
    setActionProject(project);
    setStatusModalOpen(true);
  };

  const handleCreateProject = () => {
    navigate('/projects/create');
  };

  const handleExport = () => {
    // Implementation for export functionality
    console.log('Export projects');
  };

  const handleRefresh = () => {
    refetch();
  };

  const activeFiltersCount = Object.keys(filters).filter(key => 
    filters[key as keyof ProjectFilters] !== undefined && 
    key !== 'page' && 
    key !== 'size' && 
    key !== 'sortBy' && 
    key !== 'sortDir'
  ).length;

  // Statistics Cards Configuration
  const statisticsCards = [
    {
      title: 'Total Projects',
      value: (stats?.totalProjects as number) || 0,
      icon: TrendingUp,
      color: 'primary.main',
      bgColor: 'primary.light',
    },
    {
      title: 'Active Projects', 
      value: (stats?.activeProjects as number) || 0,
      icon: CheckCircle,
      color: 'success.main',
      bgColor: 'success.light',
    },
    {
      title: 'Completed Projects',
      value: (stats?.completedProjects as number) || 0,
      icon: CheckCircle,
      color: 'success.main',
      bgColor: 'success.light',
    },
    {
      title: 'On Hold',
      value: (stats?.onHoldProjects as number) || 0,
      icon: Schedule,
      color: 'warning.main',
      bgColor: 'warning.light',
    },
  ];

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
          direction={{ xs: 'column', md: 'row' }} 
          justifyContent="space-between" 
          alignItems={{ xs: 'flex-start', md: 'center' }}
          spacing={2}
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
              Projects
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                mt: 0.5,
                color: '#64748b',
                fontSize: '0.875rem'
              }}
            >
              Manage and monitor project progress and budgets
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={1}>
            <Tooltip title="Refresh Data">
              <span>
                <IconButton 
                  onClick={handleRefresh}
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
              </span>
            </Tooltip>

            {canExport && (
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleExport}
                sx={{ 
                  minWidth: 120,
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
            
            {canCreate && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateProject}
                size="large"
                sx={{ 
                  minWidth: 140,
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
                New Project
              </Button>
            )}
          </Stack>
        </Stack>
      </Paper>

      {/* Main Content Area */}
      <Box sx={{ flex: 1, overflow: 'hidden', p: 3 }}>
        <Stack spacing={3} sx={{ height: '100%' }}>
          {/* Statistics Cards */}
          <Grid container spacing={2}>
            {statisticsCards.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Card 
                  elevation={0}
                  sx={{ 
                    height: '100%',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    bgcolor: '#ffffff',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                    overflow: 'hidden'
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: '8px',
                          bgcolor: '#f1f5f9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {React.createElement(stat.icon, { sx: { color: '#3b82f6', fontSize: 28 } })}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        {statsLoading ? (
                          <Skeleton variant="text" width={60} height={40} />
                        ) : (
                          <Typography 
                            variant="h3" 
                            component="div"
                            fontWeight={700}
                            sx={{ color: '#1a202c' }}
                          >
                            {stat.value}
                          </Typography>
                        )}
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: '#64748b',
                            fontWeight: 500,
                            fontSize: '0.875rem'
                          }}
                        >
                          {stat.title}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Search and Filters Section */}
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
              {/* Main Search Row */}
              <Box
                sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', md: 'row' }, 
                  gap: 2, 
                  mb: showFilters ? 2 : 0
                }}
              >
                {/* Search Input */}
                <TextField
                  placeholder="Search projects by name or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
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
                    endAdornment: searchTerm && (
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
                />

                {/* Action Buttons */}
                <Stack direction="row" spacing={1} alignItems="center">
                  <Button 
                    variant="contained" 
                    onClick={handleSearch}
                    disabled={!searchTerm.trim()}
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
                    startIcon={<FilterIcon />}
                    endIcon={showFilters ? <ExpandLess /> : <ExpandMore />}
                    onClick={() => setShowFilters(!showFilters)}
                    sx={{ 
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
                  {activeFiltersCount > 0 && (
                    <Chip label={activeFiltersCount} color="primary" size="small" />
                  )}

                  {/* View Mode Toggle */}
                  <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={(_, value) => value && setViewMode(value as 'grid' | 'list')}
                    size="small"
                  >
                    <ToggleButton value="grid">
                      <ViewModuleIcon />
                    </ToggleButton>
                    <ToggleButton value="list">
                      <ViewListIcon />
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Stack>
              </Box>

              {/* Expandable Filters */}
              <Collapse in={showFilters}>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2} alignItems="center">
                  {/* Status Filter Pills */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Project Status
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
                      <Chip
                        label="All Projects"
                        variant={!filters.status ? 'filled' : 'outlined'}
                        onClick={() => handleStatusFilter('ALL')}
                        clickable
                        color="default"
                      />
                      {Object.values(ProjectStatus).map((status) => (
                        <Chip
                          key={status}
                          label={PROJECT_STATUS_LABELS[status]}
                          variant={filters.status === status ? 'filled' : 'outlined'}
                          onClick={() => handleStatusFilter(status)}
                          clickable
                          color={
                            status === ProjectStatus.ACTIVE ? 'success' :
                            status === ProjectStatus.COMPLETED ? 'info' :
                            status === ProjectStatus.ON_HOLD ? 'warning' : 'default'
                          }
                        />
                      ))}
                    </Stack>
                  </Grid>

                  {/* Advanced Filter Controls */}
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Location</InputLabel>
                      <Select
                        value={filters.location || ''}
                        label="Location"
                        onChange={(e: SelectChangeEvent<string>) => {
                          updateFilters({ location: e.target.value || undefined });
                        }}
                      >
                        <MenuItem value="">All Locations</MenuItem>
                        <MenuItem value="Riyadh">Riyadh</MenuItem>
                        <MenuItem value="Jeddah">Jeddah</MenuItem>
                        <MenuItem value="Dammam">Dammam</MenuItem>
                        <MenuItem value="Mecca">Mecca</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Manager</InputLabel>
                      <Select
                        value={filters.managerId ? String(filters.managerId) : ''}
                        label="Manager"
                        onChange={(e: SelectChangeEvent<string>) => {
                          const value = e.target.value;
                          updateFilters({ managerId: value ? Number(value) : undefined });
                        }}
                      >
                        <MenuItem value="">All Managers</MenuItem>
                        {/* Manager options would be loaded dynamically */}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Sort By</InputLabel>
                      <Select
                        value={filters.sortBy || 'name'}
                        label="Sort By"
                        onChange={(e: SelectChangeEvent<string>) => {
                          updateFilters({ sortBy: e.target.value });
                        }}
                      >
                        <MenuItem value="name">Name</MenuItem>
                        <MenuItem value="createdDate">Created Date</MenuItem>
                        <MenuItem value="startDate">Start Date</MenuItem>
                        <MenuItem value="allocatedBudget">Budget</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={resetFilters}
                        disabled={activeFiltersCount === 0}
                      >
                        Clear All
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </Collapse>
            </CardContent>
          </Card>

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <Box sx={{ mb: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ gap: 1 }}>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  Active filters:
                </Typography>
                {filters.name && (
                  <Chip
                    label={`Search: "${filters.name}"`}
                    size="small"
                    variant="outlined"
                    onDelete={() => updateFilters({ name: undefined })}
                  />
                )}
                {filters.status && (
                  <Chip
                    label={`Status: ${PROJECT_STATUS_LABELS[filters.status]}`}
                    size="small"
                    variant="outlined"
                    onDelete={() => updateFilters({ status: undefined })}
                  />
                )}
                {filters.location && (
                  <Chip
                    label={`Location: ${filters.location}`}
                    size="small"
                    variant="outlined"
                    onDelete={() => updateFilters({ location: undefined })}
                  />
                )}
                <Button 
                  size="small" 
                  onClick={resetFilters}
                  sx={{ ml: 1 }}
                >
                  Clear All
                </Button>
              </Stack>
            </Box>
          )}

          {/* Error Display */}
          {error && (
            <Alert 
              severity="error" 
              variant="filled" 
              sx={{ borderRadius: 2 }}
            >
              Failed to load projects. Please try again.
            </Alert>
          )}

          {/* Projects Display */}
          <Card 
            elevation={1} 
            sx={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column',
              overflow: 'hidden',
              borderRadius: 2
            }}
          >
            {viewMode === 'list' ? (
              <ProjectList
                onViewProject={handleViewProject}
                onEditProject={handleEditProject}
                onAssignManager={handleAssignManager}
                onUpdateBudget={handleUpdateBudget}
                onUpdateStatus={handleUpdateStatus}
                filters={filters}
              />
            ) : (
              <Box sx={{ p: 3 }}>
                {isLoading ? (
                  <Grid container spacing={3}>
                    {Array.from({ length: 8 }).map((_, index) => (
                      <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                        <Card 
                          sx={{ 
                            height: 320,
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                          }}
                        >
                          <CardContent>
                            <Skeleton variant="text" width="60%" height={32} />
                            <Skeleton variant="text" width="40%" height={24} sx={{ mb: 2 }} />
                            <Skeleton variant="rectangular" width="100%" height={120} />
                            <Skeleton variant="text" width="80%" height={24} sx={{ mt: 2 }} />
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : projects.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h5" color="text.secondary" gutterBottom>
                      No projects found
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                      {activeFiltersCount > 0 
                        ? 'Try adjusting your filters or search criteria'
                        : 'Get started by creating your first project'
                      }
                    </Typography>
                    {canCreate && activeFiltersCount === 0 && (
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleCreateProject}
                        size="large"
                      >
                        Create Your First Project
                      </Button>
                    )}
                  </Box>
                ) : (
                  <Grid container spacing={3}>
                    {projects.map((project: Project) => (
                      <Grid item xs={12} sm={6} md={4} lg={3} key={project.id}>
                        <ProjectCard
                          project={project}
                          onView={handleViewProject}
                          onEdit={handleEditProject}
                          onAssignManager={handleAssignManager}
                          onUpdateBudget={handleUpdateBudget}
                          onUpdateStatus={handleUpdateStatus}
                        />
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            )}
          </Card>

          {/* Mobile FAB */}
          {isMobile && canCreate && (
            <Fab
              color="primary"
              sx={{ 
                position: 'fixed', 
                bottom: 16, 
                right: 16,
                boxShadow: 4
              }}
              onClick={handleCreateProject}
            >
              <AddIcon />
            </Fab>
          )}

          {/* Action Modals */}
          {actionProject && (
            <>
              <AssignManagerModal
                open={assignModalOpen}
                onClose={() => setAssignModalOpen(false)}
                project={actionProject}
                onSuccess={() => setAssignModalOpen(false)}
              />

              <UpdateBudgetModal
                open={budgetModalOpen}
                onClose={() => setBudgetModalOpen(false)}
                project={actionProject}
                onSuccess={() => setBudgetModalOpen(false)}
              />

              <UpdateStatusModal
                open={statusModalOpen}
                onClose={() => setStatusModalOpen(false)}
                project={actionProject}
                onSuccess={() => setStatusModalOpen(false)}
              />
            </>
          )}
        </Stack>
      </Box>
    </Box>
  );
};

export default ProjectListPage;