// src/services/projectService.ts - FIXED VERSION with correct backend endpoints
import apiClient from './api';
import {
  Project,
  ProjectStatistics,
  CreateProjectRequest,
  UpdateProjectRequest,
  AssignManagerRequest,
  UpdateBudgetRequest,
  UpdateStatusRequest,
  ProjectFilters,
  ProjectStatus
} from '@/types/project';
import type { ApiResponse, PaginatedResponse } from '@/types/api';

const API_BASE = '/projects';

export class ProjectService {
  /**
   * Get paginated projects list with filtering
   */
  async getProjects(filters: ProjectFilters = {}): Promise<ApiResponse<PaginatedResponse<Project>>> {
    const params = new URLSearchParams();
    
    if (filters.page !== undefined) params.append('page', filters.page.toString());
    if (filters.size !== undefined) params.append('size', filters.size.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortDir) params.append('sortDir', filters.sortDir);
    
    const response = await apiClient.get<PaginatedResponse<Project>>(`${API_BASE}?${params.toString()}`);
    return response;
  }

  /**
   * Search projects with multiple filters
   */
  async searchProjects(filters: ProjectFilters = {}): Promise<ApiResponse<PaginatedResponse<Project>>> {
    const params = new URLSearchParams();
    
    // Add pagination params
    if (filters.page !== undefined) params.append('page', filters.page.toString());
    if (filters.size !== undefined) params.append('size', filters.size.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortDir) params.append('sortDir', filters.sortDir);
    
    // Add filter params
    if (filters.name) params.append('name', filters.name);
    if (filters.location) params.append('location', filters.location);
    if (filters.status) params.append('status', filters.status);
    if (filters.managerId) params.append('managerId', filters.managerId.toString());
    
    const response = await apiClient.get<PaginatedResponse<Project>>(`${API_BASE}/search?${params.toString()}`);
    return response;
  }

  /**
   * Get project by ID
   */
  async getProjectById(projectId: number): Promise<ApiResponse<Project>> {
    const response = await apiClient.get<Project>(`${API_BASE}/${projectId}`);
    return response;
  }

  /**
   * Get current user's projects (for Project Managers)
   */
  async getMyProjects(): Promise<ApiResponse<Project[]>> {
    const response = await apiClient.get<Project[]>(`${API_BASE}/my-projects`);
    return response;
  }

  /**
   * Create new project
   */
  async createProject(data: CreateProjectRequest): Promise<ApiResponse<Project>> {
    const response = await apiClient.post<Project>(API_BASE, data);
    return response;
  }

  /**
   * Update project - FIXED to match backend
   */
  async updateProject(projectId: number, data: UpdateProjectRequest): Promise<ApiResponse<Project>> {
    const response = await apiClient.put<Project>(`${API_BASE}/${projectId}`, data);
    return response;
  }

  /**
   * Assign project manager - FIXED: use /assign-manager endpoint
   */
  async assignManager(projectId: number, data: AssignManagerRequest): Promise<ApiResponse<Project>> {
    const response = await apiClient.put<Project>(`${API_BASE}/${projectId}/assign-manager`, data);
    return response;
  }

  /**
   * Update project budget - FIXED to match backend
   */
  async updateProjectBudget(projectId: number, data: UpdateBudgetRequest): Promise<ApiResponse<Project>> {
    const response = await apiClient.put<Project>(`${API_BASE}/${projectId}/budget`, data);
    return response;
  }

  /**
   * Update project status - FIXED to match backend
   */
  async updateProjectStatus(projectId: number, data: UpdateStatusRequest): Promise<ApiResponse<Project>> {
    const response = await apiClient.put<Project>(`${API_BASE}/${projectId}/status`, data);
    return response;
  }

  /**
   * Get projects by status
   */
  async getProjectsByStatus(status: ProjectStatus): Promise<ApiResponse<Project[]>> {
    const response = await apiClient.get<Project[]>(`${API_BASE}/by-status/${status}`);
    return response;
  }

  /**
   * Get projects requiring attention (over budget, overdue, etc.)
   */
  async getProjectsRequiringAttention(): Promise<ApiResponse<Project[]>> {
    const response = await apiClient.get<Project[]>(`${API_BASE}/requiring-attention`);
    return response;
  }

  /**
   * Get project statistics
   */
  async getProjectStatistics(): Promise<ApiResponse<ProjectStatistics>> {
    const response = await apiClient.get<ProjectStatistics>(`${API_BASE}/statistics`);
    return response;
  }

  /**
   * Delete project (if supported by backend)
   */
  async deleteProject(projectId: number): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<void>(`${API_BASE}/${projectId}`);
    return response;
  }

}

// Create and export service instance
export const projectService = new ProjectService();

// Export default
export default projectService;