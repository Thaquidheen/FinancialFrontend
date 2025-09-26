// src/components/payments/PaymentQueue/PaymentQueueTable.tsx

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Checkbox,
  Paper,
  Box,
  Typography,
  IconButton,
  Tooltip,
  Avatar,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Skeleton,
  Alert
} from '@mui/material';
import {
  MoreVert,
  Visibility,
  Edit,
  AccountBalance,
  Person,
  AttachMoney,
  Schedule,
  FilterList,
  CheckCircle,
  Warning
} from '@mui/icons-material';
import { PaymentSummaryResponse } from '../../../types/payment.types';
import { saudiBankService } from '../../../services/api/saudiBankService';
import PaymentStatusBadge from '../shared/PaymentStatusBadge';
import BankIcon from '../shared/BankIcon';

interface Column {
  id: keyof PaymentSummaryResponse | 'select' | 'actions';
  label: string;
  minWidth?: number;
  align?: 'right' | 'left' | 'center';
  sortable?: boolean;
  format?: (value: any) => string;
}

const columns: Column[] = [
  { id: 'select', label: '', minWidth: 50, align: 'center', sortable: false },
  { 
    id: 'employeeName', 
    label: 'Employee', 
    minWidth: 180, 
    sortable: true 
  },
  { 
    id: 'amount', 
    label: 'Amount', 
    minWidth: 120, 
    align: 'right', 
    sortable: true,
    format: (value: number) => saudiBankService.formatSAR(value)
  },
  { 
    id: 'bankName', 
    label: 'Bank', 
    minWidth: 140, 
    sortable: true 
  },
  { 
    id: 'projectName', 
    label: 'Project', 
    minWidth: 150, 
    sortable: true 
  },
  { 
    id: 'status', 
    label: 'Status', 
    minWidth: 120, 
    sortable: true 
  },
  { 
    id: 'createdAt', 
    label: 'Date', 
    minWidth: 120, 
    sortable: true,
    format: (value: string) => new Date(value).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  },
  { id: 'actions', label: 'Actions', minWidth: 80, align: 'center', sortable: false }
];

