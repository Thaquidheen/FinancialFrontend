// hooks/approvals/useApprovalFilters.ts
import { useState, useCallback } from 'react';
import { ApprovalFilters } from '../../types/approval.types';

interface UseApprovalFiltersReturn {
  filters: ApprovalFilters;
  setFilters: (filters: ApprovalFilters) => void;
  updateFilter: <K extends keyof ApprovalFilters>(key: K, value: ApprovalFilters[K]) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
}

const defaultFilters: ApprovalFilters = {
  status: undefined,
  urgency: undefined,
  projectId: undefined,
  // projectManagerId: undefined, // Removed as it doesn't exist in ApprovalFilters type
  amountRange: undefined,
  dateRange: undefined,
  // search: undefined, // Removed as it doesn't exist in ApprovalFilters type
};

export const useApprovalFilters = (initialFilters?: Partial<ApprovalFilters>): UseApprovalFiltersReturn => {
  const [filters, setFilters] = useState<ApprovalFilters>({
    ...defaultFilters,
    ...initialFilters,
  });

  const updateFilter = useCallback(<K extends keyof ApprovalFilters>(
    key: K, 
    value: ApprovalFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== '' && (!Array.isArray(value) || value.length > 0)
  );

  return {
    filters,
    setFilters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
  };
};
