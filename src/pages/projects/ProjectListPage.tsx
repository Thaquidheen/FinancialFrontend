// src/pages/projects/ProjectListPage.tsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  InputBase,
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
  Drawer,
  useMediaQuery,
  useTheme,
  Fab
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  Clear as ClearIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  ProjectStatus,
  ProjectFilters,
  PROJECT_STATUS_LABELS,
  DEFAULT_PROJECT_FILTERS
} from '@/types/project';
import { useProjectsManager, useProjectStatistics } from '@hooks/useProject';
import { useAuth } from '@contexts/AuthContext';
import { USER_ROLES } from '@/types/auth';
import ProjectList from '@components/projects/ProjectList';
import ProjectCard from '@components/projects/ProjectCard';
import ProjectDetailsPanel from '@components/projects/ProjectDetailsPanel';

const ProjectListPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();

  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [detailsPanelOpen, setDetailsPanelOpen] = useState(false);

  const {
    projects,
    filters,
    isLoading,
    updateFilters,
    resetFilters
  } = useProjectsManager(DEFAULT_PROJECT_FILTERS);

  const { data: statsData } = useProjectStatistics();
  const stats = statsData?.data;

  const canCreate = user?.roles?.some(role => 
    [USER_ROLES.SUPER_ADMIN, USER_ROLES.ACCOUNT_MANAGER].includes(role as any)
  );

  const canExport = user?.roles?.some(role => 
    [USER_ROLES.SUPER_ADMIN, USER_ROLES.ACCOUNT_MANAGER].includes(role as any)
  );

  const handleSearch = () => {
    updateFilters({ name: searchTerm || undefined });
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    updateFilters({ name: undefined });
  };

  const handleStatusFilter = (status: ProjectStatus | 'ALL') => {
    updateFilters({ status: status === 'ALL' ? undefined : status });
  };

  const handleViewProject = (project: any) => {
    setSelectedProjectId(project.id);
    setDetailsPanelOpen(true);
  };

  const handleEditProject = (project: any) => {
    navigate(`/projects/${project.id}/edit`);
  };

  const handleCreateProject = () => {
    navigate('/projects/create');
  };

  const activeFiltersCount = Object.keys(filters).filter(key => 
    filters[key as keyof ProjectFilters] !== undefined && 
    key !== 'page' && 
    key !== 'size' && 
    key !== 'sortBy' && 
    key !== 'sortDir'
  ).length;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Projects
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and monitor project progress and budgets
          </Typography>
        </Box>
        
        {canCreate && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateProject}
            size="large"
          >
            New Project
          </Button>
        )}
      </Box>

      {/* Statistics Cards */}
      {stats && (
        <Grid container spacing={3} mb={3}>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {stats.totalProjects}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Projects
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  {stats.activeProjects}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Projects
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="error.main">
                  {stats.overBudgetProjects}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Over Budget
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main">
                  {stats.overdueProjects}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Overdue
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Search and Filters */}
      <Box mb={3}>
        <Grid container spacing={2} alignItems="center">
          {/* Search */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: '2px 4px', display: 'flex', alignItems: 'center' }}>
              <InputBase
                sx={{ ml: 1, flex: 1 }}
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              {searchTerm && (
                <IconButton onClick={handleClearSearch}>
                  <ClearIcon />
                </IconButton>
              )}
              <IconButton onClick={handleSearch}>
                <SearchIcon />
              </IconButton>
            </Paper>
          </Grid>

          {/* Quick Status Filters */}
          <Grid item xs={12} md={4}>
            <Box display="flex" gap={1} flexWrap="wrap">
              <Chip
                label="All"
                variant={!filters.status ? 'filled' : 'outlined'}
                onClick={() => handleStatusFilter('ALL')}
                clickable
              />
              {Object.values(ProjectStatus).map((status) => (
                <Chip
                  key={status}
                  label={PROJECT_STATUS_LABELS[status]}
                  variant={filters.status === status ? 'filled' : 'outlined'}
                  onClick={() => handleStatusFilter(status)}
                  clickable
                />
              ))}
            </Box>
          </Grid>

          {/* Controls */}
          <Grid item xs={12} md={2}>
            <Box display="flex" gap={1} justifyContent="flex-end">
              {/* View Mode Toggle */}
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(_, value) => value && setViewMode(value)}
                size="small"
              >
                <ToggleButton value="list">
                  <ViewListIcon />
                </ToggleButton>
                <ToggleButton value="grid">
                  <ViewModuleIcon />
                </ToggleButton>
              </ToggleButtonGroup>

              {/* Filters Button */}
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => setFilterDrawerOpen(true)}
                sx={{ minWidth: 'auto' }}
              >
                {activeFiltersCount > 0 && (
                  <Chip 
                    label={activeFiltersCount} 
                    size="small" 
                    color="primary" 
                    sx={{ ml: 1 }}
                  />
                )}
              </Button>

              {/* Export Button */}
              {canExport && (
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  sx={{ minWidth: 'auto' }}
                >
                  Export
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <Box mb={2} display="flex" gap={1} alignItems="center" flexWrap="wrap">
          <Typography variant="body2" color="text.secondary">
            Active filters:
          </Typography>
          {filters.name && (
            <Chip
              label={`Name: ${filters.name}`}
              size="small"
              onDelete={() => updateFilters({ name: undefined })}
            />
          )}
          {filters.status && (
            <Chip
              label={`Status: ${PROJECT_STATUS_LABELS[filters.status]}`}
              size="small"
              onDelete={() => updateFilters({ status: undefined })}
            />
          )}
          {filters.location && (
            <Chip
              label={`Location: ${filters.location}`}
              size="small"
              onDelete={() => updateFilters({ location: undefined })}
            />
          )}
          <Button size="small" onClick={resetFilters}>
            Clear All
          </Button>
        </Box>
      )}

      {/* Projects Display */}
      {viewMode === 'list' ? (
        <ProjectList
          onViewProject={handleViewProject}
          onEditProject={handleEditProject}
          filters={filters}
        />
      ) : (
        <Grid container spacing={3}>
          {isLoading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                <Card sx={{ height: 320 }}>
                  <CardContent>
                    {/* Loading skeleton */}
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : projects.length === 0 ? (
            <Grid item xs={12}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No projects found
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={3}>
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
                    >
                      Create Project
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ) : (
            projects.map((project) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={project.id}>
                <ProjectCard
                  project={project}
                  onView={handleViewProject}
                  onEdit={handleEditProject}
                />
              </Grid>
            ))
          )}
        </Grid>
      )}

      {/* Mobile FAB */}
      {isMobile && canCreate && (
        <Fab
          color="primary"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={handleCreateProject}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Project Details Panel */}
      <Drawer
        anchor="right"
        open={detailsPanelOpen}
        onClose={() => setDetailsPanelOpen(false)}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 600, md: 800 } }
        }}
      >
        {selectedProjectId && (
          <ProjectDetailsPanel
            projectId={selectedProjectId}
            onClose={() => setDetailsPanelOpen(false)}
            onEdit={handleEditProject}
          />
        )}
      </Drawer>

      {/* Filter Drawer */}
      <Drawer
        anchor="right"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 400 } }
        }}
      >
        <Box p={3}>
          <Typography variant="h6" gutterBottom>
            Filter Projects
          </Typography>
          
          {/* Advanced filters would go here */}
          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status || ''}
              onChange={(e: SelectChangeEvent<ProjectStatus | ''>) => {
                const value = e.target.value as ProjectStatus | '';
                updateFilters({ status: (value || undefined) as ProjectStatus | undefined });
              }}
            >
              <MenuItem value="">All Status</MenuItem>
              {Object.values(ProjectStatus).map((status) => (
                <MenuItem key={status} value={status}>
                  {PROJECT_STATUS_LABELS[status]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box mt={3} display="flex" gap={2}>
            <Button
              variant="outlined"
              onClick={() => {
                resetFilters();
                setFilterDrawerOpen(false);
              }}
              fullWidth
            >
              Clear Filters
            </Button>
            <Button
              variant="contained"
              onClick={() => setFilterDrawerOpen(false)}
              fullWidth
            >
              Apply Filters
            </Button>
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
};

export default ProjectListPage;


