// src/hooks/useProject.ts
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
// Removed notistack to avoid missing dependency
import {
  CreateProjectRequest,
  UpdateProjectRequest,
  AssignManagerRequest,
  UpdateBudgetRequest,
  UpdateStatusRequest,
  ProjectFilters,
  ProjectStatus
} from '@/types/project';
import { projectService } from '@services/projectService';
import { useAuth } from '@contexts/AuthContext';
import { USER_ROLES } from '@/types/auth';

// Query Keys
export const PROJECT_QUERY_KEYS = {
  projects: ['projects'] as const,
  projectsList: (filters: ProjectFilters) => ['projects', 'list', filters] as const,
  project: (id: number) => ['projects', id] as const,
  myProjects: ['projects', 'my'] as const,
  projectStatistics: ['projects', 'statistics'] as const,
  projectsByStatus: (status: ProjectStatus) => ['projects', 'by-status', status] as const,
  projectsRequiringAttention: ['projects', 'requiring-attention'] as const,
};

// Hook for fetching paginated projects list
export const useProjects = (filters: ProjectFilters = {}) => {
  const { user } = useAuth();
  
  const hasAccess = user?.roles?.some(role => 
    [USER_ROLES.SUPER_ADMIN, USER_ROLES.ACCOUNT_MANAGER].includes(role as any)
  );

  return useQuery({
    queryKey: PROJECT_QUERY_KEYS.projectsList(filters),
    queryFn: () => projectService.getProjects(filters),
    enabled: hasAccess,
    staleTime: 2 * 60 * 1000, // 2 minutes
    keepPreviousData: true,
  });
};

// Hook for fetching single project by ID
export const useProject = (projectId: number | null) => {
  return useQuery({
    queryKey: PROJECT_QUERY_KEYS.project(projectId!),
    queryFn: () => projectService.getProjectById(projectId!),
    enabled: !!projectId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Hook for fetching current user's projects (Project Manager)
export const useMyProjects = () => {
  const { user } = useAuth();
  
  const hasAccess = user?.roles?.some(role => 
    [USER_ROLES.SUPER_ADMIN, USER_ROLES.PROJECT_MANAGER].includes(role as any)
  );


  return useQuery({
    queryKey: PROJECT_QUERY_KEYS.myProjects,
    queryFn: () => projectService.getMyProjects(),
    enabled: hasAccess,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Hook for project statistics
export const useProjectStatistics = () => {
  const { user } = useAuth();
  
  const hasAccess = user?.roles?.some(role => 
    [USER_ROLES.SUPER_ADMIN, USER_ROLES.ACCOUNT_MANAGER, USER_ROLES.PROJECT_MANAGER].includes(role as any)
  );

  return useQuery({
    queryKey: PROJECT_QUERY_KEYS.projectStatistics,
    queryFn: () => projectService.getProjectStatistics(),
    enabled: hasAccess,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for projects by status
export const useProjectsByStatus = (status: ProjectStatus) => {
  const { user } = useAuth();
  
  const hasAccess = user?.roles?.some(role => 
    [USER_ROLES.SUPER_ADMIN, USER_ROLES.ACCOUNT_MANAGER].includes(role as any)
  );

  return useQuery({
    queryKey: PROJECT_QUERY_KEYS.projectsByStatus(status),
    queryFn: () => projectService.getProjectsByStatus(status),
    enabled: hasAccess,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook for projects requiring attention
export const useProjectsRequiringAttention = () => {
  const { user } = useAuth();
  
  const hasAccess = user?.roles?.some(role => 
    [USER_ROLES.SUPER_ADMIN, USER_ROLES.ACCOUNT_MANAGER].includes(role as any)
  );

  return useQuery({
    queryKey: PROJECT_QUERY_KEYS.projectsRequiringAttention,
    queryFn: () => projectService.getProjectsRequiringAttention(),
    enabled: hasAccess,
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

// Hook for creating projects
export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectRequest) => projectService.createProject(data),
    onSuccess: (_response: any) => {
      // Invalidate and refetch projects list
      queryClient.invalidateQueries({ queryKey: PROJECT_QUERY_KEYS.projects });
      queryClient.invalidateQueries({ queryKey: PROJECT_QUERY_KEYS.projectStatistics });
      // console.log(`Project "${response?.data?.name || ''}" created successfully`);
    },
    onError: (error: AxiosError<any>) => {
      const errorMessage = (error.response as any)?.data?.message || 'Failed to create project';
      console.error(errorMessage);
    }
  });
};

// Hook for updating projects
export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: number; data: UpdateProjectRequest }) => 
      projectService.updateProject(projectId, data),
    onSuccess: (response: any, variables) => {
      // Update specific project in cache
      queryClient.setQueryData(
        PROJECT_QUERY_KEYS.project(variables.projectId),
        response
      );
      
      // Invalidate projects list
      queryClient.invalidateQueries({ queryKey: PROJECT_QUERY_KEYS.projects });
      // console.log(`Project "${response?.data?.name || ''}" updated successfully`);
    },
    onError: (error: AxiosError<any>) => {
      const errorMessage = (error.response as any)?.data?.message || 'Failed to update project';
      console.error(errorMessage);
    }
  });
};

// Hook for assigning project manager
export const useAssignManager = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: number; data: AssignManagerRequest }) => 
      projectService.assignManager(projectId, data),
    onSuccess: (response: any, variables) => {
      // Update specific project in cache
      queryClient.setQueryData(
        PROJECT_QUERY_KEYS.project(variables.projectId),
        response
      );
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: PROJECT_QUERY_KEYS.projects });
      queryClient.invalidateQueries({ queryKey: PROJECT_QUERY_KEYS.myProjects });
      // console.log('Project manager assigned successfully');
    },
    onError: (error: AxiosError<any>) => {
      const errorMessage = (error.response as any)?.data?.message || 'Failed to assign manager';
      console.error(errorMessage);
    }
  });
};