interface PaymentQueueTableProps {
  payments: PaymentSummaryResponse[];
  selectedPayments: string[];
  onSelectPayment: (paymentId: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSortChange: (sortBy: string, sortDirection: 'asc' | 'desc') => void;
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  isLoading?: boolean;
  onViewPayment?: (paymentId: string) => void;
  onEditPayment?: (paymentId: string) => void;
}

const PaymentQueueTable: React.FC<PaymentQueueTableProps> = ({
  payments,
  selectedPayments,
  onSelectPayment,
  onSelectAll,
  onClearSelection,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  currentPage,
  pageSize,
  totalElements,
  totalPages,
  sortBy,
  sortDirection,
  isLoading,
  onViewPayment,
  onEditPayment
}) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPaymentForMenu, setSelectedPaymentForMenu] = useState<string | null>(null);

  const handleSort = (columnId: string) => {
    const isAsc = sortBy === columnId && sortDirection === 'asc';
    onSortChange(columnId, isAsc ? 'desc' : 'asc');
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      onSelectAll();
    } else {
      onClearSelection();
    }
  };

  const handlePaymentSelect = (paymentId: string) => (event: React.MouseEvent) => {
    event.stopPropagation();
    onSelectPayment(paymentId);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, paymentId: string) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setSelectedPaymentForMenu(paymentId);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedPaymentForMenu(null);
  };

  const handleMenuAction = (action: string) => {
    if (selectedPaymentForMenu) {
      switch (action) {
        case 'view':
          onViewPayment?.(selectedPaymentForMenu);
          break;
        case 'edit':
          onEditPayment?.(selectedPaymentForMenu);
          break;
      }
    }
    handleMenuClose();
  };

  const isAllSelected = payments.length > 0 && selectedPayments.length === payments.length;
  const isIndeterminate = selectedPayments.length > 0 && selectedPayments.length < payments.length;

  const renderLoadingSkeleton = () => (
    <TableBody>
      {[...Array(pageSize)].map((_, index) => (
        <TableRow key={index}>
          <TableCell padding="checkbox">
            <Skeleton variant="circular" width={24} height={24} />
          </TableCell>
          <TableCell>
            <Box display="flex" alignItems="center" gap={2}>
              <Skeleton variant="circular" width={32} height={32} />
              <Box>
                <Skeleton variant="text" width={120} />
                <Skeleton variant="text" width={80} />
              </Box>
            </Box>
          </TableCell>
          <TableCell align="right">
            <Skeleton variant="text" width={80} />
          </TableCell>
          <TableCell>
            <Box display="flex" alignItems="center" gap={1}>
              <Skeleton variant="circular" width={24} height={24} />
              <Skeleton variant="text" width={60} />
            </Box>
          </TableCell>
          <TableCell>
            <Skeleton variant="text" width={100} />
          </TableCell>
          <TableCell>
            <Skeleton variant="rectangular" width={80} height={24} />
          </TableCell>
          <TableCell>
            <Skeleton variant="text" width={60} />
          </TableCell>
          <TableCell align="center">
            <Skeleton variant="circular" width={24} height={24} />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );

  const renderEmptyState = () => (
    <TableBody>
      <TableRow>
        <TableCell colSpan={columns.length} align="center" sx={{ py: 8 }}>
          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <AccountBalance sx={{ fontSize: 48, color: 'text.secondary' }} />
            <Typography variant="h6" color="text.secondary">
              No payments ready for processing
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Approved quotations will appear here when ready for payment
            </Typography>
          </Box>
        </TableCell>
      </TableRow>
    </TableBody>
  );

  const getRowValidationStatus = (payment: PaymentSummaryResponse) => {
    const issues = [];
    if (!payment.bankName) issues.push('Missing bank information');
    if (!payment.employeeName) issues.push('Missing employee name');
    
    return {
      hasIssues: issues.length > 0,
      issues
    };
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      {/* Selection Summary */}
      {selectedPayments.length > 0 && (
        <Alert 
          severity="info" 
          sx={{ borderRadius: 0, borderBottom: 1, borderColor: 'divider' }}
        >
          <Typography variant="body2">
            {selectedPayments.length} payment{selectedPayments.length === 1 ? '' : 's'} selected
          </Typography>
        </Alert>
      )}

      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader>
          {/* Table Head */}
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                  padding={column.id === 'select' ? 'checkbox' : 'normal'}
                >
                  {column.id === 'select' ? (
                    <Checkbox
                      color="primary"
                      indeterminate={isIndeterminate}
                      checked={isAllSelected}
                      onChange={handleSelectAllClick}
                      inputProps={{
                        'aria-label': 'select all payments'
                      }}
                    />
                  ) : column.sortable ? (
                    <TableSortLabel
                      active={sortBy === column.id}
                      direction={sortBy === column.id ? sortDirection : 'asc'}
                      onClick={() => handleSort(column.id as string)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          {/* Table Body */}
          {isLoading ? (
            renderLoadingSkeleton()
          ) : payments.length === 0 ? (
            renderEmptyState()
          ) : (
            <TableBody>
              {payments.map((payment) => {
                const isSelected = selectedPayments.includes(payment.id);
                const validation = getRowValidationStatus(payment);

                return (
                  <TableRow
                    key={payment.id}
                    hover
                    selected={isSelected}
                    sx={{ 
                      cursor: 'pointer',
                      '&.Mui-selected': {
                        backgroundColor: 'action.selected'
                      }
                    }}
                  >
                    {/* Checkbox */}
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isSelected}
                        onChange={handlePaymentSelect(payment.id)}
                        inputProps={{
                          'aria-labelledby': `payment-${payment.id}`
                        }}
                      />
                    </TableCell>

                    {/* Employee */}
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                          {payment.employeeName.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {payment.employeeName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {payment.quotationId}
                          </Typography>
                        </Box>
                        {validation.hasIssues && (
                          <Tooltip title={`Issues: ${validation.issues.join(', ')}`}>
                            <Warning color="warning" fontSize="small" />
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>

                    {/* Amount */}
                    <TableCell align="right">
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {saudiBankService.formatSAR(payment.amount)}
                        </Typography>
                        {payment.amount > 10000 && (
                          <Chip
                            label={payment.amount > 50000 ? 'High' : 'Medium'}
                            size="small"
                            color={payment.amount > 50000 ? 'error' : 'warning'}
                            variant="outlined"
                            sx={{ fontSize: '0.7rem', height: 16 }}
                          />
                        )}
                      </Box>
                    </TableCell>

                    {/* Bank */}
                    <TableCell>
                      {payment.bankName ? (
                        <Box display="flex" alignItems="center" gap={1}>
                          <BankIcon bankCode={payment.bankName} size="small" />
                          <Typography variant="body2">
                            {saudiBankService.getBankByCode(payment.bankName)?.shortName || payment.bankName}
                          </Typography>
                        </Box>
                      ) : (
                        <Chip
                          label="Not assigned"
                          size="small"
                          variant="outlined"
                          color="warning"
                          icon={<Warning />}
                        />
                      )}
                    </TableCell>

                    {/* Project */}
                    <TableCell>
                      {payment.projectName ? (
                        <Typography variant="body2">
                          {payment.projectName}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No project
                        </Typography>
                      )}
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <PaymentStatusBadge status={payment.status} />
                    </TableCell>

                    {/* Date */}
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(payment.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Typography>
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, payment.id)}
                      >
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          )}
        </Table>
      </TableContainer>

      {/* Pagination */}
      {!isLoading && payments.length > 0 && (
        <TablePagination
          rowsPerPageOptions={[10, 20, 50, 100]}
          component="div"
          count={totalElements}
          rowsPerPage={pageSize}
          page={currentPage}
          onPageChange={(event, newPage) => onPageChange(newPage)}
          onRowsPerPageChange={(event) => {
            onPageSizeChange(parseInt(event.target.value, 10));
          }}
          labelRowsPerPage="Payments per page:"
        />
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: { minWidth: 150 }
        }}
      >
        <MenuItem onClick={() => handleMenuAction('view')}>
          <ListItemIcon>
            <Visibility fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        
        {onEditPayment && (
          <MenuItem onClick={() => handleMenuAction('edit')}>
            <ListItemIcon>
              <Edit fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit Payment</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </Paper>
  );
};

export default PaymentQueueTable;