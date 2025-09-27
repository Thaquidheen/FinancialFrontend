import apiClient from './api';
import {
  UserResponse,
  UserSummary,
  UserSearchParams,
  CreateUserRequest,
  UpdateUserRequest,
  UpdateUserRolesRequest,
  UpdateBankDetailsRequest,
  ChangePasswordRequest,
  ResetPasswordRequest,
  UserStatistics,
  UserActivityResponse,
  ActivitySearchParams,
  Role,
} from '../types/user';

class UserService {
  private unwrapResponse<T>(response: any): T {
    if (response && typeof response === 'object' && 'success' in response) {
      return (response.data as T);
    }
    return response as T;
  }

  // Get Users List with Search and Pagination
  async getUsers(params: UserSearchParams = {}): Promise<any> {
    // Check if we have role filtering - use dedicated endpoints for specific roles
    if (params.roles?.length === 1) {
      const role = params.roles[0];
      if (role === 'PROJECT_MANAGER') {
        return this.getProjectManagers();
      } else if (role === 'ACCOUNT_MANAGER') {
        return this.getAccountManagers();
      }
    }
    
    // Check if we have search/filter parameters
    const hasSearchOrFilters = params.search || params.roles?.length || params.departments?.length || params.isActive !== undefined;
    
    if (hasSearchOrFilters) {
      // Use search endpoint for filtered results
      const searchParams: Record<string, any> = {
        page: params.page ?? 0,
        size: params.size ?? params.pageSize ?? 10,
        fullName: params.search,
        department: params.departments?.[0] || params.department, // Backend expects single department
        active: params.isActive ?? params.active,
      };
      
      const response = await apiClient.get<any>('/users/search', { params: searchParams });
      return this.processUserResponse(response);
    } else {
      // Use basic endpoint for unfiltered results
      const mappedParams: Record<string, any> = {
        page: params.page ?? 0,
        size: params.size ?? params.pageSize ?? 10,
        sortBy: params.sortBy ?? 'createdDate',
        sortDir: params.sortDirection ?? 'asc',
      };

      const response = await apiClient.get<any>('/users', { params: mappedParams });
      return this.processUserResponse(response);
    }
  }

  private processUserResponse(response: any): any {
    const payload = this.unwrapResponse<any>(response);

    // Pass-through Spring-style pagination if present
    if (payload && typeof payload === 'object' && 'content' in payload) {
      const normalizedContent = (payload.content as any[]).map((item: any) => ({
        ...item,
        isActive: item.isActive ?? item.active ?? false,
        createdAt: item.createdAt ?? item.createdDate ?? item.created_at ?? null,
        updatedAt: item.updatedAt ?? item.updatedDate ?? item.updated_at ?? null,
      }));
      return { ...payload, content: normalizedContent };
    }
    // Support legacy users/totalCount shape
    if (payload && Array.isArray(payload.users)) {
      const normalizedUsers = (payload.users as any[]).map((item: any) => ({
        ...item,
        isActive: item.isActive ?? item.active ?? false,
        createdAt: item.createdAt ?? item.createdDate ?? item.created_at ?? null,
        updatedAt: item.updatedAt ?? item.updatedDate ?? item.updated_at ?? null,
      }));
      return { ...payload, users: normalizedUsers };
    }

    if (Array.isArray(payload)) {
      const normalizedArray = (payload as any[]).map((item: any) => ({
        ...item,
        isActive: item.isActive ?? item.active ?? false,
        createdAt: item.createdAt ?? item.createdDate ?? item.created_at ?? null,
        updatedAt: item.updatedAt ?? item.updatedDate ?? item.updated_at ?? null,
      }));
      return {
        content: normalizedArray,
        totalElements: payload.length,
        number: 0,
        size: payload.length,
        totalPages: 1,
        first: true,
        last: true,
        empty: payload.length === 0,
        numberOfElements: payload.length,
        sort: { empty: true, sorted: false, unsorted: true },
        pageable: { pageNumber: 0, pageSize: payload.length, sort: { empty: true, sorted: false, unsorted: true }, offset: 0, unpaged: false, paged: true },
      };
    }

    return payload;
  }

  // Get Single User by ID
  async getUser(id: string): Promise<UserResponse> {
    const response = await apiClient.get<UserResponse>(`/users/${id}`);
    const payload = this.unwrapResponse<UserResponse>(response) as any;
    return {
      ...payload,
      isActive: payload.isActive ?? payload.active ?? false,
      createdAt: payload.createdAt ?? payload.createdDate ?? payload.created_at ?? '',
      updatedAt: payload.updatedAt ?? payload.updatedDate ?? payload.updated_at ?? '',
    } as UserResponse;
  }

