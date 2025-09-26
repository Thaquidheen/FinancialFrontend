import React from 'react';
import { Tooltip, Box, Typography, Divider } from '@mui/material';
import { ApprovalItem } from '../../../types/approval.types';
import { 
  formatCurrency, 
  formatRelativeTime, 
  formatBudgetCompliance 
} from '../../../utils/approvals/approvalUtils';

interface ApprovalTooltipProps {
  approval: ApprovalItem;
  children: React.ReactElement;
}

const ApprovalTooltip: React.FC<ApprovalTooltipProps> = ({ 
  approval, 
  children 
}) => {
  const tooltipContent = (
    <Box sx={{ p: 1, maxWidth: 300 }}>
      <Typography variant="subtitle2" gutterBottom>
        {approval.quotationNumber}
      </Typography>
      
      <Typography variant="body2">
        Project: {approval.projectName}
      </Typography>
      
      <Typography variant="body2">
        Amount: {formatCurrency(approval.totalAmount, approval.currency)}
      </Typography>
      
      <Typography variant="body2">
        Budget Status: {formatBudgetCompliance(approval.budgetCompliance)}
      </Typography>
      
      <Typography variant="body2">
        Submitted: {formatRelativeTime(approval.submissionDate)}
      </Typography>
      
      <Typography variant="body2">
        Waiting: {approval.daysWaiting} day{approval.daysWaiting !== 1 ? 's' : ''}
      </Typography>
      
      {approval.hasDocuments && (
        <Typography variant="body2" color="primary">
          📎 Has attachments
        </Typography>
      )}
      
      {approval.description && (
        <>
          <Divider sx={{ my: 1 }} />
          <Typography variant="body2" color="textSecondary">
            {approval.description}
          </Typography>
        </>
      )}
    </Box>
  );

  return (
    <Tooltip 
      title={tooltipContent}
      arrow
      placement="top"
      enterDelay={500}
    >
      {children}
    </Tooltip>
  );
};

export default ApprovalTooltip;