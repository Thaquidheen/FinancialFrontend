// src/pages/quotations/QuotationListPage.tsx
import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tooltip,
  Fab,
  Card,
  CardContent,
  Avatar,
  Badge,
  TextField,
  InputAdornment,
  ButtonGroup,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRowSelectionModel,
  GridActionsCellItem,
  GridRowParams,
  GridToolbar
} from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Send as SubmitIcon,
  FileDownload as ExportIcon,
  FilterList as FilterIcon,
  CheckCircle as ApproveIcon,
  CheckCircle,
  Cancel as RejectIcon,
  Search as SearchIcon,
  TrendingUp,
  Schedule,
  Assignment,
  AttachMoney,
  Refresh,
  Dashboard,
  Clear
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useQuotations } from '../../hooks/quotations/useQuotations';
import { quotationService } from '../../services/quotation/quotationService';
import { QuotationSummary, QuotationStatus, Currency } from '../../types/quotation';
import QuotationFilters from '../../components/quotations/QuotationFilters';
import { formatCurrency, formatDate } from '../../utils/quotations/quotationFormatters';

const QuotationListPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<QuotationSummary | null>(null);
  const [quickSearch, setQuickSearch] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

  const {
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
  } = useQuotations();

  // Filter quotations based on quick search
  const filteredQuotations = useMemo(() => {
    if (!quickSearch.trim()) return quotations;
    
    const searchTerm = quickSearch.toLowerCase();
    return quotations.filter(quotation =>
      quotation.description.toLowerCase().includes(searchTerm) ||
      quotation.projectName.toLowerCase().includes(searchTerm) ||
      quotation.id.toString().includes(searchTerm) ||
      quotation.createdByName?.toLowerCase().includes(searchTerm)
    );
  }, [quotations, quickSearch]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const total = quotations.length;
    const pending = quotations.filter(q => q.status === QuotationStatus.PENDING).length;
    const approved = quotations.filter(q => q.status === QuotationStatus.APPROVED).length;
    const draft = quotations.filter(q => q.status === QuotationStatus.DRAFT).length;
    const rejected = quotations.filter(q => q.status === QuotationStatus.REJECTED).length;
    const totalAmount = quotations.reduce((sum, q) => sum + q.totalAmount, 0);
    const exceedsBudget = quotations.filter(q => q.exceedsBudget).length;

    return { total, pending, approved, draft, rejected, totalAmount, exceedsBudget };
  }, [quotations]);

  // Define enhanced columns with better formatting
  const columns: GridColDef[] = useMemo(() => {
    const baseColumns: GridColDef[] = [
      {
        field: 'id',
        headerName: 'ID',
        width: 90,
        sortable: true,
        renderCell: (params) => (
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar sx={{ width: 24, height: 24, fontSize: 12, bgcolor: 'primary.main' }}>
              {params.value.toString().slice(-2)}
            </Avatar>
            <Typography variant="body2" fontWeight="medium">
              {params.value}
            </Typography>
          </Box>
        )
      },
      {
        field: 'description',
        headerName: 'Description',
        flex: 1,
        minWidth: 250,
        sortable: true,
        renderCell: (params) => (
          <Box>
            <Tooltip title={params.value}>
              <Typography variant="body2" noWrap fontWeight="medium" sx={{ mb: 0.5 }}>
                {params.value}
              </Typography>
            </Tooltip>
            <Typography variant="caption" color="text.secondary">
              {params.row.itemCount} items • Created {formatDate(params.row.createdDate)}
            </Typography>
          </Box>
        )
      },
      {
        field: 'projectName',
        headerName: 'Project',
        width: 180,
        sortable: true,
        renderCell: (params) => (
          <Box>
            <Typography variant="body2" fontWeight="medium" sx={{ mb: 0.5 }}>
              {params.value}
            </Typography>
            <Chip 
              label={params.row.projectCode} 
              size="small" 
              variant="outlined" 
              sx={{ height: 20, fontSize: '0.7rem' }}
            />
          </Box>
        )
      },
      {
        field: 'totalAmount',
        headerName: 'Amount',
        width: 150,
        sortable: true,
        align: 'right',
        headerAlign: 'right',
        renderCell: (params) => (
          <Box textAlign="right">
            <Typography 
              variant="body2" 
              fontWeight="bold" 
              color={params.row.exceedsBudget ? 'error.main' : 'text.primary'}
              sx={{ mb: 0.5 }}
            >
              {formatCurrency(params.value, params.row.currency)}
            </Typography>
            {params.row.exceedsBudget && (
              <Chip
                label="Over Budget"
                color="error"
                size="small"
                variant="outlined"
                sx={{ height: 20, fontSize: '0.65rem' }}
              />
            )}
          </Box>
        )
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 130,
        sortable: true,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <QuotationStatusChip status={params.value} />
        )
      }
    ];

    // Add creator column for admins and account managers
    if (user?.roles?.includes('SUPER_ADMIN') || user?.roles?.includes('ACCOUNT_MANAGER')) {
      baseColumns.push({
        field: 'createdByName',
        headerName: 'Created By',
        width: 140,
        sortable: true,
        renderCell: (params) => (
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem' }}>
              {params.value?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
            <Typography variant="body2">
              {params.value}
            </Typography>
          </Box>
        )
      });
    }

    // Enhanced actions column
    baseColumns.push({
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      getActions: (params: GridRowParams<QuotationSummary>) => {
        const actions = [];

        // View action
        actions.push(
          <GridActionsCellItem
            icon={<ViewIcon sx={{ fontSize: 18 }} />}
            label="View"
            onClick={() => navigate(`/quotations/${params.id}`)}
            showInMenu
          />
        );

        // Edit action (only for drafts and own quotations)
        if (params.row.status === QuotationStatus.DRAFT && 
            (user?.roles?.includes('PROJECT_MANAGER') || user?.roles?.includes('SUPER_ADMIN'))) {
          actions.push(
            <GridActionsCellItem
              icon={<EditIcon sx={{ fontSize: 18 }} />}
              label="Edit"
              onClick={() => navigate(`/quotations/${params.id}/edit`)}
              showInMenu
            />
          );
        }

        // Submit action (only for drafts)
        if (params.row.status === QuotationStatus.DRAFT && 
            (user?.roles?.includes('PROJECT_MANAGER') || user?.roles?.includes('SUPER_ADMIN'))) {
          actions.push(
            <GridActionsCellItem
              icon={<SubmitIcon sx={{ fontSize: 18 }} />}
              label="Submit"
              onClick={() => handleSubmitQuotation(params.row)}
              showInMenu
            />
          );
        }

        // Approval actions (only for account managers on pending quotations)
        if (params.row.status === QuotationStatus.PENDING && 
            (user?.roles?.includes('ACCOUNT_MANAGER') || user?.roles?.includes('SUPER_ADMIN'))) {
          actions.push(
            <GridActionsCellItem
              icon={<ApproveIcon sx={{ fontSize: 18 }} />}
              label="Approve"
              onClick={() => handleApproveQuotation(params.row)}
              showInMenu
            />,
            <GridActionsCellItem
              icon={<RejectIcon sx={{ fontSize: 18 }} />}
              label="Reject"
              onClick={() => handleRejectQuotation(params.row)}
              showInMenu
            />
          );
        }

        // Delete action (only for drafts)
        if (params.row.status === QuotationStatus.DRAFT && 
            (user?.roles?.includes('PROJECT_MANAGER') || user?.roles?.includes('SUPER_ADMIN'))) {
          actions.push(
            <GridActionsCellItem
              icon={<DeleteIcon sx={{ fontSize: 18 }} />}
              label="Delete"
              onClick={() => handleDeleteQuotation(params.row)}
              showInMenu
            />
          );
        }

        return actions;
      }
    });

    return baseColumns;
  }, [user?.roles, navigate]);

  const handleSubmitQuotation = async (quotation: QuotationSummary) => {
    try {
      await handleSubmit(quotation.id);
      refreshQuotations();
    } catch (error) {
      console.error('Error submitting quotation:', error);
    }
  };

  const handleApproveQuotation = async (quotation: QuotationSummary) => {
    try {
      await handleApprove(quotation.id, 'Approved via list page');
      refreshQuotations();
    } catch (error) {
      console.error('Error approving quotation:', error);
    }
  };

  const handleRejectQuotation = async (quotation: QuotationSummary) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason) {
      try {
        await handleReject(quotation.id, reason);
        refreshQuotations();
      } catch (error) {
        console.error('Error rejecting quotation:', error);
      }
    }
  };

  const handleDeleteQuotation = (quotation: QuotationSummary) => {
    setSelectedQuotation(quotation);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedQuotation) {
      try {
        await handleDelete(selectedQuotation.id);
        setDeleteDialogOpen(false);
        setSelectedQuotation(null);
        refreshQuotations();
      } catch (error) {
        console.error('Error deleting quotation:', error);
      }
    }
  };

  const handleBulkAction = (action: string) => {
    console.log(`Bulk ${action} for quotations:`, selectionModel);
  };

  const handleExport = async () => {
    try {
      const blob = await quotationService.exportQuotations(filters, 'xlsx');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `quotations_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting quotations:', error);
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'grey.50' }}>
      {/* Header Section */}
      <Paper elevation={0} sx={{ px: 3, py: 2, borderRadius: 0 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link 
            color="inherit" 
            href="/dashboard" 
            onClick={(e) => {
              e.preventDefault();
              navigate('/dashboard');
            }}
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
          >
            <Dashboard sx={{ fontSize: 16 }} />
            Dashboard
          </Link>
          <Typography color="text.primary">Quotations</Typography>
        </Breadcrumbs>

        {/* Main Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 0.5 }}>
              Quotation Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage and track all quotations across projects
            </Typography>
          </Box>
          
          <Box display="flex" gap={1} alignItems="center">
            <Tooltip title="Refresh Data">
              <IconButton onClick={refreshQuotations} disabled={loading}>
                <Refresh />
              </IconButton>
            </Tooltip>
            
            <Button
              startIcon={<FilterIcon />}
              onClick={() => setFilterOpen(true)}
              variant="outlined"
              size="small"
            >
              Advanced Filters
            </Button>
            
            <Button
              startIcon={<ExportIcon />}
              onClick={handleExport}
              variant="outlined"
              size="small"
            >
              Export
            </Button>
            
            {(user?.roles?.includes('PROJECT_MANAGER') || user?.roles?.includes('SUPER_ADMIN')) && (
              <Button
                startIcon={<AddIcon />}
                onClick={() => navigate('/quotations/create')}
                variant="contained"
                size="medium"
              >
                New Quotation
              </Button>
            )}
          </Box>
        </Box>

        {/* Search and Quick Actions */}
        <Box display="flex" gap={2} alignItems="center" mb={2}>
          <TextField
            placeholder="Search quotations..."
            value={quickSearch}
            onChange={(e) => setQuickSearch(e.target.value)}
            size="small"
            sx={{ minWidth: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: quickSearch && (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="clear search"
                    onClick={() => setQuickSearch('')}
                    size="small"
                  >
                    <Clear />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          
          <ButtonGroup variant="outlined" size="small">
            <Button 
              onClick={() => setViewMode('table')}
              variant={viewMode === 'table' ? 'contained' : 'outlined'}
            >
              Table
            </Button>
            <Button 
              onClick={() => setViewMode('card')}
              variant={viewMode === 'card' ? 'contained' : 'outlined'}
            >
              Cards
            </Button>
          </ButtonGroup>
        </Box>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ m: 2, mb: 0 }} onClose={() => {}}>
          {error}
        </Alert>
      )}

      {/* Statistics Dashboard */}
      <Box sx={{ px: 3, py: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card elevation={1} sx={{ borderLeft: 4, borderLeftColor: 'primary.main' }}>
              <CardContent sx={{ py: 2 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight="bold" color="primary">
                      {statistics.total}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Quotations
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'primary.light' }}>
                    <Assignment />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2.4}>
            <Card elevation={1} sx={{ borderLeft: 4, borderLeftColor: 'warning.main' }}>
              <CardContent sx={{ py: 2 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight="bold" color="warning.main">
                      {statistics.pending}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pending Approval
                    </Typography>
                  </Box>
                  <Badge badgeContent={statistics.pending} color="warning">
                    <Avatar sx={{ bgcolor: 'warning.light' }}>
                      <Schedule />
                    </Avatar>
                  </Badge>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2.4}>
            <Card elevation={1} sx={{ borderLeft: 4, borderLeftColor: 'success.main' }}>
              <CardContent sx={{ py: 2 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight="bold" color="success.main">
                      {statistics.approved}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Approved
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'success.light' }}>
                    <CheckCircle />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2.4}>
            <Card elevation={1} sx={{ borderLeft: 4, borderLeftColor: 'info.main' }}>
              <CardContent sx={{ py: 2 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight="bold" color="info.main">
                      {formatCurrency(statistics.totalAmount, Currency.SAR)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Value
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'info.light' }}>
                    <AttachMoney />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2.4}>
            <Card elevation={1} sx={{ borderLeft: 4, borderLeftColor: 'error.main' }}>
              <CardContent sx={{ py: 2 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight="bold" color="error.main">
                      {statistics.exceedsBudget}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Over Budget
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'error.light' }}>
                    <TrendingUp />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Bulk Selection Bar */}
      {selectionModel.length > 0 && (
        <Paper elevation={1} sx={{ mx: 3, mb: 2, p: 2 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="body2" color="primary" fontWeight="medium">
              {selectionModel.length} quotation(s) selected
            </Typography>
            <Box display="flex" gap={1}>
              {user?.roles?.includes('ACCOUNT_MANAGER') || user?.roles?.includes('SUPER_ADMIN') ? (
                <>
                  <Button
                    size="small"
                    startIcon={<ApproveIcon />}
                    onClick={() => handleBulkAction('approve')}
                    color="success"
                    variant="outlined"
                  >
                    Bulk Approve
                  </Button>
                  <Button
                    size="small"
                    startIcon={<RejectIcon />}
                    onClick={() => handleBulkAction('reject')}
                    color="error"
                    variant="outlined"
                  >
                    Bulk Reject
                  </Button>
                </>
              ) : (
                <Button
                  size="small"
                  startIcon={<SubmitIcon />}
                  onClick={() => handleBulkAction('submit')}
                  variant="outlined"
                >
                  Bulk Submit
                </Button>
              )}
              <Button
                size="small"
                startIcon={<ExportIcon />}
                onClick={() => handleBulkAction('export')}
                variant="outlined"
              >
                Export Selected
              </Button>
              <Button
                size="small"
                onClick={() => setSelectionModel([])}
                variant="text"
              >
                Clear Selection
              </Button>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Data Grid */}
      <Box sx={{ flexGrow: 1, px: 3, pb: 3 }}>
        <Paper elevation={1} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <DataGrid
            rows={filteredQuotations}
            columns={columns}
            loading={loading}
            paginationMode="server"
            sortingMode="server"
            checkboxSelection
            disableRowSelectionOnClick
            rowSelectionModel={selectionModel}
            onRowSelectionModelChange={setSelectionModel}
            paginationModel={{
              page: pagination.page,
              pageSize: pagination.size
            }}
            onPaginationModelChange={(model) => {
              setFilters({
                ...filters,
                page: model.page,
                size: model.pageSize
              });
            }}
            onSortModelChange={(model) => {
              if (model.length > 0) {
                setFilters({
                  ...filters,
                  sortBy: model[0].field,
                  sortDir: model[0].sort || 'asc'
                });
              }
            }}
            rowCount={pagination.totalElements}
            pageSizeOptions={[10, 25, 50, 100]}
            slots={{ toolbar: GridToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 500 },
              },
            }}
            sx={{
              border: 0,
              '& .MuiDataGrid-main': {
                '& .MuiDataGrid-row': {
                  '&:hover': {
                    backgroundColor: 'action.hover',
                    cursor: 'pointer'
                  }
                },
                '& .MuiDataGrid-cell': {
                  borderColor: 'grey.200',
                  py: 1.5
                }
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: 'grey.50',
                borderColor: 'grey.200'
              },
              '& .MuiDataGrid-footerContainer': {
                backgroundColor: 'grey.50',
                borderColor: 'grey.200'
              }
            }}
            onRowClick={(params) => {
              if (!selectionModel.includes(params.id)) {
                navigate(`/quotations/${params.id}`);
              }
            }}
          />
        </Paper>
      </Box>

      {/* Floating Action Button for Mobile */}
      {(user?.roles?.includes('PROJECT_MANAGER') || user?.roles?.includes('SUPER_ADMIN')) && (
        <Fab
          color="primary"
          aria-label="add"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            display: { xs: 'flex', sm: 'none' }
          }}
          onClick={() => navigate('/quotations/create')}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Filter Dialog */}
      <QuotationFilters
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar sx={{ bgcolor: 'error.light' }}>
              <DeleteIcon />
            </Avatar>
            Delete Quotation
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone. The quotation and all associated data will be permanently deleted.
          </Alert>
          <Typography>
            Are you sure you want to delete quotation <strong>"{selectedQuotation?.description}"</strong>?
          </Typography>
          <Box mt={2} p={2} bgcolor="grey.50" borderRadius={1}>
            <Typography variant="body2" color="text.secondary">
              <strong>Quotation ID:</strong> {selectedQuotation?.id}<br />
              <strong>Project:</strong> {selectedQuotation?.projectName}<br />
              <strong>Amount:</strong> {selectedQuotation ? formatCurrency(selectedQuotation.totalAmount, selectedQuotation.currency) : ''}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete Quotation
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Enhanced Status Chip Component
const QuotationStatusChip: React.FC<{ status: QuotationStatus }> = ({ status }) => {
  const getStatusConfig = (status: QuotationStatus) => {
    switch (status) {
      case QuotationStatus.DRAFT:
        return { color: 'default' as const, icon: <EditIcon sx={{ fontSize: 14 }} /> };
      case QuotationStatus.SUBMITTED:
      case QuotationStatus.PENDING:
        return { color: 'warning' as const, icon: <Schedule sx={{ fontSize: 14 }} /> };
      case QuotationStatus.APPROVED:
        return { color: 'success' as const, icon: <CheckCircle sx={{ fontSize: 14 }} /> };
      case QuotationStatus.REJECTED:
        return { color: 'error' as const, icon: <RejectIcon sx={{ fontSize: 14 }} /> };
      case QuotationStatus.CANCELLED:
        return { color: 'default' as const, icon: <RejectIcon sx={{ fontSize: 14 }} /> };
      default:
        return { color: 'default' as const, icon: null };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Chip
      label={status}
      color={config.color}
      size="small"
      variant="filled"
      icon={config.icon || undefined}
      sx={{
        fontWeight: 'medium',
        '& .MuiChip-icon': {
          marginLeft: 1
        }
      }}
    />
  );
};

export default QuotationListPage;