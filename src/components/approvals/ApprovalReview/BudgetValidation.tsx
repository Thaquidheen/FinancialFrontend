// components/approvals/ApprovalReview/BudgetValidation.tsx
import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { QuotationDetails as QuotationDetailsType, ApprovalItem } from '../../../types/approval.types';
import { formatCurrency } from '../../../utils/approvals/approvalUtils';

interface BudgetValidationProps {
  quotation: QuotationDetailsType;
  approval: ApprovalItem;
}

export const BudgetValidation: React.FC<BudgetValidationProps> = ({
  quotation,
  approval,
}) => {
  const budgetInfo = quotation.budgetInfo;
  const totalAfterQuotation = budgetInfo.spentAmount + quotation.totalAmount;
  const utilizationAfterQuotation = (totalAfterQuotation / budgetInfo.projectBudget) * 100;
  const remainingAfterQuotation = budgetInfo.projectBudget - totalAfterQuotation;

  const getComplianceStatus = () => {
    if (utilizationAfterQuotation > 100) {
      return {
        status: 'EXCEEDED',
        color: 'error' as const,
        icon: <ErrorIcon />,
        message: 'Budget would be exceeded',
      };
    } else if (utilizationAfterQuotation > 90) {
      return {
        status: 'WARNING',
        color: 'warning' as const,
        icon: <WarningIcon />,
        message: 'Budget utilization would be high',
      };
    } else {
      return {
        status: 'COMPLIANT',
        color: 'success' as const,
        icon: <CheckIcon />,
        message: 'Budget compliant',
      };
    }
  };

  const complianceStatus = getComplianceStatus();

  const renderBudgetOverview = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Budget Overview
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Current Status
              </Typography>
              <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
                <Chip 
                  label={budgetInfo.complianceStatus}
                  color={budgetInfo.complianceStatus === 'COMPLIANT' ? 'success' : 
                         budgetInfo.complianceStatus === 'WARNING' ? 'warning' : 'error'}
                  size="small"
                />
                <Typography variant="body2" color="textSecondary">
                  {budgetInfo.budgetUtilization.toFixed(1)}% utilized
                </Typography>
              </Box>
              
              <LinearProgress
                variant="determinate"
                value={budgetInfo.budgetUtilization}
                color={budgetInfo.complianceStatus === 'COMPLIANT' ? 'success' : 
                       budgetInfo.complianceStatus === 'WARNING' ? 'warning' : 'error'}
                sx={{ height: 8, borderRadius: 4, mb: 2 }}
              />
              
              <Typography variant="body2" color="textSecondary">
                {formatCurrency(budgetInfo.spentAmount, quotation.currency)} of{' '}
                {formatCurrency(budgetInfo.projectBudget, quotation.currency)} spent
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                After Approval
              </Typography>
              <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
                <Chip 
                  label={complianceStatus.status}
                  color={complianceStatus.color}
                  size="small"
                />
                <Typography variant="body2" color="textSecondary">
                  {utilizationAfterQuotation.toFixed(1)}% utilized
                </Typography>
              </Box>
              
              <LinearProgress
                variant="determinate"
                value={Math.min(utilizationAfterQuotation, 100)}
                color={complianceStatus.color}
                sx={{ height: 8, borderRadius: 4, mb: 2 }}
              />
              
              <Typography variant="body2" color="textSecondary">
                {formatCurrency(totalAfterQuotation, quotation.currency)} of{' '}
                {formatCurrency(budgetInfo.projectBudget, quotation.currency)} spent
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const renderFinancialImpact = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Financial Impact
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary">
                Quotation Amount
              </Typography>
              <Typography variant="h6" color="primary">
                {formatCurrency(quotation.totalAmount, quotation.currency)}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary">
                Remaining Budget
              </Typography>
              <Typography variant="h6" color={remainingAfterQuotation >= 0 ? 'success.main' : 'error.main'}>
                {formatCurrency(remainingAfterQuotation, quotation.currency)}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary">
                Utilization Change
              </Typography>
              <Typography variant="h6" color="info.main">
                +{utilizationAfterQuotation - budgetInfo.budgetUtilization}%
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary">
                Final Utilization
              </Typography>
              <Typography variant="h6" color={complianceStatus.color}>
                {utilizationAfterQuotation.toFixed(1)}%
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const renderValidationResults = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Validation Results
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Alert 
            severity={complianceStatus.color === 'success' ? 'success' : 
                     complianceStatus.color === 'warning' ? 'warning' : 'error'}
            icon={complianceStatus.icon}
          >
            <Typography variant="body1" fontWeight="medium">
              {complianceStatus.message}
            </Typography>
            <Typography variant="body2">
              {complianceStatus.status === 'EXCEEDED' 
                ? `This quotation would exceed the project budget by ${formatCurrency(Math.abs(remainingAfterQuotation), quotation.currency)}.`
                : complianceStatus.status === 'WARNING'
                ? `This quotation would bring budget utilization to ${utilizationAfterQuotation.toFixed(1)}%.`
                : `This quotation is within budget limits and would result in ${utilizationAfterQuotation.toFixed(1)}% utilization.`
              }
            </Typography>
          </Alert>
        </Box>
        
        <List dense>
          <ListItem>
            <ListItemIcon>
              <CheckIcon color={budgetInfo.projectBudget > 0 ? 'success' : 'disabled'} />
            </ListItemIcon>
            <ListItemText 
              primary="Project has allocated budget"
              secondary={budgetInfo.projectBudget > 0 ? 'Yes' : 'No'}
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <CheckIcon color={quotation.totalAmount > 0 ? 'success' : 'disabled'} />
            </ListItemIcon>
            <ListItemText 
              primary="Quotation amount is valid"
              secondary={quotation.totalAmount > 0 ? 'Yes' : 'No'}
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              {complianceStatus.status === 'EXCEEDED' ? 
                <ErrorIcon color="error" /> : 
                <CheckIcon color="success" />
              }
            </ListItemIcon>
            <ListItemText 
              primary="Budget compliance check"
              secondary={complianceStatus.message}
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <TrendingUpIcon color="info" />
            </ListItemIcon>
            <ListItemText 
              primary="Budget utilization impact"
              secondary={`${budgetInfo.budgetUtilization.toFixed(1)}% → ${utilizationAfterQuotation.toFixed(1)}%`}
            />
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {renderBudgetOverview()}
      {renderFinancialImpact()}
      {renderValidationResults()}
    </Box>
  );
};