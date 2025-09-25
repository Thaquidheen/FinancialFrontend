import axios, { AxiosResponse } from 'axios';
import {
  UserResponse,
  UserSummary,
  UserListResponse,
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
  Department,
} from '../types/user';

// API Base URL - should come from environment variables
const API_BASE_URL = '/api';

class UserService {
  private api = axios.create({
    baseURL: API_BASE_URL,
  });

  constructor() {
    // Add request interceptor for authentication
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Get Users List with Search and Pagination
  async getUsers(params: UserSearchParams = {}): Promise<UserListResponse> {
    const response: AxiosResponse<UserListResponse> = await this.api.get('/users', {
      params: {
        search: params.search,
        department: params.department,
        role: params.role,
        active: params.active,
        accountLocked: params.accountLocked,
        managerId: params.managerId,
        page: params.page || 1,
        pageSize: params.pageSize || 10,
        sortBy: params.sortBy || 'fullName',
        sortDirection: params.sortDirection || 'asc',
      },
    });
    
    return response.data;
  }

  // Get Single User by ID
  async getUser(id: string): Promise<UserResponse> {
    const response: AxiosResponse<UserResponse> = await this.api.get(`/users/${id}`);
    return response.data;
  }

  // Create New User
  async createUser(userData: CreateUserRequest): Promise<UserResponse> {
    const response: AxiosResponse<UserResponse> = await this.api.post('/users', userData);
    return response.data;
  }

  // Update User Information
  async updateUser(id: string, userData: UpdateUserRequest): Promise<UserResponse> {
    const response: AxiosResponse<UserResponse> = await this.api.put(`/users/${id}`, userData);
    return response.data;
  }

  // Update User Roles
  async updateUserRoles(id: string, rolesData: UpdateUserRolesRequest): Promise<UserResponse> {
    const response: AxiosResponse<UserResponse> = await this.api.put(`/users/${id}/roles`, rolesData);
    return response.data;
  }

  // Update User Bank Details
  async updateBankDetails(id: string, bankData: UpdateBankDetailsRequest): Promise<UserResponse> {
    const response: AxiosResponse<UserResponse> = await this.api.put(`/users/${id}/bank-details`, bankData);
    return response.data;
  }

  // Change Password
  async changePassword(passwordData: ChangePasswordRequest): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.api.post('/auth/change-password', passwordData);
    return response.data;
  }

  // Reset Password (Admin only)
  async resetPassword(resetData: ResetPasswordRequest): Promise<{ message: string; temporaryPassword?: string }> {
    const response: AxiosResponse<{ message: string; temporaryPassword?: string }> = 
      await this.api.post(`/users/${resetData.userId}/reset-password`, {
        sendEmail: resetData.sendEmail ?? true,
      });
    return response.data;
  }

  // Activate User
  async activateUser(id: string): Promise<UserResponse> {
    const response: AxiosResponse<UserResponse> = await this.api.put(`/users/${id}/activate`);
    return response.data;
  }

  // Deactivate User
  async deactivateUser(id: string): Promise<UserResponse> {
    const response: AxiosResponse<UserResponse> = await this.api.put(`/users/${id}/deactivate`);
    return response.data;
  }

