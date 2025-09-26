// components/approvals/ApprovalQueue/UrgentApprovalsBadge.tsx
import React, { useState, useEffect } from 'react';
import {
  Badge,
  IconButton,
  Tooltip,
  Popover,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  Button
} from '@mui/material';
import {
  Warning as WarningIcon
} from '@mui/icons-material';
import { ApprovalItem } from '../../../types/approval.types';
import approvalService from '../../../services/approvalService';
import { formatCurrency } from '../../../utils/approvals/approvalUtils';

const UrgentApprovalsBadge: React.FC = () => {
  const [urgentApprovals, setUrgentApprovals] = useState<ApprovalItem[]>([]);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    fetchUrgentApprovals();
    
    // Set up polling for urgent approvals
    const interval = setInterval(fetchUrgentApprovals, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const fetchUrgentApprovals = async () => {
    try {
      const response = await approvalService.getUrgentApprovals(0, 20);
      setUrgentApprovals(response.content);
    } catch (error) {
      console.error('Error fetching urgent approvals:', error);
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  if (urgentApprovals.length === 0) return null;

  return (
    <>
      <Tooltip title={`${urgentApprovals.length} urgent approval${urgentApprovals.length > 1 ? 's' : ''}`}>
        <IconButton onClick={handleClick} color="error">
          <Badge badgeContent={urgentApprovals.length} color="error">
            <WarningIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: { maxWidth: 400, maxHeight: 500 }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom color="error">
            Urgent Approvals
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            These quotations require immediate attention
          </Typography>
          
          <List dense>
            {urgentApprovals.slice(0, 5).map((approval) => (
              <ListItem key={approval.id} divider>
                <ListItemText
                  primary={
                    <Box display="flex" justifyContent="space-between" alignItems="start">
                      <Typography variant="body2" fontWeight="bold">
                        {approval.quotationNumber}
                      </Typography>
                      <Typography variant="caption" color="error">
                        {approval.daysWaiting} days
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="caption" display="block">
                        {approval.projectName}
                      </Typography>
                      <Typography variant="caption" display="block">
                        {formatCurrency(approval.totalAmount)} • {approval.projectManagerName}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
          
          {urgentApprovals.length > 5 && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              ... and {urgentApprovals.length - 5} more urgent items
            </Typography>
          )}
          
          <Button
            fullWidth
            variant="contained"
            color="error"
            sx={{ mt: 2 }}
            onClick={() => {
              handleClose();
              // Navigate to urgent filter or implement urgent view
              window.location.hash = '#urgent';
            }}
          >
            Review All Urgent
          </Button>
        </Box>
      </Popover>
    </>
  );
};

export default UrgentApprovalsBadge;