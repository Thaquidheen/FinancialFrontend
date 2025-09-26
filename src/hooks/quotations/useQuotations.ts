import { useState, useEffect, useCallback } from 'react';
import { quotationService } from '../../services/quotation/quotationService';
import { 
  QuotationSummary, 
  QuotationFilters
} from '../../types/quotation';

export interface UseQuotationsReturn {
  quotations: QuotationSummary[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
  };
  filters: QuotationFilters;
  setFilters: (filters: QuotationFilters) => void;
  refreshQuotations: () => Promise<void>;
  handleDelete: (id: number) => Promise<void>;
  handleSubmit: (id: number) => Promise<void>;
  handleApprove: (id: number, comments?: string) => Promise<void>;
  handleReject: (id: number, reason: string) => Promise<void>;
}

export const useQuotations = (initialFilters: QuotationFilters = {}): UseQuotationsReturn => {
  const [quotations, setQuotations] = useState<QuotationSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true
  });

  const [filters, setFilters] = useState<QuotationFilters>({
    page: 0,
    size: 10,
    sortBy: 'createdDate',
    sortDir: 'desc',
    ...initialFilters
  });

  const fetchQuotations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await quotationService.getMyQuotations({
        page: filters.page,
        size: filters.size,
        sortBy: filters.sortBy,
        sortDir: filters.sortDir,
        status: filters.status?.[0], // Convert array to single string
        projectId: filters.projectId?.[0], // Convert array to single number
        startDate: filters.startDate,
        endDate: filters.endDate
      });
      
      setQuotations(response.content);
      setPagination({
        page: filters.page || 0,
        size: filters.size || 20,
        totalElements: response.totalElements,
        totalPages: response.totalPages,
        first: response.first,
        last: response.last
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch quotations');
      setQuotations([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchQuotations();
  }, [fetchQuotations]);

  const refreshQuotations = useCallback(async () => {
    await fetchQuotations();
  }, [fetchQuotations]);

  const handleDelete = useCallback(async (id: number) => {
    await quotationService.deleteQuotation(id);
    await refreshQuotations();
  }, [refreshQuotations]);

  const handleSubmit = useCallback(async (id: number) => {
    await quotationService.submitQuotation(id);
    await refreshQuotations();
  }, [refreshQuotations]);

  const handleApprove = useCallback(async (id: number, comments?: string) => {
    await quotationService.approveQuotation(id, comments);
    await refreshQuotations();
  }, [refreshQuotations]);

  const handleReject = useCallback(async (id: number, reason: string) => {
    await quotationService.rejectQuotation(id, reason);
    await refreshQuotations();
  }, [refreshQuotations]);

  return {
    quotations,
    loading,
    error,
    pagination,
    filters,
    setFilters,
    refreshQuotations,
    handleDelete,
    handleSubmit,
    handleApprove,
    handleReject
  };
};