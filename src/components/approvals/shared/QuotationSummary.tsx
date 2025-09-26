import React from 'react';
import { Box, Typography } from '@mui/material';
import { ApprovalItem } from '../../../types/approval.types';
import { formatCurrency, formatRelativeTime } from '../../../utils/approvals/approvalUtils';

interface QuotationSummaryProps {
  approval: ApprovalItem;
  showDetails?: boolean;
}

const QuotationSummary: React.FC<QuotationSummaryProps> = ({ 
  approval, 
  showDetails = true 
}) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {approval.quotationNumber}
      </Typography>
      
      <Box display="flex" flexDirection="column" gap={1}>
        <Typography variant="body2">
          <strong>Project:</strong> {approval.projectName}
        </Typography>
        
        <Typography variant="body2">
          <strong>Manager:</strong> {approval.projectManagerName}
        </Typography>
        
        <Typography variant="body2">
          <strong>Amount:</strong> {formatCurrency(approval.totalAmount, approval.currency)}
        </Typography>
        
        {showDetails && (
          <>
            <Typography variant="body2">
              <strong>Submitted:</strong> {formatRelativeTime(approval.submissionDate)}
            </Typography>
            
            <Typography variant="body2">
              <strong>Line Items:</strong> {approval.lineItemCount}
            </Typography>
            
            {approval.description && (
              <Typography variant="body2" color="textSecondary">
                {approval.description}
              </Typography>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default QuotationSummary;