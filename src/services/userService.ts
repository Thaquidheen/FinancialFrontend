import apiClient from './api';
import {
  User,
  UserSummary,
  CreateUserRequest,
  UpdateUserRequest,
  UpdateUserRolesRequest,
  UpdateBankDetailsRequest,
  ChangePasswordRequest,
  UserSearchParams,
  UserStats,
  Role,
  Department,
  BulkUserOperation,
  BulkOperationResult,
  UserActivity,
  UserExportOptions,
  UserImportResult,
} from '@types/user';
import { ApiResponse, PaginatedResponse } from '@types/api';

export class UserService {
  /**
   * Get paginated list of users with search and filtering
   */
  async getUsers(params?: UserSearchParams): Promise<PaginatedResponse<User>> {
    const queryParams = new URLSearchParams();
    
    if (params?.search) queryParams.append('search', params.search);
    if (params?.roles?.length) params.roles.forEach(role => queryParams.append('roles', role));
    if (params?.departments?.length) params.departments.forEach(dept => queryParams.append('departments', dept));
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params?.managerId) queryParams.append('managerId', params.managerId);
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortDirection) queryParams.append('sortDirection', params.sortDirection);

    const response = await apiClient.get<PaginatedResponse<User>>(
      `/api/users?${queryParams.toString()}`
    );

    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to fetch users');
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User> {
    const response = await apiClient.get<User>(`/api/users/${userId}`);

    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to fetch user');
  }

  /**
   * Create new user
   */
  async createUser(userData: CreateUserRequest): Promise<User> {
    const response = await apiClient.post<User>('/api/users', userData);

    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to create user');
  }

  /**
   * Update user information
   */
  async updateUser(userId: string, userData: UpdateUserRequest): Promise<User> {
    const response = await apiClient.put<User>(`/api/users/${userId}`, userData);

    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to update user');
  }

  /**
   * Update user roles
   */
  async updateUserRoles(userId: string, rolesData: UpdateUserRolesRequest): Promise<User> {
    const response = await apiClient.put<User>(`/api/users/${userId}/roles`, rolesData);

    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to update user roles');
  }

  /**
   * Update user bank details
   */
  async updateBankDetails(userId: string, bankDetails: UpdateBankDetailsRequest): Promise<User> {
    const response = await apiClient.put<User>(`/api/users/${userId}/bank-details`, bankDetails);

    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to update bank details');
  }

  /**
   * Activate user account
   */
  async activateUser(userId: string): Promise<User> {
    const response = await apiClient.put<User>(`/api/users/${userId}/activate`);

    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to activate user');
  }

  /**
   * Deactivate user account
   */
  async deactivateUser(userId: string): Promise<User> {
    const response = await apiClient.put<User>(`/api/users/${userId}/deactivate`);

    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to deactivate user');
  }

  /**
   * Delete user (soft delete)
   */
  async deleteUser(userId: string): Promise<void> {
    const response = await apiClient.delete(`/api/users/${userId}`);

    if (!response.success) {
      throw new Error(response.message || 'Failed to delete user');
    }
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, passwordData: ChangePasswordRequest): Promise<void> {
    const response = await apiClient.post(`/api/users/${userId}/change-password`, passwordData);

    if (!response.success) {
      throw new Error(response.message || 'Failed to change password');
    }
  }

  /**
   * Reset user password (admin only)
   */
  async resetPassword(userId: string): Promise<{ temporaryPassword: string }> {
    const response = await apiClient.post<{ temporaryPassword: string }>(`/api/users/${userId}/reset-password`);

    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to reset password');
  }

  /**
   * Get user statistics for dashboard
   */
  async getUserStats(): Promise<UserStats> {
    const response = await apiClient.get<UserStats>('/api/users/statistics');

    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to fetch user statistics');
  }

  /**
   * Get all available roles
   */
  async getRoles(): Promise<Role[]> {
    const response = await apiClient.get<Role[]>('/api/auth/roles');

    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to fetch roles');
  }

  /**
   * Get all departments
   */
  async getDepartments(): Promise<Department[]> {
    const response = await apiClient.get<Department[]>('/api/users/departments');

    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to fetch departments');
  }

  /**
   * Get users by role (for dropdowns)
   */
  async getUsersByRole(role: string): Promise<UserSummary[]> {
    const response = await apiClient.get<UserSummary[]>(`/api/users/by-role/${role}`);

    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to fetch users by role');
  }

  /**
   * Get managers list for user assignment
   */
  async getManagers(): Promise<UserSummary[]> {
    const response = await apiClient.get<UserSummary[]>('/api/users/managers');

    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to fetch managers');
  }

  /**
   * Bulk operations on users
   */
  async performBulkOperation(operation: BulkUserOperation): Promise<BulkOperationResult> {
    const response = await apiClient.post<BulkOperationResult>('/api/users/bulk-operation', operation);

    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to perform bulk operation');
  }

  /**
   * Get user activity history
   */
  async getUserActivity(userId: string, params?: {
    page?: number;
    size?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<PaginatedResponse<UserActivity>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const response = await apiClient.get<PaginatedResponse<UserActivity>>(
      `/api/users/${userId}/activity?${queryParams.toString()}`
    );

    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to fetch user activity');
  }

  /**
   * Export users to file
   */
  async exportUsers(options: UserExportOptions): Promise<Blob> {
    const queryParams = new URLSearchParams();
    
    queryParams.append('format', options.format);
    options.fields.forEach(field => queryParams.append('fields', field as string));
    if (options.includeInactive) queryParams.append('includeInactive', 'true');
    if (options.includeBankDetails) queryParams.append('includeBankDetails', 'true');

    // Add filter params
    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => queryParams.append(key, v.toString()));
        } else if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = await apiClient.getRawClient().get(`/api/users/export?${queryParams.toString()}`, {
      responseType: 'blob',
    });

    return response.data;
  }

  /**
   * Import users from file
   */
  async importUsers(file: File): Promise<UserImportResult> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.upload<UserImportResult>('/api/users/import', formData);

    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to import users');
  }

  /**
   * Check if username is available
   */
  async checkUsernameAvailability(username: string, excludeUserId?: string): Promise<{ available: boolean }> {
    const queryParams = new URLSearchParams();
    queryParams.append('username', username);
    if (excludeUserId) queryParams.append('excludeUserId', excludeUserId);

    const response = await apiClient.get<{ available: boolean }>(
      `/api/users/check-username?${queryParams.toString()}`
    );

    if (response.success && response.data) {
      return response.data;
    }
    
    return { available: false };
  }

  /**
   * Check if email is available
   */
  async checkEmailAvailability(email: string, excludeUserId?: string): Promise<{ available: boolean }> {
    const queryParams = new URLSearchParams();
    queryParams.append('email', email);
    if (excludeUserId) queryParams.append('excludeUserId', excludeUserId);

    const response = await apiClient.get<{ available: boolean }>(
      `/api/users/check-email?${queryParams.toString()}`
    );

    if (response.success && response.data) {
      return response.data;
    }
    
    return { available: false };
  }

  /**
   * Upload user profile image
   */
  async uploadProfileImage(userId: string, file: File): Promise<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiClient.upload<{ imageUrl: string }>(
      `/api/users/${userId}/profile-image`,
      formData
    );

    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to upload profile image');
  }

  /**
   * Get user's subordinates (for managers)
   */
  async getUserSubordinates(userId: string): Promise<UserSummary[]> {
    const response = await apiClient.get<UserSummary[]>(`/api/users/${userId}/subordinates`);

    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to fetch subordinates');
  }
}

// Export singleton instance
const userService = new UserService();
export default userService;