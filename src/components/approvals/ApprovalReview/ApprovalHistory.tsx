// components/approvals/ApprovalReview/ApprovalHistory.tsx
import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Edit as EditIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { ApprovalHistory as ApprovalHistoryType } from '../../../types/approval.types';
import { formatDate } from '../../../utils/approvals/approvalUtils';

interface ApprovalHistoryProps {
  history: ApprovalHistoryType[];
}

const ApprovalHistory: React.FC<ApprovalHistoryProps> = ({ history }) => {
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'APPROVE': return <ApproveIcon />;
      case 'REJECT': return <RejectIcon />;
      case 'REQUEST_CHANGES': return <EditIcon />;
      default: return <ScheduleIcon />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'APPROVE': return 'success';
      case 'REJECT': return 'error';
      case 'REQUEST_CHANGES': return 'warning';
      default: return 'default';
    }
  };

  const renderHistoryItem = (item: ApprovalHistoryType) => (
    <ListItem key={item.id} sx={{ px: 0 }}>
      <ListItemIcon>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            backgroundColor: getActionColor(item.action) === 'success' ? 'success.main' : 
                           getActionColor(item.action) === 'error' ? 'error.main' : 'warning.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}
        >
          {getActionIcon(item.action)}
        </Box>
      </ListItemIcon>
      <ListItemText
        primary={
          <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
            <Typography variant="subtitle1" fontWeight="medium">
              {item.performedByName}
            </Typography>
            <Chip 
              label={item.action.replace('_', ' ')} 
              size="small" 
              color={getActionColor(item.action) as any}
            />
            <Typography variant="caption" color="text.secondary">
              {formatDate(item.timestamp, true)}
            </Typography>
          </Box>
        }
        secondary={
          <Box>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
              Changed status from <strong>{item.oldStatus}</strong> to <strong>{item.newStatus}</strong>
            </Typography>
            {item.comments && (
              <Box sx={{ mt: 1, p: 1, backgroundColor: 'background.default', borderRadius: 1 }}>
                <Typography variant="body2">
                  <strong>Comments:</strong> {item.comments}
                </Typography>
              </Box>
            )}
            {item.reason && (
              <Box sx={{ mt: 1, p: 1, backgroundColor: 'background.default', borderRadius: 1 }}>
                <Typography variant="body2">
                  <strong>Reason:</strong> {item.reason}
                </Typography>
              </Box>
            )}
          </Box>
        }
      />
    </ListItem>
  );

  if (!history || history.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Approval History
          </Typography>
          <Typography variant="body2" color="textSecondary">
            No approval history available for this quotation.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Approval History
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          Complete timeline of all approval actions for this quotation.
        </Typography>
        
        <List>
          {history.map((item, index) => (
            <React.Fragment key={item.id}>
              {renderHistoryItem(item)}
              {index < history.length - 1 && <Divider sx={{ my: 1 }} />}
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export { ApprovalHistory };