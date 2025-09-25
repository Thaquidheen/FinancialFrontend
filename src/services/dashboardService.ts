import apiClient from './api';
import {
  DashboardResponse,
  FinancialDashboardResponse,
  ApprovalDashboardResponse,
  PaymentDashboardResponse,
  DashboardFilters,
} from '../types/dashboard';

export class DashboardService {
  /**
   * Get Super Admin / Account Manager Financial Dashboard
   */
  async getFinancialDashboard(filters?: DashboardFilters): Promise<FinancialDashboardResponse> {
    const params = new URLSearchParams();
    
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.groupBy) params.append('groupBy', filters.groupBy);

    const response = await apiClient.get<FinancialDashboardResponse>(
      `/financial/reports/dashboard?${params.toString()}`
    );

    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to fetch financial dashboard');
  }

  /**
   * Get Project Manager Dashboard
   */
  async getProjectManagerDashboard(filters?: DashboardFilters): Promise<FinancialDashboardResponse> {
    const params = new URLSearchParams();
    
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const response = await apiClient.get<FinancialDashboardResponse>(
      `/financial/reports/dashboard/project-manager?${params.toString()}`
    );

    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to fetch project manager dashboard');
  }

  /**
   * Get General Dashboard (for all user types)
   */
  async getDashboard(): Promise<DashboardResponse> {
    const response = await apiClient.get<DashboardResponse>('/dashboard');

    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to fetch dashboard');
  }

  /**
   * Get Approval Dashboard (Account Manager)
   */
  async getApprovalDashboard(): Promise<ApprovalDashboardResponse> {
    const response = await apiClient.get<ApprovalDashboardResponse>('/api/approvals/dashboard');

    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to fetch approval dashboard');
  }

  /**
   * Get Payment Dashboard (Account Manager)
   */
  async getPaymentDashboard(): Promise<PaymentDashboardResponse> {
    const response = await apiClient.get<PaymentDashboardResponse>('/api/payments/dashboard');

    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to fetch payment dashboard');
  }

  /**
   * Get Budget Utilization Report
   */
  async getBudgetUtilization(filters?: DashboardFilters): Promise<any> {
    const params = new URLSearchParams();
    
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.groupBy) params.append('groupBy', filters.groupBy);

    const response = await apiClient.get<any>(
      `/financial/reports/budget-utilization?${params.toString()}`
    );

    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to fetch budget utilization');
  }

  /**
   * Get Spending Trends
   */
  async getSpendingTrends(filters?: DashboardFilters): Promise<any> {
    const params = new URLSearchParams();
    
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const response = await apiClient.get<any>(
      `/financial/reports/spending-trends?${params.toString()}`
    );

    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to fetch spending trends');
  }

  /**
   * Generate Financial Report
   */
  async generateFinancialReport(request: {
    reportType: string;
    startDate: string;
    endDate: string;
    projectIds?: string[];
    includeDetails?: boolean;
  }): Promise<any> {
    const response = await apiClient.post<any>('/financial/reports/generate', request);

    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to generate financial report');
  }

  /**
   * Get Dashboard Analytics for Charts
   */
  async getDashboardAnalytics(filters?: DashboardFilters): Promise<{
    budgetUtilization: any[];
    spendingTrends: any[];
    categorySpending: any[];
    projectPerformance: any[];
  }> {
    try {
      // Make parallel requests for better performance
      const [budgetUtilization, spendingTrends] = await Promise.allSettled([
        this.getBudgetUtilization(filters),
        this.getSpendingTrends(filters),
      ]);

      return {
        budgetUtilization: budgetUtilization.status === 'fulfilled' ? budgetUtilization.value : [],
        spendingTrends: spendingTrends.status === 'fulfilled' ? spendingTrends.value : [],
        categorySpending: [], // Will be populated from main dashboard
        projectPerformance: [], // Will be populated from main dashboard
      };
    } catch (error) {
      console.warn('Failed to fetch some dashboard analytics:', error);
      return {
        budgetUtilization: [],
        spendingTrends: [],
        categorySpending: [],
        projectPerformance: [],
      };
    }
  }

  /**
   * Get Combined Dashboard Data for Account Manager
   */
  async getAccountManagerDashboard(filters?: DashboardFilters): Promise<{
    financial: FinancialDashboardResponse;
    approvals: ApprovalDashboardResponse;
    payments: PaymentDashboardResponse;
  }> {
    try {
      const [financial, approvals, payments] = await Promise.allSettled([
        this.getFinancialDashboard(filters),
        this.getApprovalDashboard(),
        this.getPaymentDashboard(),
      ]);

      return {
        financial: financial.status === 'fulfilled' ? financial.value : this.getEmptyFinancialDashboard(),
        approvals: approvals.status === 'fulfilled' ? approvals.value : this.getEmptyApprovalDashboard(),
        payments: payments.status === 'fulfilled' ? payments.value : this.getEmptyPaymentDashboard(),
      };
    } catch (error) {
      console.error('Failed to fetch account manager dashboard:', error);
      throw error;
    }
  }

  // Helper methods for empty states
  private getEmptyFinancialDashboard(): FinancialDashboardResponse {
    return {
      totalBudgetAllocated: 0,
      totalSpent: 0,
      totalRemaining: 0,
      overallUtilizationPercentage: 0,
      recentTransactions: [],
      budgetAlerts: [],
      spendingTrends: [],
      categorySpending: [],
      reportGeneratedAt: new Date().toISOString(),
    };
  }

  private getEmptyApprovalDashboard(): ApprovalDashboardResponse {
    return {
      pendingApprovalsCount: 0,
      approvedTodayCount: 0,
      rejectedTodayCount: 0,
      averageApprovalTime: 0,
      totalPendingAmount: 0,
      recentApprovals: [],
      approvalsByStatus: [],
      weeklyApprovalTrends: [],
    };
  }

  private getEmptyPaymentDashboard(): PaymentDashboardResponse {
    return {
      readyForPaymentCount: 0,
      readyForPaymentAmount: 0,
      processedTodayCount: 0,
      processedTodayAmount: 0,
      failedPaymentsCount: 0,
      failedPaymentsAmount: 0,
      monthlyPaymentTotal: 0,
      recentPayments: [],
      paymentsByBank: [],
      monthlyPaymentTrends: [],
    };
  }
}

// Export singleton instance
const dashboardService = new DashboardService();
export default dashboardService;