// src/hooks/useProject.ts
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
// Removed notistack to avoid missing dependency
import {
  Project,
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

  // Debug logging
  console.log('useMyProjects Debug:', {
    user,
    userRoles: user?.roles,
    hasAccess,
    PROJECT_MANAGER: USER_ROLES.PROJECT_MANAGER
  });

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
    [USER_ROLES.SUPER_ADMIN, USER_ROLES.ACCOUNT_MANAGER].includes(role as any)
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
  const [filters, setFilters] = useState<ProjectFilters>({
    page: 0,
    size: 20,
    sortBy: 'name',
    sortDir: 'asc',
    ...initialFilters
  });

  const [selectedProjects, setSelectedProjects] = useState<number[]>([]);

  const { data, isLoading, error, refetch } = useProjects(filters);

  const updateFilters = useCallback((newFilters: Partial<ProjectFilters>) => {
    setFilters((prev: ProjectFilters) => ({ ...prev, ...newFilters, page: 0 })); // Reset to first page
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setFilters((prev: ProjectFilters) => ({ ...prev, page }));
  }, []);

  const handleSortChange = useCallback((sortBy: string, sortDir: 'asc' | 'desc') => {
    setFilters((prev: ProjectFilters) => ({ ...prev, sortBy, sortDir, page: 0 }));
  }, []);

  const handleSelectProject = useCallback((projectId: number) => {
    setSelectedProjects((prev: number[]) => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  }, []);

  const handleSelectAllProjects = useCallback((projects: Project[]) => {
    const allIds = projects.map(p => p.id);
    setSelectedProjects((prev: number[]) => 
      prev.length === allIds.length ? [] : allIds
    );
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedProjects([]);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      page: 0,
      size: 20,
      sortBy: 'name',
      sortDir: 'asc'
    });
    clearSelection();
  }, [clearSelection]);

  return {
    // Data
    projects: ((data as any)?.data?.content ?? (data as any)?.content) || [],
    totalPages: ((data as any)?.data?.totalPages ?? (data as any)?.totalPages) || 0,
    totalElements: ((data as any)?.data?.totalElements ?? (data as any)?.totalElements) || 0,
    
    // State
    filters,
    selectedProjects,
    isLoading,
    error,
    
    // Actions
    updateFilters,
    handlePageChange,
    handleSortChange,
    handleSelectProject,
    handleSelectAllProjects,
    clearSelection,
    resetFilters,
    refetch
  };
};