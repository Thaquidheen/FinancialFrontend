// src/services/quotation/quotationService.ts

import apiClient from '../api';
import { 
  Quotation, 
  QuotationSummary, 
  CreateQuotationRequest, 
  UpdateQuotationRequest,
  SubmitQuotationRequest,
  QuotationStatistics
} from '../../types/quotation/quotation';
import { QuotationFilters } from '../../types/quotation/filters';

class QuotationService {
  private baseURL = '/quotations';

  private unwrapResponse<T>(response: any): T {
    if (response && typeof response === 'object' && 'success' in response) {
      return (response.data as T);
    }
    return response as T;
  }

  // Create new quotation
  async createQuotation(data: CreateQuotationRequest): Promise<Quotation> {
    const response = await apiClient.post<Quotation>(this.baseURL, data);
    return this.unwrapResponse<Quotation>(response);
  }

  // Get quotation by ID
  async getQuotation(id: number): Promise<Quotation> {
    const response = await apiClient.get<Quotation>(`${this.baseURL}/${id}`);
    return this.unwrapResponse<Quotation>(response);
  }

  // Update quotation (draft only)
  async updateQuotation(id: number, data: UpdateQuotationRequest): Promise<Quotation> {
    const response = await apiClient.put<Quotation>(`${this.baseURL}/${id}`, data);
    return this.unwrapResponse<Quotation>(response);
  }

  // Delete quotation (draft only)
  async deleteQuotation(id: number): Promise<void> {
    await apiClient.delete(`${this.baseURL}/${id}`);
  }

  // Get user's quotations with pagination and filters
  async getMyQuotations(params: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
    status?: string;
    projectId?: number;
    startDate?: string;
    endDate?: string;
  } = {}): Promise<{
    content: QuotationSummary[];
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
  }> {
    const response = await apiClient.get(`${this.baseURL}/my`, { params });
    return this.unwrapResponse<{
      content: QuotationSummary[];
      totalElements: number;
      totalPages: number;
      first: boolean;
      last: boolean;
    }>(response);
  }

  // Get all quotations (admin/account manager)
  async getAllQuotations(filters: QuotationFilters): Promise<{
    content: QuotationSummary[];
    totalElements: number;
    totalPages: number;
  }> {
    const response = await apiClient.get(this.baseURL, { params: filters });
    return this.unwrapResponse<{
      content: QuotationSummary[];
      totalElements: number;
      totalPages: number;
    }>(response);
  }

  // Get quotations by project
  async getQuotationsByProject(projectId: number, params: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
  } = {}): Promise<QuotationSummary[]> {
    const response = await apiClient.get(`${this.baseURL}/project/${projectId}`, { params });
    const payload = this.unwrapResponse<{
      content: QuotationSummary[];
    }>(response);
    return payload.content;
  }

  // Get pending quotations for approval
  async getPendingQuotations(params: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
  } = {}): Promise<{
    content: QuotationSummary[];
    totalElements: number;
    totalPages: number;
  }> {
    const response = await apiClient.get(`${this.baseURL}/pending`, { params });
    return this.unwrapResponse<{
      content: QuotationSummary[];
      totalElements: number;
      totalPages: number;
    }>(response);
  }

  // Submit quotation for approval
  async submitQuotation(id: number, request?: SubmitQuotationRequest): Promise<Quotation> {
    const response = await apiClient.post<Quotation>(`${this.baseURL}/${id}/submit`, request || {});
    return this.unwrapResponse<Quotation>(response);
  }

  // Approve quotation
  async approveQuotation(id: number, comments?: string): Promise<Quotation> {
    const response = await apiClient.post<Quotation>(
      `${this.baseURL}/${id}/approve`,
      null,
      { params: { comments } }
    );
    return this.unwrapResponse<Quotation>(response);
  }

  // Reject quotation
  async rejectQuotation(id: number, reason: string): Promise<Quotation> {
    const response = await apiClient.post<Quotation>(
      `${this.baseURL}/${id}/reject`,
      null,
      { params: { reason } }
    );
    return this.unwrapResponse<Quotation>(response);
  }

  // Get quotation statistics
  async getQuotationStatistics(projectManagerId?: number): Promise<QuotationStatistics> {
    const response = await apiClient.get<QuotationStatistics>(
      `${this.baseURL}/statistics`,
      { params: { projectManagerId } }
    );
    return this.unwrapResponse<QuotationStatistics>(response);
  }

  // Bulk operations
  async bulkApprove(quotationIds: number[], comments?: string): Promise<void> {
    await apiClient.post('/approvals/bulk', {
      quotationIds,
      action: 'APPROVE',
      comments
    });
  }

  async bulkReject(quotationIds: number[], reason: string): Promise<void> {
    await apiClient.post('/approvals/bulk', {
      quotationIds,
      action: 'REJECT',
      reason
    });
  }

  // Search quotations
  async searchQuotations(query: string, filters?: Partial<QuotationFilters>): Promise<QuotationSummary[]> {
    const response = await apiClient.get(this.baseURL, {
      params: {
        ...filters,
        description: query
      }
    });
    const payload = this.unwrapResponse<{
      content: QuotationSummary[];
    }>(response);
    return payload.content;
  }

  // Export quotations
  async exportQuotations(filters: QuotationFilters, format: 'xlsx' | 'pdf' = 'xlsx'): Promise<Blob> {
    const response = await apiClient.get(`${this.baseURL}/export`, {
      params: { ...filters, format },
      responseType: 'blob'
    });
    return this.unwrapResponse<Blob>(response);
  }

  // Duplicate quotation
  async duplicateQuotation(id: number): Promise<Quotation> {
    const response = await apiClient.post<Quotation>(`${this.baseURL}/${id}/duplicate`);
    return this.unwrapResponse<Quotation>(response);
  }

}

export const quotationService = new QuotationService();