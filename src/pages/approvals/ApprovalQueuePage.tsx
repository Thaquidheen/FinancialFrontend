// pages/approvals/ApprovalQueuePage.tsx
import React, { useState } from 'react';
import approvalService from '../../services/approvalService';
import {
  Box,
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
      console.log('Quick approve:', approval);
      await approvalService.quickApprove(approval.quotationId);
      await refreshApprovals();
    } catch (err) {
      console.error('Quick approve failed:', err);
    }
  };

  const handleQuickReject = async (approval: any, reason: string, comments?: string) => {
    try {
      console.log('Quick reject:', approval, reason, comments);
      await approvalService.quickReject(approval.quotationId, reason);
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
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid item xs={12} sm={6} md={3}>
        <Card 
          elevation={0}
          sx={{
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            bgcolor: '#ffffff',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          }}
        >
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography 
                  sx={{ 
                    color: '#64748b',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    mb: 1
                  }} 
                  gutterBottom 
                  variant="body2"
                >
                  Total Pending
                </Typography>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    color: '#1a202c',
                    fontWeight: 700,
                    fontSize: '1.875rem'
                  }}
                >
                  {pagination.total}
                </Typography>
              </Box>
              <ScheduleIcon sx={{ fontSize: 40, color: '#3b82f6' }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card 
          elevation={0}
          sx={{
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            bgcolor: '#ffffff',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          }}
        >
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography 
                  sx={{ 
                    color: '#64748b',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    mb: 1
                  }} 
                  gutterBottom 
                  variant="body2"
                >
                  Urgent (&gt;3 days)
                </Typography>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    color: urgentCount > 0 ? '#dc2626' : '#1a202c',
                    fontWeight: 700,
                    fontSize: '1.875rem'
                  }}
                >
                  {urgentCount}
                </Typography>
              </Box>
              <WarningIcon sx={{ fontSize: 40, color: urgentCount > 0 ? '#dc2626' : '#9ca3af' }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card 
          elevation={0}
          sx={{
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            bgcolor: '#ffffff',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          }}
        >
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography 
                  sx={{ 
                    color: '#64748b',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    mb: 1
                  }} 
                  gutterBottom 
                  variant="body2"
                >
                  Selected Amount
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: '#1a202c',
                    fontWeight: 600,
                    fontSize: '1.25rem'
                  }}
                >
                  {formatCurrency(totalAmount)}
                </Typography>
              </Box>
              <CheckCircleIcon sx={{ fontSize: 40, color: '#16a34a' }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card 
          elevation={0}
          sx={{
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            bgcolor: '#ffffff',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          }}
        >
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography 
                  sx={{ 
                    color: '#64748b',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    mb: 1
                  }} 
                  gutterBottom 
                  variant="body2"
                >
                  Selected Items
                </Typography>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    color: selectedCount > 0 ? '#3b82f6' : '#1a202c',
                    fontWeight: 700,
                    fontSize: '1.875rem'
                  }}
                >
                  {selectedCount}
                </Typography>
              </Box>
              <Chip 
                label={selectedCount > 0 ? 'Selected' : 'None'} 
                sx={{
                  bgcolor: selectedCount > 0 ? '#dbeafe' : '#f1f5f9',
                  color: selectedCount > 0 ? '#1e40af' : '#64748b',
                  fontWeight: 500,
                  border: 'none'
                }}
                size="small"
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderToolbar = () => (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        bgcolor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        p: 3,
        mb: 3,
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      }}
    >
      <Box>
        <Typography 
          variant="h5" 
          component="h2"
          sx={{ 
            color: '#1a202c',
            fontWeight: 600,
            fontSize: '1.25rem',
            mb: 0.5
          }}
        >
          Queue Management
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#64748b',
            fontSize: '0.875rem'
          }}
        >
          Manage approvals and bulk operations
        </Typography>
      </Box>
      
      <Box display="flex" gap={1}>
        <Tooltip title="Refresh">
          <span>
            <IconButton 
              onClick={refreshApprovals} 
              disabled={loading}
              sx={{ 
                bgcolor: '#f1f5f9',
                color: '#475569',
              '&:hover': { 
                bgcolor: '#e2e8f0',
                color: '#334155'
              },
              '&:disabled': {
                bgcolor: '#f8fafc',
                color: '#9ca3af'
              }
            }}
          >
            <RefreshIcon />
          </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Toggle Filters">
          <IconButton 
            onClick={() => setShowFilters(!showFilters)}
            sx={{ 
              bgcolor: showFilters ? '#dbeafe' : '#f1f5f9',
              color: showFilters ? '#1e40af' : '#475569',
              '&:hover': { 
                bgcolor: showFilters ? '#bfdbfe' : '#e2e8f0',
                color: showFilters ? '#1e3a8a' : '#334155'
              }
            }}
          >
            <FilterIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title={viewMode === 'table' ? 'Card View' : 'Table View'}>
          <IconButton 
            onClick={() => setViewMode(viewMode === 'table' ? 'card' : 'table')}
            sx={{ 
              bgcolor: '#f1f5f9',
              color: '#475569',
              '&:hover': { 
                bgcolor: '#e2e8f0',
                color: '#334155'
              }
            }}
          >
            {viewMode === 'table' ? <ViewModuleIcon /> : <ViewListIcon />}
          </IconButton>
        </Tooltip>

        <Tooltip title="Export to CSV">
          <span>
            <IconButton 
              onClick={handleExport} 
              disabled={approvals.length === 0}
              sx={{ 
                bgcolor: '#f1f5f9',
                color: '#475569',
                '&:hover': { 
                  bgcolor: '#e2e8f0',
                  color: '#334155'
                },
                '&:disabled': {
                  bgcolor: '#f8fafc',
                  color: '#9ca3af'
                }
              }}
            >
              <DownloadIcon />
            </IconButton>
          </span>
        </Tooltip>

        {selectedCount > 0 && (
          <Button
            variant="contained"
            onClick={() => setShowBulkPanel(!showBulkPanel)}
            sx={{ 
              minWidth: 140,
              bgcolor: '#3b82f6',
              color: '#ffffff',
              fontWeight: 600,
              borderRadius: '8px',
              '&:hover': { 
                bgcolor: '#2563eb',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }
            }}
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
    <Box sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: '#f8fafc', // Light gray background
    }}>
      {/* Header Section */}
      <Paper 
        elevation={0} 
        sx={{ 
          borderBottom: '1px solid #e2e8f0',
          px: 3,
          py: 2,
          bgcolor: '#ffffff',
          borderRadius: 0,
        }}
      >
        <Box sx={{ mb: 2 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            fontWeight={700}
            sx={{ 
              color: '#1a202c',
              fontSize: '1.875rem',
              letterSpacing: '-0.025em',
              mb: 0.5
            }}
          >
            Approval Queue
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#64748b',
              fontSize: '0.875rem'
            }}
          >
            Review and manage pending approvals
          </Typography>
        </Box>
      </Paper>

      {/* Main Content Area */}
      <Box sx={{ flex: 1, overflow: 'hidden', p: 3 }}>
        {/* Statistics Cards */}
        {renderStatsCards()}
        
        {/* Toolbar */}
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
            <Paper 
              elevation={0}
              sx={{ 
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                bgcolor: '#ffffff',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              }}
            >
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
      </Box>
    </Box>
  );
};

export default ApprovalQueuePage;