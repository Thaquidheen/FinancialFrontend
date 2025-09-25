// API Configuration
export const API_CONFIG = {
    BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api',
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
  } as const;
  
  // Authentication
  export const AUTH_CONFIG = {
    TOKEN_KEY: 'auth_token',
    REFRESH_TOKEN_KEY: 'refresh_token',
    USER_KEY: 'user_data',
    TOKEN_EXPIRY_BUFFER: 5 * 60 * 1000, // 5 minutes before actual expiry
  } as const;
  
  // Pagination defaults
  export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [5, 10, 25, 50, 100],
    MAX_PAGE_SIZE: 100,
  } as const;
  
  // Route paths
  export const ROUTES = {
    // Auth
    LOGIN: '/login',
    LOGOUT: '/logout',
    
    // Dashboard
    DASHBOARD: '/dashboard',
    
    // User Management
    USERS: '/users',
    USER_DETAIL: '/users/:id',
    USER_CREATE: '/users/create',
    USER_EDIT: '/users/:id/edit',
    PROFILE: '/profile',
    
    // Project Management
    PROJECTS: '/projects',
    PROJECT_DETAIL: '/projects/:id',
    PROJECT_CREATE: '/projects/create',
    PROJECT_EDIT: '/projects/:id/edit',
    
    // Quotations
    QUOTATIONS: '/quotations',
    QUOTATION_DETAIL: '/quotations/:id',
    QUOTATION_CREATE: '/quotations/create',
    QUOTATION_EDIT: '/quotations/:id/edit',
    
    // Approvals
    APPROVALS: '/approvals',
    APPROVAL_DETAIL: '/approvals/:id',
    
    // Payments
    PAYMENTS: '/payments',
    PAYMENT_DETAIL: '/payments/:id',
    PAYMENT_PROCESSING: '/payments/processing',
    PAYMENT_BATCHES: '/payments/batches',
    
    // Documents
    DOCUMENTS: '/documents',
    
    // Notifications
    NOTIFICATIONS: '/notifications',
    
    // Reports
    REPORTS: '/reports',
    REPORTS_FINANCIAL: '/reports/financial',
    REPORTS_PROJECT: '/reports/project',
    
    // Settings
    SETTINGS: '/settings',
  } as const;
  
  // Navigation items based on roles
  export const NAVIGATION_ITEMS = {
    SUPER_ADMIN: [
      { path: ROUTES.DASHBOARD, label: 'Dashboard', icon: 'Dashboard' },
      { path: ROUTES.USERS, label: 'Users', icon: 'People' },
      { path: ROUTES.PROJECTS, label: 'Projects', icon: 'Work' },
      { path: ROUTES.QUOTATIONS, label: 'Quotations', icon: 'RequestQuote' },
      { path: ROUTES.APPROVALS, label: 'Approvals', icon: 'Approval' },
      { path: ROUTES.PAYMENTS, label: 'Payments', icon: 'Payment' },
      { path: ROUTES.REPORTS, label: 'Reports', icon: 'Assessment' },
      { path: ROUTES.DOCUMENTS, label: 'Documents', icon: 'Folder' },
      { path: ROUTES.SETTINGS, label: 'Settings', icon: 'Settings' },
    ],
    PROJECT_MANAGER: [
      { path: ROUTES.DASHBOARD, label: 'Dashboard', icon: 'Dashboard' },
      { path: ROUTES.PROJECTS, label: 'My Projects', icon: 'Work' },
      { path: ROUTES.QUOTATIONS, label: 'Quotations', icon: 'RequestQuote' },
      { path: ROUTES.DOCUMENTS, label: 'Documents', icon: 'Folder' },
      { path: ROUTES.REPORTS, label: 'Reports', icon: 'Assessment' },
    ],
    ACCOUNT_MANAGER: [
      { path: ROUTES.DASHBOARD, label: 'Dashboard', icon: 'Dashboard' },
      { path: ROUTES.QUOTATIONS, label: 'Quotations', icon: 'RequestQuote' },
      { path: ROUTES.APPROVALS, label: 'Approvals', icon: 'Approval' },
      { path: ROUTES.PAYMENTS, label: 'Payments', icon: 'Payment' },
      { path: ROUTES.REPORTS, label: 'Financial Reports', icon: 'Assessment' },
    ],
    EMPLOYEE: [
      { path: ROUTES.DASHBOARD, label: 'Dashboard', icon: 'Dashboard' },
      { path: ROUTES.QUOTATIONS, label: 'My Requests', icon: 'RequestQuote' },
      { path: ROUTES.DOCUMENTS, label: 'Documents', icon: 'Folder' },
    ],
  } as const;
  
  // Theme configuration
  export const THEME_CONFIG = {
    DRAWER_WIDTH: 280,
    DRAWER_WIDTH_COLLAPSED: 64,
    HEADER_HEIGHT: 64,
    BREAKPOINTS: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  } as const;
  
  // File upload configuration
  export const FILE_CONFIG = {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
    ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx', '.xls', '.xlsx'],
  } as const;
  
  // Date formats
  export const DATE_FORMATS = {
    DISPLAY: 'MMM dd, yyyy',
    DISPLAY_WITH_TIME: 'MMM dd, yyyy HH:mm',
    INPUT: 'yyyy-MM-dd',
    INPUT_WITH_TIME: "yyyy-MM-dd'T'HH:mm",
    API: "yyyy-MM-dd'T'HH:mm:ss",
  } as const;
  
  // Status colors and configurations
  export const STATUS_CONFIG = {
    PROJECT: {
      PLANNING: { color: 'info', label: 'Planning' },
      ACTIVE: { color: 'success', label: 'Active' },
      COMPLETED: { color: 'default', label: 'Completed' },
      CANCELLED: { color: 'error', label: 'Cancelled' },
      ON_HOLD: { color: 'warning', label: 'On Hold' },
    },
    QUOTATION: {
      DRAFT: { color: 'default', label: 'Draft' },
      PENDING_APPROVAL: { color: 'warning', label: 'Pending Approval' },
      APPROVED: { color: 'success', label: 'Approved' },
      REJECTED: { color: 'error', label: 'Rejected' },
      CANCELLED: { color: 'default', label: 'Cancelled' },
    },
    APPROVAL: {
      PENDING: { color: 'warning', label: 'Pending' },
      APPROVED: { color: 'success', label: 'Approved' },
      REJECTED: { color: 'error', label: 'Rejected' },
    },
    PAYMENT: {
      READY_FOR_PAYMENT: { color: 'info', label: 'Ready for Payment' },
      PROCESSING: { color: 'warning', label: 'Processing' },
      COMPLETED: { color: 'success', label: 'Completed' },
      FAILED: { color: 'error', label: 'Failed' },
    },
    URGENCY: {
      LOW: { color: 'default', label: 'Low' },
      MEDIUM: { color: 'info', label: 'Medium' },
      HIGH: { color: 'warning', label: 'High' },
      URGENT: { color: 'error', label: 'Urgent' },
    },
  } as const;