import apiClient from './api';
import { LoginRequest, LoginResponse, User } from '../types/auth';
import { AUTH_CONFIG } from '@constants/app';

export class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    // Support both wrapped ApiResponse and plain backend response
    const response: any = await apiClient.post<any>('/auth/login', credentials);

    // Case 1: Wrapped { success, data }
    if (response && typeof response === 'object' && 'success' in response) {
      if (response.success && response.data) {
        localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, response.data.token);
        if (response.data.refreshToken) {
          localStorage.setItem(AUTH_CONFIG.REFRESH_TOKEN_KEY, response.data.refreshToken);
        }
        localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(response.data.user));
        return response.data as LoginResponse;
      }
      throw new Error(response.message || 'Login failed');
    }

    // Case 2: Plain backend response
    if (response && typeof response === 'object' && 'token' in response) {
      const plain = response as {
        token: string;
        tokenType?: string;
        username?: string;
        fullName?: string;
        email?: string;
        roles?: string[];
        expiresAt?: string;
      };

      // Build user object
      const userIdFromJwt = this.tryGetUserIdFromJwt(plain.token);
      const user: User = {
        id: userIdFromJwt || plain.username || 'user',
        email: plain.email || '',
        username: plain.username || '',
        firstName: (plain.fullName || '').split(' ')[0] || '',
        lastName: (plain.fullName || '').split(' ').slice(1).join(' ') || '',
        roles: plain.roles || [],
        permissions: [],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Compute expiresIn if provided
      let expiresIn = 3600;
      if (plain.expiresAt) {
        const diffMs = new Date(plain.expiresAt).getTime() - Date.now();
        if (!Number.isNaN(diffMs)) {
          expiresIn = Math.max(0, Math.floor(diffMs / 1000));
        }
      }

      const mapped: LoginResponse = {
        token: plain.token,
        refreshToken: '',
        user,
        expiresIn,
      };

      // Store tokens and user data
      localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, mapped.token);
      if (mapped.refreshToken) {
        localStorage.setItem(AUTH_CONFIG.REFRESH_TOKEN_KEY, mapped.refreshToken);
      } else {
        localStorage.removeItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
      }
      localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(mapped.user));

      return mapped;
    }

    throw new Error('Login failed');
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
    try {
      const response = await apiClient.get<User>('/auth/check');
      if ((response as any)?.success && (response as any)?.data) {
        localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify((response as any).data));
        return (response as any).data as User;
      }
      // If backend returns plain user
      if (response && typeof response === 'object' && 'id' in (response as any)) {
        localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(response));
        return response as unknown as User;
      }
      throw new Error('Authentication check failed');
    } catch (err) {
      // If endpoint not available, fall back to stored user
      const stored = this.getCurrentUser();
      if (stored) return stored;
      throw err;
    }
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
      // Decode JWT token (base64url payload)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));
      const currentTime = Date.now() / 1000;
      const expirationTime = payload.exp;
      
      // Check if token expires within the buffer time
      return (expirationTime - currentTime) < (AUTH_CONFIG.TOKEN_EXPIRY_BUFFER / 1000);
    } catch {
      return true; // If we can't decode, consider it expiring
    }
  }

  private tryGetUserIdFromJwt(token: string): string | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));
      return (payload.userId || payload.sub || null) as string | null;
    } catch {
      return null;
    }
  }
}

// Export singleton instance
const authService = new AuthService();
export default authService;