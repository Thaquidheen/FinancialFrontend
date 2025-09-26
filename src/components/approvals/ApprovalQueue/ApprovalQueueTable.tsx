// components/approvals/ApprovalQueue/ApprovalQueueTable.tsx
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Checkbox,
  IconButton,
  Chip,
  Tooltip,
  Typography,
  Box,
  TableSortLabel,
  Menu,
  MenuItem
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  AttachFile as AttachmentIcon,
  Warning as WarningIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { ApprovalItem, SortConfig } from '../../../types/approval.types';
import {
  formatCurrency,
  formatRelativeTime,
  formatBudgetCompliance,
  getBudgetComplianceColor
} from '../../../utils/approvals/approvalUtils';
import { ApprovalStatusBadge, ApprovalTimer } from '../shared';

interface ApprovalQueueTableProps {
  approvals: ApprovalItem[];
  selectedItems: string[];
  sort: SortConfig;
  isAllSelected: boolean;
  isPartiallySelected: boolean;
  onSelectItem: (itemId: string) => void;
  onSelectAll: () => void;
  onSort: (field: keyof ApprovalItem, direction?: 'asc' | 'desc') => void;
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

const ApprovalQueueTable: React.FC<ApprovalQueueTableProps> = ({
  approvals,
  selectedItems,
  sort,
  isAllSelected,
  isPartiallySelected,
  onSelectItem,
  onSelectAll,
  onSort,
  onQuickApprove,
  onQuickReject,
  onViewDetails,
  pagination,
  onPageChange,
  onPageSizeChange
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedApprovalForMenu, setSelectedApprovalForMenu] = useState<ApprovalItem | null>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, approval: ApprovalItem) => {
    setAnchorEl(event.currentTarget);
    setSelectedApprovalForMenu(approval);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedApprovalForMenu(null);
  };

  const handleQuickRejectWithReason = (reason: string) => {
    if (selectedApprovalForMenu) {
      onQuickReject(selectedApprovalForMenu, reason);
    }
    handleMenuClose();
  };

  const getSortDirection = (field: keyof ApprovalItem): 'asc' | 'desc' | undefined => {
    return sort.field === field ? sort.direction : undefined;
  };

  const handleSort = (field: keyof ApprovalItem) => {
    onSort(field);
  };

  const renderStatusCell = (approval: ApprovalItem) => (
    <Box display="flex" alignItems="center" gap={1}>
      <ApprovalStatusBadge status={approval.status as any} />
      {approval.urgencyLevel === 'CRITICAL' && (
        <Tooltip title="Critical Priority">
          <WarningIcon color="error" fontSize="small" />
        </Tooltip>
      )}
    </Box>
  );

  const renderProjectCell = (approval: ApprovalItem) => (
    <Box>
      <Typography variant="body2" fontWeight="medium">
        {approval.projectName}
      </Typography>
      <Typography variant="caption" color="textSecondary">
        {approval.projectManagerName}
      </Typography>
    </Box>
  );

  const renderAmountCell = (approval: ApprovalItem) => (
    <Box textAlign="right">
      <Typography variant="body2" fontWeight="medium">
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
  );

  const renderTimeCell = (approval: ApprovalItem) => (
    <Box>
      <Typography variant="body2">
        {formatRelativeTime(approval.submissionDate)}
      </Typography>
      <ApprovalTimer 
        submissionDate={approval.submissionDate}
        urgencyLevel={approval.urgencyLevel}
      />
    </Box>
  );

  const renderActionsCell = (approval: ApprovalItem) => (
    <Box display="flex" alignItems="center" gap={1}>
      {approval.hasDocuments && (
        <Tooltip title="Has Attachments">
          <AttachmentIcon fontSize="small" color="action" />
        </Tooltip>
      )}
      
      <Tooltip title="View Details">
        <IconButton size="small" onClick={() => onViewDetails(approval)}>
          <ViewIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Tooltip title="Quick Approve">
        <IconButton 
          size="small" 
          onClick={() => onQuickApprove(approval)}
          color="success"
        >
          <ApproveIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Tooltip title="More Actions">
        <IconButton 
          size="small" 
          onClick={(e) => handleMenuClick(e, approval)}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );

  return (
    <Box>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={isAllSelected}
                  indeterminate={isPartiallySelected}
                  onChange={onSelectAll}
                />
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sort.field === 'status'}
                  direction={getSortDirection('status')}
                  onClick={() => handleSort('status')}
                >
                  Status
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sort.field === 'projectName'}
                  direction={getSortDirection('projectName')}
                  onClick={() => handleSort('projectName')}
                >
                  Project
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={sort.field === 'totalAmount'}
                  direction={getSortDirection('totalAmount')}
                  onClick={() => handleSort('totalAmount')}
                >
                  Amount
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sort.field === 'submissionDate'}
                  direction={getSortDirection('submissionDate')}
                  onClick={() => handleSort('submissionDate')}
                >
                  Submitted
                </TableSortLabel>
              </TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {approvals.map((approval) => (
              <TableRow 
                key={approval.id} 
                hover 
                selected={selectedItems.includes(approval.id)}
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedItems.includes(approval.id)}
                    onChange={() => onSelectItem(approval.id)}
                  />
                </TableCell>
                <TableCell>
                  {renderStatusCell(approval)}
                </TableCell>
                <TableCell>
                  {renderProjectCell(approval)}
                </TableCell>
                <TableCell align="right">
                  {renderAmountCell(approval)}
                </TableCell>
                <TableCell>
                  {renderTimeCell(approval)}
                </TableCell>
                <TableCell>
                  {renderActionsCell(approval)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={pagination.total}
        page={pagination.page}
        onPageChange={(_, page) => onPageChange(page)}
        rowsPerPage={pagination.size}
        onRowsPerPageChange={(e) => onPageSizeChange(parseInt(e.target.value))}
        rowsPerPageOptions={[10, 25, 50, 100]}
        labelRowsPerPage="Rows per page:"
        labelDisplayedRows={({ from, to, count }) => 
          `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`
        }
      />

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => selectedApprovalForMenu && onQuickApprove(selectedApprovalForMenu)}>
          <ApproveIcon fontSize="small" sx={{ mr: 1 }} />
          Quick Approve
        </MenuItem>
        <MenuItem onClick={() => handleQuickRejectWithReason('Budget exceeded')}>
          <RejectIcon fontSize="small" sx={{ mr: 1 }} />
          Reject - Budget Exceeded
        </MenuItem>
        <MenuItem onClick={() => handleQuickRejectWithReason('Incomplete documentation')}>
          <RejectIcon fontSize="small" sx={{ mr: 1 }} />
          Reject - Incomplete Documentation
        </MenuItem>
        <MenuItem onClick={() => handleQuickRejectWithReason('Other')}>
          <RejectIcon fontSize="small" sx={{ mr: 1 }} />
          Reject - Other
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ApprovalQueueTable;