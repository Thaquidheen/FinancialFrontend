import apiClient from './api';
import { LoginRequest, LoginResponse, User } from '@types/auth';
import { AUTH_CONFIG } from '@constants/app';

export class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    
    if (response.success && response.data) {
      // Store tokens and user data
      localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, response.data.token);
      localStorage.setItem(AUTH_CONFIG.REFRESH_TOKEN_KEY, response.data.refreshToken);
      localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(response.data.user));
      
      return response.data;
    }
    
    throw new Error(response.message || 'Login failed');
  }

  async logout(): Promise<void> {
    try {
      // Call backend logout endpoint
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.warn('Backend logout failed:', error);
    } finally {
      // Always clear local storage
      this.clearAuthData();
    }
  }

  async refreshToken(): Promise<string> {
    const refreshToken = localStorage.getItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post<{ token: string; refreshToken: string }>('/auth/refresh', {
      refreshToken,
    });

    if (response.success && response.data) {
      localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, response.data.token);
      localStorage.setItem(AUTH_CONFIG.REFRESH_TOKEN_KEY, response.data.refreshToken);
      return response.data.token;
    }

    throw new Error('Token refresh failed');
  }

  async checkAuth(): Promise<User> {
    const response = await apiClient.get<User>('/auth/check');
    
    if (response.success && response.data) {
      // Update stored user data
      localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(response.data));
      return response.data;
    }
    
    throw new Error('Authentication check failed');
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const response = await apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });

    if (!response.success) {
      throw new Error(response.message || 'Password change failed');
    }
  }

  getCurrentUser(): User | null {
    try {
      const userData = localStorage.getItem(AUTH_CONFIG.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  getCurrentToken(): string | null {
    return localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    const token = this.getCurrentToken();
    const user = this.getCurrentUser();
    return !!(token && user);
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.roles?.includes(role) || false;
  }

  hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();
    return user?.permissions?.includes(permission) || false;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    if (!user?.roles) return false;
    return roles.some(role => user.roles.includes(role));
  }

  hasAnyPermission(permissions: string[]): boolean {
    const user = this.getCurrentUser();
    if (!user?.permissions) return false;
    return permissions.some(permission => user.permissions.includes(permission));
  }

  clearAuthData(): void {
    localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
    localStorage.removeItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
    localStorage.removeItem(AUTH_CONFIG.USER_KEY);
  }

  // Token expiration check
  isTokenExpiring(): boolean {
    const token = this.getCurrentToken();
    if (!token) return true;

    try {
      // Decode JWT token (simple base64 decode for payload)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      const expirationTime = payload.exp;
      
      // Check if token expires within the buffer time
      return (expirationTime - currentTime) < (AUTH_CONFIG.TOKEN_EXPIRY_BUFFER / 1000);
    } catch {
      return true; // If we can't decode, consider it expiring
    }
  }
}

// Export singleton instance
const authService = new AuthService();
export default authService;