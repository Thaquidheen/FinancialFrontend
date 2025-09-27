// src/hooks/payments/usePaymentQueue.ts

import { useState, useEffect, useCallback } from 'react';
import { PaymentSummaryResponse, PaymentSearchParams, BankFileRequest } from '../../types/payment.types';
import { paymentService } from '../../services/paymentService';
import { saudiBankService } from '../../services/saudiBankService';

interface UsePaymentQueueOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UsePaymentQueueReturn {
  payments: PaymentSummaryResponse[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  isLoading: boolean;
  error: string | null;
  selectedPayments: number[];
  filters: PaymentSearchParams;
  updateFilters: (newFilters: Partial<PaymentSearchParams>) => void;
  changePage: (page: number) => void;
  changePageSize: (size: number) => void;
  changeSorting: (sortBy: string, sortDirection: 'asc' | 'desc') => void;
  selectPayment: (paymentId: number) => void;
  selectAllPayments: () => void;
  clearSelection: () => void;
  selectPaymentsByBank: (bankName: string) => void;
  generateBankFile: (bankName: string, comments: string) => Promise<void>;
  getPaymentsByBank: () => Map<string, PaymentSummaryResponse[]>;
  getAvailableBanks: () => import('../../services/saudiBankService').SaudiBankDefinition[];
  getSelectionStats: () => {
    count: number;
    totalAmount: number;
    byBank: Record<string, number>;
  };
  validateSelection: () => {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  };
  refetch: () => void;
  isGeneratingFile: boolean;
  fileGenerationError: string | null;
}

export const usePaymentQueue = (options: UsePaymentQueueOptions = {}): UsePaymentQueueReturn => {
  const { autoRefresh = false, refreshInterval = 30000 } = options;

  // State
  const [payments, setPayments] = useState<PaymentSummaryResponse[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPayments, setSelectedPayments] = useState<number[]>([]);
  const [isGeneratingFile, setIsGeneratingFile] = useState(false);
  const [fileGenerationError, setFileGenerationError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<PaymentSearchParams>({
    page: 0,
    size: 20,
    sortBy: 'createdDate',
    sortDirection: 'desc'
  });

  // Fetch payments data
  const fetchPayments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await paymentService.getPaymentsReadyForProcessing({
        ...filters,
        page: currentPage,
        size: pageSize
      });

      console.log('PaymentQueue - API Response:', response);
      console.log('PaymentQueue - Content:', response.content);
      console.log('PaymentQueue - Total Elements:', response.totalElements);

      setPayments(response.content || []);
      setTotalElements(response.totalElements || 0);
      setTotalPages(response.totalPages || 0);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch payments');
    } finally {
      setIsLoading(false);
    }
  }, [filters, currentPage, pageSize]);

  // Auto-refresh effect
  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(fetchPayments, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, fetchPayments]);

  // Filter management
  const updateFilters = useCallback((newFilters: Partial<PaymentSearchParams>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: newFilters.page !== undefined ? newFilters.page : 0
    }));
    setCurrentPage(0);
  }, []);

  // Pagination
  const changePage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const changePageSize = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(0);
  }, []);

  // Sorting
  const changeSorting = useCallback((sortBy: string, sortDirection: 'asc' | 'desc') => {
    updateFilters({ sortBy, sortDirection });
  }, [updateFilters]);

  // Selection management
  const selectPayment = useCallback((paymentId: number) => {
    setSelectedPayments(prev => {
      const isSelected = prev.includes(paymentId);
      if (isSelected) {
        return prev.filter(id => id !== paymentId);
      } else {
        return [...prev, paymentId];
      }
    });
  }, []);

  const selectAllPayments = useCallback(() => {
    setSelectedPayments(payments.map(p => p.id));
  }, [payments]);

  const clearSelection = useCallback(() => {
    setSelectedPayments([]);
  }, []);

  const selectPaymentsByBank = useCallback((bankName: string) => {
    const bankPayments = payments.filter(p => p.bankName === bankName);
    setSelectedPayments(bankPayments.map(p => p.id));
  }, [payments]);

  // Bank file generation
  const generateBankFile = useCallback(async (bankName: string, comments: string) => {
    try {
      setIsGeneratingFile(true);
      setFileGenerationError(null);

      const selectedPaymentItems = payments.filter(p => selectedPayments.includes(p.id));
      const paymentIds = selectedPaymentItems.map(p => p.id);

      const request: BankFileRequest = {
        paymentIds,
        bankName,
        comments
      };

      const result = await paymentService.generateBankFile(request);
      
      // Download the file automatically
      if (result.batchId && result.fileName) {
        try {
          const blob = await paymentService.downloadBankFile(result.batchId, result.fileName);
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = result.fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        } catch (downloadError) {
          console.error('Error downloading file:', downloadError);
          setFileGenerationError('File generated but download failed');
        }
      }

      // Clear selection and refresh
      clearSelection();
      fetchPayments();
    } catch (err) {
      console.error('Error generating bank file:', err);
      setFileGenerationError(err instanceof Error ? err.message : 'Failed to generate bank file');
    } finally {
      setIsGeneratingFile(false);
    }
  }, [payments, selectedPayments, clearSelection, fetchPayments]);

  // Data analysis functions
  const getPaymentsByBank = useCallback((): Map<string, PaymentSummaryResponse[]> => {
    const bankGroups = new Map<string, PaymentSummaryResponse[]>();
    
    payments.forEach(payment => {
      const bankName = payment.bankName || 'Unknown Bank';
      if (!bankGroups.has(bankName)) {
        bankGroups.set(bankName, []);
      }
      bankGroups.get(bankName)!.push(payment);
    });

    return bankGroups;
  }, [payments]);

  const getAvailableBanks = useCallback(() => {
    const banks = new Set<string>();
    payments.forEach(payment => {
      if (payment.bankName) {
        banks.add(payment.bankName);
      }
    });

    
    return Array.from(banks).map(bankName => {
      const bankDefinition = saudiBankService.getBankByCode(bankName);
      if (bankDefinition) {
        return bankDefinition;
      }
      // Fallback for unknown banks
      return {
        code: bankName,
        name: bankName,
        arabicName: bankName,
        shortName: bankName,
        primaryColor: '#666666',
        secondaryColor: '#F5F5F5',
        supportsBulkPayments: true,
        maxFileSize: 10 * 1024 * 1024,
        maxBulkPayments: 100,
        requiredFields: ['accountNumber', 'amount', 'beneficiaryName'],
        ibanPrefix: 'SA',
        processingTime: '1-2 business days',
        cutoffTime: '14:00'
      };
    });
  }, [payments]);

  const getSelectionStats = useCallback(() => {
    const selectedItems = payments.filter(p => selectedPayments.includes(p.id));
    const totalAmount = selectedItems.reduce((sum, payment) => sum + payment.amount, 0);
    
    const byBank: Record<string, number> = {};
    selectedItems.forEach(payment => {
      const bankName = payment.bankName || 'Unknown';
      byBank[bankName] = (byBank[bankName] || 0) + 1;
    });

    return {
      count: selectedItems.length,
      totalAmount,
      byBank
    };
  }, [payments, selectedPayments]);

  const validateSelection = useCallback(() => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (selectedPayments.length === 0) {
      errors.push('No payments selected');
      return { isValid: false, errors, warnings };
    }

    const selectedItems = payments.filter(p => selectedPayments.includes(p.id));
    
    // Check for missing bank information
    const missingBank = selectedItems.filter(p => !p.bankName);
    if (missingBank.length > 0) {
      errors.push(`${missingBank.length} payment(s) missing bank information`);
    }

    // Check for mixed banks
    const banks = new Set(selectedItems.map(p => p.bankName).filter(Boolean));
    if (banks.size > 1) {
      warnings.push(`Selected payments are from ${banks.size} different banks`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }, [payments, selectedPayments]);

  const refetch = useCallback(() => {
    fetchPayments();
  }, [fetchPayments]);

  return {
    payments,
    totalElements,
    totalPages,
    currentPage,
    pageSize,
    isLoading,
    error,
    selectedPayments,
    filters,
    updateFilters,
    changePage,
    changePageSize,
    changeSorting,
    selectPayment,
    selectAllPayments,
    clearSelection,
    selectPaymentsByBank,
    generateBankFile,
    getPaymentsByBank,
    getAvailableBanks,
    getSelectionStats,
    validateSelection,
    refetch,
    isGeneratingFile,
    fileGenerationError
  };
};