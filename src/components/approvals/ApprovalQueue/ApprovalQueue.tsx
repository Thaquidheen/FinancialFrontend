// components/approvals/ApprovalQueue/ApprovalQueue.tsx
import React, { useState, useCallback } from 'react';
import approvalService from '../../../services/approvalService';
import {
  Box,
  Paper,
  Toolbar,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  Alert,
  CircularProgress,
  Backdrop
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  FilterList as FilterListIcon,
  GetApp as ExportIcon
} from '@mui/icons-material';
import { ApprovalFilters, ApprovalItem } from '../../../types/approval.types';
import { UserRole } from '../../../types/auth';
import { useApprovalQueue } from '../../../hooks/approvals/useApprovalQueue';
import { useBulkApprovals } from '../../../hooks/approvals/useBulkApprovals';
import ApprovalQueueFilters from './ApprovalQueueFilters';
import ApprovalQueueTable from './ApprovalQueueTable';
import ApprovalQueueCard from './ApprovalQueueCard';
import ApprovalQueueEmpty from './ApprovalQueueEmpty';
import BulkApprovalPanel from '../BulkOperations/BulkApprovalPanel';
import { ApprovalReviewModal } from '../ApprovalReview/ApprovalReviewModal';
import { exportToCSV, downloadFile } from '../../../utils/approvals/approvalUtils';

interface ApprovalQueueProps {
  role: UserRole;
  showUrgentOnly?: boolean;
  defaultFilters?: Partial<ApprovalFilters>;
  onApprovalProcessed?: (approval: ApprovalItem) => void;
}

type ViewMode = 'table' | 'cards';

