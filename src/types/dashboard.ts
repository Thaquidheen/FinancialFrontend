export interface DashboardStats {
    totalUsers?: number;
    activeProjects?: number;
    totalProjectsCount?: number;
    myProjectsCount?: number;
    pendingApprovals?: number;
    pendingApprovalsCount?: number;
    totalBudgetAllocated?: number;
    totalSpent?: number;
    totalRemaining?: number;
    monthlyBudget?: number;
    budgetUtilizationPercentage?: number;
    overallUtilizationPercentage?: number;
    myBudgetUtilization?: number;
    teamMembers?: number;
    myTeamSize?: number;
    systemHealthScore?: number;
    readyForPayment?: number;
    processedToday?: number;
    monthlyTotal?: number;
    myRequests?: number;
    approved?: number;
    pending?: number;
    thisMonthTotal?: number;
  }
  
  export interface FinancialDashboardResponse {
    totalBudgetAllocated: number;
    totalSpent: number;
    totalRemaining: number;
    overallUtilizationPercentage: number;
    recentTransactions: RecentTransaction[];
    budgetAlerts: BudgetAlert[];
    spendingTrends: SpendingTrend[];
    categorySpending: CategorySpending[];
    reportGeneratedAt: string;
  }
  
  export interface DashboardResponse {
    totalUsersCount?: number;
    activeProjectsCount?: number;
    totalProjectsCount?: number;
    myProjectsCount?: number;
    pendingApprovalsCount?: number;
    totalBudgetAllocated?: number;
    totalSpentAmount?: number;
    budgetUtilizationPercentage?: number;
    myBudgetUtilization?: number;
    myTeamSize?: number;
    systemHealthScore?: number;
    recentActivities?: RecentActivity[];
    upcomingDeadlines?: UpcomingDeadline[];
    reportGeneratedAt?: string;
  }
  
  export interface RecentTransaction {
    id: string;
    quotationNumber: string;
    amount: number;
    description: string;
    projectName: string;
    requestedBy: string;
    status: string;
    transactionDate: string;
  }
  
  export interface RecentActivity {
    id: number;
    type: ActivityType;
    message: string;
    timestamp: string;
    userId?: string;
    userName?: string;
    entityType?: string;
    entityId?: string;
    metadata?: Record<string, any>;
  }
  
  export enum ActivityType {
    USER_CREATED = 'USER_CREATED',
    USER_UPDATED = 'USER_UPDATED',
    PROJECT_CREATED = 'PROJECT_CREATED',
    PROJECT_UPDATED = 'PROJECT_UPDATED',
    PROJECT_COMPLETED = 'PROJECT_COMPLETED',
    QUOTATION_CREATED = 'QUOTATION_CREATED',
    QUOTATION_SUBMITTED = 'QUOTATION_SUBMITTED',
    QUOTATION_APPROVED = 'QUOTATION_APPROVED',
    QUOTATION_REJECTED = 'QUOTATION_REJECTED',
    PAYMENT_PROCESSED = 'PAYMENT_PROCESSED',
    PAYMENT_COMPLETED = 'PAYMENT_COMPLETED',
    APPROVAL_PENDING = 'APPROVAL_PENDING',
    APPROVAL_COMPLETED = 'APPROVAL_COMPLETED',
    DOCUMENT_UPLOADED = 'DOCUMENT_UPLOADED',
    BUDGET_ALERT = 'BUDGET_ALERT',
    SYSTEM_MAINTENANCE = 'SYSTEM_MAINTENANCE'
  }
  
  export interface BudgetAlert {
    id: string;
    projectId: string;
    projectName: string;
    alertType: BudgetAlertType;
    threshold: number;
    currentUtilization: number;
    message: string;
    severity: AlertSeverity;
    createdAt: string;
  }
  
  export enum BudgetAlertType {
    APPROACHING_LIMIT = 'APPROACHING_LIMIT',
    EXCEEDED_BUDGET = 'EXCEEDED_BUDGET',
    LOW_BUDGET = 'LOW_BUDGET',
    UNUSUAL_SPENDING = 'UNUSUAL_SPENDING'
  }
  
  export enum AlertSeverity {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    CRITICAL = 'CRITICAL'
  }
  
  export interface SpendingTrend {
    period: string;
    budgetAllocated: number;
    actualSpending: number;
    projectedSpending?: number;
    variance: number;
    variancePercentage: number;
  }
  
  export interface CategorySpending {
    category: string;
    amount: number;
    percentage: number;
    change: number;
    changePercentage: number;
  }
  
  export interface UpcomingDeadline {
    id: string;
    title: string;
    description: string;
    dueDate: string;
    priority: DeadlinePriority;
    entityType: string;
    entityId: string;
    assignedTo?: string;
  }
  
  export enum DeadlinePriority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    URGENT = 'URGENT'
  }
  
  export interface ChartDataPoint {
    name: string;
    value: number;
    change?: number;
    color?: string;
    metadata?: Record<string, any>;
  }
  
  export interface TimeSeriesDataPoint {
    date: string;
    value: number;
    budget?: number;
    actual?: number;
    projected?: number;
    label?: string;
  }
  
  // Dashboard request parameters
  export interface DashboardFilters {
    startDate?: string;
    endDate?: string;
    projectIds?: string[];
    userId?: string;
    groupBy?: 'day' | 'week' | 'month' | 'quarter' | 'year';
    includeProjections?: boolean;
  }
  
  // Approval dashboard specific types
  export interface ApprovalDashboardResponse {
    pendingApprovalsCount: number;
    approvedTodayCount: number;
    rejectedTodayCount: number;
    averageApprovalTime: number;
    totalPendingAmount: number;
    recentApprovals: RecentApproval[];
    approvalsByStatus: ApprovalStatusCount[];
    weeklyApprovalTrends: WeeklyApprovalTrend[];
  }
  
  export interface RecentApproval {
    id: string;
    quotationNumber: string;
    amount: number;
    requestedBy: string;
    projectName: string;
    status: string;
    submittedAt: string;
    approvedAt?: string;
    daysWaiting: number;
  }
  
  export interface ApprovalStatusCount {
    status: string;
    count: number;
    totalAmount: number;
  }
  
  export interface WeeklyApprovalTrend {
    week: string;
    approved: number;
    rejected: number;
    pending: number;
  }
  
  // Payment dashboard specific types
  export interface PaymentDashboardResponse {
    readyForPaymentCount: number;
    readyForPaymentAmount: number;
    processedTodayCount: number;
    processedTodayAmount: number;
    failedPaymentsCount: number;
    failedPaymentsAmount: number;
    monthlyPaymentTotal: number;
    recentPayments: RecentPayment[];
    paymentsByBank: PaymentByBank[];
    monthlyPaymentTrends: MonthlyPaymentTrend[];
  }
  
  export interface RecentPayment {
    id: string;
    quotationNumber: string;
    amount: number;
    bankName: string;
    accountNumber: string;
    beneficiaryName: string;
    status: string;
    processedAt?: string;
    reference?: string;
  }
  
  export interface PaymentByBank {
    bankName: string;
    count: number;
    totalAmount: number;
    averageAmount: number;
  }
  
  export interface MonthlyPaymentTrend {
    month: string;
    totalAmount: number;
    transactionCount: number;
    averageAmount: number;
  }