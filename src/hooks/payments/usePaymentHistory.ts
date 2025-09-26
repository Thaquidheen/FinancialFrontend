import { useEffect, useMemo, useState } from 'react';
import { PaymentSearchParams, PaymentStatus, PaymentSummaryResponse, PaymentStatistics } from '../../types/payment.types';
import { PAYMENT_CONFIG } from '../../constants/payments/paymentConstants';

interface UsePaymentHistoryReturn {
  payments: PaymentSummaryResponse[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  isLoading: boolean;
  error: string | null;
  filters: Required<Pick<PaymentSearchParams, 'search' | 'status' | 'dateRange' | 'sortBy' | 'sortDirection'>> & Partial<PaymentSearchParams>;
  updateFilters: (partial: Partial<PaymentSearchParams>) => void;
  changePage: (page: number) => void;
  changePageSize: (size: number) => void;
  changeSorting: (sortBy: string, sortDirection: 'asc' | 'desc') => void;
  getPaymentStatistics: () => {
    totalPayments: number;
    totalAmount: number;
    paymentsByBank: Record<string, number>;
    uniqueEmployees: number;
    monthlyTrends: { month: string; amount: number; completed: number }[];
  };
  exportPayments: (format: 'csv' | 'excel' | 'pdf', params: PaymentSearchParams) => Promise<void>;
  refetch: () => void;
}

// Temporary mock data loader. Replace with real API integration using services/api.ts
function mockFetchPayments(params: PaymentSearchParams): Promise<{
  content: PaymentSummaryResponse[];
  totalElements: number;
}> {
  return new Promise((resolve) => {
    const page = params.page ?? 0;
    const size = params.size ?? PAYMENT_CONFIG.DEFAULT_PAGE_SIZE;
    const start = page * size;
    const content: PaymentSummaryResponse[] = Array.from({ length: size }, (_, i) => {
      const id = (start + i + 1).toString();
      const amount = Math.round((Math.random() * 90000 + 1000) * 100) / 100;
      const statuses = Object.values(PaymentStatus);
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      return {
        id,
        quotationId: `Q-${1000 + start + i}`,
        employeeName: `Employee ${id}`,
        amount,
        status,
        bankName: ['SABB', 'ANB', 'SNB', 'RIB'][Math.floor(Math.random() * 4)],
        projectName: Math.random() > 0.5 ? `Project ${(start + i) % 7}` : undefined,
        createdAt: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString(),
        processedAt: Math.random() > 0.4 ? new Date().toISOString() : undefined,
      };
    });
    resolve({ content, totalElements: 250 });
  });
}

export function usePaymentHistory(): UsePaymentHistoryReturn {
  const [payments, setPayments] = useState<PaymentSummaryResponse[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(PAYMENT_CONFIG.DEFAULT_PAGE_SIZE);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<UsePaymentHistoryReturn['filters']>({
    search: '',
    status: [],
    dateRange: undefined,
    sortBy: 'createdDate',
    sortDirection: 'desc',
    page: 0,
    size: PAYMENT_CONFIG.DEFAULT_PAGE_SIZE,
  });

  const totalPages = useMemo(() => Math.ceil(totalElements / pageSize), [totalElements, pageSize]);

  const load = () => {
    setIsLoading(true);
    setError(null);
    mockFetchPayments({ ...filters, page: currentPage, size: pageSize })
      .then((res) => {
        setPayments(res.content);
        setTotalElements(res.totalElements);
      })
      .catch((e: unknown) => setError((e as Error).message))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, filters.search, JSON.stringify(filters.status), JSON.stringify(filters.dateRange), filters.sortBy, filters.sortDirection]);

  const updateFilters = (partial: Partial<PaymentSearchParams>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
    setCurrentPage(0);
  };

  const changePage = (page: number) => setCurrentPage(page);
  const changePageSize = (size: number) => {
    setPageSize(size);
    setCurrentPage(0);
  };
  const changeSorting = (sortBy: string, sortDirection: 'asc' | 'desc') => setFilters((p) => ({ ...p, sortBy, sortDirection }));

  const getPaymentStatistics = () => {
    const totalPayments = payments.length;
    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    const paymentsByBank = payments.reduce<Record<string, number>>((acc, p) => {
      const key = p.bankName || 'UNKNOWN';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const uniqueEmployees = new Set(payments.map((p) => p.employeeName)).size;
    const monthlyTrends = Array.from({ length: 6 }, (_, i) => ({
      month: `M${i + 1}`,
      completed: Math.floor(Math.random() * 100),
      amount: Math.round(Math.random() * 100000),
    }));
    return { totalPayments, totalAmount, paymentsByBank, uniqueEmployees, monthlyTrends };
  };

  const exportPayments = async (_format: 'csv' | 'excel' | 'pdf', _params: PaymentSearchParams) => {
    // Placeholder for API call
    return Promise.resolve();
  };

  return {
    payments,
    totalElements,
    totalPages,
    currentPage,
    pageSize,
    isLoading,
    error,
    filters,
    updateFilters,
    changePage,
    changePageSize,
    changeSorting,
    getPaymentStatistics,
    exportPayments,
    refetch: load,
  };
}

export default usePaymentHistory;