const ApprovalQueue: React.FC<ApprovalQueueProps> = ({
  showUrgentOnly = false,
  onApprovalProcessed
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState<ApprovalItem | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Initialize approval queue hook
  const {
    approvals,
    loading,
    error,
    filters,
    sort,
    pagination,
    selectedItems,
    isAllSelected,
    isPartiallySelected,
    setFilters,
    setSort,
    setPage,
    setPageSize,
    refreshApprovals,
    selectItem,
    selectAll,
    clearSelection,
    selectedCount,
    urgentCount,
    totalAmount
  } = useApprovalQueue();

  // Initialize bulk approvals hook
  const {
    isProcessing: isBulkProcessing,
    progress: bulkProgress,
    currentOperation,
    processBulkApprove,
    processBulkReject,
    validateBulkOperation
  } = useBulkApprovals();

  // Handle single approval action
  const handleQuickApprove = useCallback(async (approval: ApprovalItem) => {
    try {
      console.log('Quick approve:', approval);
      await approvalService.quickApprove(approval.quotationId);
      await refreshApprovals();
      onApprovalProcessed?.(approval);
    } catch (error) {
      console.error('Error approving quotation:', error);
    }
  }, [refreshApprovals, onApprovalProcessed]);

  const handleQuickReject = useCallback(async (approval: ApprovalItem, reason: string, comments?: string) => {
    try {
      console.log('Quick reject:', approval, reason, comments);
      await approvalService.quickReject(approval.quotationId, reason);
      await refreshApprovals();
      onApprovalProcessed?.(approval);
    } catch (error) {
      console.error('Error rejecting quotation:', error);
    }
  }, [refreshApprovals, onApprovalProcessed]);

  // Handle bulk operations
  const handleBulkApprove = useCallback(async (comments?: string) => {
    const selectedApprovals = approvals.filter(approval => 
      selectedItems.includes(approval.id)
    );
    
    const validation = validateBulkOperation(selectedApprovals, 'APPROVE');
    if (!validation.isValid) {
      console.error('Validation failed:', validation.errors);
      return;
    }

    await processBulkApprove(selectedItems, comments);
    clearSelection();
    await refreshApprovals();
  }, [approvals, selectedItems, validateBulkOperation, processBulkApprove, clearSelection, refreshApprovals]);

  const handleBulkReject = useCallback(async (reason: string) => {
    const selectedApprovals = approvals.filter(approval => 
      selectedItems.includes(approval.id)
    );
    
    const validation = validateBulkOperation(selectedApprovals, 'REJECT');
    if (!validation.isValid) {
      console.error('Validation failed:', validation.errors);
      return;
    }

    await processBulkReject(selectedItems, reason);
    clearSelection();
    await refreshApprovals();
  }, [approvals, selectedItems, validateBulkOperation, processBulkReject, clearSelection, refreshApprovals]);

  // Export functionality
  const handleExport = useCallback(async (format: 'csv' | 'excel' = 'csv') => {
    try {
      setIsExporting(true);
      
      if (format === 'csv') {
        const csvContent = exportToCSV(approvals);
        const fileName = `approvals_${new Date().toISOString().split('T')[0]}.csv`;
        downloadFile(csvContent, fileName, 'text/csv');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
    } finally {
      setIsExporting(false);
    }
  }, [approvals]);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header Toolbar */}
      <Paper elevation={1} sx={{ mb: 2 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Approval Queue
            {showUrgentOnly && (
              <Chip 
                label="Urgent Only" 
                color="error" 
                size="small" 
                sx={{ ml: 2 }}
              />
            )}
          </Typography>

          {urgentCount > 0 && (
            <Chip 
              label={`${urgentCount} Urgent`} 
              color="error" 
              size="small" 
              sx={{ mr: 1 }}
            />
          )}

          <Tooltip title="Toggle Filters">
            <IconButton onClick={() => setShowFilters(!showFilters)}>
              <FilterListIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Refresh">
            <span>
              <IconButton onClick={refreshApprovals} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Export">
            <span>
              <IconButton onClick={() => handleExport()} disabled={isExporting}>
                <ExportIcon />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title={viewMode === 'table' ? 'Card View' : 'Table View'}>
            <IconButton onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}>
              {viewMode === 'table' ? <ViewModuleIcon /> : <ViewListIcon />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </Paper>

      <Box sx={{ display: 'flex', flex: 1, gap: 2 }}>
        {/* Filters Sidebar */}
        {showFilters && (
          <Paper sx={{ width: 320, p: 2 }}>
            <ApprovalQueueFilters
              filters={filters}
              onFiltersChange={setFilters}
              onClose={() => setShowFilters(false)}
            />
          </Paper>
        )}

        {/* Main Content */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Selection Summary and Bulk Actions */}
          {selectedItems.length > 0 && (
            <BulkApprovalPanel
              selectedCount={selectedCount}
              selectedAmount={totalAmount}
              isProcessing={isBulkProcessing}
              progress={bulkProgress}
              currentOperation={currentOperation}
              results={null}
              error={null}
              onApprove={handleBulkApprove}
              onReject={handleBulkReject}
              onClose={() => {
                clearSelection();
              }}
            />
          )}

          {/* Error Display */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Loading State */}
          {loading && approvals.length === 0 && (
            <Box display="flex" justifyContent="center" alignItems="center" sx={{ flex: 1 }}>
              <CircularProgress />
            </Box>
          )}

          {/* Empty State */}
          {!loading && approvals.length === 0 && !error && (
            <ApprovalQueueEmpty 
              onRefresh={refreshApprovals}
              hasActiveFilters={Object.values(filters).some(v => v !== undefined && v !== '' && (!Array.isArray(v) || v.length > 0))}
              onClearFilters={() => setFilters({})}
            />
          )}

          {/* Approval Queue Content */}
          {approvals.length > 0 && (
            <>
              {viewMode === 'table' ? (
                <ApprovalQueueTable
                  approvals={approvals}
                  selectedItems={selectedItems}
                  sort={sort}
                  isAllSelected={isAllSelected}
                  isPartiallySelected={isPartiallySelected}
                  onSelectItem={selectItem}
                  onSelectAll={selectAll}
                  onSort={(field: keyof ApprovalItem, direction?: 'asc' | 'desc') => setSort({ field, direction: direction || 'asc' })}
                  onQuickApprove={handleQuickApprove}
                  onQuickReject={handleQuickReject}
                  onViewDetails={(approval: ApprovalItem) => setSelectedApproval(approval)}
                  pagination={{
                    page: pagination.page,
                    size: pagination.size,
                    total: pagination.total,
                    totalPages: pagination.totalPages,
                    hasNext: pagination.hasNext,
                    hasPrevious: pagination.hasPrevious,
                  }}
                  onPageChange={setPage}
                  onPageSizeChange={setPageSize}
                />
              ) : (
                <ApprovalQueueCard
                  approvals={approvals}
                  selectedItems={selectedItems}
                  onSelectItem={selectItem}
                  onQuickApprove={handleQuickApprove}
                  onQuickReject={handleQuickReject}
                  onViewDetails={(approval: ApprovalItem) => setSelectedApproval(approval)}
                  pagination={{
                    page: pagination.page,
                    size: pagination.size,
                    total: pagination.total,
                    totalPages: pagination.totalPages,
                    hasNext: pagination.hasNext,
                    hasPrevious: pagination.hasPrevious,
                  }}
                  onPageChange={setPage}
                  onPageSizeChange={setPageSize}
                />
              )}
            </>
          )}
        </Box>
      </Box>

      {/* Modals */}
      {selectedApproval && (
        <ApprovalReviewModal
          open={!!selectedApproval}
          onClose={() => setSelectedApproval(null)}
          approval={selectedApproval}
          onApprovalProcessed={(approval: ApprovalItem) => {
            setSelectedApproval(null);
            onApprovalProcessed?.(approval);
          }}
        />
      )}

      {/* Bulk Processing Backdrop */}
      <Backdrop
        open={isBulkProcessing}
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, color: '#fff' }}
      >
        <Box textAlign="center">
          <CircularProgress color="inherit" />
          <Typography variant="h6" sx={{ mt: 2 }}>
            {currentOperation}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            {bulkProgress > 0 && `${Math.round(bulkProgress)}% complete`}
          </Typography>
        </Box>
      </Backdrop>
    </Box>
  );
};

export default ApprovalQueue;