import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Alert,
  Stack,
  Chip,
  Divider,
  Paper
} from '@mui/material';
import {
  Close,
  Download,
  Fullscreen,
  ZoomIn,
  ZoomOut,
  RotateLeft,
  RotateRight
} from '@mui/icons-material';
import { Document } from '../../types/document';
import { useDocumentPreview, useDocumentDownload } from '../../hooks/useDocuments';
import { 
  formatFileSize, 
  getCategoryDisplayName, 
  getCategoryColor,
  getRelativeTime,
  isImageFile,
  isPdfFile
} from '../../utils/documentUtils';

interface DocumentPreviewProps {
  document: Document | null;
  open: boolean;
  onClose: () => void;
  onDownload?: (document: Document) => void;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  document,
  open,
  onClose,
  onDownload
}) => {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  const { data: previewData, isLoading, error } = useDocumentPreview(
    document?.id || 0, 
    open && !!document
  );

  const downloadMutation = useDocumentDownload();

  useEffect(() => {
    if (open) {
      setZoom(100);
      setRotation(0);
      setFullscreen(false);
    }
  }, [open]);

  const handleDownload = async () => {
    if (document) {
      try {
        await downloadMutation.mutateAsync({ 
          id: document.id, 
          filename: document.fileName 
        });
        onDownload?.(document);
      } catch (error) {
        console.error('Download failed:', error);
      }
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 300));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 25));
  };

  const handleRotateLeft = () => {
    setRotation(prev => (prev - 90) % 360);
  };

  const handleRotateRight = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleFullscreen = () => {
    setFullscreen(!fullscreen);
  };

  const renderPreviewContent = () => {
    if (isLoading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error">
          Failed to load document preview
        </Alert>
      );
    }

    if (!previewData) {
      return (
        <Alert severity="info">
          Preview not available for this document type
        </Alert>
      );
    }

    if (isImageFile(document?.mimeType || '')) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight={400}
          sx={{ overflow: 'auto' }}
        >
          <img
            src={previewData.previewUrl}
            alt={document?.fileName}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              transition: 'transform 0.3s ease'
            }}
          />
        </Box>
      );
    }

    if (isPdfFile(document?.mimeType || '')) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight={400}
          sx={{ overflow: 'auto' }}
        >
          <iframe
            src={previewData.previewUrl}
            width="100%"
            height="600px"
            style={{ border: 'none' }}
            title={document?.fileName}
          />
        </Box>
      );
    }

    return (
      <Alert severity="info">
        Preview not supported for this file type
      </Alert>
    );
  };

  if (!document) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={fullscreen}
      PaperProps={{
        sx: { minHeight: '80vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" noWrap>
            {document.fileName}
          </Typography>
          <Box display="flex" gap={1}>
            <IconButton onClick={handleFullscreen} size="small">
              <Fullscreen />
            </IconButton>
            <IconButton onClick={onClose} size="small">
              <Close />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2}>
          {/* Document Info */}
          <Paper sx={{ p: 2 }}>
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
              <Chip
                label={getCategoryDisplayName(document.category)}
                color={getCategoryColor(document.category)}
                size="small"
              />
              <Typography variant="body2" color="text.secondary">
                {formatFileSize(document.fileSize)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Uploaded {getRelativeTime(document.uploadDate)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                by {document.uploadedBy.username}
              </Typography>
            </Stack>
            
            {document.description && (
              <>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2">
                  {document.description}
                </Typography>
              </>
            )}

            {document.tags.length > 0 && (
              <>
                <Divider sx={{ my: 1 }} />
                <Box display="flex" gap={1} flexWrap="wrap">
                  {document.tags.map((tag) => (
                    <Chip
                      key={tag.id}
                      label={tag.name}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </>
            )}
          </Paper>

          {/* Preview Controls */}
          {(isImageFile(document.mimeType) || isPdfFile(document.mimeType)) && (
            <Box display="flex" gap={1} justifyContent="center" flexWrap="wrap">
              <Button
                variant="outlined"
                startIcon={<ZoomOut />}
                onClick={handleZoomOut}
                size="small"
              >
                Zoom Out
              </Button>
              <Button
                variant="outlined"
                startIcon={<ZoomIn />}
                onClick={handleZoomIn}
                size="small"
              >
                Zoom In
              </Button>
              {isImageFile(document.mimeType) && (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<RotateLeft />}
                    onClick={handleRotateLeft}
                    size="small"
                  >
                    Rotate Left
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<RotateRight />}
                    onClick={handleRotateRight}
                    size="small"
                  >
                    Rotate Right
                  </Button>
                </>
              )}
              <Typography variant="body2" color="text.secondary" alignSelf="center">
                {zoom}%
              </Typography>
            </Box>
          )}

          {/* Preview Content */}
          <Box
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              overflow: 'auto',
              maxHeight: fullscreen ? 'calc(100vh - 200px)' : '60vh'
            }}
          >
            {renderPreviewContent()}
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Close
        </Button>
        <Button
          variant="contained"
          startIcon={<Download />}
          onClick={handleDownload}
          disabled={downloadMutation.isLoading}
        >
          {downloadMutation.isLoading ? 'Downloading...' : 'Download'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
