import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Tooltip,
  Stack,
  Pagination,
  Checkbox,
  FormControlLabel,
  Skeleton,
  Alert
} from '@mui/material';
import {
  MoreVert,
  Download,
  Delete,
  Preview,
  Description,
  Image,
  PictureAsPdf,
  InsertDriveFile,
  TableChart,
  Slideshow,
  TextSnippet,
  Archive
} from '@mui/icons-material';
import { format } from 'date-fns';
import { Document, DocumentCategory } from '../../types/document';
import { useDocumentDelete, useDocumentDownload } from '../../hooks/useDocuments';
import { 
  formatFileSize, 
  getFileIcon, 
  getCategoryColor, 
  getCategoryDisplayName,
  getRelativeTime,
  isImageFile,
  isPdfFile
} from '../../utils/documentUtils';
import { getDocumentPermissions } from '../../utils/documentPermissions';
import { useAuth } from '../../hooks/useAuth';

interface DocumentListProps {
  documents: Document[];
  loading?: boolean;
  totalPages?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onDocumentClick?: (document: Document) => void;
  onDownload?: (document: Document) => void;
  onPreview?: (document: Document) => void;
  showProjectInfo?: boolean;
  showSelection?: boolean;
  selectedDocuments?: number[];
  onSelectionChange?: (selectedIds: number[]) => void;
  emptyMessage?: string;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  loading = false,
  totalPages,
  currentPage,
  onPageChange,
  onDocumentClick,
  onDownload,
  onPreview,
  showProjectInfo = false,
  showSelection = false,
  selectedDocuments = [],
  onSelectionChange,
  emptyMessage = 'No documents found'
}) => {
  const { user } = useAuth();
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  
  const deleteMutation = useDocumentDelete();
  const downloadMutation = useDocumentDownload();

  const getFileIconComponent = (mimeType: string) => {
    const iconName = getFileIcon(mimeType);
    const iconProps = { fontSize: 'small' as const };
    
    switch (iconName) {
      case 'Image':
        return <Image {...iconProps} />;
      case 'PictureAsPdf':
        return <PictureAsPdf {...iconProps} />;
      case 'Description':
        return <Description {...iconProps} />;
      case 'TableChart':
        return <TableChart {...iconProps} />;
      case 'Slideshow':
        return <Slideshow {...iconProps} />;
      case 'TextSnippet':
        return <TextSnippet {...iconProps} />;
      case 'Archive':
        return <Archive {...iconProps} />;
      default:
        return <InsertDriveFile {...iconProps} />;
    }
  };

  const getCategoryColor = (category: DocumentCategory) => {
    const colors = {
      [DocumentCategory.INVOICE]: 'error',
      [DocumentCategory.BILL]: 'error',
      [DocumentCategory.RECEIPT]: 'success',
      [DocumentCategory.CONTRACT]: 'warning',
      [DocumentCategory.PHOTO]: 'info',
      [DocumentCategory.DELIVERY_NOTE]: 'primary',
      [DocumentCategory.SPECIFICATION]: 'secondary',
      [DocumentCategory.OTHER]: 'default'
    } as const;
    return colors[category] || 'default';
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, document: Document) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setSelectedDocument(document);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedDocument(null);
  };

  const handleDownload = async () => {
    if (selectedDocument) {
      try {
        await downloadMutation.mutateAsync({ 
          id: selectedDocument.id, 
          filename: selectedDocument.fileName 
        });
        onDownload?.(selectedDocument);
      } catch (error) {
        console.error('Download failed:', error);
      }
    }
    handleMenuClose();
  };

  const handlePreview = () => {
    if (selectedDocument) {
      onPreview?.(selectedDocument);
    }
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (selectedDocument) {
      try {
        await deleteMutation.mutateAsync(selectedDocument.id);
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
    handleMenuClose();
  };

  const handleSelectionChange = (documentId: number, checked: boolean) => {
    if (!onSelectionChange) return;
    
    if (checked) {
      onSelectionChange([...selectedDocuments, documentId]);
    } else {
      onSelectionChange(selectedDocuments.filter(id => id !== documentId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;
    
    if (checked) {
      onSelectionChange(documents.map(doc => doc.id));
    } else {
      onSelectionChange([]);
    }
  };

  const canPreview = (document: Document) => {
    return isImageFile(document.mimeType) || isPdfFile(document.mimeType);
  };

  if (loading) {
    return (
      <Grid container spacing={2}>
        {Array.from({ length: 6 }).map((_, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Skeleton variant="circular" width={40} height={40} />
                    <Skeleton variant="rectangular" width={24} height={24} />
                  </Box>
                  <Skeleton variant="text" width="80%" />
                  <Skeleton variant="text" width="60%" />
                  <Box display="flex" gap={1}>
                    <Skeleton variant="rectangular" width={60} height={24} />
                    <Skeleton variant="rectangular" width={40} height={24} />
                  </Box>
                  <Skeleton variant="text" width="40%" />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  if (documents.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Alert severity="info">
          {emptyMessage}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Selection Header */}
      {showSelection && (
        <Box mb={2} display="flex" alignItems="center" gap={2}>
          <FormControlLabel
            control={
              <Checkbox
                checked={selectedDocuments.length === documents.length && documents.length > 0}
                indeterminate={selectedDocuments.length > 0 && selectedDocuments.length < documents.length}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
            }
            label={`${selectedDocuments.length} of ${documents.length} selected`}
          />
        </Box>
      )}

      <Grid container spacing={2}>
        {documents.map((document) => {
          const permissions = getDocumentPermissions(user, document);
          const isSelected = selectedDocuments.includes(document.id);
          
          return (
            <Grid item xs={12} sm={6} md={4} key={document.id}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { boxShadow: 4 },
                  border: isSelected ? 2 : 0,
                  borderColor: 'primary.main'
                }}
                onClick={() => onDocumentClick?.(document)}
              >
                <CardContent>
                  <Stack spacing={2}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {getFileIconComponent(document.mimeType)}
                      </Avatar>
                      <Box display="flex" alignItems="center" gap={1}>
                        {showSelection && (
                          <Checkbox
                            checked={isSelected}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleSelectionChange(document.id, e.target.checked);
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        )}
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, document)}
                        >
                          <MoreVert />
                        </IconButton>
                      </Box>
                    </Box>

                    <Box>
                      <Typography 
                        variant="subtitle1" 
                        noWrap 
                        title={document.fileName}
                        sx={{ fontWeight: 500 }}
                      >
                        {document.fileName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatFileSize(document.fileSize)}
                      </Typography>
                    </Box>

                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Chip
                        size="small"
                        label={getCategoryDisplayName(document.category)}
                        color={getCategoryColor(document.category)}
                      />
                      {document.tags.slice(0, 2).map((tag) => (
                        <Chip
                          key={tag.id}
                          size="small"
                          label={tag.name}
                          variant="outlined"
                        />
                      ))}
                      {document.tags.length > 2 && (
                        <Chip
                          size="small"
                          label={`+${document.tags.length - 2}`}
                          variant="outlined"
                        />
                      )}
                    </Stack>

                    <Typography variant="caption" color="text.secondary">
                      {getRelativeTime(document.uploadDate)}
                      <br />
                      by {document.uploadedBy.username}
                    </Typography>

                    {showProjectInfo && document.projectId && (
                      <Typography variant="caption" color="primary">
                        Project #{document.projectId}
                      </Typography>
                    )}

                    {document.description && (
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ 
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {document.description}
                      </Typography>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Pagination */}
      {totalPages && totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={totalPages}
            page={currentPage || 1}
            onChange={(_, page) => onPageChange?.(page)}
            color="primary"
          />
        </Box>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        {selectedDocument && (
          <>
            {canPreview(selectedDocument) && (
              <MenuItem onClick={handlePreview}>
                <Preview sx={{ mr: 1 }} />
                Preview
              </MenuItem>
            )}
            {permissions.canDownload && (
              <MenuItem onClick={handleDownload}>
                <Download sx={{ mr: 1 }} />
                Download
              </MenuItem>
            )}
            {permissions.canDelete && (
              <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                <Delete sx={{ mr: 1 }} />
                Delete
              </MenuItem>
            )}
          </>
        )}
      </Menu>
    </Box>
  );
};
