// src/pages/quotations/QuotationDetailsPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Chip,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Breadcrumbs,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Send as SubmitIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  FileDownload as ExportIcon,
  FileDownload,
  Print as PrintIcon,
  Assignment,
  AttachMoney,
  Schedule,
  Person,
  Description,
  Business,
  CalendarToday,
  CheckCircle,
  Cancel,
  Info,
  Dashboard,
  Refresh
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { quotationService } from '../../services/quotation/quotationService';
import { Quotation, QuotationStatus } from '../../types/quotation/quotation';
import { formatCurrency, formatDate } from '../../utils/quotations/quotationFormatters';
import { QuotationDocuments } from '../../components/documents';

const QuotationDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [approveComments, setApproveComments] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    if (id) {
      loadQuotation();
    }
  }, [id]);

  const loadQuotation = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await quotationService.getQuotation(parseInt(id!));
      setQuotation(data);
    } catch (err) {
      setError('Failed to load quotation details');
      console.error('Error loading quotation:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!quotation) return;
    
    try {
      setActionLoading(true);
      await quotationService.submitQuotation(quotation.id);
      await loadQuotation();
    } catch (err) {
      console.error('Error submitting quotation:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!quotation) return;
    
    try {
      setActionLoading(true);
      await quotationService.approveQuotation(quotation.id, approveComments);
      setApproveDialogOpen(false);
      setApproveComments('');
      await loadQuotation();
    } catch (err) {
      console.error('Error approving quotation:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!quotation || !rejectReason.trim()) return;
    
    try {
      setActionLoading(true);
      await quotationService.rejectQuotation(quotation.id, rejectReason);
      setRejectDialogOpen(false);
      setRejectReason('');
      await loadQuotation();
    } catch (err) {
      console.error('Error rejecting quotation:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!quotation) return;
    
    try {
      setActionLoading(true);
      await quotationService.deleteQuotation(quotation.id);
      navigate('/quotations');
    } catch (err) {
      console.error('Error deleting quotation:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleExport = async () => {
    if (!quotation) return;
    
    try {
      const blob = await quotationService.exportQuotations({ projectId: [quotation.projectId] }, 'pdf');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `quotation_${quotation.id}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting quotation:', err);
    }
  };

  const getStatusConfig = (status: QuotationStatus) => {
    switch (status) {
      case QuotationStatus.DRAFT:
        return { color: 'default' as const, icon: <EditIcon />, label: 'Draft' };
      case QuotationStatus.SUBMITTED:
      case QuotationStatus.PENDING:
        return { color: 'warning' as const, icon: <Schedule />, label: 'Pending Approval' };
      case QuotationStatus.APPROVED:
        return { color: 'success' as const, icon: <CheckCircle />, label: 'Approved' };
      case QuotationStatus.REJECTED:
        return { color: 'error' as const, icon: <Cancel />, label: 'Rejected' };
      case QuotationStatus.CANCELLED:
        return { color: 'default' as const, icon: <Cancel />, label: 'Cancelled' };
      default:
        return { color: 'default' as const, icon: <Info />, label: status };
    }
  };

  const canEdit = quotation?.status === QuotationStatus.DRAFT && 
    (user?.roles?.includes('PROJECT_MANAGER') || user?.roles?.includes('SUPER_ADMIN'));
  
  const canSubmit = quotation?.status === QuotationStatus.DRAFT && 
    (user?.roles?.includes('PROJECT_MANAGER') || user?.roles?.includes('SUPER_ADMIN'));
  
  const canApprove = quotation?.status === QuotationStatus.PENDING && 
    (user?.roles?.includes('ACCOUNT_MANAGER') || user?.roles?.includes('SUPER_ADMIN'));
  
  const canReject = quotation?.status === QuotationStatus.PENDING && 
    (user?.roles?.includes('ACCOUNT_MANAGER') || user?.roles?.includes('SUPER_ADMIN'));
  
  const canDelete = quotation?.status === QuotationStatus.DRAFT && 
    (user?.roles?.includes('PROJECT_MANAGER') || user?.roles?.includes('SUPER_ADMIN'));

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !quotation || !quotation.projectName || !quotation.createdBy) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Quotation not found or incomplete data'}
        </Alert>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/quotations')}>
          Back to Quotations
        </Button>
      </Box>
    );
  }

  const statusConfig = getStatusConfig(quotation.status);

  return (
    <Box sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: '#f8fafc',
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
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link 
            sx={{ 
              color: '#64748b',
              textDecoration: 'none',
              display: 'flex', 
              alignItems: 'center', 
              gap: 0.5,
              '&:hover': { color: '#3b82f6' }
            }}
            href="/dashboard" 
            onClick={(e) => {
              e.preventDefault();
              navigate('/dashboard');
            }}
          >
            <Dashboard sx={{ fontSize: 16 }} />
            Dashboard
          </Link>
          <Link 
            sx={{ 
              color: '#64748b',
              textDecoration: 'none',
              '&:hover': { color: '#3b82f6' }
            }}
            href="/quotations" 
            onClick={(e) => {
              e.preventDefault();
              navigate('/quotations');
            }}
          >
            Quotations
          </Link>
          <Typography sx={{ color: '#1a202c', fontWeight: 500 }}>
            Quotation #{quotation.id}
          </Typography>
        </Breadcrumbs>

        {/* Main Header */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box sx={{ flex: 1 }}>
            <Box display="flex" alignItems="center" gap={2} mb={1}>
              <Typography 
                variant="h4" 
                component="h1" 
                fontWeight={700}
                sx={{ 
                  color: '#1a202c',
                  fontSize: '1.875rem',
                  letterSpacing: '-0.025em',
                }}
              >
                Quotation #{quotation.id}
              </Typography>
              <Chip
                icon={statusConfig.icon}
                label={statusConfig.label}
                color={statusConfig.color}
                variant="filled"
                sx={{ fontWeight: 'medium' }}
              />
            </Box>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#64748b',
                fontSize: '1.125rem',
                fontWeight: 500,
                mb: 1
              }}
            >
              {quotation.description}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#64748b',
                fontSize: '0.875rem'
              }}
            >
              Project: {quotation.projectName || 'Loading...'} • Created {formatDate(quotation.createdDate)}
            </Typography>
          </Box>
          
          <Box display="flex" gap={1} alignItems="center">
            <Tooltip title="Refresh">
              <IconButton 
                onClick={loadQuotation} 
                disabled={loading}
                sx={{ 
                  bgcolor: '#f1f5f9',
                  color: '#475569',
                  '&:hover': { 
                    bgcolor: '#e2e8f0',
                    color: '#334155'
                  }
                }}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Export PDF">
              <IconButton 
                onClick={handleExport}
                sx={{ 
                  bgcolor: '#f1f5f9',
                  color: '#475569',
                  '&:hover': { 
                    bgcolor: '#e2e8f0',
                    color: '#334155'
                  }
                }}
              >
                <ExportIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Print">
              <IconButton 
                onClick={() => window.print()}
                sx={{ 
                  bgcolor: '#f1f5f9',
                  color: '#475569',
                  '&:hover': { 
                    bgcolor: '#e2e8f0',
                    color: '#334155'
                  }
                }}
              >
                <PrintIcon />
              </IconButton>
            </Tooltip>

            {canEdit && (
              <Button
                startIcon={<EditIcon />}
                onClick={() => navigate(`/quotations/${quotation.id}/edit`)}
                variant="outlined"
                sx={{ 
                  borderColor: '#d1d5db',
                  color: '#374151',
                  borderRadius: '8px',
                  '&:hover': {
                    borderColor: '#9ca3af',
                    backgroundColor: '#f9fafb'
                  }
                }}
              >
                Edit
              </Button>
            )}

            {canSubmit && (
              <Button
                startIcon={<SubmitIcon />}
                onClick={handleSubmit}
                disabled={actionLoading}
                variant="contained"
                sx={{ 
                  bgcolor: '#3b82f6',
                  color: '#ffffff',
                  fontWeight: 600,
                  borderRadius: '8px',
                  '&:hover': { 
                    bgcolor: '#2563eb',
                  }
                }}
              >
                Submit for Approval
              </Button>
            )}

            {canApprove && (
              <Button
                startIcon={<ApproveIcon />}
                onClick={() => setApproveDialogOpen(true)}
                variant="contained"
                color="success"
                sx={{ 
                  fontWeight: 600,
                  borderRadius: '8px',
                }}
              >
                Approve
              </Button>
            )}

            {canReject && (
              <Button
                startIcon={<RejectIcon />}
                onClick={() => setRejectDialogOpen(true)}
                variant="contained"
                color="error"
                sx={{ 
                  fontWeight: 600,
                  borderRadius: '8px',
                }}
              >
                Reject
              </Button>
            )}

            {canDelete && (
              <Button
                startIcon={<DeleteIcon />}
                onClick={() => setDeleteDialogOpen(true)}
                variant="outlined"
                color="error"
                sx={{ 
                  borderColor: '#ef4444',
                  color: '#ef4444',
                  borderRadius: '8px',
                  '&:hover': {
                    borderColor: '#dc2626',
                    backgroundColor: '#fef2f2'
                  }
                }}
              >
                Delete
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Content */}
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Grid container spacing={3}>
          {/* Main Content */}
          <Grid item xs={12} lg={8}>
            {/* Quotation Details */}
            <Card sx={{ mb: 3, borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1a202c' }}>
                  Quotation Details
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <List dense>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <Assignment sx={{ color: '#64748b' }} />
                        </ListItemIcon>
                        <ListItemText
                          primary="Description"
                          secondary={quotation.description}
                          primaryTypographyProps={{ fontWeight: 'medium' }}
                        />
                      </ListItem>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <Business sx={{ color: '#64748b' }} />
                        </ListItemIcon>
                        <ListItemText
                          primary="Project"
                          secondary={quotation.projectName || 'Loading...'}
                          primaryTypographyProps={{ fontWeight: 'medium' }}
                        />
                      </ListItem>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <Person sx={{ color: '#64748b' }} />
                        </ListItemIcon>
                        <ListItemText
                          primary="Created By"
                          secondary={quotation.createdBy || 'Unknown'}
                          primaryTypographyProps={{ fontWeight: 'medium' }}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <List dense>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <CalendarToday sx={{ color: '#64748b' }} />
                        </ListItemIcon>
                        <ListItemText
                          primary="Created Date"
                          secondary={formatDate(quotation.createdDate)}
                          primaryTypographyProps={{ fontWeight: 'medium' }}
                        />
                      </ListItem>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <CalendarToday sx={{ color: '#64748b' }} />
                        </ListItemIcon>
                        <ListItemText
                          primary="Last Modified"
                          secondary={formatDate(quotation.createdDate)}
                          primaryTypographyProps={{ fontWeight: 'medium' }}
                        />
                      </ListItem>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <AttachMoney sx={{ color: '#64748b' }} />
                        </ListItemIcon>
                        <ListItemText
                          primary="Total Amount"
                          secondary={formatCurrency(quotation.totalAmount, quotation.currency)}
                          primaryTypographyProps={{ fontWeight: 'medium' }}
                          secondaryTypographyProps={{ 
                            fontWeight: 'bold', 
                            color: quotation.exceedsBudget ? 'error.main' : 'text.primary' 
                          }}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Line Items */}
            <Card sx={{ mb: 3, borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1a202c' }}>
                  Line Items ({quotation.items?.length || 0})
                </Typography>
                
                {quotation.items && quotation.items.length > 0 ? (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Item</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Description</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, color: '#374151' }}>Quantity</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, color: '#374151' }}>Unit Price</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, color: '#374151' }}>Total</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {quotation.items.map((item: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell>{item.itemName}</TableCell>
                            <TableCell>{item.description}</TableCell>
                            <TableCell align="right">{item.quantity}</TableCell>
                            <TableCell align="right">{formatCurrency(item.unitPrice, quotation.currency)}</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'medium' }}>
                              {formatCurrency(item.quantity * item.unitPrice, quotation.currency)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    No line items found
                  </Typography>
                )}
              </CardContent>
            </Card>

            {/* Documents */}
            {quotation.documents && quotation.documents.length > 0 && (
              <Card sx={{ mb: 3, borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1a202c' }}>
                    Attached Documents ({quotation.documents.length})
                  </Typography>
                  
                  <List>
                    {quotation.documents.map((doc, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon>
                          <Description sx={{ color: '#64748b' }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={doc.fileName}
                          secondary={`${doc.fileSize} • ${doc.uploadedAt}`}
                          primaryTypographyProps={{ fontWeight: 'medium' }}
                        />
                        <IconButton size="small">
                          <FileDownload />
                        </IconButton>
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            )}

            {/* Documents Section */}
            <Card sx={{ mb: 3, borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <CardContent sx={{ p: 3 }}>
                {id && !isNaN(parseInt(id)) && (
                  <QuotationDocuments 
                    quotationId={parseInt(id)} 
                    onDocumentUpload={() => {
                      // Refresh quotation data if needed
                      console.log('Document uploaded for quotation');
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} lg={4}>
            {/* Summary Card */}
            <Card sx={{ mb: 3, borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1a202c' }}>
                  Summary
                </Typography>
                
                <List dense>
                  <ListItem sx={{ px: 0, py: 1 }}>
                    <ListItemText
                      primary="Subtotal"
                      secondary={formatCurrency(
                        quotation.items?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0, 
                        quotation.currency
                      )}
                      primaryTypographyProps={{ fontSize: '0.875rem', color: '#64748b' }}
                      secondaryTypographyProps={{ fontWeight: 'medium' }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0, py: 1 }}>
                    <ListItemText
                      primary="Tax Amount"
                      secondary={formatCurrency(0, quotation.currency)}
                      primaryTypographyProps={{ fontSize: '0.875rem', color: '#64748b' }}
                      secondaryTypographyProps={{ fontWeight: 'medium' }}
                    />
                  </ListItem>
                  <Divider sx={{ my: 1 }} />
                  <ListItem sx={{ px: 0, py: 1 }}>
                    <ListItemText
                      primary="Total Amount"
                      secondary={formatCurrency(quotation.totalAmount, quotation.currency)}
                      primaryTypographyProps={{ fontSize: '0.875rem', color: '#64748b' }}
                      secondaryTypographyProps={{ 
                        fontWeight: 'bold', 
                        fontSize: '1.125rem',
                        color: quotation.exceedsBudget ? 'error.main' : '#1a202c'
                      }}
                    />
                  </ListItem>
                </List>

                {quotation.exceedsBudget && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    This quotation exceeds the project budget
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Status History */}
            <Card sx={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1a202c' }}>
                  Status History
                </Typography>
                
                <List dense>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <EditIcon sx={{ color: '#64748b' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Created"
                      secondary={formatDate(quotation.createdDate)}
                      primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 'medium' }}
                      secondaryTypographyProps={{ fontSize: '0.75rem', color: '#64748b' }}
                    />
                  </ListItem>
                  
                  {quotation.submittedDate && (
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <SubmitIcon sx={{ color: '#64748b' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Submitted"
                        secondary={formatDate(quotation.submittedDate)}
                        primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 'medium' }}
                        secondaryTypographyProps={{ fontSize: '0.75rem', color: '#64748b' }}
                      />
                    </ListItem>
                  )}
                  
                  {quotation.approvedDate && (
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <ApproveIcon sx={{ color: '#16a34a' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Approved"
                        secondary={formatDate(quotation.approvedDate)}
                        primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 'medium' }}
                        secondaryTypographyProps={{ fontSize: '0.75rem', color: '#64748b' }}
                      />
                    </ListItem>
                  )}
                  
                  {quotation.status === QuotationStatus.REJECTED && quotation.rejectionReason && (
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <RejectIcon sx={{ color: '#dc2626' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Rejected"
                        secondary={quotation.rejectionReason}
                        primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 'medium' }}
                        secondaryTypographyProps={{ fontSize: '0.75rem', color: '#64748b' }}
                      />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Action Dialogs */}
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
            Are you sure you want to delete quotation <strong>"{quotation.description}"</strong>?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            variant="contained"
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={20} /> : 'Delete Quotation'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog 
        open={approveDialogOpen} 
        onClose={() => setApproveDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar sx={{ bgcolor: 'success.light' }}>
              <ApproveIcon />
            </Avatar>
            Approve Quotation
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Are you sure you want to approve this quotation? This action will make it available for payment processing.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Comments (Optional)"
            value={approveComments}
            onChange={(e) => setApproveComments(e.target.value)}
            placeholder="Add any comments about this approval..."
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setApproveDialogOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button 
            onClick={handleApprove} 
            color="success" 
            variant="contained"
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={20} /> : 'Approve Quotation'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog 
        open={rejectDialogOpen} 
        onClose={() => setRejectDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar sx={{ bgcolor: 'error.light' }}>
              <RejectIcon />
            </Avatar>
            Reject Quotation
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Please provide a reason for rejecting this quotation.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Rejection Reason *"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Please explain why this quotation is being rejected..."
            error={!rejectReason.trim()}
            helperText={!rejectReason.trim() ? 'Rejection reason is required' : ''}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRejectDialogOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button 
            onClick={handleReject} 
            color="error" 
            variant="contained"
            disabled={actionLoading || !rejectReason.trim()}
          >
            {actionLoading ? <CircularProgress size={20} /> : 'Reject Quotation'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuotationDetailsPage;
