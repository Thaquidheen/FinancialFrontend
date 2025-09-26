// hooks/approvals/useApprovalQueue.ts
import { useState, useEffect, useCallback } from 'react';
import { ApprovalItem, ApprovalFilters, SortConfig, PagedResponse } from '../../types/approval.types';
import approvalService from '../../services/approvalService';
import { DEFAULT_FILTERS, DEFAULT_SORT, DEFAULT_PAGINATION } from '../../constants/approvals/approvalConstants';

interface UseApprovalQueueReturn {
  // Data
  approvals: ApprovalItem[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };

  // Filters and sorting
  filters: ApprovalFilters;
  sort: SortConfig;
  selectedItems: string[];

  // Actions
  loadApprovals: () => Promise<void>;
  refreshApprovals: () => Promise<void>;
  setFilters: (filters: Partial<ApprovalFilters>) => void;
  setSort: (sort: SortConfig) => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  selectItem: (itemId: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  toggleItem: (itemId: string) => void;

  // Computed values
  isAllSelected: boolean;
  isPartiallySelected: boolean;
  selectedCount: number;
  urgentCount: number;
  totalAmount: number;
}

export const useApprovalQueue = (): UseApprovalQueueReturn => {
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<ApprovalFilters>(DEFAULT_FILTERS);
  const [sort, setSortState] = useState<SortConfig>(DEFAULT_SORT);
  const [pagination, setPagination] = useState({
    page: DEFAULT_PAGINATION.page,
    size: DEFAULT_PAGINATION.size,
    total: DEFAULT_PAGINATION.total,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
  });
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const loadApprovals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response: PagedResponse<ApprovalItem> = await approvalService.getPendingApprovals(
        pagination.page,
        pagination.size,
        filters,
        sort
      );

      setApprovals(response.content);
      setPagination(prev => ({
        ...prev,
        total: response.totalElements,
        totalPages: response.totalPages,
        hasNext: response.hasNext,
        hasPrevious: response.hasPrevious,
      }));
    } catch (err: any) {
      setError(err.message || 'Failed to load approvals');
      console.error('Error loading approvals:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.size, filters, sort]);

  const refreshApprovals = useCallback(async () => {
    await loadApprovals();
  }, [loadApprovals]);

  const setFilters = useCallback((newFilters: Partial<ApprovalFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 0 })); // Reset to first page
  }, []);

  const setSort = useCallback((newSort: SortConfig) => {
    setSortState(newSort);
    setPagination(prev => ({ ...prev, page: 0 })); // Reset to first page
  }, []);

  const setPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const setPageSize = useCallback((size: number) => {
    setPagination(prev => ({ ...prev, size: size as any, page: 0 }));
  }, []);

  const selectItem = useCallback((itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  }, []);

  const selectAll = useCallback(() => {
    const allSelected = approvals.length > 0 && selectedItems.length === approvals.length;
    if (allSelected) {
      setSelectedItems([]);
    } else {
      setSelectedItems(approvals.map(approval => approval.id));
    }
  }, [approvals, selectedItems.length]);

  const clearSelection = useCallback(() => {
    setSelectedItems([]);
  }, []);

  const toggleItem = useCallback((itemId: string) => {
    selectItem(itemId);
  }, [selectItem]);

  // Computed values
  const isAllSelected = approvals.length > 0 && selectedItems.length === approvals.length;
  const isPartiallySelected = selectedItems.length > 0 && selectedItems.length < approvals.length;
  const selectedCount = selectedItems.length;
  const urgentCount = approvals.filter(approval => 
    approval.urgencyLevel === 'HIGH' || approval.urgencyLevel === 'CRITICAL'
  ).length;
  const totalAmount = approvals.reduce((sum, approval) => sum + approval.totalAmount, 0);

  // Load approvals when dependencies change
  useEffect(() => {
    loadApprovals();
  }, [loadApprovals]);

  // Clear selection when approvals change
  useEffect(() => {
    setSelectedItems([]);
  }, [approvals]);

  return {
    // Data
    approvals,
    loading,
    error,
    pagination,

    // Filters and sorting
    filters,
    sort,
    selectedItems,

    // Actions
    loadApprovals,
    refreshApprovals,
    setFilters,
    setSort,
    setPage,
    setPageSize,
    selectItem,
    selectAll,
    clearSelection,
    toggleItem,

    // Computed values
    isAllSelected,
    isPartiallySelected,
    selectedCount,
    urgentCount,
    totalAmount,
  };
};