// components/approvals/ApprovalQueue/ApprovalQueueCard.tsx
import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Checkbox,
  IconButton,
  Chip,
  Button,
  Tooltip,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  AttachFile as AttachmentIcon,
  Warning as WarningIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { ApprovalItem } from '../../../types/approval.types';
import {
  formatCurrency,
  formatRelativeTime,
  formatBudgetCompliance,
  getBudgetComplianceColor,
} from '../../../utils/approvals/approvalUtils';
import { ApprovalStatusBadge, ApprovalTimer } from '../shared';

interface ApprovalQueueCardProps {
  approvals: ApprovalItem[];
  selectedItems: string[];
  onSelectItem: (itemId: string) => void;
  onQuickApprove: (approval: ApprovalItem) => void;
  onQuickReject: (approval: ApprovalItem, reason: string, comments?: string) => void;
  onViewDetails: (approval: ApprovalItem) => void;
  pagination: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const ApprovalQueueCard: React.FC<ApprovalQueueCardProps> = ({
  approvals,
  selectedItems,
  onSelectItem,
  onQuickApprove,
  onQuickReject,
  onViewDetails,
  pagination,
  onPageChange,
  onPageSizeChange,
}) => {
  const renderApprovalCard = (approval: ApprovalItem) => (
    <Grid item xs={12} sm={6} md={4} key={approval.id}>
      <Card 
        variant="outlined" 
        sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          border: selectedItems.includes(approval.id) ? '2px solid' : '1px solid',
          borderColor: selectedItems.includes(approval.id) ? 'primary.main' : 'divider',
        }}
      >
        {/* Selection Checkbox */}
        <Box sx={{ position: 'absolute', top: 8, left: 8, zIndex: 1 }}>
          <Checkbox
            size="small"
            checked={selectedItems.includes(approval.id)}
            onChange={() => onSelectItem(approval.id)}
            sx={{ 
              backgroundColor: 'background.paper',
              borderRadius: '4px',
              '&:hover': {
                backgroundColor: 'background.paper',
              }
            }}
          />
        </Box>

        {/* Urgent Indicator */}
        {approval.urgencyLevel === 'CRITICAL' && (
          <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
            <Tooltip title="Critical Priority">
              <WarningIcon color="error" fontSize="small" />
            </Tooltip>
          </Box>
        )}

        <CardContent sx={{ flexGrow: 1, pt: 3 }}>
          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
            <Box>
              <Typography variant="h6" component="div" gutterBottom>
                {approval.quotationNumber}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {approval.projectName}
              </Typography>
            </Box>
            <ApprovalStatusBadge status={approval.status as any} />
          </Box>

          {/* Project Manager */}
          <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
            <strong>Manager:</strong> {approval.projectManagerName}
          </Typography>

          {/* Amount */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" color="primary" gutterBottom>
              {formatCurrency(approval.totalAmount, approval.currency)}
            </Typography>
            <Chip
              label={formatBudgetCompliance(approval.budgetCompliance)}
              size="small"
              sx={{
                backgroundColor: getBudgetComplianceColor(approval.budgetCompliance).backgroundColor,
                color: getBudgetComplianceColor(approval.budgetCompliance).color,
                fontSize: '0.7rem',
                height: '20px'
              }}
            />
          </Box>

          {/* Description */}
          {approval.description && (
            <Typography 
              variant="body2" 
              color="textSecondary" 
              sx={{ 
                mb: 2,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {approval.description}
            </Typography>
          )}

          {/* Time Info */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="textSecondary">
              Submitted {formatRelativeTime(approval.submissionDate)}
            </Typography>
            <ApprovalTimer 
              submissionDate={approval.submissionDate}
              urgencyLevel={approval.urgencyLevel}
            />
          </Box>

          {/* Additional Info */}
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="caption" color="textSecondary">
              {approval.lineItemCount} items
            </Typography>
            {approval.hasDocuments && (
              <Tooltip title="Has Attachments">
                <AttachmentIcon fontSize="small" color="action" />
              </Tooltip>
            )}
          </Box>
        </CardContent>

        <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
          <Box>
            <Tooltip title="View Details">
              <IconButton size="small" onClick={() => onViewDetails(approval)}>
                <ViewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          <Box>
            <Tooltip title="Quick Approve">
              <IconButton 
                size="small" 
                onClick={() => onQuickApprove(approval)}
                color="success"
              >
                <ApproveIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Quick Reject">
              <IconButton 
                size="small" 
                onClick={() => onQuickReject(approval, 'Budget exceeded')}
                color="error"
              >
                <RejectIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="More Actions">
              <IconButton size="small">
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </CardActions>
      </Card>
    </Grid>
  );

  return (
    <Box>
      {/* Cards Grid */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {approvals.map(renderApprovalCard)}
      </Grid>

      {/* Pagination */}
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mt: 3 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="body2" color="textSecondary">
            Showing {pagination.page * pagination.size + 1} to{' '}
            {Math.min((pagination.page + 1) * pagination.size, pagination.total)} of{' '}
            {pagination.total} results
          </Typography>
          
          <FormControl size="small" sx={{ minWidth: 80 }}>
            <InputLabel>Per page</InputLabel>
            <Select
              value={pagination.size}
              label="Per page"
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
            >
              <MenuItem value={12}>12</MenuItem>
              <MenuItem value={24}>24</MenuItem>
              <MenuItem value={48}>48</MenuItem>
              <MenuItem value={96}>96</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Pagination
          count={pagination.totalPages}
          page={pagination.page + 1}
          onChange={(_, page) => onPageChange(page - 1)}
          color="primary"
          showFirstButton
          showLastButton
        />
      </Box>
    </Box>
  );
};

export default ApprovalQueueCard;