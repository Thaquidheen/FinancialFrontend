import { LoginRequest, LoginResponse, User } from '../types/auth';
import { USER_ROLES } from '../types/auth';

// Mock user data for development
const mockUsers = {
  admin: {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    firstName: 'Super',
    lastName: 'Administrator',
    roles: [USER_ROLES.SUPER_ADMIN],
    permissions: ['*'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  manager: {
    id: '2',
    username: 'manager',
    email: 'manager@example.com',
    firstName: 'Project',
    lastName: 'Manager',
    roles: [USER_ROLES.PROJECT_MANAGER],
    permissions: ['projects:read', 'projects:write'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  accountant: {
    id: '3',
    username: 'accountant',
    email: 'accountant@example.com',
    firstName: 'Account',
    lastName: 'Manager',
    roles: [USER_ROLES.ACCOUNT_MANAGER],
    permissions: ['payments:read', 'payments:write', 'approvals:read'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

export class MockAuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    console.log('MockAuthService: Login attempt for', credentials.username);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = mockUsers[credentials.username as keyof typeof mockUsers];
    
    if (!user || credentials.password !== 'password') {
      throw new Error('Invalid credentials');
    }
    
    const token = `mock-token-${user.id}-${Date.now()}`;
    const refreshToken = `mock-refresh-${user.id}-${Date.now()}`;
    
    console.log('MockAuthService: Login successful for', user.username);
    
    return {
      user,
      token,
      refreshToken,
      expiresIn: 3600, // 1 hour
    };
  }

  async logout(): Promise<void> {
    console.log('MockAuthService: Logout');
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  async refreshToken(): Promise<string> {
    console.log('MockAuthService: Token refresh');
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return `mock-token-refreshed-${Date.now()}`;
  }

  async checkAuth(): Promise<User> {
    console.log('MockAuthService: Check auth');
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const storedUser = this.getCurrentUser();
    if (!storedUser) {
      throw new Error('No user found');
    }
    
    return storedUser;
  }

  async changePassword(_currentPassword: string, _newPassword: string): Promise<void> {
    console.log('MockAuthService: Change password');
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  getCurrentUser(): User | null {
    try {
      const userData = localStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  getCurrentToken(): string | null {
    return localStorage.getItem('auth_token');
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
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
  }

  isTokenExpiring(): boolean {
    // Mock tokens don't expire
    return false;
  }
}

// Export singleton instance
const mockAuthService = new MockAuthService();
export default mockAuthService;
