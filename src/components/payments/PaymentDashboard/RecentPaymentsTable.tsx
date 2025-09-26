// src/components/payments/PaymentDashboard/RecentPaymentsTable.tsx

import React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Button,
  Avatar,
  IconButton,
  Tooltip,
  Chip,
  LinearProgress,
  Skeleton
} from '@mui/material';
import {
  Visibility,
  Launch,
  AccountBalance,
  Person,
  Receipt,
  Schedule,
  CheckCircle,
  Warning
} from '@mui/icons-material';
import { PaymentSummaryResponse, PaymentStatus } from '../../../types/payment.types';
import { PAYMENT_STATUS_LABELS, PAYMENT_STATUS_COLORS } from '../../../constants/payments/paymentConstants';
import { saudiBankService } from '../../../services/saudiBankService';
import PaymentStatusBadge from '../shared/PaymentStatusBadge';
import BankIcon from '../shared/BankIcon';

interface RecentPaymentsTableProps {
  payments: PaymentSummaryResponse[];
  isLoading?: boolean;
  onViewDetails?: (paymentId: string) => void;
  maxRows?: number;
  showActions?: boolean;
  className?: string;
}

const RecentPaymentsTable: React.FC<RecentPaymentsTableProps> = ({
  payments,
  isLoading,
  onViewDetails,
  maxRows = 10,
  showActions = true,
  className
}) => {
  const displayPayments = payments.slice(0, maxRows);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.READY_FOR_PAYMENT:
        return <Schedule color="warning" />;
      case PaymentStatus.BANK_FILE_GENERATED:
      case PaymentStatus.SENT_TO_BANK:
      case PaymentStatus.BANK_PROCESSING:
        return <AccountBalance color="info" />;
      case PaymentStatus.COMPLETED:
        return <CheckCircle color="success" />;
      case PaymentStatus.FAILED:
        return <Warning color="error" />;
      default:
        return <Receipt color="action" />;
    }
  };

  const getPriorityColor = (amount: number) => {
    if (amount > 50000) return 'error';
    if (amount > 10000) return 'warning';
    return 'default';
  };

  if (isLoading) {
    return (
      <Paper className={className}>
        <Box p={3}>
          <Typography variant="h6" gutterBottom>
            Recent Payments
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Bank</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                  {showActions && <TableCell>Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {[...Array(5)].map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Skeleton variant="circular" width={32} height={32} />
                        <Skeleton variant="text" width={120} />
                      </Box>
                    </TableCell>
                    <TableCell><Skeleton variant="text" width={80} /></TableCell>
                    <TableCell><Skeleton variant="text" width={100} /></TableCell>
                    <TableCell><Skeleton variant="rectangular" width={80} height={24} /></TableCell>
                    <TableCell><Skeleton variant="text" width={80} /></TableCell>
                    {showActions && (
                      <TableCell>
                        <Skeleton variant="circular" width={32} height={32} />
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Paper>
    );
  }

  if (!payments || payments.length === 0) {
    return (
      <Paper className={className}>
        <Box p={3}>
          <Typography variant="h6" gutterBottom>
            Recent Payments
          </Typography>
          <Box 
            display="flex" 
            flexDirection="column" 
            alignItems="center" 
            justifyContent="center" 
            py={8}
          >
            <Receipt sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Recent Payments
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Payment activities will appear here once processing begins
            </Typography>
          </Box>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper className={className}>
      <Box p={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">
            Recent Payments
          </Typography>
          {payments.length > maxRows && (
            <Button
              variant="outlined"
              size="small"
              endIcon={<Launch />}
              onClick={() => {/* Navigate to full payments history */}}
            >
              View All ({payments.length})
            </Button>
          )}
        </Box>

        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Person fontSize="small" color="action" />
                    Employee
                  </Box>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Receipt fontSize="small" color="action" />
                    Amount
                  </Box>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <AccountBalance fontSize="small" color="action" />
                    Bank
                  </Box>
                </TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Project</TableCell>
                <TableCell>Date</TableCell>
                {showActions && <TableCell align="center">Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {displayPayments.map((payment) => (
                <TableRow 
                  key={payment.id}
                  hover
                  sx={{ 
                    '&:hover': { backgroundColor: 'action.hover' },
                    cursor: onViewDetails ? 'pointer' : 'default'
                  }}
                  onClick={() => onViewDetails?.(payment.id)}
                >
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
                    </Box>
                  </TableCell>

                  {/* Amount */}
                  <TableCell>
                    <Box>
                      <Typography 
                        variant="body2" 
                        fontWeight="bold"
                        color={getPriorityColor(payment.amount) === 'error' ? 'error.main' : 'text.primary'}
                      >
                        {saudiBankService.formatSAR(payment.amount)}
                      </Typography>
                      {payment.amount > 10000 && (
                        <Chip
                          label={payment.amount > 50000 ? 'High Value' : 'Medium Value'}
                          size="small"
                          color={getPriorityColor(payment.amount)}
                          variant="outlined"
                          sx={{ mt: 0.5, fontSize: '0.7rem', height: 16 }}
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
                      <Typography variant="body2" color="text.secondary">
                        Not assigned
                      </Typography>
                    )}
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      {getStatusIcon(payment.status)}
                      <PaymentStatusBadge status={payment.status} />
                    </Box>
                  </TableCell>

                  {/* Project */}
                  <TableCell>
                    {payment.projectName ? (
                      <Typography variant="body2" color="text.primary">
                        {payment.projectName}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No project
                      </Typography>
                    )}
                  </TableCell>

                  {/* Date */}
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {formatDate(payment.createdAt)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatRelativeTime(payment.createdAt)}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* Actions */}
                  {showActions && (
                    <TableCell align="center">
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewDetails?.(payment.id);
                          }}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Summary Footer */}
        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems="center" 
          mt={2}
          pt={2}
          borderTop={1}
          borderColor="divider"
        >
          <Typography variant="body2" color="text.secondary">
            Showing {displayPayments.length} of {payments.length} recent payments
          </Typography>
          
          <Box display="flex" alignItems="center" gap={3}>
            <Box textAlign="center">
              <Typography variant="caption" color="text.secondary">
                Total Amount
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {saudiBankService.formatSAR(
                  displayPayments.reduce((sum, payment) => sum + payment.amount, 0)
                )}
              </Typography>
            </Box>
            
            <Box textAlign="center">
              <Typography variant="caption" color="text.secondary">
                Completed Today
              </Typography>
              <Typography variant="body2" fontWeight="bold" color="success.main">
                {displayPayments.filter(p => 
                  p.status === PaymentStatus.COMPLETED &&
                  new Date(p.processedAt || p.createdAt).toDateString() === new Date().toDateString()
                ).length}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default RecentPaymentsTable;