// Hook for updating project budget
export const useUpdateProjectBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: number; data: UpdateBudgetRequest }) => 
      projectService.updateProjectBudget(projectId, data),
    onSuccess: (response: any, variables) => {
      // Update specific project in cache
      queryClient.setQueryData(
        PROJECT_QUERY_KEYS.project(variables.projectId),
        response
      );
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: PROJECT_QUERY_KEYS.projects });
      queryClient.invalidateQueries({ queryKey: PROJECT_QUERY_KEYS.projectStatistics });
      // console.log('Project budget updated successfully');
    },
    onError: (error: AxiosError<any>) => {
      const errorMessage = (error.response as any)?.data?.message || 'Failed to update budget';
      console.error(errorMessage);
    }
  });
};

// Hook for updating project status
export const useUpdateProjectStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: number; data: UpdateStatusRequest }) => 
      projectService.updateProjectStatus(projectId, data),
    onSuccess: (response: any, variables) => {
      // Update specific project in cache
      queryClient.setQueryData(
        PROJECT_QUERY_KEYS.project(variables.projectId),
        response
      );
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: PROJECT_QUERY_KEYS.projects });
      queryClient.invalidateQueries({ queryKey: PROJECT_QUERY_KEYS.projectStatistics });
      // console.log('Project status updated successfully');
    },
    onError: (error: AxiosError<any>) => {
      const errorMessage = (error.response as any)?.data?.message || 'Failed to update status';
      console.error(errorMessage);
    }
  });
};

