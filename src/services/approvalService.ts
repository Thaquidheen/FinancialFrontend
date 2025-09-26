// services/approvalService.ts
import apiClient from './api';
import {
  ApprovalItem,
  ApprovalRequest,
  BulkApprovalRequest,
  ApprovalResponse,
  BulkApprovalResponse,
  ApprovalStatistics,
  ApprovalHistory,
  PagedResponse,
  ApprovalFilters,
  SortConfig
} from '../types/approval.types';
import { API_ENDPOINTS } from '../constants/approvals/approvalConstants';

// Backend DTOs matching your Java backend
interface BackendApprovalResponse {
  id: number;
  quotationId: number;
  projectName: string;
  quotationDescription: string;
  totalAmount: number;
  currency: string;
  quotationStatus: string;
  approverName: string;
  approverUsername: string;
  status: string;
  comments?: string;
  approvalDate?: string;
  createdDate: string;
  levelOrder: number;
  createdByName: string;
  createdByUsername: string;
  projectBudget: number;
  remainingBudget: number;
  exceedsBudget: boolean;
}

interface BackendPendingApprovalsResponse {
  quotationId: number;
  projectId: number;
  projectName: string;
  description: string;
  totalAmount: number;
  currency: string;
  createdByName: string;
  createdByUsername: string;
  submittedDate: string;
  createdDate: string;
  itemCount: number;
  daysPending: number;
  isUrgent: boolean;
  exceedsBudget: boolean;
  priority: string;
  projectBudget: number;
  remainingBudget: number;
}

interface BackendApprovalStatistics {
  pendingApprovals: number;
  urgentApprovals: number;
  approvedToday: number;
  rejectedToday: number;
  averageApprovalTime: number;
  workloadDistribution: Array<{
    managerId: number;
    managerName: string;
    pendingCount: number;
    approvedCount: number;
    rejectedCount: number;
    averageTime: number;
  }>;
  approvalTrends: Array<{
    date: string;
    approved: number;
    rejected: number;
    pending: number;
  }>;
  budgetComplianceStats: {
    compliant: number;
    warning: number;
    exceeded: number;
    total: number;
  };
}

class ApprovalService {
  /**
   * Get pending approvals with pagination and filters
   */
  async getPendingApprovals(
    page: number = 0,
    size: number = 20,
    filters?: ApprovalFilters,
    sort?: SortConfig
  ): Promise<PagedResponse<ApprovalItem>> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    // Add filters
    if (filters) {
      if (filters.status && filters.status.length > 0) {
        params.append('status', filters.status.join(','));
      }
      if (filters.urgency && filters.urgency.length > 0) {
        params.append('urgency', filters.urgency.join(','));
      }
      if (filters.projectId) {
        params.append('projectId', filters.projectId);
      }
      if (filters.managerId) {
        params.append('managerId', filters.managerId);
      }
      if (filters.hasDocuments !== undefined) {
        params.append('hasDocuments', filters.hasDocuments.toString());
      }
      if (filters.searchTerm) {
        params.append('search', filters.searchTerm);
      }
      if (filters.amountRange) {
        params.append('minAmount', filters.amountRange.min.toString());
        params.append('maxAmount', filters.amountRange.max.toString());
      }
      if (filters.dateRange) {
        params.append('startDate', filters.dateRange.start.toISOString());
        params.append('endDate', filters.dateRange.end.toISOString());
      }
    }

    // Add sorting
    if (sort) {
      params.append('sort', `${sort.field},${sort.direction}`);
    }

    const response = await apiClient.get<{
      content: BackendPendingApprovalsResponse[];
      totalElements: number;
      totalPages: number;
      number: number;
      size: number;
      first: boolean;
      last: boolean;
    }>(`${API_ENDPOINTS.PENDING}?${params.toString()}`);

