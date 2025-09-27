import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Alert,
  Divider
} from '@mui/material';
import {
  ExpandMore,
  AttachFile
} from '@mui/icons-material';
import { DocumentList, DocumentUpload } from './';
import { useQuotationDocuments } from '../../hooks/useDocuments';
import { canUserAccessQuotationDocuments } from '../../utils/documentPermissions';
import { useAuth } from '../../hooks/useAuth';

interface QuotationDocumentsProps {
  quotationId: number;
  onDocumentUpload?: () => void;
  showUpload?: boolean;
}

export const QuotationDocuments: React.FC<QuotationDocumentsProps> = ({
  quotationId,
  onDocumentUpload,
  showUpload = true
}) => {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  
  const { 
    data: documents = [], 
    isLoading, 
    error,
    refetch 
  } = useQuotationDocuments(quotationId, expanded);

  const handleUploadComplete = () => {
    refetch();
    onDocumentUpload?.();
  };

  const handleDocumentClick = (document: any) => {
    // Handle document click - could open preview or download
    console.log('Document clicked:', document);
  };

  const handleDocumentDownload = (document: any) => {
    // Handle document download
    console.log('Document download:', document);
  };

  if (!canUserAccessQuotationDocuments(user, quotationId)) {
    return (
      <Alert severity="warning">
        You don't have permission to view documents for this quotation.
      </Alert>
    );
  }

  return (
    <Accordion 
      expanded={expanded} 
      onChange={(_, isExpanded) => setExpanded(isExpanded)}
    >
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Box display="flex" alignItems="center" gap={1}>
          <AttachFile />
          <Typography variant="subtitle1">
            Documents ({documents.length})
          </Typography>
        </Box>
      </AccordionSummary>
      
      <AccordionDetails>
        <Stack spacing={2}>
          {showUpload && (
            <>
              <DocumentUpload
                projectId={undefined} // Quotation documents don't need project ID
                onUploadComplete={handleUploadComplete}
                maxFiles={5}
                defaultCategory="CONTRACT"
              />
              <Divider />
            </>
          )}

          {error && (
            <Alert severity="error">
              Failed to load documents
            </Alert>
          )}

          <DocumentList
            documents={documents}
            loading={isLoading}
            onDocumentClick={handleDocumentClick}
            onDownload={handleDocumentDownload}
            emptyMessage="No documents attached to this quotation"
          />
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};