  // Create New User
  async createUser(userData: CreateUserRequest): Promise<UserResponse> {
    const response = await apiClient.post<UserResponse>('/users', userData);
    return this.unwrapResponse<UserResponse>(response);
  }

  // Update User Information
  async updateUser(id: string, userData: UpdateUserRequest): Promise<UserResponse> {
    const response = await apiClient.put<UserResponse>(`/users/${id}`, userData);
    return this.unwrapResponse<UserResponse>(response);
  }

  // Update User Roles
  async updateUserRoles(id: string, rolesData: UpdateUserRolesRequest): Promise<UserResponse> {
    const response = await apiClient.put<UserResponse>(`/users/${id}/roles`, rolesData);
    return this.unwrapResponse<UserResponse>(response);
  }

  // Update User Bank Details
  async updateBankDetails(id: string, bankData: UpdateBankDetailsRequest): Promise<UserResponse> {
    const response = await apiClient.put<UserResponse>(`/users/${id}/bank-details`, bankData);
    return this.unwrapResponse<UserResponse>(response);
  }

  // Change Password
  async changePassword(passwordData: ChangePasswordRequest): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/change-password', passwordData);
    return this.unwrapResponse<{ message: string }>(response);
  }

  // Reset Password (Admin only)
  async resetPassword(resetData: ResetPasswordRequest): Promise<{ message: string; temporaryPassword?: string }> {
    const response = await apiClient.post<{ message: string; temporaryPassword?: string }>(`/users/${resetData.userId}/reset-password`, {
      sendEmail: resetData.sendEmail ?? true,
    });
    return this.unwrapResponse<{ message: string; temporaryPassword?: string }>(response);
  }

  // Activate User
  async activateUser(id: string): Promise<UserResponse> {
    const response = await apiClient.put<UserResponse>(`/users/${id}/activate`);
    return this.unwrapResponse<UserResponse>(response);
  }

  // Deactivate User
  async deactivateUser(id: string): Promise<UserResponse> {
    const response = await apiClient.put<UserResponse>(`/users/${id}/deactivate`);
    return this.unwrapResponse<UserResponse>(response);
  }

  // Delete User
  async deleteUser(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/users/${id}`);
    return this.unwrapResponse<{ message: string }>(response);
  }

  // Get User Statistics
  async getUserStatistics(): Promise<UserStatistics> {
    const response = await apiClient.get<UserStatistics>('/users/statistics');
    return this.unwrapResponse<UserStatistics>(response);
  }

  // Get User Activities
  async getUserActivities(params: ActivitySearchParams): Promise<UserActivityResponse> {
    const response = await apiClient.get<UserActivityResponse>(`/users/${params.userId}/activities`, {
      params: {
        action: params.action,
        status: params.status,
        deviceType: params.deviceType,
        dateFrom: params.dateFrom,
        dateTo: params.dateTo,
        page: params.page || 1,
        pageSize: params.pageSize || 20,
      },
    });
    return this.unwrapResponse<UserActivityResponse>(response);
  }

  // Get Users Without Bank Details
  async getUsersWithoutBankDetails(): Promise<UserResponse[]> {
    const response = await apiClient.get<UserResponse[]>('/users/without-bank-details');
    return this.unwrapResponse<UserResponse[]>(response);
  }

  // Bulk Operations
  async bulkUpdateUsers(userIds: string[], operation: 'activate' | 'deactivate'): Promise<{ 
    message: string; 
    successCount: number; 
    failedCount: number; 
  }> {
    const response = await apiClient.post<{ message: string; successCount: number; failedCount: number }>(
      '/users/bulk-update',
      { userIds, operation }
    );
    return this.unwrapResponse<{ message: string; successCount: number; failedCount: number }>(response);
  }

  // Export Users Data
  async exportUsers(params: UserSearchParams = {}): Promise<Blob> {
    const response = await apiClient.get<Blob>('/users/export', {
      params,
      responseType: 'blob',
    });
    return this.unwrapResponse<Blob>(response);
  }

  // Get Available Managers (for assignment)
  async getAvailableManagers(): Promise<UserResponse[]> {
    const response = await apiClient.get<UserResponse[]>('/users/project-managers');
    return this.unwrapResponse<UserResponse[]>(response);
  }

  // Get Project Managers - returns paginated response format
  async getProjectManagers(): Promise<any> {
    const response = await apiClient.get<UserResponse[]>('/users/project-managers');
    const managers = this.unwrapResponse<UserResponse[]>(response);
    
    // Convert to paginated response format for consistency
    return {
      content: managers,
      totalElements: managers.length,
      number: 0,
      size: managers.length,
      totalPages: 1,
      first: true,
      last: true,
      empty: managers.length === 0,
      numberOfElements: managers.length,
      sort: { empty: true, sorted: false, unsorted: true },
      pageable: { pageNumber: 0, pageSize: managers.length, sort: { empty: true, sorted: false, unsorted: true }, offset: 0, unpaged: false, paged: true },
    };
  }

  // Get Account Managers - returns paginated response format
  async getAccountManagers(): Promise<any> {
    const response = await apiClient.get<UserResponse[]>('/users/account-managers');
    const managers = this.unwrapResponse<UserResponse[]>(response);
    
    // Convert to paginated response format for consistency
    return {
      content: managers,
      totalElements: managers.length,
      number: 0,
      size: managers.length,
      totalPages: 1,
      first: true,
      last: true,
      empty: managers.length === 0,
      numberOfElements: managers.length,
      sort: { empty: true, sorted: false, unsorted: true },
      pageable: { pageNumber: 0, pageSize: managers.length, sort: { empty: true, sorted: false, unsorted: true }, offset: 0, unpaged: false, paged: true },
    };
  }

  // Verify Bank Details
  async verifyBankDetails(userId: string): Promise<{ message: string; verified: boolean }> {
    const response = await apiClient.post<{ message: string; verified: boolean }>(
      `/users/${userId}/bank-details/verify`
    );
    return this.unwrapResponse<{ message: string; verified: boolean }>(response);
  }

  // Get User Dashboard Data (role-specific)
  async getUserDashboard(userId: string): Promise<{
    user: UserResponse;
    statistics: any;
    recentActivities: UserActivityResponse;
    notifications: any[];
  }> {
    const response = await apiClient.get<{
      user: UserResponse;
      statistics: any;
      recentActivities: UserActivityResponse;
      notifications: any[];
    }>(`/users/${userId}/dashboard`);
    return this.unwrapResponse<{
      user: UserResponse;
      statistics: any;
      recentActivities: UserActivityResponse;
      notifications: any[];
    }>(response);
  }

  // Search Users by Name or Employee ID (for autocomplete)
  async searchUsers(query: string, limit: number = 10): Promise<UserResponse[]> {
    const response = await apiClient.get<UserResponse[]>('/users/search', {
      params: { q: query, limit },
    });
    return this.unwrapResponse<UserResponse[]>(response);
  }

  // Get User's Direct Reports
  async getUserDirectReports(managerId: string): Promise<UserResponse[]> {
    const response = await apiClient.get<UserResponse[]>(`/users/${managerId}/direct-reports`);
    return this.unwrapResponse<UserResponse[]>(response);
  }

  // Get Department Users
  async getDepartmentUsers(department: string): Promise<UserResponse[]> {
    const response = await apiClient.get<UserResponse[]>(`/users/department/${department}`);
    return this.unwrapResponse<UserResponse[]>(response);
  }

  // Lock User Account (Admin only)
  async lockUserAccount(id: string): Promise<UserResponse> {
    const response = await apiClient.put<UserResponse>(`/users/${id}/lock`);
    return this.unwrapResponse<UserResponse>(response);
  }

  // Unlock User Account (Admin only)
  async unlockUserAccount(id: string): Promise<UserResponse> {
    const response = await apiClient.put<UserResponse>(`/users/${id}/unlock`);
    return this.unwrapResponse<UserResponse>(response);
  }

  // Force Password Reset on Next Login
  async forcePasswordReset(id: string): Promise<UserResponse> {
    const response = await apiClient.put<UserResponse>(`/users/${id}/force-password-reset`);
    return this.unwrapResponse<UserResponse>(response);
  }

  // Get Users by Role
  async getUsersByRole(role: string): Promise<UserResponse[]> {
    const response = await apiClient.get<UserResponse[]>(`/users/by-role/${role}`);
    return this.unwrapResponse<UserResponse[]>(response);
  }

  // Update User Profile Picture
  async updateProfilePicture(id: string, file: File): Promise<UserResponse> {
    const formData = new FormData();
    formData.append('profilePicture', file);
    
    const response = await apiClient.post<UserResponse>(`/users/${id}/profile-picture`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return this.unwrapResponse<UserResponse>(response);
  }

  // Get User Permissions
  async getUserPermissions(id: string): Promise<string[]> {
    const response = await apiClient.get<{ permissions: string[] }>(`/users/${id}/permissions`);
    const payload = this.unwrapResponse<{ permissions: string[] }>(response);
    return payload.permissions;
  }

  // Update User Status (for batch operations)
  async updateUserStatus(id: string, status: { 
    active?: boolean; 
    accountLocked?: boolean; 
    passwordExpired?: boolean;
  }): Promise<UserResponse> {
    const response = await apiClient.patch<UserResponse>(`/users/${id}/status`, status);
    return this.unwrapResponse<UserResponse>(response);
  }

  // Get Recently Active Users
  async getRecentlyActiveUsers(limit: number = 10): Promise<UserResponse[]> {
    const response = await apiClient.get<UserResponse[]>('/users/recently-active', {
      params: { limit },
    });
    return this.unwrapResponse<UserResponse[]>(response);
  }

  // Send Welcome Email to New User
  async sendWelcomeEmail(id: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(`/users/${id}/send-welcome-email`);
    return this.unwrapResponse<{ message: string }>(response);
  }

  // Check Username Availability
  async checkUsernameAvailability(username: string, excludeUserId?: string): Promise<{ available: boolean }> {
    const response = await apiClient.get<{ available: boolean }>('/users/check-username', {
      params: { username, excludeUserId },
    });
    return this.unwrapResponse<{ available: boolean }>(response);
  }

  // Check Email Availability
  async checkEmailAvailability(email: string, excludeUserId?: string): Promise<{ available: boolean }> {
    const response = await apiClient.get<{ available: boolean }>('/users/check-email', {
      params: { email, excludeUserId },
    });
    return this.unwrapResponse<{ available: boolean }>(response);
  }

  // Validate Employee ID
  async validateEmployeeId(employeeId: string, excludeUserId?: string): Promise<{ valid: boolean }> {
    const response = await apiClient.get<{ valid: boolean }>('/users/validate-employee-id', {
      params: { employeeId, excludeUserId },
    });
    return this.unwrapResponse<{ valid: boolean }>(response);
  }

  // Get available roles
  async getRoles(): Promise<Role[]> {
    try {
      console.log('Fetching roles from /api/auth/available-roles...');
      
      const response = await apiClient.get<any>('/users/roles');
      const payload = this.unwrapResponse<any>(response);
      
      console.log('Roles response:', payload);
      
      if (Array.isArray(payload)) {
        // Backend returns array of role objects directly
        return payload.map((roleItem: any) => ({
          id: String(roleItem.id || roleItem.name),
          name: roleItem.name,
          displayName: roleItem.displayName || roleItem.name.replace(/_/g, ' '),
          description: roleItem.description || '',
          permissions: [],
          isActive: roleItem.isActive !== false,
        }));
      }
      
      // Fallback to hardcoded roles if response is unexpected
      console.warn('Unexpected roles response format, using fallback');
      return this.getFallbackRoles();
      
    } catch (error: any) {
      console.error('Failed to fetch roles from backend:', error);
      
      // If endpoint doesn't exist yet, use fallback
      if (error.response?.status === 404 || error.response?.status === 403) {
        console.log('Roles endpoint not available, using hardcoded fallback');
        return this.getFallbackRoles();
      }
      
      throw error;
    }
  }
  
  // Fallback roles method
  private getFallbackRoles(): Role[] {
    return [
      {
        id: 'SUPER_ADMIN',
        name: 'SUPER_ADMIN',
        displayName: 'Super Admin',
        description: 'Super Administrator with full system access',
        permissions: [],
        isActive: true,
      },
      {
        id: 'ACCOUNT_MANAGER',
        name: 'ACCOUNT_MANAGER',
        displayName: 'Account Manager',
        description: 'Account Manager with approval and payment processing rights',
        permissions: [],
        isActive: true,
      },
      {
        id: 'PROJECT_MANAGER',
        name: 'PROJECT_MANAGER',
        displayName: 'Project Manager',
        description: 'Project Manager with project and quotation management rights',
        permissions: [],
        isActive: true,
      },
      {
        id: 'EMPLOYEE',
        name: 'EMPLOYEE',
        displayName: 'Employee',
        description: 'Regular employee with basic system access',
        permissions: [],
        isActive: true,
      },
    ];
  }

  // Departments not supported by backend

  // Get available managers
  async getManagers(): Promise<UserSummary[]> {
    const response = await apiClient.get<UserSummary[]>('/users/project-managers');
    return this.unwrapResponse<UserSummary[]>(response);
  }


}

// Export singleton instance
export const userService = new UserService();
export default userService;