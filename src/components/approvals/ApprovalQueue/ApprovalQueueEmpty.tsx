// components/approvals/ApprovalQueue/ApprovalQueueEmpty.tsx
import React from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Container,
} from '@mui/material';
import {
  Inbox as InboxIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';

interface ApprovalQueueEmptyProps {
  onRefresh: () => void;
  onClearFilters?: () => void;
  hasActiveFilters?: boolean;
}

const ApprovalQueueEmpty: React.FC<ApprovalQueueEmptyProps> = ({
  onRefresh,
  onClearFilters,
  hasActiveFilters = false,
}) => {
  return (
    <Container maxWidth="sm">
      <Paper 
        variant="outlined" 
        sx={{ 
          p: 6, 
          textAlign: 'center',
          backgroundColor: 'background.paper',
        }}
      >
        <Box sx={{ mb: 3 }}>
          <InboxIcon 
            sx={{ 
              fontSize: 80, 
              color: 'text.secondary',
              opacity: 0.5,
            }} 
          />
        </Box>

        <Typography variant="h5" gutterBottom color="textSecondary">
          {hasActiveFilters ? 'No approvals match your filters' : 'No pending approvals'}
        </Typography>

        <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
          {hasActiveFilters 
            ? 'Try adjusting your filter criteria to see more results.'
            : 'All quotations have been processed or there are no submissions awaiting approval.'
          }
        </Typography>

        <Box display="flex" gap={2} justifyContent="center">
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={onRefresh}
          >
            Refresh
          </Button>

          {hasActiveFilters && onClearFilters && (
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={onClearFilters}
            >
              Clear Filters
            </Button>
          )}
        </Box>

        {!hasActiveFilters && (
          <Box sx={{ mt: 4, p: 2, backgroundColor: 'background.default', borderRadius: 1 }}>
            <Typography variant="body2" color="textSecondary">
              <strong>What happens next?</strong>
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              • Project managers submit quotations for approval<br/>
              • Urgent approvals (&gt;3 days) appear at the top<br/>
              • Use bulk actions to process multiple quotations<br/>
              • Review details before making decisions
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default ApprovalQueueEmpty;