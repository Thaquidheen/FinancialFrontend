// services/api/approvalService.ts
import { AxiosResponse } from 'axios';
import apiClient from '../api';
const axios = apiClient.getRawClient();
import {
  ApprovalItem,
  ApprovalFilters,
  ApprovalRequest,
  BulkApprovalRequest,
  ApprovalResponse,
  BulkApprovalResponse,
  ApprovalHistory,
  ApprovalStatistics,
  QuotationDetails,
  PagedResponse
} from '../../types/approval.types';
import { API_ENDPOINTS } from '../../constants/approvals/approvalConstants';

class ApprovalService {
  private baseURL = '/api';

  // Queue Management Methods
  async getPendingApprovals(
    filters: ApprovalFilters,
    page: number = 0,
    size: number = 20,
    sortBy: string = 'submissionDate',
    sortDir: string = 'desc'
  ): Promise<PagedResponse<ApprovalItem>> {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('size', size.toString());
      params.append('sortBy', sortBy);
      params.append('sortDir', sortDir);

      // Add filter parameters
      if (filters.status?.length) {
        filters.status.forEach(status => params.append('status', status));
      }
      if (filters.urgency?.length) {
        filters.urgency.forEach(urgency => params.append('urgency', urgency));
      }
      if (filters.projectId) {
        params.append('projectId', filters.projectId);
      }
      if (filters.managerId) {
        params.append('managerId', filters.managerId);
      }
      if (filters.searchTerm) {
        params.append('search', filters.searchTerm);
      }
      if (filters.hasDocuments !== undefined) {
        params.append('hasDocuments', filters.hasDocuments.toString());
      }
      if (filters.amountRange) {
        params.append('minAmount', filters.amountRange.min.toString());
        params.append('maxAmount', filters.amountRange.max.toString());
      }
      if (filters.dateRange) {
        params.append('startDate', filters.dateRange.start.toISOString());
        params.append('endDate', filters.dateRange.end.toISOString());
      }
      if (filters.budgetCompliance?.length) {
        filters.budgetCompliance.forEach(compliance => 
          params.append('budgetCompliance', compliance)
        );
      }

      const response: AxiosResponse<PagedResponse<ApprovalItem>> = await axios.get(
        `${this.baseURL}${API_ENDPOINTS.PENDING}?${params.toString()}`
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      throw new Error('Failed to fetch pending approvals');
    }
  }

