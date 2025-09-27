import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  IconButton,
  Tooltip,
  Stack,
  Grid,
  Collapse,
  Divider,
  Paper,
  InputAdornment,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  ExpandLess,
  ExpandMore,
  Delete,
  Category,
  ViewList,
  ViewModule,
  MoreVert,
} from '@mui/icons-material';
import { Helmet } from 'react-helmet-async';
import { DocumentSearchParams, DocumentCategory } from '../../types/document';
import { DocumentList, DocumentUpload, DocumentPreview } from '../../components/documents';
import { 
  useDocuments, 
  useDocumentStats, 
  useBulkDocumentDelete,
  useBulkDocumentCategoryUpdate 
} from '../../hooks/useDocuments';
import { useAuth } from '../../hooks/useAuth';
import { canUserPerformBulkOperations, canUserAccessDocuments } from '../../utils/documentPermissions';
import { formatFileSize } from '../../utils/documentUtils';
import { MetricsCard } from '@components/dashboard/MetricsCard';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`documents-tabpanel-${index}`}
      aria-labelledby={`documents-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const DocumentsPage: React.FC = () => {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);
  const [previewDocument, setPreviewDocument] = useState<any>(null);
  const [bulkCategoryDialog, setBulkCategoryDialog] = useState(false);
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    categories: [] as DocumentCategory[],
    tags: [] as string[],
    dateRange: 'all' as 'all' | 'today' | 'week' | 'month' | 'year',
  });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'info' });

  const [searchParams, setSearchParams] = useState<DocumentSearchParams>({
    page: 0,
    size: 12,
    sortBy: 'uploadDate',
    sortDir: 'desc'
  });

  const { data: documentsData, isLoading, refetch } = useDocuments(searchParams);
  const { data: stats } = useDocumentStats();
  const bulkDeleteMutation = useBulkDocumentDelete();
  const bulkCategoryMutation = useBulkDocumentCategoryUpdate();

  const documents = documentsData?.content || [];
  const totalPages = documentsData?.totalPages || 0;
  const currentPage = documentsData?.number || 0;

  useEffect(() => {
    if (user && !canUserAccessDocuments(user)) {
      // Redirect or show access denied
      return;
    }
  }, [user]);


  const handleSearch = () => {
    setSearchParams(prev => ({
      ...prev,
      searchTerm: searchQuery,
      page: 0,
    }));
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchParams(prev => ({
      ...prev,
      searchTerm: undefined,
      page: 0,
    }));
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setSearchParams(prev => ({
      ...prev,
      categories: newFilters.categories,
      tags: newFilters.tags,
      page: 0,
    }));
  };

  const handlePageChange = (page: number) => {
    setSearchParams(prev => ({
      ...prev,
      page: page - 1 // Convert to 0-based index
    }));
  };

  const handleDocumentClick = (document: any) => {
    setPreviewDocument(document);
  };

  const handleDocumentDownload = () => {
    // Download logic is handled in DocumentList component
  };


  const handleBulkCategoryUpdate = async (category: DocumentCategory) => {
    try {
      await bulkCategoryMutation.mutateAsync({ ids: selectedDocuments, category });
      setSelectedDocuments([]);
      setBulkCategoryDialog(false);
      refetch();
      setSnackbar({
        open: true,
        message: 'Document categories updated successfully',
        severity: 'success',
      });
    } catch (error) {
      console.error('Bulk category update failed:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update document categories',
        severity: 'error',
      });
    }
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDeleteMutation.mutateAsync(selectedDocuments);
      setSelectedDocuments([]);
      setBulkDeleteDialog(false);
      refetch();
      setSnackbar({
        open: true,
        message: 'Documents deleted successfully',
        severity: 'success',
      });
    } catch (error) {
      console.error('Bulk delete failed:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete documents',
        severity: 'error',
      });
    }
  };

  const handleUploadComplete = () => {
    refetch();
    setSelectedDocuments([]);
    setSnackbar({
      open: true,
      message: 'Documents uploaded successfully',
      severity: 'success',
    });
  };

  const canPerformBulkOps = user ? canUserPerformBulkOperations(user) : false;
  const canUploadDocuments = user ? canUserAccessDocuments(user) : false;

  return (
    <>
      <Helmet>
        <title>Document Management - Financial Management System</title>
      </Helmet>

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
          <Stack 
            direction="row" 
            justifyContent="space-between" 
            alignItems="center"
          >
            <Box>
              <Typography 
                variant="h4" 
                component="h1" 
                fontWeight={700}
                sx={{ 
                  color: '#1a202c',
                  fontSize: '1.875rem',
                  letterSpacing: '-0.025em'
                }}
              >
                Document Management
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  mt: 0.5,
                  color: '#64748b',
                  fontSize: '0.875rem'
                }}
              >
                Upload, organize, and manage your documents
              </Typography>
            </Box>

            <Stack direction="row" spacing={1}>
              <Tooltip title="Refresh Data">
                <IconButton 
                  onClick={() => refetch()}
                  disabled={isLoading}
                  sx={{ 
                    bgcolor: '#f1f5f9',
                    color: '#475569',
                    '&:hover': { 
                      bgcolor: '#e2e8f0',
                      color: '#334155'
                    }
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Toggle View">
                <IconButton 
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  sx={{ 
                    bgcolor: '#f1f5f9',
                    color: '#475569',
                    '&:hover': { 
                      bgcolor: '#e2e8f0',
                      color: '#334155'
                    }
                  }}
                >
                  {viewMode === 'grid' ? <ViewList /> : <ViewModule />}
                </IconButton>
              </Tooltip>
              
              {canUploadDocuments && (
                <DocumentUpload onUploadComplete={handleUploadComplete} />
              )}
            </Stack>
          </Stack>
        </Paper>

        {/* Main Content Area */}
        <Box sx={{ flex: 1, overflow: 'hidden', p: 3 }}>
          <Stack spacing={3} sx={{ height: '100%' }}>
            {/* Statistics Cards */}
            {stats && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <MetricsCard
                    title="Total Documents"
                    value={{
                      current: stats.totalDocuments || 0,
                      format: 'number',
                    }}
                    color="primary"
                    icon={AddIcon}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <MetricsCard
                    title="Total Size"
                    value={{
                      current: stats.totalSize || 0,
                      format: 'number',
                    }}
                    color="success"
                    icon={AddIcon}
                    subtitle={formatFileSize(stats.totalSize || 0)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <MetricsCard
                    title="Recent Uploads"
                    value={{
                      current: stats.recentUploads?.length || 0,
                      format: 'number',
                    }}
                    color="warning"
                    icon={AddIcon}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <MetricsCard
                    title="Most Accessed"
                    value={{
                      current: stats.mostAccessed?.length || 0,
                      format: 'number',
                    }}
                    color="info"
                    icon={AddIcon}
                  />
                </Grid>
              </Grid>
            )}

            {/* Search and Filters Card */}
            <Card 
              elevation={0}
              sx={{
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                bgcolor: '#ffffff',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              }}
            >
              <CardContent sx={{ pb: showFilters ? 2 : 1, p: 3 }}>
                {/* Search Row */}
                <Stack 
                  direction={{ xs: 'column', md: 'row' }} 
                  spacing={2} 
                  alignItems={{ md: 'center' }}
                  sx={{ mb: showFilters ? 2 : 0 }}
                >
                  <TextField
                    placeholder="Search by filename, description, or content..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ 
                      flex: 1,
                      '& .MuiOutlinedInput-root': {
                        bgcolor: '#ffffff',
                        borderColor: '#d1d5db',
                        borderRadius: '8px',
                        '&:hover': {
                          borderColor: '#9ca3af',
                        },
                        '&.Mui-focused': {
                          borderColor: '#3b82f6',
                          boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                        }
                      },
                      '& .MuiInputBase-input': {
                        color: '#374151',
                        fontSize: '0.875rem',
                      }
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: '#9ca3af' }} />
                        </InputAdornment>
                      ),
                      endAdornment: searchQuery && (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={handleClearSearch}
                            edge="end"
                            sx={{ color: '#9ca3af' }}
                          >
                            <ClearIcon />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch();
                      }
                    }}
                  />
                  
                  <Stack direction="row" spacing={1}>
                    <Button 
                      variant="contained" 
                      onClick={handleSearch}
                      disabled={!searchQuery.trim()}
                      sx={{ 
                        minWidth: 100,
                        bgcolor: '#3b82f6',
                        color: '#ffffff',
                        fontWeight: 600,
                        borderRadius: '8px',
                        '&:hover': { 
                          bgcolor: '#2563eb',
                        },
                        '&:disabled': {
                          bgcolor: '#e5e7eb',
                          color: '#9ca3af'
                        }
                      }}
                    >
                      Search
                    </Button>
                    
                    <Button
                      variant="outlined"
                      startIcon={<FilterListIcon />}
                      endIcon={showFilters ? <ExpandLess /> : <ExpandMore />}
                      onClick={() => setShowFilters(!showFilters)}
                      sx={{ 
                        minWidth: 100,
                        borderColor: '#d1d5db',
                        color: '#374151',
                        borderRadius: '8px',
                        '&:hover': {
                          borderColor: '#9ca3af',
                          backgroundColor: '#f9fafb'
                        }
                      }}
                    >
                      Filters
                    </Button>
                  </Stack>
                </Stack>

                {/* Filters Section */}
                <Collapse in={showFilters}>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Categories</InputLabel>
                        <Select
                          multiple
                          value={filters.categories}
                          onChange={(e) => handleFilterChange({ 
                            ...filters, 
                            categories: e.target.value as DocumentCategory[] 
                          })}
                          input={<OutlinedInput label="Categories" />}
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map((value) => (
                                <Chip 
                                  key={value} 
                                  label={value.replace(/_/g, ' ')} 
                                  size="small"
                                  variant="outlined"
                                />
                              ))}
                            </Box>
                          )}
                        >
                          {Object.values(DocumentCategory).map((category) => (
                            <MenuItem key={category} value={category}>
                              {category.replace(/_/g, ' ')}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Date Range</InputLabel>
                        <Select
                          value={filters.dateRange}
                          label="Date Range"
                          onChange={(e) => handleFilterChange({ 
                            ...filters, 
                            dateRange: e.target.value as typeof filters.dateRange
                          })}
                        >
                          <MenuItem value="all">All Time</MenuItem>
                          <MenuItem value="today">Today</MenuItem>
                          <MenuItem value="week">This Week</MenuItem>
                          <MenuItem value="month">This Month</MenuItem>
                          <MenuItem value="year">This Year</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => {
                            setFilters({
                              categories: [],
                              tags: [],
                              dateRange: 'all',
                            });
                            handleFilterChange({
                              categories: [],
                              tags: [],
                              dateRange: 'all',
                            });
                          }}
                        >
                          Clear Filters
                        </Button>
                      </Stack>
                    </Grid>
                  </Grid>
                </Collapse>
              </CardContent>
            </Card>

            {/* Bulk Actions */}
            {selectedDocuments.length > 0 && canPerformBulkOps && (
              <Paper 
                elevation={0}
                sx={{ 
                  p: 2, 
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  bgcolor: '#fef3c7',
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1" sx={{ color: '#92400e', fontWeight: 600 }}>
                    {selectedDocuments.length} document(s) selected
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      startIcon={<Category />}
                      onClick={() => setBulkCategoryDialog(true)}
                      sx={{ 
                        borderColor: '#d97706',
                        color: '#92400e',
                        '&:hover': {
                          borderColor: '#b45309',
                          backgroundColor: '#fef3c7'
                        }
                      }}
                    >
                      Update Category
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<Delete />}
                      onClick={() => setBulkDeleteDialog(true)}
                      sx={{ 
                        borderColor: '#dc2626',
                        color: '#dc2626',
                        '&:hover': {
                          borderColor: '#b91c1c',
                          backgroundColor: '#fef2f2'
                        }
                      }}
                    >
                      Delete
                    </Button>
                    <IconButton>
                      <MoreVert />
                    </IconButton>
                  </Stack>
                </Box>
              </Paper>
            )}

            {/* Main Content */}
            <Card 
              elevation={0}
              sx={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column',
                overflow: 'hidden',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                bgcolor: '#ffffff',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              }}
            >
              <Box sx={{ borderBottom: '1px solid #e2e8f0' }}>
                <Tabs 
                  value={currentTab} 
                  onChange={(_, newValue) => setCurrentTab(newValue)}
                  sx={{
                    '& .MuiTab-root': {
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      color: '#64748b',
                      '&.Mui-selected': {
                        color: '#3b82f6',
                      }
                    },
                    '& .MuiTabs-indicator': {
                      backgroundColor: '#3b82f6',
                    }
                  }}
                >
                  <Tab label="All Documents" />
                  <Tab label="Recent" />
                  <Tab label="Most Accessed" />
                </Tabs>
              </Box>

              <Box sx={{ flex: 1, overflow: 'hidden' }}>
                <TabPanel value={currentTab} index={0}>
                  <DocumentList
                    documents={documents}
                    loading={isLoading}
                    totalPages={totalPages}
                    currentPage={currentPage + 1}
                    onPageChange={handlePageChange}
                    onDocumentClick={handleDocumentClick}
                    onDownload={handleDocumentDownload}
                    showSelection={canPerformBulkOps}
                    selectedDocuments={selectedDocuments}
                    onSelectionChange={setSelectedDocuments}
                  />
                </TabPanel>

                <TabPanel value={currentTab} index={1}>
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                      Recent documents view will be implemented
                    </Alert>
                  </Box>
                </TabPanel>

                <TabPanel value={currentTab} index={2}>
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                      Most accessed documents view will be implemented
                    </Alert>
                  </Box>
                </TabPanel>
              </Box>
            </Card>
          </Stack>
        </Box>

        {/* Document Preview */}
        <DocumentPreview
          document={previewDocument}
          open={!!previewDocument}
          onClose={() => setPreviewDocument(null)}
          onDownload={handleDocumentDownload}
        />

        {/* Bulk Category Update Dialog */}
        <Dialog 
          open={bulkCategoryDialog} 
          onClose={() => setBulkCategoryDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Typography variant="h6" component="div">
              Update Category
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Select a new category for {selectedDocuments.length} document(s):
            </Typography>
            <List>
              {Object.values(DocumentCategory).map(category => (
                <ListItem
                  key={category}
                  button
                  onClick={() => handleBulkCategoryUpdate(category)}
                  sx={{ 
                    borderRadius: 1,
                    '&:hover': { 
                      backgroundColor: '#f8fafc' 
                    }
                  }}
                >
                  <ListItemText primary={category.replace(/_/g, ' ')} />
                </ListItem>
              ))}
            </List>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button 
              onClick={() => setBulkCategoryDialog(false)}
              variant="outlined"
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>

        {/* Bulk Delete Confirmation Dialog */}
        <Dialog 
          open={bulkDeleteDialog} 
          onClose={() => setBulkDeleteDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Typography variant="h6" component="div">
              Delete Documents
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Typography color="text.secondary">
              Are you sure you want to delete {selectedDocuments.length} document(s)? 
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button 
              onClick={() => setBulkDeleteDialog(false)}
              variant="outlined"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleBulkDelete} 
              color="error" 
              variant="contained"
              disabled={bulkDeleteMutation.isLoading}
              sx={{ minWidth: 100 }}
            >
              {bulkDeleteMutation.isLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar Notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            severity={snackbar.severity}
            variant="filled"
            sx={{ borderRadius: 2 }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
};
