import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Stack,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider
} from '@mui/material';
import {
  CloudUpload,
  AttachFile,
  Close,
  CheckCircle,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useDocumentUpload } from '../../hooks/useDocuments';
import { DocumentCategory, DocumentUploadRequest } from '../../types/document';
import { validateFiles, formatFileSize, generateFileId } from '../../utils/documentUtils';
import { useAuth } from '../../hooks/useAuth';

interface DocumentUploadProps {
  projectId?: number;
  onUploadComplete?: (documents: any[]) => void;
  maxFiles?: number;
  allowedTypes?: string[];
  showProjectSelector?: boolean;
  defaultCategory?: DocumentCategory;
}

interface UploadFile {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  progress: number;
  error?: string;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  projectId,
  onUploadComplete,
  maxFiles = 10,
  allowedTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png'],
  showProjectSelector = false,
  defaultCategory = DocumentCategory.OTHER
}) => {
  const { user } = useAuth();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [category, setCategory] = useState<DocumentCategory>(defaultCategory);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useDocumentUpload();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Validate files
    const validation = validateFiles(files);
    if (!validation.valid) {
      setValidationErrors(validation.errors);
      return;
    }

    // Check max files limit
    if (files.length + uploadFiles.length > maxFiles) {
      setValidationErrors([`Maximum ${maxFiles} files allowed`]);
      return;
    }

    // Create upload file objects
    const newUploadFiles: UploadFile[] = files.map(file => ({
      id: generateFileId(),
      file,
      status: 'pending',
      progress: 0
    }));

    setUploadFiles(prev => [...prev, ...newUploadFiles]);
    setValidationErrors([]);
    setUploadDialogOpen(true);
  };

  const handleRemoveFile = (fileId: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags(prev => [...prev, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddTag();
    }
  };

  const handleUpload = async () => {
    if (uploadFiles.length === 0) return;

    const files = uploadFiles.map(uf => uf.file);
    const request: DocumentUploadRequest = {
      files,
      projectId,
      category,
      description: description.trim() || undefined,
      tags: tags.filter(tag => tag.trim())
    };

    try {
      // Update files to uploading status
      setUploadFiles(prev => prev.map(f => ({ ...f, status: 'uploading' as const })));

      const uploadedDocuments = await uploadMutation.mutateAsync(request);
      
      // Update files to completed status
      setUploadFiles(prev => prev.map(f => ({ ...f, status: 'completed' as const, progress: 100 })));
      
      onUploadComplete?.(uploadedDocuments);
      
      // Reset form after a short delay
      setTimeout(() => {
        setUploadDialogOpen(false);
        setUploadFiles([]);
        setDescription('');
        setTags([]);
        setCategory(defaultCategory);
        setUploadProgress(0);
        setValidationErrors([]);
      }, 2000);
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadFiles(prev => prev.map(f => ({ 
        ...f, 
        status: 'error' as const, 
        error: 'Upload failed' 
      })));
    }
  };

  const handleClose = () => {
    if (uploadMutation.isLoading) return;
    setUploadDialogOpen(false);
    setUploadFiles([]);
    setDescription('');
    setTags([]);
    setCategory(defaultCategory);
    setUploadProgress(0);
    setValidationErrors([]);
  };

  const getFileStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle color="success" fontSize="small" />;
      case 'error':
        return <ErrorIcon color="error" fontSize="small" />;
      case 'uploading':
        return <LinearProgress size={20} />;
      default:
        return null;
    }
  };

  return (
    <>
      <Box>
        <Button
          variant="contained"
          startIcon={<CloudUpload />}
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadMutation.isLoading}
          size="large"
        >
          Upload Documents
        </Button>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={allowedTypes.join(',')}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </Box>

      <Dialog 
        open={uploadDialogOpen} 
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        disableEscapeKeyDown={uploadMutation.isLoading}
      >
        <DialogTitle>
          Upload Documents
          {uploadFiles.length > 0 && ` (${uploadFiles.length})`}
        </DialogTitle>
        <DialogContent>
          {validationErrors.length > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {validationErrors.map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            </Alert>
          )}

          <Stack spacing={3}>
            {/* File List */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Selected Files
              </Typography>
              <List dense>
                {uploadFiles.map((uploadFile) => (
                  <ListItem key={uploadFile.id} divider>
                    <ListItemText
                      primary={uploadFile.file.name}
                      secondary={`${formatFileSize(uploadFile.file.size)} • ${uploadFile.status}`}
                    />
                    <ListItemSecondaryAction>
                      <Box display="flex" alignItems="center" gap={1}>
                        {getFileStatusIcon(uploadFile.status)}
                        {uploadFile.status === 'pending' && (
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveFile(uploadFile.id)}
                            disabled={uploadMutation.isLoading}
                          >
                            <Close />
                          </IconButton>
                        )}
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Box>

            <Divider />

            {/* Category Selection */}
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                disabled={uploadMutation.isLoading}
              >
                {Object.values(DocumentCategory).map(cat => (
                  <MenuItem key={cat} value={cat}>
                    {cat.replace(/_/g, ' ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Description */}
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description (Optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={uploadMutation.isLoading}
            />

            {/* Tags */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Tags
              </Typography>
              <Box display="flex" gap={1} mb={1}>
                <TextField
                  size="small"
                  placeholder="Add a tag"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={uploadMutation.isLoading}
                />
                <Button
                  variant="outlined"
                  onClick={handleAddTag}
                  disabled={!tagInput.trim() || uploadMutation.isLoading}
                >
                  Add
                </Button>
              </Box>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleRemoveTag(tag)}
                    disabled={uploadMutation.isLoading}
                    size="small"
                  />
                ))}
              </Box>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleClose}
            disabled={uploadMutation.isLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUpload}
            variant="contained"
            disabled={uploadFiles.length === 0 || uploadMutation.isLoading}
            startIcon={uploadMutation.isLoading ? <LinearProgress size={20} /> : <CloudUpload />}
          >
            {uploadMutation.isLoading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
