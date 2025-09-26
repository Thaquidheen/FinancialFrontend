// components/approvals/ApprovalReview/CommentsSection.tsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Divider,
} from '@mui/material';
import {
  Send as SendIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { QuotationDetails as QuotationDetailsType, ApprovalItem, QuotationComment } from '../../../types/approval.types';
import { formatDate } from '../../../utils/approvals/approvalUtils';

interface CommentsSectionProps {
  quotation: QuotationDetailsType;
  approval: ApprovalItem;
  onAddComment?: (comment: string) => void;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({
  quotation,
  approval,
  onAddComment,
}) => {
  const [newComment, setNewComment] = useState('');

  const handleAddComment = () => {
    if (newComment.trim() && onAddComment) {
      onAddComment(newComment.trim());
      setNewComment('');
    }
  };

  const getCommentTypeColor = (type: string) => {
    switch (type) {
      case 'SUBMISSION': return 'primary';
      case 'APPROVAL': return 'success';
      case 'REJECTION': return 'error';
      default: return 'default';
    }
  };

  const renderCommentForm = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Add Comment
        </Typography>
        
        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder="Add a comment about this quotation..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          sx={{ mb: 2 }}
        />
        
        <Box display="flex" justifyContent="flex-end">
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            onClick={handleAddComment}
            disabled={!newComment.trim()}
          >
            Add Comment
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  const renderCommentsList = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Comments ({quotation.comments.length})
        </Typography>
        
        {quotation.comments.length === 0 ? (
          <Typography variant="body2" color="textSecondary">
            No comments yet. Be the first to add one!
          </Typography>
        ) : (
          <List>
            {quotation.comments.map((comment, index) => (
              <React.Fragment key={comment.id || index}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
                        <Typography variant="subtitle2">
                          {comment.userName}
                        </Typography>
                        <Chip 
                          label={comment.type} 
                          size="small" 
                          color={getCommentTypeColor(comment.type) as any}
                          variant="outlined"
                        />
                        <Typography variant="caption" color="textSecondary">
                          {formatDate(comment.createdDate, true)}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Typography variant="body2">
                        {comment.comment}
                      </Typography>
                    }
                  />
                </ListItem>
                
                {index < quotation.comments.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {renderCommentForm()}
      {renderCommentsList()}
    </Box>
  );
};
