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
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tooltip,
  Fab
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRowSelectionModel,
  GridActionsCellItem,
  GridRowParams
} from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Send as SubmitIcon,
  FileDownload as ExportIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useQuotations } from '../../hooks/quotations/useQuotations';
import { quotationService } from '../../services/quotation/quotationService';
import { QuotationSummary, QuotationStatus } from '../../types/quotation';
import QuotationFilters from '../../components/quotations/QuotationFilters';
import QuotationBulkActions from '../../components/quotations/QuotationBulkActions';
import { formatCurrency, formatDate } from '../../utils/quotations/quotationFormatters';

const QuotationListPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<QuotationSummary | null>(null);
  const [bulkActionAnchor, setBulkActionAnchor] = useState<null | HTMLElement>(null);

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

  // Define columns based on user role
  const columns: GridColDef[] = useMemo(() => {
    const baseColumns: GridColDef[] = [
      {
        field: 'id',
        headerName: 'ID',
        width: 80,
        sortable: true
      },
      {
        field: 'description',
        headerName: 'Description',
        width: 300,
        sortable: true,
        renderCell: (params) => (
          <Tooltip title={params.value}>
            <Typography variant="body2" noWrap>
              {params.value}
            </Typography>
          </Tooltip>
        )
      },
      {
        field: 'projectName',
        headerName: 'Project',
        width: 200,
        sortable: true,
        renderCell: (params) => (
          <Box>
            <Typography variant="body2" fontWeight={500}>
              {params.value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.projectCode}
            </Typography>
          </Box>
        )
      },
      {
        field: 'totalAmount',
        headerName: 'Amount',
        width: 150,
        sortable: true,
        renderCell: (params) => (
          <Box textAlign="right">
            <Typography variant="body2" fontWeight={500}>
              {formatCurrency(params.value, params.row.currency)}
            </Typography>
            {params.row.exceedsBudget && (
              <Chip
                label="Exceeds Budget"
                color="error"
                size="small"
                variant="outlined"
              />
            )}
          </Box>
        )
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 120,
        sortable: true,
        renderCell: (params) => (
          <QuotationStatusChip status={params.value} />
        )
      },
      {
        field: 'createdDate',
        headerName: 'Created',
        width: 120,
        sortable: true,
        renderCell: (params) => (
          <Typography variant="body2">
            {formatDate(params.value)}
          </Typography>
        )
      },
      {
        field: 'itemCount',
        headerName: 'Items',
        width: 80,
        sortable: false,
        align: 'center',
        renderCell: (params) => (
          <Chip
            label={params.value}
            size="small"
            variant="outlined"
          />
        )
      }
    ];

    // Add creator column for admins and account managers
    if (user?.roles?.includes('SUPER_ADMIN') || user?.roles?.includes('ACCOUNT_MANAGER')) {
      baseColumns.push({
        field: 'createdByName',
        headerName: 'Created By',
        width: 150,
        sortable: true
      });
    }

    // Add actions column
    baseColumns.push({
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 150,
      getActions: (params: GridRowParams<QuotationSummary>) => {
        const actions = [];

        // View action
        actions.push(
          <GridActionsCellItem
            icon={<ViewIcon />}
            label="View"
            onClick={() => navigate(`/quotations/${params.id}`)}
          />
        );

        // Edit action (only for drafts and own quotations)
        if (params.row.status === QuotationStatus.DRAFT && 
            (user?.roles?.includes('PROJECT_MANAGER') || user?.roles?.includes('SUPER_ADMIN'))) {
          actions.push(
            <GridActionsCellItem
              icon={<EditIcon />}
              label="Edit"
              onClick={() => navigate(`/quotations/${params.id}/edit`)}
            />
          );
        }

        // Submit action (only for drafts)
        if (params.row.status === QuotationStatus.DRAFT && 
            (user?.roles?.includes('PROJECT_MANAGER') || user?.roles?.includes('SUPER_ADMIN'))) {
          actions.push(
            <GridActionsCellItem
              icon={<SubmitIcon />}
              label="Submit"
              onClick={() => handleSubmitQuotation(params.row)}
            />
          );
        }

        // Approval actions (only for account managers on pending quotations)
        if (params.row.status === QuotationStatus.PENDING && 
            (user?.roles?.includes('ACCOUNT_MANAGER') || user?.roles?.includes('SUPER_ADMIN'))) {
          actions.push(
            <GridActionsCellItem
              icon={<ApproveIcon />}
              label="Approve"
              onClick={() => handleApproveQuotation(params.row)}
              color="success"
            />,
            <GridActionsCellItem
              icon={<RejectIcon />}
              label="Reject"
              onClick={() => handleRejectQuotation(params.row)}
              color="error"
            />
          );
        }

        // Delete action (only for drafts)
        if (params.row.status === QuotationStatus.DRAFT && 
            (user?.roles?.includes('PROJECT_MANAGER') || user?.roles?.includes('SUPER_ADMIN'))) {
          actions.push(
            <GridActionsCellItem
              icon={<DeleteIcon />}
              label="Delete"
              onClick={() => handleDeleteQuotation(params.row)}
              color="error"
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
    setBulkActionAnchor(null);
    // Handle bulk actions based on selection
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
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Quotations
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <QuotationBulkActions
            selectedQuotations={quotations.filter((_, index) => selectionModel.includes(index))}
            onActionComplete={() => {
              refreshQuotations();
              setSelectionModel([]);
            }}
            onError={(error) => {
              console.error('Bulk action error:', error);
              // You could show a toast notification here
            }}
          />
          <Button
            startIcon={<FilterIcon />}
            onClick={() => setFilterOpen(true)}
            variant="outlined"
          >
            Filters
          </Button>
          <Button
            startIcon={<ExportIcon />}
            onClick={handleExport}
            variant="outlined"
          >
            Export
          </Button>
          {(user?.roles?.includes('PROJECT_MANAGER') || user?.roles?.includes('SUPER_ADMIN')) && (
            <Button
              startIcon={<AddIcon />}
              onClick={() => navigate('/quotations/create')}
              variant="contained"
            >
              Create Quotation
            </Button>
          )}
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => {}}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="primary">
              {pagination.totalElements}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Quotations
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="warning.main">
              {quotations.filter(q => q.status === QuotationStatus.PENDING).length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pending Approval
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="success.main">
              {quotations.filter(q => q.status === QuotationStatus.APPROVED).length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Approved
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="error.main">
              {quotations.filter(q => q.exceedsBudget).length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Exceed Budget
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Bulk Actions */}
      {selectionModel.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2">
              {selectionModel.length} quotation(s) selected
            </Typography>
            <IconButton
              onClick={(event) => setBulkActionAnchor(event.currentTarget)}
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={bulkActionAnchor}
              open={Boolean(bulkActionAnchor)}
              onClose={() => setBulkActionAnchor(null)}
            >
              {user?.roles?.includes('ACCOUNT_MANAGER') || user?.roles?.includes('SUPER_ADMIN') ? (
                [
                  <MenuItem key="approve" onClick={() => handleBulkAction('approve')}>
                    <ApproveIcon sx={{ mr: 1 }} /> Bulk Approve
                  </MenuItem>,
                  <MenuItem key="reject" onClick={() => handleBulkAction('reject')}>
                    <RejectIcon sx={{ mr: 1 }} /> Bulk Reject
                  </MenuItem>
                ]
              ) : (
                <MenuItem onClick={() => handleBulkAction('submit')}>
                  <SubmitIcon sx={{ mr: 1 }} /> Bulk Submit
                </MenuItem>
              )}
              <MenuItem onClick={() => handleBulkAction('export')}>
                <ExportIcon sx={{ mr: 1 }} /> Export Selected
              </MenuItem>
            </Menu>
          </Paper>
        </Box>
      )}

      {/* Data Grid */}
      <Paper sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <DataGrid
          rows={quotations}
          columns={columns}
          loading={loading}
          paginationMode="server"
          sortingMode="server"
          filterMode="server"
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
          sx={{
            '& .MuiDataGrid-row:hover': {
              cursor: 'pointer'
            }
          }}
          onRowClick={(params) => {
            if (!selectionModel.includes(params.id)) {
              navigate(`/quotations/${params.id}`);
            }
          }}
        />
      </Paper>

      {/* Floating Action Button for Mobile */}
      {(user?.roles?.includes('PROJECT_MANAGER') || user?.roles?.includes('SUPER_ADMIN')) && (
        <Fab
          color="primary"
          aria-label="add"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
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
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Quotation</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete quotation "{selectedQuotation?.description}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Status Chip Component
const QuotationStatusChip: React.FC<{ status: QuotationStatus }> = ({ status }) => {
  const getStatusColor = (status: QuotationStatus) => {
    switch (status) {
      case QuotationStatus.DRAFT:
        return 'default';
      case QuotationStatus.SUBMITTED:
      case QuotationStatus.PENDING:
        return 'warning';
      case QuotationStatus.APPROVED:
        return 'success';
      case QuotationStatus.REJECTED:
        return 'error';
      case QuotationStatus.CANCELLED:
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Chip
      label={status}
      color={getStatusColor(status)}
      size="small"
      variant="filled"
    />
  );
};

export default QuotationListPage;