import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@contexts/AuthContext';
import dashboardService from '@services/dashboardService';
import { DashboardFilters } from '../types/dashboard';
import { USER_ROLES } from '../types/auth';

// Query keys
const QUERY_KEYS = {
  dashboard: ['dashboard'],
  financialDashboard: ['dashboard', 'financial'],
  projectManagerDashboard: ['dashboard', 'project-manager'],
  approvalDashboard: ['dashboard', 'approvals'],
  paymentDashboard: ['dashboard', 'payments'],
  budgetUtilization: ['dashboard', 'budget-utilization'],
  spendingTrends: ['dashboard', 'spending-trends'],
  analytics: ['dashboard', 'analytics'],
  accountManagerDashboard: ['dashboard', 'account-manager'],
} as const;

/**
 * Hook for general dashboard data
 */
export const useDashboard = () => {
  return useQuery({
    queryKey: QUERY_KEYS.dashboard,
    queryFn: () => dashboardService.getDashboard(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

/**
 * Hook for financial dashboard (Super Admin / Account Manager)
 */
export const useFinancialDashboard = (filters?: DashboardFilters) => {
  const { user } = useAuth();
  
  const hasAccess = user?.roles?.some(role => 
    [USER_ROLES.SUPER_ADMIN, USER_ROLES.ACCOUNT_MANAGER].includes(role as any)
  );

  return useQuery({
    queryKey: [...QUERY_KEYS.financialDashboard, filters],
    queryFn: () => dashboardService.getFinancialDashboard(filters),
    enabled: hasAccess,
    staleTime: 3 * 60 * 1000, // 3 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });
};

/**
 * Hook for project manager dashboard
 */
export const useProjectManagerDashboard = (filters?: DashboardFilters) => {
  const { user } = useAuth();
  
  const hasAccess = user?.roles?.includes(USER_ROLES.PROJECT_MANAGER);

  return useQuery({
    queryKey: [...QUERY_KEYS.projectManagerDashboard, filters],
    queryFn: () => dashboardService.getProjectManagerDashboard(filters),
    enabled: hasAccess,
    staleTime: 3 * 60 * 1000, // 3 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });
};

/**
 * Hook for approval dashboard (Account Manager)
 */
export const useApprovalDashboard = () => {
  const { user } = useAuth();
  
  const hasAccess = user?.roles?.some(role => 
    [USER_ROLES.SUPER_ADMIN, USER_ROLES.ACCOUNT_MANAGER].includes(role as any)
  );

  return useQuery({
    queryKey: QUERY_KEYS.approvalDashboard,
    queryFn: () => dashboardService.getApprovalDashboard(),
    enabled: hasAccess,
    staleTime: 1 * 60 * 1000, // 1 minute (approvals are time-sensitive)
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  });
};

/**
 * Hook for payment dashboard (Account Manager)
 */
export const usePaymentDashboard = () => {
  const { user } = useAuth();
  
  const hasAccess = user?.roles?.some(role => 
    [USER_ROLES.SUPER_ADMIN, USER_ROLES.ACCOUNT_MANAGER].includes(role as any)
  );

  return useQuery({
    queryKey: QUERY_KEYS.paymentDashboard,
    queryFn: () => dashboardService.getPaymentDashboard(),
    enabled: hasAccess,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

/**
 * Hook for budget utilization data
 */
export const useBudgetUtilization = (filters?: DashboardFilters) => {
  const { user } = useAuth();
  
  const hasAccess = user?.roles?.some(role => 
    [USER_ROLES.SUPER_ADMIN, USER_ROLES.ACCOUNT_MANAGER, USER_ROLES.PROJECT_MANAGER].includes(role as any)
  );

  return useQuery({
    queryKey: [...QUERY_KEYS.budgetUtilization, filters],
    queryFn: () => dashboardService.getBudgetUtilization(filters),
    enabled: hasAccess,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook for spending trends data
 */
export const useSpendingTrends = (filters?: DashboardFilters) => {
  const { user } = useAuth();
  
  const hasAccess = user?.roles?.some(role => 
    [USER_ROLES.SUPER_ADMIN, USER_ROLES.ACCOUNT_MANAGER, USER_ROLES.PROJECT_MANAGER].includes(role as any)
  );

  return useQuery({
    queryKey: [...QUERY_KEYS.spendingTrends, filters],
    queryFn: () => dashboardService.getSpendingTrends(filters),
    enabled: hasAccess,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook for dashboard analytics (charts data)
 */
export const useDashboardAnalytics = (filters?: DashboardFilters) => {
  const { user } = useAuth();
  
  const hasAccess = user?.roles?.some(role => 
    [USER_ROLES.SUPER_ADMIN, USER_ROLES.ACCOUNT_MANAGER, USER_ROLES.PROJECT_MANAGER].includes(role as any)
  );

  return useQuery({
    queryKey: [...QUERY_KEYS.analytics, filters],
    queryFn: () => dashboardService.getDashboardAnalytics(filters),
    enabled: hasAccess,
    staleTime: 10 * 60 * 1000, // 10 minutes (analytics are less time-sensitive)
  });
};

/**
 * Hook for combined Account Manager dashboard
 */
export const useAccountManagerDashboard = (filters?: DashboardFilters) => {
  const { user } = useAuth();
  
  const hasAccess = user?.roles?.some(role => 
    [USER_ROLES.SUPER_ADMIN, USER_ROLES.ACCOUNT_MANAGER].includes(role as any)
  );

  return useQuery({
    queryKey: [...QUERY_KEYS.accountManagerDashboard, filters],
    queryFn: () => dashboardService.getAccountManagerDashboard(filters),
    enabled: hasAccess,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

/**
 * Hook to manually refresh dashboard data
 */
export const useRefreshDashboard = () => {
  const queryClient = useQueryClient();

  const refreshAll = () => {
    // Invalidate all dashboard queries to force refresh
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const refreshFinancial = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.financialDashboard });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.budgetUtilization });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.spendingTrends });
  };

  const refreshApprovals = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.approvalDashboard });
  };

  const refreshPayments = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.paymentDashboard });
  };

  return {
    refreshAll,
    refreshFinancial,
    refreshApprovals,
    refreshPayments,
  };
};

/**
 * Hook to get appropriate dashboard based on user role
 */
export const useRoleDashboard = (filters?: DashboardFilters) => {
  const { user } = useAuth();
  const primaryRole = user?.roles?.[0];

  const financialDashboard = useFinancialDashboard(filters);
  const projectManagerDashboard = useProjectManagerDashboard(filters);
  const accountManagerDashboard = useAccountManagerDashboard(filters);
  const generalDashboard = useDashboard();

  switch (primaryRole) {
    case USER_ROLES.SUPER_ADMIN:
      return {
        data: financialDashboard.data,
        isLoading: financialDashboard.isLoading,
        error: financialDashboard.error,
        refetch: financialDashboard.refetch,
        type: 'financial' as const,
      };

    case USER_ROLES.ACCOUNT_MANAGER:
      return {
        data: accountManagerDashboard.data,
        isLoading: accountManagerDashboard.isLoading,
        error: accountManagerDashboard.error,
        refetch: accountManagerDashboard.refetch,
        type: 'account-manager' as const,
      };

    case USER_ROLES.PROJECT_MANAGER:
      return {
        data: projectManagerDashboard.data,
        isLoading: projectManagerDashboard.isLoading,
        error: projectManagerDashboard.error,
        refetch: projectManagerDashboard.refetch,
        type: 'project-manager' as const,
      };

    case USER_ROLES.EMPLOYEE:
    default:
      return {
        data: generalDashboard.data,
        isLoading: generalDashboard.isLoading,
        error: generalDashboard.error,
        refetch: generalDashboard.refetch,
        type: 'general' as const,
      };
  }
};