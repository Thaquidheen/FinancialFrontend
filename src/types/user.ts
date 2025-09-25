export interface User {
    id: string;
    username: string;
    email: string;
    fullName: string;
    phoneNumber?: string;
    nationalId?: string;
    iqamaId?: string;
    passportNumber?: string;
    department?: string;
    position?: string;
    hireDate?: string;
    isActive: boolean;
    roles: string[];
    permissions: string[];
    manager?: UserSummary;
    bankDetails?: UserBankDetails;
    createdAt: string;
    updatedAt: string;
    lastLoginAt?: string;
    profileImage?: string;
  }
  
  export interface UserSummary {
    id: string;
    username: string;
    fullName: string;
    email: string;
    roles: string[];
    isActive: boolean;
  }
  
  export interface UserBankDetails {
    id?: string;
    bankName: string;
    accountNumber: string;
    iban: string;
    beneficiaryAddress?: string;
  }
  
  export interface CreateUserRequest {
    username: string;
    email: string;
    password: string;
    fullName: string;
    phoneNumber?: string;
    nationalId?: string;
    iqamaId?: string;
    passportNumber?: string;
    department?: string;
    position?: string;
    hireDate?: string;
    managerId?: string;
    roles: string[];
    bankDetails?: Omit<UserBankDetails, 'id'>;
  }
  
  export interface UpdateUserRequest {
    username?: string;
    email?: string;
    fullName?: string;
    phoneNumber?: string;
    nationalId?: string;
    iqamaId?: string;
    passportNumber?: string;
    department?: string;
    position?: string;
    hireDate?: string;
    managerId?: string;
  }
  
  export interface UpdateUserRolesRequest {
    roles: string[];
  }
  
  export interface UpdateBankDetailsRequest {
    bankName: string;
    accountNumber: string;
    iban: string;
    beneficiaryAddress?: string;
  }
  
  export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }
  
  export interface UserSearchParams {
    search?: string;
    roles?: string[];
    departments?: string[];
    isActive?: boolean;
    managerId?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  }
  
  export interface UserFilters {
    roles: string[];
    departments: string[];
    status: 'all' | 'active' | 'inactive';
    managers: string[];
    dateRange?: {
      startDate?: string;
      endDate?: string;
    };
  }
  
  export interface UserStats {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    usersByRole: Record<string, number>;
    usersByDepartment: Record<string, number>;
    recentlyCreated: number;
    recentlyUpdated: number;
  }
  
  export interface Role {
    id: string;
    name: string;
    displayName: string;
    description: string;
    permissions: string[];
    isActive: boolean;
  }
  
  export interface Department {
    id: string;
    name: string;
    description: string;
    managerId?: string;
    manager?: UserSummary;
    employeeCount: number;
  }
  
  // Saudi Banks enum
  export enum SaudiBanks {
    AL_RAJHI = 'Al Rajhi Bank',
    SAMBA = 'Samba Financial Group',
    NCB = 'National Commercial Bank',
    RIYAD = 'Riyad Bank',
    SABB = 'Saudi British Bank',
    ALINMA = 'Alinma Bank',
    ARAB_NATIONAL = 'Arab National Bank',
    BANQUE_SAUDI_FRANSI = 'Banque Saudi Fransi',
    SAUDI_INVESTMENT = 'Saudi Investment Bank',
    BANK_ALBILAD = 'Bank AlBilad',
    BANK_ALJAZIRA = 'Bank AlJazira',
    GULF_INTERNATIONAL = 'Gulf International Bank',
  }
  
  // Validation patterns for Saudi-specific fields
  export const VALIDATION_PATTERNS = {
    SAUDI_NATIONAL_ID: /^[12][0-9]{9}$/,
    IQAMA_ID: /^[12][0-9]{9}$/,
    SAUDI_MOBILE: /^(\+966|966|0)?5[0-9]{8}$/,
    SAUDI_IBAN: /^SA[0-9]{22}$/,
    PASSPORT: /^[A-Z][0-9]{8}$/,
  };
  
  // Form validation messages
  export const VALIDATION_MESSAGES = {
    REQUIRED: 'This field is required',
    EMAIL_INVALID: 'Please enter a valid email address',
    USERNAME_MIN_LENGTH: 'Username must be at least 3 characters',
    USERNAME_MAX_LENGTH: 'Username cannot exceed 50 characters',
    PASSWORD_MIN_LENGTH: 'Password must be at least 8 characters',
    PASSWORD_REQUIREMENTS: 'Password must contain at least one number and one special character',
    PHONE_INVALID: 'Please enter a valid Saudi mobile number',
    NATIONAL_ID_INVALID: 'National ID must be 10 digits starting with 1 or 2',
    IQAMA_ID_INVALID: 'Iqama ID must be 10 digits starting with 1 or 2',
    IBAN_INVALID: 'Please enter a valid Saudi IBAN (SA followed by 22 digits)',
    PASSPORT_INVALID: 'Passport must be 1 letter followed by 8 digits',
    ACCOUNT_NUMBER_INVALID: 'Account number must be numeric and between 10-20 digits',
  };
  
  // User table column definitions
  export interface UserTableColumn {
    id: keyof User | 'actions';
    label: string;
    minWidth?: number;
    align?: 'left' | 'right' | 'center';
    sortable?: boolean;
    filterable?: boolean;
  }
  
  export const USER_TABLE_COLUMNS: UserTableColumn[] = [
    { id: 'fullName', label: 'Full Name', minWidth: 200, sortable: true },
    { id: 'username', label: 'Username', minWidth: 150, sortable: true },
    { id: 'email', label: 'Email', minWidth: 200, sortable: true },
    { id: 'roles', label: 'Roles', minWidth: 150, filterable: true },
    { id: 'department', label: 'Department', minWidth: 150, filterable: true },
    { id: 'isActive', label: 'Status', minWidth: 100, filterable: true },
    { id: 'createdAt', label: 'Created', minWidth: 120, sortable: true },
    { id: 'actions', label: 'Actions', minWidth: 120, align: 'center' },
  ];
  
  // Bulk operations
  export interface BulkUserOperation {
    userIds: string[];
    operation: 'activate' | 'deactivate' | 'delete' | 'updateRoles' | 'export';
    data?: any;
  }
  
  export interface BulkOperationResult {
    successful: string[];
    failed: Array<{
      userId: string;
      error: string;
    }>;
    summary: {
      total: number;
      successful: number;
      failed: number;
    };
  }
  
  // User activity tracking
  export interface UserActivity {
    id: string;
    userId: string;
    action: UserActivityAction;
    description: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    timestamp: string;
  }
  
  export enum UserActivityAction {
    LOGIN = 'LOGIN',
    LOGOUT = 'LOGOUT',
    PASSWORD_CHANGED = 'PASSWORD_CHANGED',
    PROFILE_UPDATED = 'PROFILE_UPDATED',
    ROLES_UPDATED = 'ROLES_UPDATED',
    BANK_DETAILS_UPDATED = 'BANK_DETAILS_UPDATED',
    ACCOUNT_ACTIVATED = 'ACCOUNT_ACTIVATED',
    ACCOUNT_DEACTIVATED = 'ACCOUNT_DEACTIVATED',
    FAILED_LOGIN_ATTEMPT = 'FAILED_LOGIN_ATTEMPT',
  }
  
  // Export formats
  export interface UserExportOptions {
    format: 'csv' | 'excel' | 'pdf';
    fields: (keyof User)[];
    filters?: UserSearchParams;
    includeInactive?: boolean;
    includeBankDetails?: boolean;
  }
  
  // User import
  export interface UserImportData {
    username: string;
    email: string;
    fullName: string;
    phoneNumber?: string;
    nationalId?: string;
    iqamaId?: string;
    department?: string;
    position?: string;
    roles: string;
    bankName?: string;
    accountNumber?: string;
    iban?: string;
  }
  
  export interface UserImportResult {
    imported: number;
    skipped: number;
    errors: Array<{
      row: number;
      errors: string[];
      data: UserImportData;
    }>;
  }