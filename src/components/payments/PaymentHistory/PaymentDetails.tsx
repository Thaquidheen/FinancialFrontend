import React, { useState, useEffect } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  IconButton,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Alert,
  Divider,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/lab';
import {
  Close,
  Info,
  History as HistoryIcon,
  AccountBalance,
  DocumentScanner,
  Receipt,
  Person,
  AttachMoney,
  Business,
  Schedule,
  CheckCircle,
  FileCopy,
  TrendingUp,
  ErrorOutline,
  ExpandLess,
  ExpandMore,
  Visibility,
  Print,
  Share,
  Update,
  CreditCard,
  AccountBalanceWallet,
  LocationOn,
  Description,
  GetApp,
  Assignment,
} from '@mui/icons-material';
import { Payment, PaymentStatus, PaymentSummaryResponse } from '../../../types/payment.types';

interface PaymentTimelineEvent {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  status: 'completed' | 'active' | 'error';
  icon: React.ReactNode;
  user?: string;
  details?: string[];
  duration?: string;
  batchId?: string;
}
import { SAUDI_BANKS } from '../../../types/saudiBanking.types';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
  }

interface PaymentDetailsProps {
  payment: Payment | PaymentSummaryResponse;
  open: boolean;
  onClose: () => void;
  className?: string;
  onStatusUpdate?: (paymentId: string, status: PaymentStatus) => void;
  onRetryPayment?: (paymentId: string) => void;
}
  
  function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`payment-tabpanel-${index}`}
        aria-labelledby={`payment-tab-${index}`}
        {...other}
      >
        {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
      </div>
    );
  }
  
  // PaymentStatusBadge Component
  const PaymentStatusBadge: React.FC<{ 
    status: PaymentStatus; 
    size?: 'small' | 'medium' 
  }> = ({ status, size = 'medium' }) => {
    const getColor = (): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
      switch (status) {
        case PaymentStatus.COMPLETED: return 'success';
        case PaymentStatus.BANK_PROCESSING: return 'warning';
        case PaymentStatus.FAILED: return 'error';
        case PaymentStatus.READY_FOR_PAYMENT: return 'info';
        case PaymentStatus.BANK_FILE_GENERATED: return 'info';
        case PaymentStatus.SENT_TO_BANK: return 'warning';
        case PaymentStatus.CANCELLED: return 'default';
        default: return 'default';
      }
    };
  
    const getLabel = () => {
      switch (status) {
        case PaymentStatus.COMPLETED: return 'Completed';
        case PaymentStatus.BANK_PROCESSING: return 'Processing';
        case PaymentStatus.FAILED: return 'Failed';
        case PaymentStatus.READY_FOR_PAYMENT: return 'Ready for Payment';
        case PaymentStatus.BANK_FILE_GENERATED: return 'File Generated';
        case PaymentStatus.SENT_TO_BANK: return 'Sent to Bank';
        case PaymentStatus.CANCELLED: return 'Cancelled';
        default: return status;
      }
    };
  
    return (
      <Chip
        label={getLabel()}
        color={getColor()}
        size={size}
        variant="filled"
      />
    );
  };
  
  // BankIcon Component
  const BankIcon: React.FC<{ 
    bankName: string; 
    size?: 'small' | 'medium' 
  }> = ({ bankName, size = 'medium' }) => {
    const iconSize = size === 'medium' ? 32 : 24;
    
    const getBankData = (bankName: string) => {
      const bank = Object.values(SAUDI_BANKS).find(b => 
        b.name.toLowerCase().includes(bankName.toLowerCase()) ||
        bankName.toLowerCase().includes(b.name.toLowerCase().split(' ')[0])
      );
      return bank || { name: bankName, primaryColor: '#1976d2' };
    };
  
    const bankData = getBankData(bankName);
    
    return (
      <Box
        sx={{
          width: iconSize,
          height: iconSize,
          borderRadius: 1,
          backgroundColor: bankData.primaryColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: size === 'medium' ? 12 : 10,
          fontWeight: 'bold'
        }}
      >
        {bankData.name.split(' ').map(word => word[0]).join('').slice(0, 3)}
      </Box>
    );
  };
  
  const PaymentDetails: React.FC<PaymentDetailsProps> = ({
    payment,
    open,
    onClose,
    className,
    onStatusUpdate,
    onRetryPayment
  }) => {
    const [paymentHistory, setPaymentHistory] = useState<PaymentTimelineEvent[]>([]);
    const [tabValue, setTabValue] = useState(0);
    const [expandedDetails, setExpandedDetails] = useState(false);

    // Helper functions to safely access properties that might not exist in PaymentSummaryResponse
    const getEmployeeId = () => 'employeeId' in payment ? payment.employeeId : '';
    // const getEmployeeFullName = () => 'employeeFullName' in payment ? payment.employeeFullName : payment.employeeName;
    const getCurrency = () => 'currency' in payment ? payment.currency : 'SAR';
    const getUpdatedAt = () => 'updatedAt' in payment ? payment.updatedAt : payment.createdAt;
    const getAccountNumber = () => 'accountNumber' in payment ? payment.accountNumber : undefined;
    const getIban = () => 'iban' in payment ? payment.iban : undefined;
    const getBeneficiaryAddress = () => 'beneficiaryAddress' in payment ? payment.beneficiaryAddress : undefined;
    const getNationalId = () => 'nationalId' in payment ? payment.nationalId : undefined;
    // const getIqamaId = () => 'iqamaId' in payment ? payment.iqamaId : undefined;
    const getDescription = () => 'description' in payment ? payment.description : undefined;
    // const getComments = () => 'comments' in payment ? payment.comments : undefined;
    const getCompletedAt = () => 'completedAt' in payment ? payment.completedAt : undefined;
    const getBatchId = () => 'batchId' in payment ? payment.batchId : undefined;
    const getErrorMessage = () => 'errorMessage' in payment ? payment.errorMessage : undefined;
  
    useEffect(() => {
      if (open && payment.id) {
        generatePaymentTimeline();
      }
    }, [open, payment.id]);
  
    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
      setTabValue(newValue);
    };
  
    const generatePaymentTimeline = () => {
      const events: PaymentTimelineEvent[] = [];
      
      // Payment Created
      events.push({
        id: 'created',
        title: 'Payment Request Created',
        description: 'Payment generated from approved quotation',
        timestamp: payment.createdAt,
        status: 'completed',
        icon: <Receipt />,
        user: 'System Automated',
        details: [
          `Quotation ID: ${payment.quotationId}`,
          `Employee: ${payment.employeeName}`,
          `Amount: ${formatSAR(payment.amount)}`,
          `Project: ${payment.projectName || 'General'}`
        ]
      });
  
      // Ready for Payment Queue
      if (payment.status !== PaymentStatus.READY_FOR_PAYMENT) {
        events.push({
          id: 'queued',
          title: 'Added to Payment Queue',
          description: 'Payment validated and queued for processing',
          timestamp: payment.createdAt,
          status: 'completed',
          icon: <Schedule />,
          user: 'Account Manager',
          details: [
            'Bank details validated',
            'Amount verified against budget',
            'Employee information confirmed',
            'Ready for bank file generation'
          ]
        });
      }
  
      // Bank Processing
      if ([PaymentStatus.BANK_PROCESSING, PaymentStatus.COMPLETED].includes(payment.status)) {
        events.push({
          id: 'processing',
          title: 'Bank Processing',
          description: 'Bank is validating and processing payment',
          timestamp: getCompletedAt() || payment.processedAt || payment.createdAt,
          status: payment.status === PaymentStatus.BANK_PROCESSING ? 'active' : 'completed',
          icon: <TrendingUp />,
          user: payment.bankName || 'Saudi Bank',
          details: payment.status === PaymentStatus.BANK_PROCESSING ? [
            'Payment being processed by bank',
            'IBAN validation in progress',
            'Funds transfer preparation',
            'Expected completion: Within 24 hours'
          ] : [
            'Payment validated by bank',
            'Funds transfer completed',
            'Transaction processed successfully'
          ]
        });
      }
  
      // Payment Completed
      if (payment.status === PaymentStatus.COMPLETED) {
        events.push({
          id: 'completed',
          title: 'Payment Completed',
          description: 'Payment successfully transferred to employee account',
          timestamp: getCompletedAt() || payment.processedAt || payment.createdAt,
          status: 'completed',
          icon: <CheckCircle />,
          user: payment.bankName || 'Saudi Bank',
          details: [
            '✓ Payment executed successfully',
            '✓ Funds transferred to beneficiary account',
            getBatchId() ? `✓ Batch Reference: ${getBatchId()}` : '',
            '✓ SMS notification sent to employee',
            '✓ Process completed'
          ].filter(Boolean),
          duration: getProcessingDuration() || undefined
        });
      }
  
      // Payment Failed
      if (payment.status === PaymentStatus.FAILED) {
        events.push({
          id: 'failed',
          title: 'Payment Failed',
          description: getErrorMessage() || 'Payment processing encountered an error',
          timestamp: getUpdatedAt() || payment.createdAt,
          status: 'error',
          icon: <ErrorOutline />,
          user: payment.bankName || 'Saudi Bank',
          details: [
            '✗ Payment processing failed',
            getErrorMessage() ? `✗ Reason: ${getErrorMessage()}` : '✗ Unknown error occurred',
            '✗ Manual review required',
            '⚠ Account Manager notified',
            '🔄 Retry available'
          ]
        });
      }
  
      setPaymentHistory(events);
    };
  
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };
  
    const formatSAR = (amount: number) => {
      return new Intl.NumberFormat('en-SA', {
        style: 'currency',
        currency: 'SAR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    };
  
    const getProcessingDuration = () => {
      if (!getCompletedAt()) return null;
      
      const start = new Date(payment.createdAt);
      const end = new Date(getCompletedAt()!);
      const diffMs = end.getTime() - start.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      if (diffHours > 24) {
        const days = Math.floor(diffHours / 24);
        const hours = diffHours % 24;
        return `${days}d ${hours}h`;
      } else if (diffHours > 0) {
        return `${diffHours}h ${diffMinutes}m`;
      }
      return `${diffMinutes}m`;
    };
  
    const handleRetryPayment = () => {
      if (onRetryPayment && payment.id) {
        onRetryPayment(payment.id.toString());
      }
    };
  
    const handleStatusUpdate = (newStatus: PaymentStatus) => {
      if (onStatusUpdate && payment.id) {
        onStatusUpdate(payment.id.toString(), newStatus);
      }
    };
  
    const handleShare = async () => {
      const shareData = {
        title: `Payment Details - ${payment.employeeName}`,
        text: `Payment of ${formatSAR(payment.amount)} to ${payment.employeeName}`,
        url: window.location.href
      };
  
      if (navigator.share && navigator.canShare(shareData)) {
        try {
          await navigator.share(shareData);
        } catch (error) {
          // User cancelled sharing
        }
      } else {
        // Fallback: copy to clipboard
        const textToCopy = `Payment Details: ${payment.employeeName} - ${formatSAR(payment.amount)} - Status: ${payment.status}`;
        try {
          await navigator.clipboard.writeText(textToCopy);
          // Could show success toast here
        } catch (error) {
          console.error('Failed to copy to clipboard', error);
        }
      }
    };
  
    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        className={className}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Payment Details
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {payment.employeeName} • {formatSAR(payment.amount)} • {formatDate(payment.createdAt)}
              </Typography>
            </Box>
            <Box display="flex" gap={1}>
              {payment.status === PaymentStatus.FAILED && (
                <Button
                  startIcon={<FileCopy />}
                  variant="outlined"
                  size="small"
                  onClick={handleRetryPayment}
                  color="warning"
                >
                  Retry Payment
                </Button>
              )}
              <IconButton onClick={onClose} size="small">
                <Close />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>
  
        <DialogContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Overview" icon={<Info />} />
              <Tab label="Timeline" icon={<HistoryIcon />} />
              <Tab label="Bank Details" icon={<AccountBalance />} />
              <Tab label="Documents" icon={<DocumentScanner />} />
            </Tabs>
          </Box>
  
          {/* Overview Tab */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              {/* Payment Summary */}
              <Grid item xs={12} md={8}>
                <Card elevation={2}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                      <Receipt color="primary" />
                      Payment Summary
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <List dense>
                          <ListItem disablePadding>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <Assignment fontSize="small" />
                            </ListItemIcon>
                            <ListItemText
                              primary="Payment ID"
                              secondary={payment.id}
                            />
                          </ListItem>
                          
                          <ListItem disablePadding>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <Person fontSize="small" />
                            </ListItemIcon>
                            <ListItemText
                              primary="Employee"
                              secondary={
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem' }}>
                                    {payment.employeeName.charAt(0).toUpperCase()}
                                  </Avatar>
                                  {payment.employeeName}
                                </Box>
                              }
                            />
                          </ListItem>
                          
                          <ListItem disablePadding>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <AttachMoney fontSize="small" />
                            </ListItemIcon>
                            <ListItemText
                              primary="Amount"
                              secondary={
                                <Typography variant="h6" fontWeight="bold" color="primary">
                                  {formatSAR(payment.amount)}
                                </Typography>
                              }
                            />
                          </ListItem>
  
                          <ListItem disablePadding>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <Business fontSize="small" />
                            </ListItemIcon>
                            <ListItemText
                              primary="Project"
                              secondary={payment.projectName || 'General Project'}
                            />
                          </ListItem>
                        </List>
                      </Grid>
  
                      <Grid item xs={12} sm={6}>
                        <List dense>
                          <ListItem disablePadding>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <Receipt fontSize="small" />
                            </ListItemIcon>
                            <ListItemText
                              primary="Quotation"
                              secondary={payment.quotationId}
                            />
                          </ListItem>
  
                          <ListItem disablePadding>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <Schedule fontSize="small" />
                            </ListItemIcon>
                            <ListItemText
                              primary="Created"
                              secondary={formatDate(payment.createdAt)}
                            />
                          </ListItem>
  
                          {getCompletedAt() && (
                            <ListItem disablePadding>
                              <ListItemIcon sx={{ minWidth: 32 }}>
                                <CheckCircle fontSize="small" />
                              </ListItemIcon>
                              <ListItemText
                                primary="Payment Date"
                                secondary={`${formatDate(getCompletedAt()!)} ${getProcessingDuration() ? `(${getProcessingDuration()})` : ''}`}
                              />
                            </ListItem>
                          )}
  
                          {getBatchId() && (
                            <ListItem disablePadding>
                              <ListItemIcon sx={{ minWidth: 32 }}>
                                <FileCopy fontSize="small" />
                              </ListItemIcon>
                              <ListItemText
                                primary="Batch ID"
                                secondary={getBatchId()}
                              />
                            </ListItem>
                          )}
                        </List>
                      </Grid>
                    </Grid>
  
                    <Divider sx={{ my: 2 }} />
  
                    {/* Additional Details Toggle */}
                    <Box>
                      <Button
                        startIcon={expandedDetails ? <ExpandLess /> : <ExpandMore />}
                        onClick={() => setExpandedDetails(!expandedDetails)}
                        variant="text"
                        size="small"
                      >
                        {expandedDetails ? 'Hide' : 'Show'} Additional Details
                      </Button>
                      
                      <Collapse in={expandedDetails}>
                        <Box mt={2}>
                          <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Field</TableCell>
                                  <TableCell>Value</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                <TableRow>
                                  <TableCell>Employee ID</TableCell>
                                  <TableCell>{getEmployeeId() || 'N/A'}</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell>Department</TableCell>
                                  <TableCell>{getDescription() || 'Not specified'}</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell>National ID</TableCell>
                                  <TableCell>{getNationalId() || 'Not provided'}</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell>Currency</TableCell>
                                  <TableCell>{getCurrency()}</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell>Payment Method</TableCell>
                                  <TableCell>Bank Transfer (Saudi Banking)</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell>Last Modified</TableCell>
                                  <TableCell>{getUpdatedAt() ? formatDate(getUpdatedAt()!) : 'N/A'}</TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Box>
                      </Collapse>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
  
              {/* Status Card */}
              <Grid item xs={12} md={4}>
                <Card elevation={2}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                      <TrendingUp color="primary" />
                      Payment Status
                    </Typography>
                    
                    <Box textAlign="center" mb={2}>
                      <PaymentStatusBadge status={payment.status} size="medium" />
                      <Typography variant="body2" color="text.secondary" mt={1}>
                        Current Status
                      </Typography>
                    </Box>
  
                    {/* Status-specific alerts */}
                    {payment.status === PaymentStatus.COMPLETED && (
                      <Alert severity="success" sx={{ mb: 2 }}>
                        <Typography variant="body2">
                          ✓ Payment completed successfully!<br />
                          Employee has received funds.
                        </Typography>
                      </Alert>
                    )}
  
                    {payment.status === PaymentStatus.BANK_PROCESSING && (
                      <Alert severity="info" sx={{ mb: 2 }}>
                        <Typography variant="body2">
                          ⏳ Bank is processing payment<br />
                          Expected completion within 24 hours
                        </Typography>
                      </Alert>
                    )}
  
                    {payment.status === PaymentStatus.FAILED && (
                      <Alert severity="error" sx={{ mb: 2 }}>
                        <Typography variant="body2">
                          ✗ Payment processing failed<br />
                          {getErrorMessage() || 'Manual review required'}
                        </Typography>
                      </Alert>
                    )}
  
                    {payment.status === PaymentStatus.READY_FOR_PAYMENT && (
                      <Alert severity="warning" sx={{ mb: 2 }}>
                        <Typography variant="body2">
                          ⏳ Ready for bank file generation<br />
                          Awaiting account manager action
                        </Typography>
                      </Alert>
                    )}
  
                    {/* Quick Actions */}
                    <Box display="flex" flexDirection="column" gap={1}>
                      {payment.status === PaymentStatus.FAILED && (
                        <Button
                          variant="contained"
                          color="warning"
                          startIcon={<FileCopy />}
                          onClick={handleRetryPayment}
                          fullWidth
                        >
                          Retry Payment
                        </Button>
                      )}
                      
                      <Button
                        variant="outlined"
                        startIcon={<Visibility />}
                        onClick={() => setTabValue(1)}
                        fullWidth
                      >
                        View Timeline
                      </Button>
                      
                      <Button
                        variant="outlined"
                        startIcon={<Print />}
                        onClick={() => window.print()}
                        fullWidth
                      >
                        Print Details
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
  
          {/* Timeline Tab */}
          <TabPanel value={tabValue} index={1}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                  <HistoryIcon color="primary" />
                  Payment Processing Timeline
                </Typography>
                
                <Timeline>
                  {paymentHistory.map((event, index) => (
                    <TimelineItem key={event.id}>
                      <TimelineSeparator>
                        <TimelineDot color={
                          event.status === 'completed' ? 'success' :
                          event.status === 'active' ? 'warning' :
                          event.status === 'error' ? 'error' : 'grey'
                        }>
                          {event.icon}
                        </TimelineDot>
                        {index < paymentHistory.length - 1 && <TimelineConnector />}
                      </TimelineSeparator>
                      
                      <TimelineContent sx={{ py: '12px', px: 2 }}>
                        <Paper elevation={1} sx={{ p: 2 }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {event.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {event.description}
                          </Typography>
                          
                          <Box display="flex" alignItems="center" gap={2} mb={1}>
                            <Typography variant="caption" color="text.secondary">
                              📅 {formatDate(event.timestamp)}
                            </Typography>
                            {event.user && (
                              <Typography variant="caption" color="text.secondary">
                                👤 {event.user}
                              </Typography>
                            )}
                            {event.duration && (
                              <Typography variant="caption" color="text.secondary">
                                ⏱️ {event.duration}
                              </Typography>
                            )}
                            {event.batchId && (
                              <Chip label={`Batch: ${event.batchId}`} size="small" variant="outlined" />
                            )}
                          </Box>
                          
                          {event.details && event.details.length > 0 && (
                            <List dense>
                              {event.details.map((detail, idx) => (
                                <ListItem key={idx} disablePadding>
                                  <Typography variant="caption" color="text.secondary">
                                    • {detail}
                                  </Typography>
                                </ListItem>
                              ))}
                            </List>
                          )}
                        </Paper>
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
              </CardContent>
            </Card>
          </TabPanel>
  
          {/* Bank Details Tab */}
          <TabPanel value={tabValue} index={2}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                  <AccountBalance color="primary" />
                  Banking Information
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Processing Bank
                    </Typography>
                    {payment.bankName ? (
                      <Box display="flex" alignItems="center" gap={2} p={2} border={1} borderColor="grey.200" borderRadius={1}>
                        <BankIcon bankName={payment.bankName} size="medium" />
                        <Box>
                          <Typography variant="h6" fontWeight="bold">
                            {payment.bankName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Saudi Banking Network
                          </Typography>
                        </Box>
                      </Box>
                    ) : (
                      <Alert severity="info">
                        Bank information will be assigned during processing
                      </Alert>
                    )}
                  </Grid>
  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Employee Bank Account
                    </Typography>
                    
                    <List>
                      {getIban() && (
                        <ListItem>
                          <ListItemIcon>
                            <CreditCard />
                          </ListItemIcon>
                          <ListItemText
                            primary="IBAN"
                            secondary={getIban()}
                          />
                        </ListItem>
                      )}
                      
                      {getAccountNumber() && (
                        <ListItem>
                          <ListItemIcon>
                            <AccountBalanceWallet />
                          </ListItemIcon>
                          <ListItemText
                            primary="Account Number"
                            secondary={getAccountNumber()}
                          />
                        </ListItem>
                      )}
                      
                      <ListItem>
                        <ListItemIcon>
                          <Person />
                        </ListItemIcon>
                        <ListItemText
                          primary="Account Name"
                          secondary={payment.employeeName}
                        />
                      </ListItem>
                      
                      {getBeneficiaryAddress() && (
                        <ListItem>
                          <ListItemIcon>
                            <LocationOn />
                          </ListItemIcon>
                          <ListItemText
                            primary="Beneficiary Address"
                            secondary={getBeneficiaryAddress()}
                          />
                        </ListItem>
                      )}
                    </List>
                    
                    {payment.status === PaymentStatus.COMPLETED && (
                      <Alert severity="success" sx={{ mt: 2 }}>
                        ✓ Bank details verified and payment successful
                      </Alert>
                    )}
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </TabPanel>
  
          {/* Documents Tab */}
          <TabPanel value={tabValue} index={3}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                  <DocumentScanner color="primary" />
                  Related Documents
                </Typography>
                
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Receipt />
                    </ListItemIcon>
                    <ListItemText
                      primary="Original Quotation"
                      secondary={`Quotation ${payment.quotationId} - ${formatSAR(payment.amount)}`}
                    />
                    <Button variant="outlined" size="small" startIcon={<Visibility />}>
                      View
                    </Button>
                  </ListItem>
                  
                  {getBatchId() && (
                    <ListItem>
                      <ListItemIcon>
                        <Description />
                      </ListItemIcon>
                      <ListItemText
                        primary="Bank Payment File"
                        secondary={`Batch ${getBatchId()} - Excel format for ${payment.bankName || 'Saudi Bank'}`}
                      />
                      <Button variant="outlined" size="small" startIcon={<GetApp />}>
                        Download
                      </Button>
                    </ListItem>
                  )}
  
                  {payment.status === PaymentStatus.COMPLETED && getBatchId() && (
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircle />
                      </ListItemIcon>
                      <ListItemText
                        primary="Payment Confirmation"
                        secondary={`Batch reference: ${getBatchId()}`}
                      />
                      <Button variant="outlined" size="small" startIcon={<Visibility />}>
                        View
                      </Button>
                    </ListItem>
                  )}
  
                  <ListItem>
                    <ListItemIcon>
                      <Print />
                    </ListItemIcon>
                    <ListItemText
                      primary="Payment Summary Report"
                      secondary="Complete payment details and timeline report"
                    />
                    <Button variant="outlined" size="small" startIcon={<Print />}>
                      Generate
                    </Button>
                  </ListItem>
  
                  {/* Audit Trail */}
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Audit Trail
                  </Typography>
                  
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Action</TableCell>
                          <TableCell>User</TableCell>
                          <TableCell>Timestamp</TableCell>
                          <TableCell>Details</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>Payment Created</TableCell>
                          <TableCell>System</TableCell>
                          <TableCell>{formatDate(payment.createdAt)}</TableCell>
                          <TableCell>From approved quotation</TableCell>
                        </TableRow>
                        
                        {payment.status !== PaymentStatus.READY_FOR_PAYMENT && (
                          <TableRow>
                            <TableCell>Status Updated</TableCell>
                            <TableCell>Account Manager</TableCell>
                            <TableCell>{formatDate(getUpdatedAt() || payment.createdAt)}</TableCell>
                            <TableCell>Status changed to {payment.status}</TableCell>
                          </TableRow>
                        )}
                        
                        {getCompletedAt() && (
                          <TableRow>
                            <TableCell>Payment {payment.status === PaymentStatus.COMPLETED ? 'Completed' : 'Processed'}</TableCell>
                            <TableCell>{payment.bankName || 'Saudi Bank'}</TableCell>
                            <TableCell>{formatDate(getCompletedAt()!)}</TableCell>
                            <TableCell>
                              {payment.status === PaymentStatus.COMPLETED 
                                ? `Payment successful${getBatchId() ? ` - Batch: ${getBatchId()}` : ''}`
                                : getErrorMessage() || 'Processing update'}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </List>
              </CardContent>
            </Card>
          </TabPanel>
        </DialogContent>
  
        <DialogActions>
          <Box display="flex" justifyContent="space-between" width="100%" p={1}>
            <Box display="flex" gap={1}>
              {payment.status === PaymentStatus.FAILED && (
                <Button
                  variant="contained"
                  color="warning"
                  startIcon={<FileCopy />}
                  onClick={handleRetryPayment}
                >
                  Retry Payment
                </Button>
              )}
              
              {payment.status === PaymentStatus.READY_FOR_PAYMENT && (
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<Update />}
                  onClick={() => handleStatusUpdate(PaymentStatus.BANK_PROCESSING)}
                >
                  Mark as Processing
                </Button>
              )}

              {payment.status === PaymentStatus.BANK_PROCESSING && (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircle />}
                  onClick={() => handleStatusUpdate(PaymentStatus.COMPLETED)}
                >
                  Mark as Completed
                </Button>
              )}
            </Box>
  
            <Box display="flex" gap={1}>
              <Button
                variant="outlined"
                startIcon={<Share />}
                onClick={handleShare}
              >
                Share
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<Print />}
                onClick={() => window.print()}
              >
                Print
              </Button>
              
              <Button onClick={onClose} variant="contained">
                Close
              </Button>
            </Box>
          </Box>
        </DialogActions>
      </Dialog>
    );
  };
  
  export default PaymentDetails;