// src/types/project.ts
export interface Project {
    id: number;
    name: string;
    description?: string;
    location?: string;
    allocatedBudget: number;
    remainingBudget: number;
    usedBudget: number;
    currency: string;
    startDate?: string;
    endDate?: string;
    actualEndDate?: string;
    status: ProjectStatus;
    createdDate: string;
    updatedDate: string;
    managerId?: number;
    managerName?: string;
    managerEmail?: string;
    budgetUtilization: number;
    isOverBudget: boolean;
    isOverdue: boolean;
    active: boolean;
  }
  
  export enum ProjectStatus {
    DRAFT = 'DRAFT',
    PLANNING = 'PLANNING',
    ACTIVE = 'ACTIVE',
    ON_HOLD = 'ON_HOLD',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
  }
  
  export interface ProjectSummary {
    id: number;
    name: string;
    location?: string;
    allocatedBudget: number;
    remainingBudget: number;
    status: ProjectStatus;
    managerName?: string;
    budgetUtilization: number;
    isOverBudget: boolean;
    isOverdue: boolean;
  }
  
  export interface BudgetSummary {
    totalAllocated: number;
    totalUsed: number;
    totalRemaining: number;
    utilizationPercentage: number;
    overBudgetCount: number;
    currency: string;
  }
  
  export interface ProjectStatistics {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    overBudgetProjects: number;
    overdueProjects: number;
    totalBudgetAllocated: number;
    totalBudgetUsed: number;
    averageBudgetUtilization: number;
  }
  
  // Request DTOs
  export interface CreateProjectRequest {
    name: string;
    description?: string;
    location?: string;
    allocatedBudget: number;
    currency?: string;
    startDate?: string;
    endDate?: string;
    managerId?: number;
  }
  
  export interface UpdateProjectRequest {
    name?: string;
    description?: string;
    location?: string;
    allocatedBudget?: number;
    startDate?: string;
    endDate?: string;
  }
  
  export interface AssignManagerRequest {
    managerId: number;
    transferBudget?: boolean;
  }
  
  export interface UpdateBudgetRequest {
    allocatedBudget: number;
    reason?: string;
  }
  
  export interface UpdateStatusRequest {
    status: ProjectStatus;
    reason?: string;
  }
  
  // API Response wrapper
  export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
    timestamp: string;
  }
  
  export interface PaginatedResponse<T> {
    content: T[];
    pageable: {
      page: number;
      size: number;
      sort: string;
    };
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
    numberOfElements: number;
  }
  
  // Form data interfaces
  export interface ProjectFormData {
    name: string;
    description: string;
    location: string;
    allocatedBudget: string;
    currency: string;
    startDate: string | null;
    endDate: string | null;
    managerId: string;
  }
  
  export interface ProjectFilters {
    name?: string;
    location?: string;
    status?: ProjectStatus;
    managerId?: number;
    overBudget?: boolean;
    overdue?: boolean;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
  }
  
  // UI State interfaces
  export interface ProjectListState {
    projects: Project[];
    loading: boolean;
    error: string | null;
    totalPages: number;
    currentPage: number;
    filters: ProjectFilters;
    selectedProjects: number[];
  }
  
  export interface ProjectFormState {
    loading: boolean;
    errors: Record<string, string>;
    touched: Record<string, boolean>;
    isValid: boolean;
  }
  
  export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
    [ProjectStatus.DRAFT]: 'Draft',
    [ProjectStatus.PLANNING]: 'Planning',
    [ProjectStatus.ACTIVE]: 'Active',
    [ProjectStatus.ON_HOLD]: 'On Hold',
    [ProjectStatus.COMPLETED]: 'Completed',
    [ProjectStatus.CANCELLED]: 'Cancelled'
  };
  
  export const PROJECT_STATUS_COLORS: Record<ProjectStatus, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
    [ProjectStatus.DRAFT]: 'default',
    [ProjectStatus.PLANNING]: 'info',
    [ProjectStatus.ACTIVE]: 'success',
    [ProjectStatus.ON_HOLD]: 'warning',
    [ProjectStatus.COMPLETED]: 'primary',
    [ProjectStatus.CANCELLED]: 'error'
  };
  
  export const CURRENCY_OPTIONS = [
    { value: 'SAR', label: 'Saudi Riyal (SAR)' },
    { value: 'USD', label: 'US Dollar (USD)' },
    { value: 'EUR', label: 'Euro (EUR)' }
  ];
  
  export const DEFAULT_PROJECT_FILTERS: ProjectFilters = {
    page: 0,
    size: 20,
    sortBy: 'name',
    sortDir: 'asc'
  };