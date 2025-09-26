// src/components/quotations/forms/QuotationReview.tsx
import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Alert,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Edit as EditIcon,
  Description as DescriptionIcon,
  AttachFile as AttachFileIcon,
  AccountBalance as ProjectIcon,
  CurrencyExchange as CurrencyIcon
} from '@mui/icons-material';
import { QuotationFormData, Project } from '@/types/quotation';

interface QuotationReviewProps {
  formData: QuotationFormData;
  onEdit: (step: number) => void;
}

const QuotationReview: React.FC<QuotationReviewProps> = ({ formData, onEdit }) => {
  const getTotalAmount = () => {
    return formData.items.reduce((total, item) => total + item.amount, 0);
  };

  const getProjectInfo = (): Project | null => {
    // In a real app, you'd fetch this from the project service
    // For now, we'll return a mock project or null
    return null;
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  // const formatDate = (dateString: string) => {
  //   return new Date(dateString).toLocaleDateString('en-US', {
  //     year: 'numeric',
  //     month: 'long',
  //     day: 'numeric'
  //   });
  // };

  const getCategoryBreakdown = () => {
    const breakdown: { [key: string]: { count: number; amount: number } } = {};
    
    formData.items.forEach(item => {
      const category = item.category.replace(/_/g, ' ');
      if (!breakdown[category]) {
        breakdown[category] = { count: 0, amount: 0 };
      }
      breakdown[category].count += 1;
      breakdown[category].amount += item.amount;
    });

    return Object.entries(breakdown).map(([category, data]) => ({
      category,
      ...data,
      percentage: (data.amount / getTotalAmount()) * 100
    }));
  };

  const project = getProjectInfo();
  const totalAmount = getTotalAmount();
  const categoryBreakdown = getCategoryBreakdown();

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        Review & Submit
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CurrencyIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  {formatCurrency(totalAmount, formData.currency)}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Total Amount
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <DescriptionIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  {formData.items.length}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Line Items
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AttachFileIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  {formData.documents.length}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Documents
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ProjectIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  {project ? '1' : '0'}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Project
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Basic Information */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Basic Information</Typography>
            <Button
              startIcon={<EditIcon />}
              onClick={() => onEdit(0)}
              size="small"
            >
              Edit
            </Button>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ProjectIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  Project
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {project ? `${project.name} (${project.code})` : 'No project selected'}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CurrencyIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  Currency
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {formData.currency}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <DescriptionIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  Description
                </Typography>
              </Box>
              <Typography variant="body1">
                {formData.description || 'No description provided'}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Line Items Summary */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Line Items Summary</Typography>
            <Button
              startIcon={<EditIcon />}
              onClick={() => onEdit(1)}
              size="small"
            >
              Edit
            </Button>
          </Box>

          {formData.items.length === 0 ? (
            <Alert severity="warning">
              No line items added. Please add at least one line item before submitting.
            </Alert>
          ) : (
            <>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Account Head</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                            {item.description}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="medium">
                            {formatCurrency(item.amount, formData.currency)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={item.category.replace(/_/g, ' ')} 
                            size="small" 
                            color="primary" 
                            variant="outlined" 
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {item.accountHead.replace(/_/g, ' ')}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Category Breakdown */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Category Breakdown
                </Typography>
                <Grid container spacing={2}>
                  {categoryBreakdown.map((item, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                        <Typography variant="body2" color="text.secondary">
                          {item.category}
                        </Typography>
                        <Typography variant="h6">
                          {formatCurrency(item.amount, formData.currency)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.count} items • {item.percentage.toFixed(1)}%
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </>
          )}
        </CardContent>
      </Card>

      {/* Documents Summary */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Documents</Typography>
            <Button
              startIcon={<EditIcon />}
              onClick={() => onEdit(2)}
              size="small"
            >
              Edit
            </Button>
          </Box>

          {formData.documents.length === 0 ? (
            <Alert severity="info">
              No documents attached. Documents are optional but recommended for better record keeping.
            </Alert>
          ) : (
            <List>
              {formData.documents.map((file, index) => (
                <ListItem key={index} divider={index < formData.documents.length - 1}>
                  <ListItemIcon>
                    <AttachFileIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={file.name}
                    secondary={`${(file.size / 1024).toFixed(1)} KB • ${file.type}`}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Final Summary */}
      <Card sx={{ bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}>
        <CardContent>
          <Typography variant="h6" color="primary" gutterBottom>
            Final Summary
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Total Amount
              </Typography>
              <Typography variant="h5" color="primary">
                {formatCurrency(totalAmount, formData.currency)}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Items & Documents
              </Typography>
              <Typography variant="h6">
                {formData.items.length} items • {formData.documents.length} documents
              </Typography>
            </Grid>
          </Grid>
          
          {project && project.remainingBudget < 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Budget Warning:</strong> This project has exceeded its budget by{' '}
                {formatCurrency(Math.abs(project.remainingBudget), project.currency)}.
                This quotation will require special approval.
              </Typography>
            </Alert>
          )}

          <Divider sx={{ my: 2 }} />
          
          <Typography variant="body2" color="text.secondary">
            Review all information above before submitting. Once submitted, this quotation will be sent for approval.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default QuotationReview;
