// src/services/projectService.ts

import apiClient from './api';
import {
  Project,
  BudgetSummary,
  ProjectStatistics,
  CreateProjectRequest,
  UpdateProjectRequest,
  AssignManagerRequest,
  UpdateBudgetRequest,
  UpdateStatusRequest,
  ProjectFilters,
  PaginatedResponse,
  ProjectStatus
} from '@/types/project';
import { ApiResponse } from '@/types/api';

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
   * Update project
   */
  async updateProject(projectId: number, data: UpdateProjectRequest): Promise<ApiResponse<Project>> {
    const response = await apiClient.put<Project>(`${API_BASE}/${projectId}`, data);
    return response;
  }

  /**
   * Assign project manager
   */
  async assignManager(projectId: number, data: AssignManagerRequest): Promise<ApiResponse<Project>> {
    const response = await apiClient.post<Project>(`${API_BASE}/${projectId}/assign`, data);
    return response;
  }

  /**
   * Update project budget
   */
  async updateProjectBudget(projectId: number, data: UpdateBudgetRequest): Promise<ApiResponse<Project>> {
    const response = await apiClient.put<Project>(`${API_BASE}/${projectId}/budget`, data);
    return response;
  }

  /**
   * Update project status
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

  /**
   * Get project budget summary
   */
  async getProjectBudgetSummary(projectId: number): Promise<ApiResponse<BudgetSummary>> {
    const response = await apiClient.get<BudgetSummary>(`${API_BASE}/${projectId}/budget/summary`);
    return response;
  }

  /**
   * Get projects with budget utilization data
   */
  async getProjectsBudgetUtilization(filters: ProjectFilters = {}): Promise<ApiResponse<Project[]>> {
    const params = new URLSearchParams();
    
    if (filters.managerId) params.append('managerId', filters.managerId.toString());
    if (filters.status) params.append('status', filters.status);
    if (filters.overBudget !== undefined) params.append('overBudget', filters.overBudget.toString());
    
    const response = await apiClient.get<Project[]>(`${API_BASE}/budget-utilization?${params.toString()}`);
    return response;
  }

  /**
   * Export projects to Excel/CSV
   */
  async exportProjects(filters: ProjectFilters = {}, format: 'excel' | 'csv' = 'excel'): Promise<Blob> {
    const params = new URLSearchParams();
    
    // Add filter params
    if (filters.name) params.append('name', filters.name);
    if (filters.location) params.append('location', filters.location);
    if (filters.status) params.append('status', filters.status);
    if (filters.managerId) params.append('managerId', filters.managerId.toString());
    
    params.append('format', format);
    
    const raw = await apiClient.getRawClient().get(`${API_BASE}/export?${params.toString()}`, {
      responseType: 'blob'
    });
    
    return raw.data as Blob;
  }

  /**
   * Bulk update projects status
   */
  async bulkUpdateStatus(projectIds: number[], status: ProjectStatus, reason?: string): Promise<ApiResponse<void>> {
    const response = await apiClient.put<void>(`${API_BASE}/bulk/status`, {
      projectIds,
      status,
      reason
    });
    return response;
  }

  /**
   * Get project timeline/history
   */
  async getProjectHistory(projectId: number): Promise<ApiResponse<any[]>> {
    const response = await apiClient.get<any[]>(`${API_BASE}/${projectId}/history`);
    return response;
  }

  /**
   * Get project team members
   */
  async getProjectTeam(projectId: number): Promise<ApiResponse<any[]>> {
    const response = await apiClient.get<any[]>(`${API_BASE}/${projectId}/team`);
    return response;
  }

  /**
   * Add team member to project
   */
  async addTeamMember(projectId: number, userId: number, role?: string): Promise<ApiResponse<void>> {
    const response = await apiClient.post<void>(`${API_BASE}/${projectId}/team`, {
      userId,
      role
    });
    return response;
  }

  /**
   * Remove team member from project
   */
  async removeTeamMember(projectId: number, userId: number): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<void>(`${API_BASE}/${projectId}/team/${userId}`);
    return response;
  }

  /**
   * Get project documents/attachments
   */
  async getProjectDocuments(projectId: number): Promise<ApiResponse<any[]>> {
    const response = await apiClient.get<any[]>(`${API_BASE}/${projectId}/documents`);
    return response;
  }

  /**
   * Upload project document
   */
  async uploadDocument(projectId: number, file: File, category?: string): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);
    if (category) formData.append('category', category);

    const response = await apiClient.upload<any>(`${API_BASE}/${projectId}/documents`, formData);
    return response;
  }

  /**
   * Get project quotations
   */
  async getProjectQuotations(projectId: number): Promise<ApiResponse<any[]>> {
    const response = await apiClient.get<any[]>(`/api/quotations/project/${projectId}`);
    return response;
  }

  /**
   * Get project approvals
   */
  async getProjectApprovals(projectId: number): Promise<ApiResponse<any[]>> {
    const response = await apiClient.get<any[]>(`/api/approvals/project/${projectId}`);
    return response;
  }

  /**
   * Get project payments
   */
  async getProjectPayments(projectId: number): Promise<ApiResponse<any[]>> {
    const response = await apiClient.get<any[]>(`/api/payments/project/${projectId}`);
    return response;
  }
}

// Create and export service instance
export const projectService = new ProjectService();

// Export default
export default projectService;