// Hook for managing projects list with local state
export const useProjectsManager = (initialFilters: ProjectFilters = {}) => {
  const { user } = useAuth();
  const [filters, setFilters] = useState<ProjectFilters>({
    page: 0,
    size: 20,
    sortBy: 'name',
    sortDir: 'asc',
    ...initialFilters
  });

  // Determine which hook to use based on user role
  const isProjectManager = user?.roles?.some(role => role === USER_ROLES.PROJECT_MANAGER);
  const isAdminOrAccountManager = user?.roles?.some(role => 
    [USER_ROLES.SUPER_ADMIN, USER_ROLES.ACCOUNT_MANAGER].includes(role as any)
  );

  // Debug role detection
  console.log('Role Detection Debug:', {
    user,
    userRoles: user?.roles,
    isProjectManager,
    isAdminOrAccountManager,
    PROJECT_MANAGER: USER_ROLES.PROJECT_MANAGER,
    SUPER_ADMIN: USER_ROLES.SUPER_ADMIN,
    ACCOUNT_MANAGER: USER_ROLES.ACCOUNT_MANAGER
  });


  // Use different hooks based on user role
  const projectsQuery = useProjects(filters);
  const myProjectsQuery = useMyProjects();

  // Select the appropriate query result
  // If user is ONLY a project manager (not admin/account manager), use myProjects
  // Otherwise, use the general projects query
  const shouldUseMyProjects = isProjectManager && !isAdminOrAccountManager;
  const { data, isLoading, error, refetch } = shouldUseMyProjects 
    ? myProjectsQuery 
    : projectsQuery;

  console.log('Query Selection Debug:', {
    shouldUseMyProjects,
    myProjectsData: myProjectsQuery.data,
    projectsData: projectsQuery.data,
    myProjectsLoading: myProjectsQuery.isLoading,
    projectsLoading: projectsQuery.isLoading,
    myProjectsError: myProjectsQuery.error,
    projectsError: projectsQuery.error
  });


  const updateFilters = useCallback((newFilters: Partial<ProjectFilters>) => {
    setFilters((prev: ProjectFilters) => ({ ...prev, ...newFilters, page: 0 })); // Reset to first page
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setFilters((prev: ProjectFilters) => ({ ...prev, page }));
  }, []);

  const handleSortChange = useCallback((sortBy: string, sortDir: 'asc' | 'desc') => {
    setFilters((prev: ProjectFilters) => ({ ...prev, sortBy, sortDir, page: 0 }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      page: 0,
      size: 20,
      sortBy: 'name',
      sortDir: 'asc'
    });
  }, []);

  // Handle different response formats
  let projects: any[] = [];
  let totalPages = 0;
  let totalElements = 0;


  if (shouldUseMyProjects) {
    // For project managers, handle both response formats:
    // 1. New format: { success: true, data: [...], message: "..." }
    // 2. Old format: [...] (raw array)
    console.log('Project Manager Data Debug:', {
      data,
      isArray: Array.isArray(data),
      dataType: typeof data,
      hasDataProperty: data && typeof data === 'object' && 'data' in data
    });
    
    if (Array.isArray(data)) {
      // Old format: raw array
      projects = data as any[];
      console.log('Using raw array format, projects:', projects);
    } else if (data && typeof data === 'object' && data.data) {
      // New format: wrapped in ApiResponse
      projects = Array.isArray(data.data) ? data.data : [];
      console.log('Using wrapped format, projects:', projects);
    } else {
      // Fallback
      projects = [];
      console.log('Using fallback, projects:', projects);
    }
    totalPages = 1;
    totalElements = projects.length;
  } else {
    // For admins/account managers, useProjects returns paginated data
    const paginatedData = data as any;
    projects = (paginatedData?.data?.content ?? paginatedData?.content) || [];
    totalPages = (paginatedData?.data?.totalPages ?? paginatedData?.totalPages) || 0;
    totalElements = (paginatedData?.data?.totalElements ?? paginatedData?.totalElements) || 0;
  }

  return {
    // Data
    projects,
    totalPages,
    totalElements,
    
    // State
    filters,
    isLoading,
    error,
    
    // Actions
    updateFilters,
    handlePageChange,
    handleSortChange,
    resetFilters,
    refetch
  };
};