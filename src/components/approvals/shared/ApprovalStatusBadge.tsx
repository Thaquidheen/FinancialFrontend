import React from 'react';
import { Chip } from '@mui/material';
import { ApprovalStatus } from '../../../types/approval.types';
import { formatApprovalStatus, getStatusColor } from '../../../utils/approvals/approvalUtils';

interface ApprovalStatusBadgeProps {
  status: ApprovalStatus;
  size?: 'small' | 'medium';
}

const ApprovalStatusBadge: React.FC<ApprovalStatusBadgeProps> = ({ 
  status, 
  size = 'small' 
}) => {
  const colors = getStatusColor(status);
  
  return (
    <Chip
      label={formatApprovalStatus(status)}
      size={size}
      sx={{
        backgroundColor: colors.backgroundColor,
        color: colors.color,
        borderColor: colors.borderColor,
        border: 1,
        fontWeight: 'medium'
      }}
    />
  );
};

export default ApprovalStatusBadge;