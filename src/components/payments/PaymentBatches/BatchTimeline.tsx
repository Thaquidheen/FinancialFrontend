// src/components/payments/PaymentBatches/BatchTimeline.tsx

import React from 'react';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineOppositeContent,
  TimelineDot
} from '@mui/lab';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  Schedule,
  Description,
  CloudUpload,
  PlayArrow,
  CheckCircle,
  Error,
  Info,
  Warning,
  AccessTime
} from '@mui/icons-material';
import { PaymentBatch, PaymentBatchStatus } from '../../../types/payment.types';
import { saudiBankService } from '../../../services/saudiBankService';

interface BatchTimelineProps {
  batch: PaymentBatch;
  showEstimates?: boolean;
  compact?: boolean;
  className?: string;
}

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  timestamp?: string;
  status: 'completed' | 'current' | 'pending' | 'failed';
  icon: React.ReactNode;
  user?: string;
  estimatedTime?: string;
  details?: string[];
  actions?: string[];
}

const BatchTimeline: React.FC<BatchTimelineProps> = ({
  batch,
  showEstimates = true,
  compact = false,
  className
}) => {
  const bank = saudiBankService.getBankByCode(batch.bankName);
  
  const generateTimelineEvents = (): TimelineEvent[] => {
    const events: TimelineEvent[] = [
      {
        id: 'created',
        title: 'Batch Created',
        description: 'Payment batch created and payments validated',
        timestamp: batch.createdAt,
        status: 'completed',
        icon: <Schedule />,
        user: batch.createdBy,
        details: [
          `${batch.paymentCount} payments included`,
          `Total amount: ${saudiBankService.formatSAR(batch.totalAmount)}`,
          `Target bank: ${bank?.name || batch.bankName}`
        ]
      },
      {
        id: 'file_generated',
        title: 'Bank File Generated',
        description: 'Excel file created for bank processing',
        timestamp: batch.status !== PaymentBatchStatus.CREATED ? batch.createdAt : undefined,
        status: batch.status === PaymentBatchStatus.CREATED ? 'pending' : 'completed',
        icon: <Description />,
        estimatedTime: '1-2 minutes',
        details: batch.fileName ? [
          `File: ${batch.fileName}`,
          `Format: Excel (.xlsx)`,
          `Ready for download`
        ] : [
          'Generating bank-specific Excel file',
          'Validating payment data',
          'Applying bank formatting rules'
        ]
      },
      {
        id: 'sent_to_bank',
        title: 'Sent to Bank',
        description: 'File uploaded to bank portal',
        status: 
          batch.status === PaymentBatchStatus.CREATED || batch.status === PaymentBatchStatus.FILE_GENERATED 
            ? 'pending'
            : batch.status === PaymentBatchStatus.FAILED 
              ? 'failed' 
              : 'completed',
        icon: <CloudUpload />,
        estimatedTime: showEstimates ? '5-15 minutes' : undefined,
        details: [
          'Manual upload to bank portal required',
          'File validation by bank system',
          'Upload confirmation needed'
        ],
        actions: [
          'Download the Excel file',
          'Login to bank portal',
          'Upload to bulk payments section',
          'Mark batch as "Sent to Bank"'
        ]
      },
      {
        id: 'processing',
        title: 'Bank Processing',
        description: 'Bank is processing the payments',
        status:
          [PaymentBatchStatus.CREATED, PaymentBatchStatus.FILE_GENERATED, PaymentBatchStatus.SENT_TO_BANK].includes(batch.status)
            ? 'pending'
            : batch.status === PaymentBatchStatus.PROCESSING
              ? 'current'
              : batch.status === PaymentBatchStatus.FAILED
                ? 'failed'
                : 'completed',
        icon: <PlayArrow />,
        estimatedTime: bank?.processingTime || '2-4 hours',
        details: [
          'Bank validates payment details',
          'Account verification in progress',
          'Payment execution initiated'
        ]
      },
      {
        id: 'completed',
        title: 'Completed',
        description: 'All payments processed successfully',
        timestamp: batch.completedAt,
        status: batch.status === PaymentBatchStatus.COMPLETED ? 'completed' : 
                batch.status === PaymentBatchStatus.FAILED ? 'failed' : 'pending',
        icon: batch.status === PaymentBatchStatus.FAILED ? <Error /> : <CheckCircle />,
        estimatedTime: showEstimates && batch.status !== PaymentBatchStatus.COMPLETED ? 
          `Total: ${getTotalEstimatedTime()}` : undefined,
        details: batch.status === PaymentBatchStatus.COMPLETED ? [
          'All payments executed successfully',
          'Bank confirmation received',
          'Process completed'
        ] : batch.status === PaymentBatchStatus.FAILED ? [
          'Processing failed',
          'Some payments may need retry',
          'Contact support if needed'
        ] : [
          'Awaiting bank confirmation',
          'Final payment execution',
          'Process completion'
        ]
      }
    ];

    return events;
  };

  const getTotalEstimatedTime = () => {
    if (!bank) return '4-8 hours';
    
    // Parse processing time (e.g., "2-4 hours" -> average 3 hours)
    const match = bank.processingTime.match(/(\d+)-(\d+)\s*hours?/);
    if (match) {
      const avg = (parseInt(match[1]) + parseInt(match[2])) / 2;
      return `${Math.floor(avg)}h`;
    }
    return bank.processingTime;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimelineItemColor = (status: TimelineEvent['status']) => {
    switch (status) {
      case 'completed': return 'success';
      case 'current': return 'primary';
      case 'failed': return 'error';
      default: return 'grey';
    }
  };

  const getChipColor = (status: TimelineEvent['status']) => {
    switch (status) {
      case 'completed': return 'success';
      case 'current': return 'primary';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const events = generateTimelineEvents();

  if (compact) {
    return (
      <Box className={className}>
        {events.filter(event => event.status !== 'pending').map((event) => (
          <Box key={event.id} display="flex" alignItems="center" gap={2} py={1}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: `${getTimelineItemColor(event.status)}.main`
              }}
            >
              {event.icon}
            </Avatar>
            <Box flex={1}>
              <Typography variant="body2" fontWeight="medium">
                {event.title}
              </Typography>
              {event.timestamp && (
                <Typography variant="caption" color="text.secondary">
                  {formatTimestamp(event.timestamp)}
                </Typography>
              )}
            </Box>
            <Chip
              size="small"
              label={event.status}
              color={getChipColor(event.status)}
              variant="outlined"
            />
          </Box>
        ))}
      </Box>
    );
  }

  return (
    <Box className={className}>
      {/* Timeline Header */}
      <Box mb={3}>
        <Typography variant="h6" gutterBottom>
          Processing Timeline
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Track the batch through each stage of the payment process
        </Typography>
      </Box>

      {/* Processing Time Alert */}
      {showEstimates && batch.status !== PaymentBatchStatus.COMPLETED && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Estimated Total Time:</strong> {getTotalEstimatedTime()}
            {bank && (
              <> • <strong>Bank Processing:</strong> {bank.processingTime}</>
            )}
          </Typography>
        </Alert>
      )}

      {/* Timeline */}
      <Timeline position="right">
        {events.map((event, index) => (
          <TimelineItem key={event.id}>
            <TimelineOppositeContent sx={{ flex: 0.3, pr: 2 }}>
              {event.timestamp ? (
                <Box>
                  <Typography variant="body2" fontWeight="medium">
                    {formatTimestamp(event.timestamp)}
                  </Typography>
                  {event.user && (
                    <Typography variant="caption" color="text.secondary">
                      by {event.user}
                    </Typography>
                  )}
                </Box>
              ) : event.status === 'pending' && event.estimatedTime ? (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Estimated
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {event.estimatedTime}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="caption" color="text.secondary">
                  {event.status === 'pending' ? 'Pending' : 'In Progress'}
                </Typography>
              )}
            </TimelineOppositeContent>

            <TimelineSeparator>
              <TimelineDot color={getTimelineItemColor(event.status)}>
                {event.icon}
              </TimelineDot>
              {index < events.length - 1 && (
                <TimelineConnector 
                  sx={{
                    bgcolor: event.status === 'completed' ? 'success.main' : 'grey.300'
                  }}
                />
              )}
            </TimelineSeparator>

            <TimelineContent sx={{ flex: 0.7 }}>
              <Card 
                variant="outlined"
                sx={{
                  borderColor: event.status === 'current' ? 'primary.main' : 
                               event.status === 'failed' ? 'error.main' :
                               event.status === 'completed' ? 'success.main' : 'grey.300',
                  borderWidth: event.status === 'current' ? 2 : 1
                }}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                    <Typography variant="h6" color={
                      event.status === 'failed' ? 'error.main' : 'text.primary'
                    }>
                      {event.title}
                    </Typography>
                    <Chip
                      size="small"
                      label={event.status}
                      color={getChipColor(event.status)}
                      variant={event.status === 'current' ? 'filled' : 'outlined'}
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" paragraph>
                    {event.description}
                  </Typography>

                  {/* Event Details */}
                  {event.details && (
                    <List dense sx={{ py: 0 }}>
                      {event.details.map((detail, idx) => (
                        <ListItem key={idx} disablePadding sx={{ py: 0.25 }}>
                          <ListItemIcon sx={{ minWidth: 28 }}>
                            <Info fontSize="small" color="action" />
                          </ListItemIcon>
                          <ListItemText
                            primary={detail}
                            primaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}

                  {/* Required Actions */}
                  {event.actions && event.status === 'pending' && (
                    <>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="subtitle2" color="warning.main" gutterBottom>
                        Required Actions:
                      </Typography>
                      <List dense sx={{ py: 0 }}>
                        {event.actions.map((action, idx) => (
                          <ListItem key={idx} disablePadding sx={{ py: 0.25 }}>
                            <ListItemIcon sx={{ minWidth: 28 }}>
                              <Warning fontSize="small" color="warning" />
                            </ListItemIcon>
                            <ListItemText
                              primary={action}
                              primaryTypographyProps={{ variant: 'body2' }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </>
                  )}

                  {/* Processing Time */}
                  {event.status === 'current' && event.estimatedTime && (
                    <Box mt={1} display="flex" alignItems="center" gap={1}>
                      <AccessTime fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        Estimated completion: {event.estimatedTime}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>

      {/* Current Status Summary */}
      <Card sx={{ mt: 3, bgcolor: 'primary.50' }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Current Status Summary
          </Typography>
          <Typography variant="body2">
            {batch.status === PaymentBatchStatus.CREATED && 
              "Batch is ready for file generation."}
            {batch.status === PaymentBatchStatus.FILE_GENERATED && 
              "File is generated and ready for download and bank upload."}
            {batch.status === PaymentBatchStatus.SENT_TO_BANK && 
              "File has been uploaded to bank. Waiting for processing to begin."}
            {batch.status === PaymentBatchStatus.PROCESSING && 
              "Bank is currently processing the payments. Monitor for completion."}
            {batch.status === PaymentBatchStatus.COMPLETED && 
              "All payments have been successfully completed by the bank."}
            {batch.status === PaymentBatchStatus.FAILED && 
              "Processing failed. Review errors and consider retrying."}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default BatchTimeline;