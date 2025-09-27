// src/hooks/payments/usePaymentBatches.ts

import { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  PaymentBatch, 
  ConfirmPaymentRequest,
  PaymentBatchStatus 
} from '../../types/payment.types';
import { paymentService } from '../../services/paymentService';
// import { useNotification } from '../../contexts/NotificationContext';

export interface UsePaymentBatchesProps {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface PaymentBatchFilters {
  status?: PaymentBatchStatus[];
  bankName?: string[];
  dateRange?: {
    startDate?: string;
    endDate?: string;
  };
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
}

export const usePaymentBatches = ({
  autoRefresh = false,
  refreshInterval = 60000 // 1 minute
}: UsePaymentBatchesProps = {}) => {
  // Temporary notification function until NotificationContext is fixed
  const showNotification = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    console.log(`[${type.toUpperCase()}] ${message}`);
  };

  const [filters, setFilters] = useState<PaymentBatchFilters>({
    page: 0,
    size: 20,
    sortBy: 'createdDate',
    sortDir: 'desc'
  });

  // Query for payment batches
  const {
    data: batchesData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['payment-batches', filters],
    queryFn: () => paymentService.getPaymentBatches(filters),
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: 60000, // Consider data stale after 1 minute
  });

  // Mutation for confirming payments as completed
  const confirmPaymentsMutation = useMutation({
    mutationFn: (request: ConfirmPaymentRequest) => 
      paymentService.confirmPaymentsCompleted(request),
    onSuccess: () => {
      showNotification('success', 'Payments confirmed successfully');
    },
    onError: (error: any) => {
      showNotification('error', `Failed to confirm payments: ${error.message}`);
    }
  });

  // Mutation for downloading bank files
  const downloadBankFileMutation = useMutation({
    mutationFn: ({ batchId, fileName }: { batchId: string; fileName: string }) => 
      paymentService.downloadBankFile(batchId, fileName),
    onSuccess: () => {
      showNotification('success', 'Bank file downloaded successfully');
    },
    onError: (error: any) => {
      showNotification('error', `Failed to download file: ${error.message}`);
    }
  });

  // Actions
  const updateFilters = useCallback((newFilters: Partial<PaymentBatchFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: newFilters.page !== undefined ? newFilters.page : 0
    }));
  }, []);

  const changePage = useCallback((page: number) => {
    updateFilters({ page });
  }, [updateFilters]);

  const changePageSize = useCallback((size: number) => {
    updateFilters({ size, page: 0 });
  }, [updateFilters]);

  const changeSorting = useCallback((sortBy: string, sortDir: 'asc' | 'desc') => {
    updateFilters({ sortBy, sortDir, page: 0 });
  }, [updateFilters]);

  // Confirm batch as completed
  const confirmBatchCompleted = useCallback(async (
    batch: PaymentBatch,
    confirmationReference?: string,
    comments?: string
  ) => {
    const request: ConfirmPaymentRequest = {
      paymentIds: batch.payments.map(p => p.id),
      batchId: batch.id,
      confirmationReference,
      comments
    };

    confirmPaymentsMutation.mutate(request);
  }, [confirmPaymentsMutation]);

  // Confirm individual payments
  const confirmPayments = useCallback(async (
    paymentIds: string[],
    batchId?: string,
    confirmationReference?: string,
    comments?: string
  ) => {
    const request: ConfirmPaymentRequest = {
      paymentIds,
      batchId,
      confirmationReference,
      comments
    };

    confirmPaymentsMutation.mutate(request);
  }, [confirmPaymentsMutation]);

  // Download bank file
  const downloadBankFile = useCallback(async (batch: PaymentBatch) => {
    if (!batch.fileName) {
      showNotification('error', 'No file available for download');
      return;
    }

    downloadBankFileMutation.mutate({
      batchId: batch.id,
      fileName: batch.fileName
    });
  }, [downloadBankFileMutation, showNotification]);

  // Get batch statistics
  const getBatchStatistics = useCallback(() => {
    const batches = batchesData?.content || [];
    
    const stats = {
      totalBatches: batches.length,
      byStatus: batches.reduce((acc, batch) => {
        acc[batch.status] = (acc[batch.status] || 0) + 1;
        return acc;
      }, {} as Record<PaymentBatchStatus, number>),
      byBank: batches.reduce((acc, batch) => {
        acc[batch.bankName] = (acc[batch.bankName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      totalPayments: batches.reduce((sum, batch) => sum + batch.paymentCount, 0),
      totalAmount: batches.reduce((sum, batch) => sum + batch.totalAmount, 0),
      pendingBatches: batches.filter(b => 
        b.status === PaymentBatchStatus.CREATED || 
        b.status === PaymentBatchStatus.FILE_GENERATED
      ).length,
      processingBatches: batches.filter(b => 
        b.status === PaymentBatchStatus.SENT_TO_BANK || 
        b.status === PaymentBatchStatus.PROCESSING
      ).length,
      completedBatches: batches.filter(b => 
        b.status === PaymentBatchStatus.COMPLETED
      ).length,
      failedBatches: batches.filter(b => 
        b.status === PaymentBatchStatus.FAILED
      ).length
    };

    return stats;
  }, [batchesData]);

  // Get batches that can be downloaded
  const getDownloadableBatches = useCallback(() => {
    const batches = batchesData?.content || [];
    return batches.filter(batch => 
      batch.fileName && 
      (batch.status === PaymentBatchStatus.FILE_GENERATED ||
       batch.status === PaymentBatchStatus.SENT_TO_BANK)
    );
  }, [batchesData]);

  // Get batches that can be confirmed
  const getConfirmableBatches = useCallback(() => {
    const batches = batchesData?.content || [];
    return batches.filter(batch => 
      batch.status === PaymentBatchStatus.SENT_TO_BANK ||
      batch.status === PaymentBatchStatus.PROCESSING
    );
  }, [batchesData]);

  // Filter batches by status
  const filterByStatus = useCallback((status: PaymentBatchStatus) => {
    updateFilters({ status: [status], page: 0 });
  }, [updateFilters]);

  // Filter batches by bank
  const filterByBank = useCallback((bankName: string) => {
    updateFilters({ bankName: [bankName], page: 0 });
  }, [updateFilters]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      page: 0,
      size: 20,
      sortBy: 'createdDate',
      sortDir: 'desc'
    });
  }, []);

  // Get batch by id
  const getBatchById = useCallback((batchId: string): PaymentBatch | undefined => {
    const batches = batchesData?.content || [];
    return batches.find(batch => batch.id === batchId);
  }, [batchesData]);

  // Check if batch can be processed today
  const canProcessBatchToday = useCallback((_batch: PaymentBatch): boolean => {
    // This would integrate with Saudi bank working hours
    return true; // Simplified for now
  }, []);

  return {
    // Data
    batches: batchesData?.content || [],
    totalElements: batchesData?.totalElements || 0,
    totalPages: batchesData?.totalPages || 0,
    currentPage: batchesData?.number || 0,
    pageSize: batchesData?.size || 20,
    
    // Loading states
    isLoading,
    error: error ? (error as any)?.message || 'An error occurred' : null,
    isConfirming: confirmPaymentsMutation.isPending,
    isDownloading: downloadBankFileMutation.isPending,
    
    // Filters
    filters,
    updateFilters,
    changePage,
    changePageSize,
    changeSorting,
    filterByStatus,
    filterByBank,
    clearFilters,
    
    // Actions
    confirmBatchCompleted,
    confirmPayments,
    downloadBankFile,
    refetch,
    
    // Utilities
    getBatchStatistics,
    getDownloadableBatches,
    getConfirmableBatches,
    getBatchById,
    canProcessBatchToday,
    
    // Mutation errors
    confirmationError: confirmPaymentsMutation.error ? (confirmPaymentsMutation.error as any)?.message : null,
    downloadError: downloadBankFileMutation.error ? (downloadBankFileMutation.error as any)?.message : null,
  };
};