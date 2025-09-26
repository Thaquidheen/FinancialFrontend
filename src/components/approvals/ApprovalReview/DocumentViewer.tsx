// components/approvals/ApprovalReview/DocumentViewer.tsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Button,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  AttachFile as AttachmentIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  Description as DocumentIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { QuotationDetails as QuotationDetailsType, ApprovalItem } from '../../../types/approval.types';
import { formatDate } from '../../../utils/approvals/approvalUtils';

interface DocumentViewerProps {
  quotation: QuotationDetailsType;
  approval: ApprovalItem;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  quotation,
  approval,
}) => {
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <PdfIcon />;
    if (fileType.includes('image')) return <ImageIcon />;
    return <DocumentIcon />;
  };

  const getFileTypeColor = (fileType: string) => {
    if (fileType.includes('pdf')) return 'error';
    if (fileType.includes('image')) return 'success';
    return 'default';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = async (document: any) => {
    setDownloading(document.id);
    try {
      // This would be implemented with the document service
      console.log('Downloading document:', document);
      // await documentService.downloadDocument(document.id);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setDownloading(null);
    }
  };

  const handlePreview = (document: any) => {
    setSelectedDocument(document);
    setPreviewOpen(true);
  };

  const renderDocumentList = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Attached Documents ({quotation.documents.length})
        </Typography>
        
        {quotation.documents.length === 0 ? (
          <Alert severity="info">
            No documents attached to this quotation.
          </Alert>
        ) : (
          <List>
            {quotation.documents.map((doc, index) => (
              <ListItem
                key={doc.id || index}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                <ListItemIcon>
                  {getFileIcon(doc.fileType)}
                </ListItemIcon>
                
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body1" fontWeight="medium">
                        {doc.fileName}
                      </Typography>
                      <Chip 
                        label={doc.fileType} 
                        size="small" 
                        color={getFileTypeColor(doc.fileType) as any}
                        variant="outlined"
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Size: {formatFileSize(doc.fileSize)} • 
                        Uploaded: {formatDate(doc.uploadDate, true)}
                      </Typography>
                    </Box>
                  }
                />
                
                <Box display="flex" gap={1}>
                  <Tooltip title="Preview">
                    <IconButton 
                      size="small" 
                      onClick={() => handlePreview(doc)}
                    >
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Download">
                    <IconButton 
                      size="small" 
                      onClick={() => handleDownload(doc)}
                      disabled={downloading === doc.id}
                    >
                      {downloading === doc.id ? (
                        <LinearProgress />
                      ) : (
                        <DownloadIcon />
                      )}
                    </IconButton>
                  </Tooltip>
                </Box>
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );

  const renderDocumentPreview = () => (
    <Dialog
      open={previewOpen}
      onClose={() => setPreviewOpen(false)}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { minHeight: '80vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {selectedDocument?.fileName}
          </Typography>
          <IconButton onClick={() => setPreviewOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {selectedDocument && (
          <Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="textSecondary">
                File Type: {selectedDocument.fileType} • 
                Size: {formatFileSize(selectedDocument.fileSize)} • 
                Uploaded: {formatDate(selectedDocument.uploadDate, true)}
              </Typography>
            </Box>
            
            <Box 
              sx={{ 
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                p: 2,
                textAlign: 'center',
                minHeight: 400,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              {selectedDocument.fileType.includes('image') ? (
                <img 
                  src={selectedDocument.downloadUrl} 
                  alt={selectedDocument.fileName}
                  style={{ maxWidth: '100%', maxHeight: '400px' }}
                />
              ) : selectedDocument.fileType.includes('pdf') ? (
                <Box>
                  <PdfIcon sx={{ fontSize: 80, color: 'text.secondary' }} />
                  <Typography variant="body1" color="textSecondary">
                    PDF Preview not available
                  </Typography>
                  <Button 
                    variant="contained" 
                    startIcon={<DownloadIcon />}
                    onClick={() => handleDownload(selectedDocument)}
                  >
                    Download to View
                  </Button>
                </Box>
              ) : (
                <Box>
                  <DocumentIcon sx={{ fontSize: 80, color: 'text.secondary' }} />
                  <Typography variant="body1" color="textSecondary">
                    Preview not available for this file type
                  </Typography>
                  <Button 
                    variant="contained" 
                    startIcon={<DownloadIcon />}
                    onClick={() => handleDownload(selectedDocument)}
                  >
                    Download to View
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={() => setPreviewOpen(false)}>
          Close
        </Button>
        <Button 
          variant="contained" 
          startIcon={<DownloadIcon />}
          onClick={() => selectedDocument && handleDownload(selectedDocument)}
        >
          Download
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderDocumentSummary = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Document Summary
        </Typography>
        
        <Box display="flex" gap={2} flexWrap="wrap">
          <Chip 
            icon={<AttachmentIcon />}
            label={`${quotation.documents.length} documents`}
            color="primary"
            variant="outlined"
          />
          
          {quotation.documents.length > 0 && (
            <>
              <Chip 
                label={`${quotation.documents.filter(d => d.fileType.includes('pdf')).length} PDFs`}
                color="error"
                variant="outlined"
              />
              <Chip 
                label={`${quotation.documents.filter(d => d.fileType.includes('image')).length} Images`}
                color="success"
                variant="outlined"
              />
              <Chip 
                label={`${quotation.documents.filter(d => !d.fileType.includes('pdf') && !d.fileType.includes('image')).length} Other`}
                color="default"
                variant="outlined"
              />
            </>
          )}
        </Box>
        
        {quotation.documents.length > 0 && (
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            Total size: {formatFileSize(
              quotation.documents.reduce((sum, doc) => sum + doc.fileSize, 0)
            )}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {renderDocumentSummary()}
      {renderDocumentList()}
      {renderDocumentPreview()}
    </Box>
  );
};