  // Delete User
  async deleteUser(id: string): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.api.delete(`/users/${id}`);
    return response.data;
  }

  // Get User Statistics
  async getUserStatistics(): Promise<UserStatistics> {
    const response: AxiosResponse<UserStatistics> = await this.api.get('/users/statistics');
    return response.data;
  }

  // Get User Activities
  async getUserActivities(params: ActivitySearchParams): Promise<UserActivityResponse> {
    const response: AxiosResponse<UserActivityResponse> = await this.api.get(`/users/${params.userId}/activities`, {
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
    return response.data;
  }

  // Get Users Without Bank Details
  async getUsersWithoutBankDetails(): Promise<UserResponse[]> {
    const response: AxiosResponse<UserResponse[]> = await this.api.get('/users/without-bank-details');
    return response.data;
  }

  // Bulk Operations
  async bulkUpdateUsers(userIds: string[], operation: 'activate' | 'deactivate'): Promise<{ 
    message: string; 
    successCount: number; 
    failedCount: number; 
  }> {
    const response = await this.api.post('/users/bulk-update', {
      userIds,
      operation,
    });
    return response.data;
  }

  // Export Users Data
  async exportUsers(params: UserSearchParams = {}): Promise<Blob> {
    const response = await this.api.get('/users/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  }

  // Get Available Managers (for assignment)
  async getAvailableManagers(): Promise<UserResponse[]> {
    const response: AxiosResponse<UserResponse[]> = await this.api.get('/users/managers');
    return response.data;
  }

  // Verify Bank Details
  async verifyBankDetails(userId: string): Promise<{ message: string; verified: boolean }> {
    const response = await this.api.post(`/users/${userId}/bank-details/verify`);
    return response.data;
  }

  // Get User Dashboard Data (role-specific)
  async getUserDashboard(userId: string): Promise<{
    user: UserResponse;
    statistics: any;
    recentActivities: UserActivityResponse;
    notifications: any[];
  }> {
    const response = await this.api.get(`/users/${userId}/dashboard`);
    return response.data;
  }

  // Search Users by Name or Employee ID (for autocomplete)
  async searchUsers(query: string, limit: number = 10): Promise<UserResponse[]> {
    const response: AxiosResponse<UserResponse[]> = await this.api.get('/users/search', {
      params: { q: query, limit },
    });
    return response.data;
  }

  // Get User's Direct Reports
  async getUserDirectReports(managerId: string): Promise<UserResponse[]> {
    const response: AxiosResponse<UserResponse[]> = await this.api.get(`/users/${managerId}/direct-reports`);
    return response.data;
  }

  // Get Department Users
  async getDepartmentUsers(department: string): Promise<UserResponse[]> {
    const response: AxiosResponse<UserResponse[]> = await this.api.get(`/users/department/${department}`);
    return response.data;
  }

  // Lock User Account (Admin only)
  async lockUserAccount(id: string): Promise<UserResponse> {
    const response: AxiosResponse<UserResponse> = await this.api.put(`/users/${id}/lock`);
    return response.data;
  }

  // Unlock User Account (Admin only)
  async unlockUserAccount(id: string): Promise<UserResponse> {
    const response: AxiosResponse<UserResponse> = await this.api.put(`/users/${id}/unlock`);
    return response.data;
  }

  // Force Password Reset on Next Login
  async forcePasswordReset(id: string): Promise<UserResponse> {
    const response: AxiosResponse<UserResponse> = await this.api.put(`/users/${id}/force-password-reset`);
    return response.data;
  }

  // Get Users by Role
  async getUsersByRole(role: string): Promise<UserResponse[]> {
    const response: AxiosResponse<UserResponse[]> = await this.api.get(`/users/by-role/${role}`);
    return response.data;
  }

  // Update User Profile Picture
  async updateProfilePicture(id: string, file: File): Promise<UserResponse> {
    const formData = new FormData();
    formData.append('profilePicture', file);
    
    const response: AxiosResponse<UserResponse> = await this.api.post(`/users/${id}/profile-picture`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Get User Permissions
  async getUserPermissions(id: string): Promise<string[]> {
    const response: AxiosResponse<{ permissions: string[] }> = await this.api.get(`/users/${id}/permissions`);
    return response.data.permissions;
  }

  // Update User Status (for batch operations)
  async updateUserStatus(id: string, status: { 
    active?: boolean; 
    accountLocked?: boolean; 
    passwordExpired?: boolean;
  }): Promise<UserResponse> {
    const response: AxiosResponse<UserResponse> = await this.api.patch(`/users/${id}/status`, status);
    return response.data;
  }

  // Get Recently Active Users
  async getRecentlyActiveUsers(limit: number = 10): Promise<UserResponse[]> {
    const response: AxiosResponse<UserResponse[]> = await this.api.get('/users/recently-active', {
      params: { limit },
    });
    return response.data;
  }

  // Send Welcome Email to New User
  async sendWelcomeEmail(id: string): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.api.post(`/users/${id}/send-welcome-email`);
    return response.data;
  }

  // Check Username Availability
  async checkUsernameAvailability(username: string, excludeUserId?: string): Promise<{ available: boolean }> {
    const response: AxiosResponse<{ available: boolean }> = await this.api.get('/users/check-username', {
      params: { username, excludeUserId },
    });
    return response.data;
  }

  // Check Email Availability
  async checkEmailAvailability(email: string, excludeUserId?: string): Promise<{ available: boolean }> {
    const response: AxiosResponse<{ available: boolean }> = await this.api.get('/users/check-email', {
      params: { email, excludeUserId },
    });
    return response.data;
  }

  // Validate Employee ID
  async validateEmployeeId(employeeId: string, excludeUserId?: string): Promise<{ valid: boolean }> {
    const response: AxiosResponse<{ valid: boolean }> = await this.api.get('/users/validate-employee-id', {
      params: { employeeId, excludeUserId },
    });
    return response.data;
  }

  // Get available roles
  async getRoles(): Promise<Role[]> {
    const response: AxiosResponse<Role[]> = await this.api.get('/users/roles');
    return response.data;
  }

  // Get available departments
  async getDepartments(): Promise<Department[]> {
    const response: AxiosResponse<Department[]> = await this.api.get('/users/departments');
    return response.data;
  }

  // Get available managers
  async getManagers(): Promise<UserSummary[]> {
    const response: AxiosResponse<UserSummary[]> = await this.api.get('/users/managers');
    return response.data;
  }


}

// Export singleton instance
export const userService = new UserService();
export default userService;