    return {
      content: response.data?.content?.map(this.mapPendingApprovalToFrontend) || [],
      totalElements: response.data?.totalElements || 0,
      totalPages: response.data?.totalPages || 0,
      currentPage: response.data?.number || 0,
      size: response.data?.size || 20,
      hasNext: !response.data?.last,
      hasPrevious: !response.data?.first,
    };
  }

  /**
   * Get urgent approvals (>3 days pending)
   */
  async getUrgentApprovals(
    page: number = 0,
    size: number = 20
  ): Promise<PagedResponse<ApprovalItem>> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    const response = await apiClient.get<{
      content: BackendPendingApprovalsResponse[];
      totalElements: number;
      totalPages: number;
      number: number;
      size: number;
      first: boolean;
      last: boolean;
    }>(`${API_ENDPOINTS.URGENT}?${params.toString()}`);

    return {
      content: response.data?.content?.map(this.mapPendingApprovalToFrontend) || [],
      totalElements: response.data?.totalElements || 0,
      totalPages: response.data?.totalPages || 0,
      currentPage: response.data?.number || 0,
      size: response.data?.size || 20,
      hasNext: !response.data?.last,
      hasPrevious: !response.data?.first,
    };
  }

  /**
   * Process single approval decision
   */
  async processApproval(request: ApprovalRequest): Promise<ApprovalResponse> {
    const backendRequest = {
      quotationId: parseInt(request.quotationId),
      action: request.action,
      comments: request.comments,
    };

    const response = await apiClient.post<BackendApprovalResponse>(
      API_ENDPOINTS.PROCESS,
      backendRequest
    );

    return {
      success: true,
      message: 'Approval processed successfully',
      quotationId: request.quotationId,
      newStatus: this.mapBackendStatusToFrontend(response.data?.status || 'PENDING'),
      processedAt: new Date(),
    };
  }

  /**
   * Process bulk approval decisions
   */
  async processBulkApprovals(request: BulkApprovalRequest): Promise<BulkApprovalResponse> {
    const backendRequest = {
      quotationIds: request.quotationIds.map(id => parseInt(id)),
      action: request.action,
      comments: request.comments,
    };

    const response = await apiClient.post<BackendApprovalResponse[]>(
      API_ENDPOINTS.BULK,
      backendRequest
    );

    return {
      success: true,
      message: `${response.data?.length} approvals processed successfully`,
      processedCount: response.data?.length || 0,
      failedCount: 0,
      results: response.data?.map(item => ({
        success: true,
        message: 'Processed successfully',
        quotationId: item.quotationId.toString(),
        newStatus: this.mapBackendStatusToFrontend(item.status),
        processedAt: new Date(),
      })) || [],
    };
  }

  /**
   * Quick approve a quotation
   */
  async quickApprove(quotationId: string, comments?: string): Promise<ApprovalResponse> {
    const params = new URLSearchParams();
    if (comments) {
      params.append('comments', comments);
    }

    const response = await apiClient.post<BackendApprovalResponse>(
      `${API_ENDPOINTS.APPROVE(quotationId)}?${params.toString()}`
    );

    return {
      success: true,
      message: 'Quotation approved successfully',
      quotationId,
      newStatus: this.mapBackendStatusToFrontend(response.data?.status || 'PENDING'),
      processedAt: new Date(),
    };
  }

  /**
   * Quick reject a quotation
   */
  async quickReject(quotationId: string, reason: string): Promise<ApprovalResponse> {
    const params = new URLSearchParams();
    params.append('reason', reason);

    const response = await apiClient.post<BackendApprovalResponse>(
      `${API_ENDPOINTS.REJECT(quotationId)}?${params.toString()}`
    );

    return {
      success: true,
      message: 'Quotation rejected successfully',
      quotationId,
      newStatus: this.mapBackendStatusToFrontend(response.data?.status || 'PENDING'),
      processedAt: new Date(),
    };
  }

  /**
   * Request changes for a quotation
   */
  async requestChanges(quotationId: string, comments: string): Promise<ApprovalResponse> {
    const params = new URLSearchParams();
    params.append('comments', comments);

    const response = await apiClient.post<BackendApprovalResponse>(
      `${API_ENDPOINTS.APPROVALS}/${quotationId}/changes?${params.toString()}`
    );

    return {
      success: true,
      message: 'Changes requested successfully',
      quotationId,
      newStatus: this.mapBackendStatusToFrontend(response.data?.status || 'PENDING'),
      processedAt: new Date(),
    };
  }

  /**
   * Get approval history for a quotation
   */
  async getApprovalHistory(quotationId: string): Promise<ApprovalHistory[]> {
    const response = await apiClient.get<BackendApprovalResponse[]>(
      API_ENDPOINTS.HISTORY(quotationId)
    );

    return response.data?.map(item => ({
      id: item.id.toString(),
      quotationId: quotationId,
      action: this.mapBackendActionToFrontend(item.status),
      performedBy: item.approverUsername,
      performedByName: item.approverName,
      comments: item.comments,
      timestamp: new Date(item.approvalDate || item.createdDate),
      oldStatus: 'PENDING' as const, // Default for history
      newStatus: this.mapBackendStatusToFrontend(item.status),
    })) || [];
  }

  /**
   * Get approval statistics
   */
  async getApprovalStatistics(approverId?: string): Promise<ApprovalStatistics> {
    const params = new URLSearchParams();
    if (approverId) {
      params.append('approverId', approverId);
    }

    const response = await apiClient.get<BackendApprovalStatistics>(
      `${API_ENDPOINTS.STATISTICS}?${params.toString()}`
    );

    return {
      totalPending: response.data?.pendingApprovals || 0,
      totalUrgent: response.data?.urgentApprovals || 0,
      approvedToday: response.data?.approvedToday || 0,
      rejectedToday: response.data?.rejectedToday || 0,
      averageApprovalTime: response.data?.averageApprovalTime || 0,
      workloadDistribution: response.data?.workloadDistribution?.map(item => ({
        managerId: item.managerId.toString(),
        managerName: item.managerName,
        pendingCount: item.pendingCount,
        approvedCount: item.approvedCount,
        rejectedCount: item.rejectedCount,
        averageTime: item.averageTime,
      })) || [],
      approvalTrends: response.data?.approvalTrends || [],
      budgetComplianceStats: response.data?.budgetComplianceStats || { compliant: 0, warning: 0, exceeded: 0, total: 0 },
    };
  }

  /**
   * Get approval dashboard data
   */
  async getApprovalDashboard(): Promise<{
    statistics: ApprovalStatistics;
    urgentApprovalsCount: number;
    totalPendingApprovals: number;
  }> {
    const response = await apiClient.get<{
      statistics: BackendApprovalStatistics;
      urgentApprovalsCount: number;
      totalPendingApprovals: number;
    }>(API_ENDPOINTS.DASHBOARD);

    return {
      statistics: {
        totalPending: response.data?.statistics?.pendingApprovals || 0,
        totalUrgent: response.data?.statistics?.urgentApprovals || 0,
        approvedToday: response.data?.statistics?.approvedToday || 0,
        rejectedToday: response.data?.statistics?.rejectedToday || 0,
        averageApprovalTime: response.data?.statistics?.averageApprovalTime || 0,
        workloadDistribution: response.data?.statistics?.workloadDistribution?.map(item => ({
          managerId: item.managerId.toString(),
          managerName: item.managerName,
          pendingCount: item.pendingCount,
          approvedCount: item.approvedCount,
          rejectedCount: item.rejectedCount,
          averageTime: item.averageTime,
        })) || [],
        approvalTrends: response.data?.statistics?.approvalTrends || [],
        budgetComplianceStats: response.data?.statistics?.budgetComplianceStats || { compliant: 0, warning: 0, exceeded: 0, total: 0 },
      },
      urgentApprovalsCount: response.data?.urgentApprovalsCount || 0,
      totalPendingApprovals: response.data?.totalPendingApprovals || 0,
    };
  }

  // Helper methods to map backend data to frontend types
  private mapPendingApprovalToFrontend(backend: BackendPendingApprovalsResponse): ApprovalItem {
    return {
      id: backend.quotationId.toString(),
      quotationId: backend.quotationId.toString(),
      quotationNumber: `Q-${backend.quotationId.toString().padStart(6, '0')}`,
      projectName: backend.projectName,
      projectId: backend.projectId.toString(),
      projectManagerName: backend.createdByName,
      projectManagerId: '1', // Backend doesn't provide this
      totalAmount: backend.totalAmount,
      currency: backend.currency,
      submissionDate: new Date(backend.submittedDate),
      urgencyLevel: this.mapBackendPriorityToUrgency(backend.priority),
      status: 'PENDING' as const, // All pending approvals are pending
      daysWaiting: backend.daysPending,
      hasDocuments: false, // Backend doesn't provide this info
      budgetCompliance: backend.exceedsBudget ? 'EXCEEDED' : 'COMPLIANT',
      description: backend.description,
      lineItemCount: backend.itemCount,
      lastUpdated: new Date(backend.createdDate),
    };
  }

  private mapBackendStatusToFrontend(status: string): ApprovalItem['status'] {
    const statusMap: Record<string, ApprovalItem['status']> = {
      'PENDING': 'PENDING',
      'UNDER_REVIEW': 'UNDER_REVIEW',
      'APPROVED': 'APPROVED',
      'REJECTED': 'REJECTED',
      'RETURNED': 'RETURNED',
    };
    return statusMap[status] || 'PENDING';
  }

  private mapBackendActionToFrontend(status: string): ApprovalHistory['action'] {
    const actionMap: Record<string, ApprovalHistory['action']> = {
      'APPROVED': 'APPROVE',
      'REJECTED': 'REJECT',
      'UNDER_REVIEW': 'REQUEST_CHANGES',
      'RETURNED': 'RETURN',
    };
    return actionMap[status] || 'APPROVE';
  }

  private mapBackendPriorityToUrgency(priority: string): ApprovalItem['urgencyLevel'] {
    const priorityMap: Record<string, ApprovalItem['urgencyLevel']> = {
      'HIGH': 'HIGH',
      'MEDIUM': 'MEDIUM',
      'LOW': 'LOW',
      'CRITICAL': 'CRITICAL',
    };
    return priorityMap[priority] || 'LOW';
  }
}

// Export singleton instance
const approvalService = new ApprovalService();
export default approvalService;
