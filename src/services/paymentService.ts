// src/services/paymentService.ts

import apiClient from './api';
import {
  Payment,
  PaymentSummaryResponse,
  PaymentBatch,
  PaymentStatistics,
  PaymentSearchParams,
  BankFileRequest,
  BankFileResponse,
  ConfirmPaymentRequest,
  PaymentStatus,
  PaymentDashboardData
} from '../types/payment.types';

export class PaymentService {
  private readonly basePath = '/payments';

  /**
   * Get payment dashboard data
   */
  async getDashboard(): Promise<PaymentDashboardData> {
    const response = await apiClient.get<any>(`${this.basePath}/dashboard`);
    
    // Transform backend response to match frontend interface
    const data = response.data || {};
    return {
      statistics: data.statistics || data,
      recentPayments: data.recentPayments || [],
      pendingBatches: data.pendingBatches || [],
      alerts: data.alerts || [],
      quickActions: this.generateQuickActions(data.statistics || data)
    };
  }

  /**
   * Get payments ready for processing (payment queue)
   */
  async getPaymentsReadyForProcessing(params?: PaymentSearchParams): Promise<{
    content: PaymentSummaryResponse[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }> {
    const queryParams = {
      page: params?.page || 0,
      size: params?.size || 20,
      sortBy: params?.sortBy || 'createdDate',
      sortDir: params?.sortDirection || 'asc',
      ...this.buildFiltersQuery(params)
    };

    const response = await apiClient.get<any>(
      `${this.basePath}/ready-for-processing`,
      { params: queryParams }
    );

    return response.data ?? {
      content: [],
      totalElements: 0,
      totalPages: 0,
      size: 20,
      number: 0
    };
  }

  /**
   * Generate bank file for selected payments
   */
  async generateBankFile(request: BankFileRequest): Promise<BankFileResponse> {
    const response = await apiClient.post<BankFileResponse>(
      `${this.basePath}/generate-bank-file`,
      request,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data ?? {
      batchId: '',
      fileName: '',
      fileUrl: '',
      paymentCount: 0,
      totalAmount: 0,
      expiresAt: new Date().toISOString()
    };
  }

  /**
   * Download bank file
   */
  async downloadBankFile(batchId: string, _fileName: string): Promise<Blob> {
    const raw = apiClient.getRawClient();
    const response = await raw.get(
      `${this.basePath}/batches/${batchId}/download`,
      {
        responseType: 'blob',
        headers: {
          Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      }
    );
    return response.data as Blob;
  }

  /**
   * Confirm payments as completed
   */
  async confirmPaymentsCompleted(request: ConfirmPaymentRequest): Promise<{
    message: string;
    processedCount: string;
  }> {
    const response = await apiClient.post<any>(
      `${this.basePath}/confirm-completed`,
      request
    );

    return response.data ?? {
      message: 'Payments confirmed successfully',
      processedCount: '0'
    };
  }

  /**
   * Get payments by status
   */
  async getPaymentsByStatus(
    status: PaymentStatus,
    params?: PaymentSearchParams
  ): Promise<{
    content: PaymentSummaryResponse[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }> {
    const queryParams = {
      page: params?.page || 0,
      size: params?.size || 20,
      sortBy: params?.sortBy || 'createdDate',
      sortDir: params?.sortDirection || 'asc'
    };

    const response = await apiClient.get<any>(
      `${this.basePath}/by-status/${status}`,
      { params: queryParams }
    );

    return response.data ?? {
      content: [],
      totalElements: 0,
      totalPages: 0,
      size: 20,
      number: 0
    };
  }

  /**
   * Get payments by bank
   */
  async getPaymentsByBank(
    bankName: string,
    params?: PaymentSearchParams
  ): Promise<{
    content: PaymentSummaryResponse[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }> {
    const queryParams = {
      page: params?.page || 0,
      size: params?.size || 20
    };

    const response = await apiClient.get<any>(
      `${this.basePath}/by-bank/${bankName}`,
      { params: queryParams }
    );

    return response.data;
  }

  /**
   * Get payment batches
   */
  async getPaymentBatches(params?: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  }): Promise<{
    content: PaymentBatch[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }> {
    const queryParams = {
      page: params?.page || 0,
      size: params?.size || 20,
      sortBy: params?.sortBy || 'createdDate',
      sortDir: params?.sortDir || 'desc'
    };

    const response = await apiClient.get<any>(
      `${this.basePath}/batches`,
      { params: queryParams }
    );

    return response.data;
  }

  /**
   * Get payment statistics (alias for getPaymentStatistics)
   */
  async getStatistics(): Promise<PaymentStatistics> {
    return this.getPaymentStatistics();
  }

  /**
   * Get payment statistics
   */
  async getPaymentStatistics(): Promise<PaymentStatistics> {
    const response = await apiClient.get<PaymentStatistics>(
      `${this.basePath}/statistics`
    );

    return response.data ?? {
      pendingPayments: 0,
      processingPayments: 0,
      completedPayments: 0,
      totalPendingAmount: 0,
      totalProcessingAmount: 0,
      totalCompletedAmount: 0,
      paymentsByBank: {},
      paymentsByStatus: {} as any,
      monthlyTrends: []
    };
  }

  /**
   * Update payment status (for manual status updates)
   */
  async updatePaymentStatus(
    paymentId: string,
    status: PaymentStatus,
    comments?: string
  ): Promise<void> {
    await apiClient.put(`${this.basePath}/${paymentId}/status`, {
      status,
      comments
    });
  }

  /**
   * Get payment details
   */
  async getPaymentDetails(paymentId: string): Promise<Payment> {
    const response = await apiClient.get<Payment>(
      `${this.basePath}/${paymentId}`
    );

    return response.data ?? {
      id: '',
      quotationId: '',
      employeeId: '',
      employeeName: '',
      employeeFullName: '',
      amount: 0,
      currency: 'SAR',
      status: 'READY_FOR_PAYMENT' as any,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Search payments with advanced filters
   */
  async searchPayments(params: PaymentSearchParams): Promise<{
    content: PaymentSummaryResponse[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }> {
    const queryParams = {
      page: params.page || 0,
      size: params.size || 20,
      sortBy: params.sortBy || 'createdDate',
      sortDirection: params.sortDirection || 'desc',
      search: params.search,
      ...this.buildFiltersQuery(params)
    };

    const response = await apiClient.get<any>(
      `${this.basePath}/search`,
      { params: queryParams }
    );

    return response.data;
  }

  /**
   * Get payment history/timeline
   */
  async getPaymentHistory(paymentId: string): Promise<any[]> {
    const response = await apiClient.get<any[]>(
      `${this.basePath}/${paymentId}/history`
    );

    return response.data ?? [];
  }

  /**
   * Retry failed payment
   */
  async retryFailedPayment(paymentId: string): Promise<void> {
    await apiClient.post(`${this.basePath}/${paymentId}/retry`);
  }

  /**
   * Cancel payment
   */
  async cancelPayment(paymentId: string, reason?: string): Promise<void> {
    await apiClient.post(`${this.basePath}/${paymentId}/cancel`, {
      reason
    });
  }

  /**
   * Validate payment data before processing
   */
  async validatePayments(paymentIds: string[]): Promise<{
    valid: string[];
    invalid: { paymentId: string; errors: string[] }[];
  }> {
    const response = await apiClient.post<any>(
      `${this.basePath}/validate`,
      { paymentIds }
    );

    return response.data;
  }

  /**
   * Generate payment report
   */
  async generateReport(
    reportType: string,
    filters: any,
    format: string
  ): Promise<Blob> {
    const response = await apiClient.post(
      `${this.basePath}/reports/${reportType}`,
      { filters, format },
      { responseType: 'blob' }
    );
    return response.data;
  }

  /**
   * Export payments
   */
  async exportPayments(
    format: 'excel' | 'csv' | 'pdf',
    filters: PaymentSearchParams
  ): Promise<Blob> {
    const response = await apiClient.post(
      `${this.basePath}/export`,
      { format, filters },
      { responseType: 'blob' }
    );
    return response.data;
  }

  /**
   * Get available Saudi banks for payments
   */
  async getAvailableBanks(): Promise<Array<{
    code: string;
    name: string;
    arabicName: string;
    supportsBulkPayments: boolean;
  }>> {
    const response = await apiClient.get<any>(
      `${this.basePath}/banks`
    );

    return response.data;
  }

  // Private helper methods

  /**
   * Build filters query parameters
   */
  private buildFiltersQuery(params?: PaymentSearchParams): Record<string, any> {
    if (!params) return {};

    const query: Record<string, any> = {};

    if (params.status?.length) {
      query.status = params.status.join(',');
    }

    if (params.bankName?.length) {
      query.bankName = params.bankName.join(',');
    }

    if (params.employeeName) {
      query.employeeName = params.employeeName;
    }

    if (params.projectId?.length) {
      query.projectId = params.projectId.join(',');
    }

    if (params.amountRange?.min !== undefined) {
      query.minAmount = params.amountRange.min;
    }

    if (params.amountRange?.max !== undefined) {
      query.maxAmount = params.amountRange.max;
    }

    if (params.dateRange?.startDate) {
      query.startDate = params.dateRange.startDate;
    }

    if (params.dateRange?.endDate) {
      query.endDate = params.dateRange.endDate;
    }

    if (params.batchId) {
      query.batchId = params.batchId;
    }

    return query;
  }

  /**
   * Generate quick actions based on statistics
   */
  private generateQuickActions(statistics: PaymentStatistics): Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    actionType: 'GENERATE_FILE' | 'VIEW_QUEUE' | 'CHECK_STATUS' | 'VIEW_HISTORY';
    count?: number;
    enabled: boolean;
  }> {
    return [
      {
        id: 'generate-files',
        title: 'Generate Bank Files',
        description: 'Create Excel files for bank processing',
        icon: 'FileSpreadsheet',
        actionType: 'GENERATE_FILE',
        count: statistics.pendingPayments,
        enabled: statistics.pendingPayments > 0
      },
      {
        id: 'view-queue',
        title: 'Payment Queue',
        description: 'Review payments ready for processing',
        icon: 'Queue',
        actionType: 'VIEW_QUEUE',
        count: statistics.pendingPayments,
        enabled: true
      },
      {
        id: 'check-status',
        title: 'Check Status',
        description: 'Monitor payment processing status',
        icon: 'CheckCircle',
        actionType: 'CHECK_STATUS',
        count: statistics.processingPayments,
        enabled: statistics.processingPayments > 0
      },
      {
        id: 'view-history',
        title: 'Payment History',
        description: 'View completed payments and reports',
        icon: 'History',
        actionType: 'VIEW_HISTORY',
        enabled: true
      }
    ];
  }
}

// Export singleton instance
export const paymentService = new PaymentService();
export default paymentService;