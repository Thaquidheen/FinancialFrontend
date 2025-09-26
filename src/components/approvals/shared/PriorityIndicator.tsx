import React from 'react';
import { Box, Chip, Tooltip } from '@mui/material';
import { 
  PriorityHigh as HighIcon,
  Warning as CriticalIcon 
} from '@mui/icons-material';
import { UrgencyLevel } from '../../../types/approval.types';
import { formatUrgencyLevel, getUrgencyColor } from '../../../utils/approvals/approvalUtils';

interface PriorityIndicatorProps {
  urgencyLevel: UrgencyLevel;
  daysWaiting: number;
  showIcon?: boolean;
}

const PriorityIndicator: React.FC<PriorityIndicatorProps> = ({ 
  urgencyLevel, 
  daysWaiting,
  showIcon = true 
}) => {
  const colors = getUrgencyColor(urgencyLevel);
  
  const getIcon = () => {
    switch (urgencyLevel) {
      case 'CRITICAL':
        return <CriticalIcon fontSize="small" />;
      case 'HIGH':
        return <HighIcon fontSize="small" />;
      default:
        return null;
    }
  };

  return (
    <Tooltip title={`${formatUrgencyLevel(urgencyLevel)} - ${daysWaiting} days waiting`}>
      <Box display="flex" alignItems="center" gap={0.5}>
        {showIcon && getIcon()}
        <Chip
          label={formatUrgencyLevel(urgencyLevel)}
          size="small"
          sx={{
            backgroundColor: colors.backgroundColor,
            color: colors.color,
            fontWeight: 'medium',
            fontSize: '0.75rem'
          }}
        />
      </Box>
    </Tooltip>
  );
};

export default PriorityIndicator;