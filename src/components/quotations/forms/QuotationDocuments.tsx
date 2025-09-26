// src/components/quotations/forms/QuotationDocuments.tsx
import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  LinearProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Description as FileIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  InsertDriveFile as DocumentIcon
} from '@mui/icons-material';

interface QuotationDocumentsProps {
  documents: File[];
  onDocumentsChange: (documents: File[]) => void;
}

interface DocumentWithPreview extends File {
  id: string;
  preview?: string;
  category?: 'INVOICE' | 'RECEIPT' | 'CONTRACT' | 'SPECIFICATION' | 'OTHER';
  description?: string;
}

const QuotationDocuments: React.FC<QuotationDocumentsProps> = ({
  documents,
  onDocumentsChange
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<DocumentWithPreview[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<number | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingFile, setEditingFile] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    category: 'OTHER' as 'INVOICE' | 'RECEIPT' | 'CONTRACT' | 'SPECIFICATION' | 'OTHER',
    description: ''
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const documentCategories = [
    { value: 'INVOICE', label: 'Invoice' },
    { value: 'RECEIPT', label: 'Receipt' },
    { value: 'CONTRACT', label: 'Contract' },
    { value: 'SPECIFICATION', label: 'Specification' },
    { value: 'OTHER', label: 'Other' }
  ];

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <ImageIcon />;
    if (fileType === 'application/pdf') return <PdfIcon />;
    if (fileType.includes('document') || fileType.includes('text')) return <DocumentIcon />;
    return <FileIcon />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newFiles: DocumentWithPreview[] = files.map(file => ({
      ...file,
      id: Math.random().toString(36).substr(2, 9),
      category: 'OTHER' as const,
      description: ''
    }));

    setSelectedFiles(prev => [...prev, ...newFiles]);
    
    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Convert to File array and add to documents
      const newDocuments = [...documents, ...selectedFiles];
      onDocumentsChange(newDocuments);
      
      setSelectedFiles([]);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteFile = (index: number) => {
    setFileToDelete(index);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (fileToDelete !== null) {
      const newDocuments = documents.filter((_, i) => i !== fileToDelete);
      onDocumentsChange(newDocuments);
    }
    setDeleteDialogOpen(false);
    setFileToDelete(null);
  };

  const handleEditFile = (index: number) => {
    const file = documents[index] as DocumentWithPreview;
    setEditingFile(index);
    setEditForm({
      category: file.category || 'OTHER',
      description: file.description || ''
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingFile !== null) {
      const updatedDocuments = [...documents];
      const file = updatedDocuments[editingFile] as DocumentWithPreview;
      file.category = editForm.category;
      file.description = editForm.description;
      onDocumentsChange(updatedDocuments);
    }
    setEditDialogOpen(false);
    setEditingFile(null);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    const newFiles: DocumentWithPreview[] = files.map(file => ({
      ...file,
      id: Math.random().toString(36).substr(2, 9),
      category: 'OTHER' as const,
      description: ''
    }));
    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        Documents ({documents.length})
      </Typography>

      {/* Upload Area */}
      <Card 
        sx={{ 
          mb: 3, 
          border: '2px dashed #ccc',
          '&:hover': { borderColor: 'primary.main' }
        }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Upload Documents
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Drag and drop files here, or click to select files
          </Typography>
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            Choose Files
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {uploading && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" gutterBottom>
            Uploading files...
          </Typography>
          <LinearProgress variant="determinate" value={uploadProgress} />
        </Box>
      )}

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              Selected Files ({selectedFiles.length})
            </Typography>
            <List>
              {selectedFiles.map((file, index) => (
                <ListItem key={file.id}>
                  {getFileIcon(file.type)}
                  <ListItemText
                    primary={file.name}
                    secondary={`${formatFileSize(file.size)} • ${file.category}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton 
                      edge="end" 
                      onClick={() => {
                        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button variant="contained" onClick={handleUpload} disabled={uploading}>
                Upload All
              </Button>
              <Button onClick={() => setSelectedFiles([])}>
                Clear All
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Uploaded Documents */}
      {documents.length === 0 ? (
        <Card>
          <CardContent>
            <Typography variant="body1" color="text.secondary" textAlign="center" py={4}>
              No documents uploaded yet. Upload files to attach them to this quotation.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              Uploaded Documents ({documents.length})
            </Typography>
            <List>
              {documents.map((file, index) => {
                const fileWithPreview = file as DocumentWithPreview;
                return (
                  <ListItem key={index} divider={index < documents.length - 1}>
                    {getFileIcon(file.type)}
                    <ListItemText
                      primary={file.name}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {formatFileSize(file.size)} • {file.type}
                          </Typography>
                          {fileWithPreview.description && (
                            <Typography variant="caption" color="text.secondary">
                              {fileWithPreview.description}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {fileWithPreview.category && (
                        <Chip 
                          label={fileWithPreview.category.replace(/_/g, ' ')} 
                          size="small" 
                          color="primary" 
                          variant="outlined" 
                        />
                      )}
                      <IconButton size="small" onClick={() => handleEditFile(index)}>
                        <ViewIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDeleteFile(index)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </ListItem>
                );
              })}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Document</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this document? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Document Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Document</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value as any })}
                  label="Category"
                >
                  {documentCategories.map((category) => (
                    <MenuItem key={category.value} value={category.value}>
                      {category.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Add a description for this document..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Help Text */}
      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body2">
          <strong>Supported file types:</strong> PDF, DOC, DOCX, XLS, XLSX, JPG, JPEG, PNG, GIF
          <br />
          <strong>Maximum file size:</strong> 10MB per file
          <br />
          <strong>Total files:</strong> Up to 20 documents per quotation
        </Typography>
      </Alert>
    </Box>
  );
};

export default QuotationDocuments;
