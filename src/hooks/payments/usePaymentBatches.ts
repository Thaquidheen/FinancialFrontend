// src/hooks/payments/usePaymentBatches.ts

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();
  
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
    queryFn: () => paymentService.getPaymentBatches({
      ...filters,
      includePayments: false // Always include payments for batch actions
    }),
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: 60000, // Consider data stale after 1 minute
  });

  // Mutation for confirming payments as completed
  const confirmPaymentsMutation = useMutation({
    mutationFn: (request: ConfirmPaymentRequest) => {
      console.log('confirmPaymentsMutation: Calling API with request:', request);
      return paymentService.confirmPaymentsCompleted(request);
    },
    onSuccess: (data) => {
      console.log('confirmPaymentsMutation: Success response:', data);
      showNotification('success', 'Payments confirmed successfully');
      // Invalidate and refetch payment batches to update the UI
      queryClient.invalidateQueries({ queryKey: ['payment-batches'] });
    },
    onError: (error: any) => {
      console.error('confirmPaymentsMutation: Error:', error);
      showNotification('error', `Failed to confirm payments: ${error.message}`);
    }
  });

  // Mutation for downloading bank files
  const downloadBankFileMutation = useMutation({
    mutationFn: ({ batchId, fileName }: { batchId: string; fileName: string }) => 
      paymentService.downloadBankFile(batchId, fileName),
    onSuccess: (blob: Blob, { fileName }) => {
      // Create download link and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showNotification('success', 'Bank file downloaded successfully');
    },
    onError: (error: any) => {
      showNotification('error', `Failed to download file: ${error.message}`);
    }
  });

  // Mutation for marking batch as sent to bank
  const markBatchSentToBankMutation = useMutation({
    mutationFn: (batchId: string) => paymentService.markBatchSentToBank(batchId),
    onSuccess: () => {
      showNotification('success', 'Batch marked as sent to bank');
      queryClient.invalidateQueries({ queryKey: ['payment-batches'] });
    },
    onError: (error: any) => {
      showNotification('error', `Failed to mark batch as sent to bank: ${error.message}`);
    }
  });

  // Mutation for marking batch as processing
  const markBatchProcessingMutation = useMutation({
    mutationFn: (batchId: string) => paymentService.markBatchProcessing(batchId),
    onSuccess: () => {
      showNotification('success', 'Batch marked as processing');
      queryClient.invalidateQueries({ queryKey: ['payment-batches'] });
    },
    onError: (error: any) => {
      showNotification('error', `Failed to mark batch as processing: ${error.message}`);
    }
  });

  // Mutation for marking batch as completed
  const markBatchCompletedMutation = useMutation({
    mutationFn: ({ batchId, notes }: { batchId: string; notes?: string }) => 
      paymentService.markBatchCompleted(batchId, notes),
    onSuccess: () => {
      showNotification('success', 'Batch marked as completed');
      queryClient.invalidateQueries({ queryKey: ['payment-batches'] });
    },
    onError: (error: any) => {
      showNotification('error', `Failed to mark batch as completed: ${error.message}`);
    }
  });

  // Mutation for retrying batch
  const retryBatchMutation = useMutation({
    mutationFn: (batchId: string) => paymentService.retryBatch(batchId),
    onSuccess: () => {
      showNotification('success', 'Batch reset for retry');
      queryClient.invalidateQueries({ queryKey: ['payment-batches'] });
    },
    onError: (error: any) => {
      showNotification('error', `Failed to retry batch: ${error.message}`);
    }
  });

  // Mutation for updating batch status
  const updateBatchStatusMutation = useMutation({
    mutationFn: ({ batchId, status }: { batchId: string; status: string }) => 
      paymentService.updateBatchStatus(batchId, status),
    onSuccess: () => {
      showNotification('success', 'Batch status updated');
      queryClient.invalidateQueries({ queryKey: ['payment-batches'] });
    },
    onError: (error: any) => {
      showNotification('error', `Failed to update batch status: ${error.message}`);
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

  // Confirm batch as completed - uses the correct API that updates quotation status
  const confirmBatchCompleted = useCallback(async (
    batch: PaymentBatch,
    confirmationReference?: string,
    comments?: string
  ) => {
    try {
      console.log('Confirming batch as completed:', batch.id);
      
      // For now, use a simplified approach - let the backend find the payments
      // We'll pass an empty paymentIds array and let the backend handle it
      const request: ConfirmPaymentRequest = {
        paymentIds: [], // Empty array - backend will find payments for this batch
        batchId: batch.id,
        confirmationReference,
        comments
      };
      
      console.log('Sending confirm request:', request);
      confirmPaymentsMutation.mutate(request);
    } catch (error) {
      console.error('Error in confirmBatchCompleted:', error);
      showNotification('error', 'Failed to complete batch: ' + (error as Error).message);
    }
  }, [confirmPaymentsMutation, showNotification]);

  // Mark batch as sent to bank
  const markBatchSentToBank = useCallback(async (batchId: string) => {
    markBatchSentToBankMutation.mutate(batchId);
  }, []);

  // Mark batch as processing
  const markBatchProcessing = useCallback(async (batchId: string) => {
    markBatchProcessingMutation.mutate(batchId);
  }, []);

  // Mark batch as completed (only updates batch status, NOT quotation status)
  // Use confirmBatchCompleted instead for proper quotation status update
  const markBatchCompleted = useCallback(async (batchId: string, notes?: string) => {
    markBatchCompletedMutation.mutate({ batchId, notes });
  }, []);

  // Retry batch
  const retryBatch = useCallback(async (batchId: string) => {
    retryBatchMutation.mutate(batchId);
  }, []);

  // Update batch status
  const updateBatchStatus = useCallback(async (batchId: string, status: string) => {
    updateBatchStatusMutation.mutate({ batchId, status });
  }, []);

  // Confirm individual payments
  const confirmPayments = useCallback(async (
    paymentIds: number[],
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
    markBatchSentToBank,
    markBatchProcessing,
    markBatchCompleted,
    retryBatch,
    updateBatchStatus,
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