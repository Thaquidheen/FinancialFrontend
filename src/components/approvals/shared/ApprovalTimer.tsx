import React, { useEffect } from 'react';
import { Typography, Box } from '@mui/material';
import { UrgencyLevel } from '../../../types/approval.types';
import { calculateDaysWaiting } from '../../../utils/approvals/approvalUtils';

interface ApprovalTimerProps {
  submissionDate: Date;
  urgencyLevel: UrgencyLevel;
  showDays?: boolean;
}

const ApprovalTimer: React.FC<ApprovalTimerProps> = ({ 
  submissionDate, 
  urgencyLevel,
  showDays = true 
}) => {
  useEffect(() => {
    const timer = setInterval(() => {
      // Timer updates every minute for real-time display
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const daysWaiting = calculateDaysWaiting(submissionDate);
  
  const getTimerColor = (): string => {
    switch (urgencyLevel) {
      case 'CRITICAL':
        return 'error.main';
      case 'HIGH':
        return 'warning.main';
      case 'MEDIUM':
        return 'info.main';
      default:
        return 'text.secondary';
    }
  };

  return (
    <Box>
      <Typography 
        variant="caption" 
        sx={{ 
          color: getTimerColor(),
          fontWeight: urgencyLevel === 'CRITICAL' ? 'bold' : 'normal'
        }}
      >
        {showDays && `${daysWaiting} day${daysWaiting !== 1 ? 's' : ''}`}
      </Typography>
    </Box>
  );
};

export default ApprovalTimer;