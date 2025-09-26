export interface User {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    roles: string[];
    permissions: string[];
    isActive: boolean;
    profile?: UserProfile;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface UserProfile {
    id: string;
    nationalId?: string;
    iqamaId?: string;
    phoneNumber?: string;
    address?: string;
    bankDetails?: BankDetails;
    profileImage?: string;
  }
  
  export interface BankDetails {
    bankName: string;
    accountNumber: string;
    iban: string;
    beneficiaryName: string;
    beneficiaryAddress?: string;
  }
  
  export interface LoginRequest {
    username: string;
    password: string;
  }
  
  export interface LoginResponse {
    token: string;
    refreshToken: string;
    user: User;
    expiresIn: number;
  }
  
export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  checkAuth: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}
  
  export interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRoles?: string[];
    requiredPermissions?: string[];
  }
  
  // Role constants from your backend
  export const USER_ROLES = {
    SUPER_ADMIN: 'SUPER_ADMIN',
    PROJECT_MANAGER: 'PROJECT_MANAGER',
    ACCOUNT_MANAGER: 'ACCOUNT_MANAGER',
    EMPLOYEE: 'EMPLOYEE'
  } as const;
  
  export type UserRole = keyof typeof USER_ROLES;
  
  // Permission constants 
  export const PERMISSIONS = {
    USER_READ: 'USER_READ',
    USER_WRITE: 'USER_WRITE',
    USER_DELETE: 'USER_DELETE',
    PROJECT_READ: 'PROJECT_READ',
    PROJECT_WRITE: 'PROJECT_WRITE',
    PROJECT_DELETE: 'PROJECT_DELETE',
    QUOTATION_READ: 'QUOTATION_READ',
    QUOTATION_WRITE: 'QUOTATION_WRITE',
    QUOTATION_DELETE: 'QUOTATION_DELETE',
    APPROVAL_READ: 'APPROVAL_READ',
    APPROVAL_WRITE: 'APPROVAL_WRITE',
    PAYMENT_READ: 'PAYMENT_READ',
    PAYMENT_WRITE: 'PAYMENT_WRITE',
    PAYMENT_PROCESS: 'PAYMENT_PROCESS',
    REPORT_READ: 'REPORT_READ',
    REPORT_WRITE: 'REPORT_WRITE'
  } as const;
  
  export type Permission = keyof typeof PERMISSIONS;