// src/hooks/payments/usePaymentQueue.ts

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  PaymentSummaryResponse, 
  PaymentSearchParams, 
  PaymentStatus,
  BankFileRequest,
  BankFileResponse 
} from '../../types/payment.types';
import { paymentService } from '../../services/paymentService';
import { saudiBankService } from '../../services/saudiBankService';
import { useNotification } from '../../contexts/NotificationContext';

export interface UsePaymentQueueProps {
  initialFilters?: PaymentSearchParams;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface PaymentQueueState {
  payments: PaymentSummaryResponse[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  isLoading: boolean;
  error: string | null;
  selectedPayments: string[];
  filters: PaymentSearchParams;
}

export const usePaymentQueue = ({
  initialFilters = {},
  autoRefresh = false,
  refreshInterval = 30000
}: UsePaymentQueueProps = {}) => {
  const queryClient = useQueryClient();
  const { showNotification } = useNotification();

  const [state, setState] = useState<PaymentQueueState>({
    payments: [],
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 20,
    isLoading: false,
    error: null,
    selectedPayments: [],
    filters: {
      page: 0,
      size: 20,
      sortBy: 'createdDate',
      sortDirection: 'asc',
      ...initialFilters
    }
  });

  // Query for ready payments
  const {
    data: paymentsData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['payments', 'ready-for-processing', state.filters],
    queryFn: () => paymentService.getPaymentsReadyForProcessing(state.filters),
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: 30000, // Consider data stale after 30 seconds
  });

  // Update state when data changes
  useEffect(() => {
    if (paymentsData) {
      setState(prev => ({
        ...prev,
        payments: paymentsData.content,
        totalElements: paymentsData.totalElements,
        totalPages: paymentsData.totalPages,
        currentPage: paymentsData.number,
        pageSize: paymentsData.size,
        isLoading: false,
        error: null
      }));
    }
  }, [paymentsData]);

  useEffect(() => {
    setState(prev => ({
      ...prev,
      isLoading,
      error: error?.message || null
    }));
  }, [isLoading, error]);

  // Mutations
  const generateBankFileMutation = useMutation({
    mutationFn: (request: BankFileRequest) => paymentService.generateBankFile(request),
    onSuccess: (response: BankFileResponse) => {
      showNotification('success', 'Bank file generated successfully');
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['payment-batches'] });
      
      // Clear selected payments after successful generation
      setState(prev => ({ ...prev, selectedPayments: [] }));
    },
    onError: (error: any) => {
      showNotification('error', `Failed to generate bank file: ${error.message}`);
    }
  });

  // Actions
  const updateFilters = useCallback((newFilters: Partial<PaymentSearchParams>) => {
    setState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        ...newFilters,
        page: newFilters.page !== undefined ? newFilters.page : 0 // Reset to first page when filters change
      }
    }));
  }, []);

  const changePage = useCallback((page: number) => {
    updateFilters({ page });
  }, [updateFilters]);

  const changePageSize = useCallback((size: number) => {
    updateFilters({ size, page: 0 });
  }, [updateFilters]);

  const changeSorting = useCallback((sortBy: string, sortDirection: 'asc' | 'desc') => {
    updateFilters({ sortBy, sortDirection, page: 0 });
  }, [updateFilters]);

  const selectPayment = useCallback((paymentId: string) => {
    setState(prev => ({
      ...prev,
      selectedPayments: prev.selectedPayments.includes(paymentId)
        ? prev.selectedPayments.filter(id => id !== paymentId)
        : [...prev.selectedPayments, paymentId]
    }));
  }, []);

  const selectAllPayments = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedPayments: prev.payments.map(p => p.id)
    }));
  }, []);

  const clearSelection = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedPayments: []
    }));
  }, []);

  const selectPaymentsByBank = useCallback((bankName: string) => {
    setState(prev => ({
      ...prev,
      selectedPayments: prev.payments
        .filter(p => p.bankName === bankName)
        .map(p => p.id)
    }));
  }, []);

  // Generate bank file for selected payments
  const generateBankFile = useCallback(async (bankName: string, comments?: string) => {
    if (state.selectedPayments.length === 0) {
      showNotification('warning', 'Please select payments to process');
      return;
    }

    // Validate selected payments for the bank
    const selectedPaymentData = state.payments.filter(p => 
      state.selectedPayments.includes(p.id)
    );

    // Check if all selected payments belong to the same bank or no bank specified
    const paymentBanks = [...new Set(selectedPaymentData.map(p => p.bankName).filter(Boolean))];
    if (paymentBanks.length > 1) {
      showNotification('error', 'Cannot mix payments from different banks in one file');
      return;
    }

    // If payments don't have bank info, they should all go to the selected bank
    const request: BankFileRequest = {
      paymentIds: state.selectedPayments,
      bankName,
      comments
    };

    generateBankFileMutation.mutate(request);
  }, [state.selectedPayments, state.payments, showNotification, generateBankFileMutation]);

  // Group payments by bank
  const getPaymentsByBank = useCallback(() => {
    const grouped = new Map<string, PaymentSummaryResponse[]>();
    
    state.payments.forEach(payment => {
      const bankName = payment.bankName || 'Unknown Bank';
      if (!grouped.has(bankName)) {
        grouped.set(bankName, []);
      }
      grouped.get(bankName)!.push(payment);
    });

    return grouped;
  }, [state.payments]);

  // Get available banks from current payments
  const getAvailableBanks = useCallback(() => {
    const bankNames = [...new Set(state.payments.map(p => p.bankName).filter(Boolean))];
    return saudiBankService.getAllBanks().filter(bank => 
      bankNames.includes(bank.code) || bankNames.includes(bank.name)
    );
  }, [state.payments]);

  // Calculate selection statistics
  const getSelectionStats = useCallback(() => {
    const selectedData = state.payments.filter(p => state.selectedPayments.includes(p.id));
    return {
      count: selectedData.length,
      totalAmount: selectedData.reduce((sum, payment) => sum + payment.amount, 0),
      byBank: selectedData.reduce((acc, payment) => {
        const bank = payment.bankName || 'Unknown';
        acc[bank] = (acc[bank] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }, [state.payments, state.selectedPayments]);

  // Validate selection for processing
  const validateSelection = useCallback(() => {
    const selectedData = state.payments.filter(p => state.selectedPayments.includes(p.id));
    const errors: string[] = [];
    const warnings: string[] = [];

    if (selectedData.length === 0) {
      errors.push('No payments selected');
      return { isValid: false, errors, warnings };
    }

    // Check for missing bank information
    const paymentsWithoutBank = selectedData.filter(p => !p.bankName);
    if (paymentsWithoutBank.length > 0) {
      warnings.push(`${paymentsWithoutBank.length} payments missing bank information`);
    }

    // Check for mixed currencies (should all be SAR)
    // This would be expanded based on your requirements

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }, [state.payments, state.selectedPayments]);

  return {
    // State
    ...state,
    
    // Actions
    updateFilters,
    changePage,
    changePageSize,
    changeSorting,
    selectPayment,
    selectAllPayments,
    clearSelection,
    selectPaymentsByBank,
    generateBankFile,
    
    // Utilities
    getPaymentsByBank,
    getAvailableBanks,
    getSelectionStats,
    validateSelection,
    
    // Query controls
    refetch,
    
    // Mutation states
    isGeneratingFile: generateBankFileMutation.isPending,
    fileGenerationError: generateBankFileMutation.error?.message,
  };
};