  async getUrgentApprovals(): Promise<ApprovalItem[]> {
    try {
      const response: AxiosResponse<ApprovalItem[]> = await axios.get(
        `${this.baseURL}${API_ENDPOINTS.URGENT}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching urgent approvals:', error);
      throw new Error('Failed to fetch urgent approvals');
    }
  }

  async getApprovalDashboard(): Promise<ApprovalStatistics> {
    try {
      const response: AxiosResponse<ApprovalStatistics> = await axios.get(
        `${this.baseURL}${API_ENDPOINTS.DASHBOARD}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching approval dashboard:', error);
      throw new Error('Failed to fetch approval dashboard');
    }
  }

  // Single Approval Methods
  async processApproval(request: ApprovalRequest): Promise<ApprovalResponse> {
    try {
      const response: AxiosResponse<ApprovalResponse> = await axios.post(
        `${this.baseURL}${API_ENDPOINTS.PROCESS}`,
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error processing approval:', error);
      throw new Error('Failed to process approval');
    }
  }

  async quickApprove(quotationId: string, comments?: string): Promise<ApprovalResponse> {
    try {
      const params = new URLSearchParams();
      if (comments) {
        params.append('comments', comments);
      }

      const response: AxiosResponse<ApprovalResponse> = await axios.post(
        `${this.baseURL}${API_ENDPOINTS.APPROVE(quotationId)}?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error('Error quick approving quotation:', error);
      throw new Error('Failed to approve quotation');
    }
  }

  async quickReject(
    quotationId: string, 
    reason: string, 
    comments?: string
  ): Promise<ApprovalResponse> {
    try {
      const params = new URLSearchParams();
      params.append('reason', reason);
      if (comments) {
        params.append('comments', comments);
      }

      const response: AxiosResponse<ApprovalResponse> = await axios.post(
        `${this.baseURL}${API_ENDPOINTS.REJECT(quotationId)}?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error('Error quick rejecting quotation:', error);
      throw new Error('Failed to reject quotation');
    }
  }

  // Bulk Operations
  async processBulkApprovals(request: BulkApprovalRequest): Promise<BulkApprovalResponse> {
    try {
      const response: AxiosResponse<BulkApprovalResponse> = await axios.post(
        `${this.baseURL}${API_ENDPOINTS.BULK}`,
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error processing bulk approvals:', error);
      throw new Error('Failed to process bulk approvals');
    }
  }

  // Quotation Details
  async getQuotationDetails(quotationId: string): Promise<QuotationDetails> {
    try {
      const response: AxiosResponse<QuotationDetails> = await axios.get(
        `${this.baseURL}/api/quotations/${quotationId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching quotation details:', error);
      throw new Error('Failed to fetch quotation details');
    }
  }

  // History and Statistics
  async getApprovalHistory(quotationId: string): Promise<ApprovalHistory[]> {
    try {
      const response: AxiosResponse<ApprovalHistory[]> = await axios.get(
        `${this.baseURL}${API_ENDPOINTS.HISTORY(quotationId)}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching approval history:', error);
      throw new Error('Failed to fetch approval history');
    }
  }

  async getApprovalStatistics(
    startDate?: Date,
    endDate?: Date,
    managerId?: string
  ): Promise<ApprovalStatistics> {
    try {
      const params = new URLSearchParams();
      if (startDate) {
        params.append('startDate', startDate.toISOString());
      }
      if (endDate) {
        params.append('endDate', endDate.toISOString());
      }
      if (managerId) {
        params.append('managerId', managerId);
      }

      const response: AxiosResponse<ApprovalStatistics> = await axios.get(
        `${this.baseURL}${API_ENDPOINTS.STATISTICS}?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching approval statistics:', error);
      throw new Error('Failed to fetch approval statistics');
    }
  }

  // Document Management
  async downloadDocument(documentId: string): Promise<Blob> {
    try {
      const response: AxiosResponse<Blob> = await axios.get(
        `${this.baseURL}/documents/${documentId}/download`,
        { responseType: 'blob' }
      );
      return response.data;
    } catch (error) {
      console.error('Error downloading document:', error);
      throw new Error('Failed to download document');
    }
  }

  // Export Functions
  async exportApprovals(
    filters: ApprovalFilters,
    format: 'excel' | 'csv' = 'excel'
  ): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      params.append('format', format);

      // Add filter parameters (same as getPendingApprovals)
      if (filters.status?.length) {
        filters.status.forEach(status => params.append('status', status));
      }
      // ... add other filters as needed

      const response: AxiosResponse<Blob> = await axios.get(
        `${this.baseURL}${API_ENDPOINTS.APPROVALS}/export?${params.toString()}`,
        { responseType: 'blob' }
      );
      return response.data;
    } catch (error) {
      console.error('Error exporting approvals:', error);
      throw new Error('Failed to export approvals');
    }
  }

  // Real-time Updates (if WebSocket is implemented)
  setupWebSocketConnection(onUpdate: (approval: ApprovalItem) => void): WebSocket | null {
    try {
      const wsUrl = import.meta.env.MODE === 'production' 
        ? 'wss://your-domain.com/ws/approvals'
        : 'ws://localhost:8080/ws/approvals';
      
      const socket = new WebSocket(wsUrl);
      
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onUpdate(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      return socket;
    } catch (error) {
      console.error('Error setting up WebSocket connection:', error);
      return null;
    }
  }

  // Utility Methods
  async validateBulkOperation(quotationIds: string[]): Promise<{ valid: string[]; invalid: string[] }> {
    try {
      const response = await axios.post(
        `${this.baseURL}${API_ENDPOINTS.BULK}/validate`,
        { quotationIds }
      );
      return response.data;
    } catch (error) {
      console.error('Error validating bulk operation:', error);
      throw new Error('Failed to validate bulk operation');
    }
  }

  async getApprovalPermissions(userId: string): Promise<{
    canApprove: boolean;
    canBulkApprove: boolean;
    maxApprovalAmount?: number;
  }> {
    try {
      const response = await axios.get(
        `${this.baseURL}/users/${userId}/approval-permissions`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching approval permissions:', error);
      return {
        canApprove: false,
        canBulkApprove: false
      };
    }
  }
}

// Create and export singleton instance
export const approvalService = new ApprovalService();
export default approvalService;