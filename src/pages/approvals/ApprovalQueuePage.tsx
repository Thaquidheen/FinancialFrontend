// pages/approvals/ApprovalQueuePage.tsx
import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  Download as DownloadIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';

import { useApprovalQueue } from '../../hooks/approvals/useApprovalQueue';
import { useBulkApprovals } from '../../hooks/approvals/useBulkApprovals';
import { ApprovalQueueTable } from '../../components/approvals/ApprovalQueue';
import { ApprovalQueueFilters } from '../../components/approvals/ApprovalQueue';
import { BulkApprovalPanel } from '../../components/approvals/BulkOperations';
import { ApprovalQueueCard } from '../../components/approvals/ApprovalQueue';
import { ApprovalQueueEmpty } from '../../components/approvals/ApprovalQueue';
import { formatCurrency, exportToCSV, downloadFile } from '../../utils/approvals/approvalUtils';

const ApprovalQueuePage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkPanel, setShowBulkPanel] = useState(false);

  const {
    approvals,
    loading,
    error,
    pagination,
    filters,
    sort,
    selectedItems,
    refreshApprovals,
    setFilters,
    setSort,
    setPage,
    setPageSize,
    selectItem,
    selectAll,
    clearSelection,
    isAllSelected,
    isPartiallySelected,
    selectedCount,
    urgentCount,
    totalAmount,
  } = useApprovalQueue();

  const {
    isProcessing,
    progress,
    currentOperation,
    results,
    error: bulkError,
    processBulkApprove,
    processBulkReject,
    resetState,
    validateBulkOperation,
  } = useBulkApprovals();

  const handleQuickApprove = async (approval: any) => {
    try {
      // This would be implemented with the approval service
      console.log('Quick approve:', approval);
      await refreshApprovals();
    } catch (err) {
      console.error('Quick approve failed:', err);
    }
  };

  const handleQuickReject = async (approval: any, reason: string, comments?: string) => {
    try {
      // This would be implemented with the approval service
      console.log('Quick reject:', approval, reason, comments);
      await refreshApprovals();
    } catch (err) {
      console.error('Quick reject failed:', err);
    }
  };

  const handleViewDetails = (approval: any) => {
    // This would open the approval review modal
    console.log('View details:', approval);
  };

  const handleBulkApprove = async (comments?: string) => {
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
    setShowBulkPanel(false);
    await refreshApprovals();
  };

  const handleBulkReject = async (reason: string) => {
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
    setShowBulkPanel(false);
    await refreshApprovals();
  };

  const handleExport = () => {
    const csvContent = exportToCSV(approvals);
    downloadFile(csvContent, `approvals-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
  };

  const renderStatsCards = () => (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Total Pending
                </Typography>
                <Typography variant="h4">
                  {pagination.total}
                </Typography>
              </Box>
              <ScheduleIcon color="primary" sx={{ fontSize: 40 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Urgent (&gt;3 days)
                </Typography>
                <Typography variant="h4" color={urgentCount > 0 ? 'error' : 'textPrimary'}>
                  {urgentCount}
                </Typography>
              </Box>
              <WarningIcon color={urgentCount > 0 ? 'error' : 'disabled'} sx={{ fontSize: 40 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Selected Amount
                </Typography>
                <Typography variant="h6">
                  {formatCurrency(totalAmount)}
                </Typography>
              </Box>
              <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Selected Items
                </Typography>
                <Typography variant="h4" color={selectedCount > 0 ? 'primary' : 'textPrimary'}>
                  {selectedCount}
                </Typography>
              </Box>
              <Chip 
                label={selectedCount > 0 ? 'Selected' : 'None'} 
                color={selectedCount > 0 ? 'primary' : 'default'}
                size="small"
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderToolbar = () => (
    <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
      <Typography variant="h5" component="h1">
        Approval Queue
      </Typography>
      
      <Box display="flex" gap={1}>
        <Tooltip title="Refresh">
          <IconButton onClick={refreshApprovals} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Toggle Filters">
          <IconButton onClick={() => setShowFilters(!showFilters)}>
            <FilterIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title={viewMode === 'table' ? 'Card View' : 'Table View'}>
          <IconButton onClick={() => setViewMode(viewMode === 'table' ? 'card' : 'table')}>
            {viewMode === 'table' ? <ViewModuleIcon /> : <ViewListIcon />}
          </IconButton>
        </Tooltip>

        <Tooltip title="Export to CSV">
          <IconButton onClick={handleExport} disabled={approvals.length === 0}>
            <DownloadIcon />
          </IconButton>
        </Tooltip>

        {selectedCount > 0 && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => setShowBulkPanel(!showBulkPanel)}
          >
            Bulk Actions ({selectedCount})
          </Button>
        )}
      </Box>
    </Box>
  );

  const renderContent = () => {
    if (loading && approvals.length === 0) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      );
    }

    if (approvals.length === 0) {
      return <ApprovalQueueEmpty onRefresh={refreshApprovals} />;
    }

    if (viewMode === 'table') {
      return (
        <ApprovalQueueTable
          approvals={approvals}
          selectedItems={selectedItems}
          sort={sort}
          isAllSelected={isAllSelected}
          isPartiallySelected={isPartiallySelected}
          onSelectItem={selectItem}
          onSelectAll={selectAll}
          onSort={(field, direction) => setSort({ field, direction: direction || 'asc' })}
          onQuickApprove={handleQuickApprove}
          onQuickReject={handleQuickReject}
          onViewDetails={handleViewDetails}
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
      );
    }

    return (
      <ApprovalQueueCard
        approvals={approvals}
        selectedItems={selectedItems}
        onSelectItem={selectItem}
        onQuickApprove={handleQuickApprove}
        onQuickReject={handleQuickReject}
        onViewDetails={handleViewDetails}
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
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {renderStatsCards()}
      {renderToolbar()}

      <Grid container spacing={3}>
        {showFilters && (
          <Grid item xs={12} md={3}>
            <ApprovalQueueFilters
              filters={filters}
              onFiltersChange={setFilters}
              onClose={() => setShowFilters(false)}
            />
          </Grid>
        )}

        <Grid item xs={12} md={showFilters ? 9 : 12}>
          <Paper variant="outlined">
            {renderContent()}
          </Paper>
        </Grid>
      </Grid>

      {showBulkPanel && (
        <BulkApprovalPanel
          selectedCount={selectedCount}
          selectedAmount={totalAmount}
          isProcessing={isProcessing}
          progress={progress}
          currentOperation={currentOperation}
          results={results}
          error={bulkError}
          onApprove={handleBulkApprove}
          onReject={handleBulkReject}
          onClose={() => {
            setShowBulkPanel(false);
            resetState();
          }}
        />
      )}
    </Container>
  );
};

export default ApprovalQueuePage;