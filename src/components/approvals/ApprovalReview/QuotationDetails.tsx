// components/approvals/ApprovalReview/QuotationDetails.tsx
import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Divider,
  Alert,
} from '@mui/material';
import { QuotationDetails as QuotationDetailsType, ApprovalItem } from '../../../types/approval.types';
import { formatCurrency, formatDate } from '../../../utils/approvals/approvalUtils';

interface QuotationDetailsProps {
  quotation: QuotationDetailsType;
  approval: ApprovalItem;
}

export const QuotationDetails: React.FC<QuotationDetailsProps> = ({
  quotation,
  approval,
}) => {
  const renderHeaderInfo = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Quotation Information
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Quotation Number
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {quotation.quotationNumber}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Project
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {quotation.projectName}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Project Manager
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {quotation.projectManagerName}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Submission Date
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {formatDate(quotation.submissionDate, true)}
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Financial Summary
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Total Amount
                </Typography>
                <Typography variant="h5" color="primary" fontWeight="bold">
                  {formatCurrency(quotation.totalAmount, quotation.currency)}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Line Items
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {quotation.lineItems.length} items
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Status
                </Typography>
                <Chip 
                  label={quotation.status} 
                  color={quotation.status === 'SUBMITTED' ? 'warning' : 'default'}
                  size="small"
                />
              </Box>
            </Box>
          </Grid>
        </Grid>
        
        {quotation.description && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Description
              </Typography>
              <Typography variant="body1">
                {quotation.description}
              </Typography>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );

  const renderLineItems = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Line Items
        </Typography>
        
        {quotation.lineItems.length === 0 ? (
          <Typography variant="body2" color="textSecondary">
            No line items available
          </Typography>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Description</TableCell>
                  <TableCell align="center">Quantity</TableCell>
                  <TableCell align="right">Unit Price</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Account Head</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {quotation.lineItems.map((item, index) => (
                  <TableRow key={item.id || index}>
                    <TableCell>
                      <Typography variant="body2">
                        {item.description}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {item.quantity}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(item.unitPrice, quotation.currency)}
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="medium">
                        {formatCurrency(item.totalPrice, quotation.currency)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={item.category} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="textSecondary">
                        {item.accountHead}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );

  const renderBudgetInfo = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Budget Information
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Box textAlign="center">
              <Typography variant="body2" color="textSecondary">
                Project Budget
              </Typography>
              <Typography variant="h6" color="primary">
                {formatCurrency(quotation.budgetInfo.projectBudget, quotation.currency)}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box textAlign="center">
              <Typography variant="body2" color="textSecondary">
                Spent Amount
              </Typography>
              <Typography variant="h6" color="textPrimary">
                {formatCurrency(quotation.budgetInfo.spentAmount, quotation.currency)}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box textAlign="center">
              <Typography variant="body2" color="textSecondary">
                Remaining Budget
              </Typography>
              <Typography variant="h6" color="success.main">
                {formatCurrency(quotation.budgetInfo.remainingBudget, quotation.currency)}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box textAlign="center">
              <Typography variant="body2" color="textSecondary">
                Utilization
              </Typography>
              <Typography variant="h6" color="info.main">
                {quotation.budgetInfo.budgetUtilization.toFixed(1)}%
              </Typography>
            </Box>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Budget Compliance Status
          </Typography>
          <Chip 
            label={quotation.budgetInfo.complianceStatus}
            color={
              quotation.budgetInfo.complianceStatus === 'COMPLIANT' ? 'success' :
              quotation.budgetInfo.complianceStatus === 'WARNING' ? 'warning' : 'error'
            }
            size="small"
          />
        </Box>
        
        {quotation.budgetInfo.wouldExceedBudget && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            This quotation would exceed the project budget by{' '}
            {formatCurrency(quotation.budgetInfo.excessAmount || 0, quotation.currency)}
          </Alert>
        )}
      </CardContent>
    </Card>
  );

  const renderDocuments = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Attached Documents
        </Typography>
        
        {quotation.documents.length === 0 ? (
          <Typography variant="body2" color="textSecondary">
            No documents attached
          </Typography>
        ) : (
          <Box>
            {quotation.documents.map((doc, index) => (
              <Box key={doc.id || index} sx={{ mb: 1 }}>
                <Typography variant="body2">
                  {doc.fileName} ({doc.fileSize} bytes)
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Uploaded: {formatDate(doc.uploadDate, true)}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {renderHeaderInfo()}
      {renderLineItems()}
      {renderBudgetInfo()}
      {renderDocuments()}
    </Box>
  );
};