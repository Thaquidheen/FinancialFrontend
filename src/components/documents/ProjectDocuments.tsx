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
  Divider,
  Tabs,
  Tab
} from '@mui/material';
import {
  ExpandMore,
  AttachFile,
  Upload,
  List
} from '@mui/icons-material';
import { DocumentList, DocumentUpload } from './';
import { useProjectDocuments } from '../../hooks/useDocuments';
import { canUserAccessProjectDocuments } from '../../utils/documentPermissions';
import { useAuth } from '../../hooks/useAuth';
import { DocumentCategory } from '../../types/document';

interface ProjectDocumentsProps {
  projectId: number;
  onDocumentUpload?: () => void;
  showUpload?: boolean;
  showTabs?: boolean;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`project-docs-tabpanel-${index}`}
      aria-labelledby={`project-docs-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

export const ProjectDocuments: React.FC<ProjectDocumentsProps> = ({
  projectId,
  onDocumentUpload,
  showUpload = true,
  showTabs = false
}) => {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  
  const { 
    data: documents = [], 
    isLoading, 
    error,
    refetch 
  } = useProjectDocuments(projectId, expanded);

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

  // Filter documents by category if tabs are shown
  const getDocumentsByCategory = (category: DocumentCategory) => {
    return documents.filter(doc => doc.category === category);
  };

  if (!canUserAccessProjectDocuments(user, projectId)) {
    return (
      <Alert severity="warning">
        You don't have permission to view documents for this project.
      </Alert>
    );
  }

  const renderDocuments = (docs: any[]) => (
    <DocumentList
      documents={docs}
      loading={isLoading}
      onDocumentClick={handleDocumentClick}
      onDownload={handleDocumentDownload}
      showProjectInfo={false}
      emptyMessage="No documents found"
    />
  );

  return (
    <Accordion 
      expanded={expanded} 
      onChange={(_, isExpanded) => setExpanded(isExpanded)}
    >
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Box display="flex" alignItems="center" gap={1}>
          <AttachFile />
          <Typography variant="subtitle1">
            Project Documents ({documents.length})
          </Typography>
        </Box>
      </AccordionSummary>
      
      <AccordionDetails>
        <Stack spacing={2}>
          {showUpload && (
            <>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2">Upload Documents</Typography>
                <DocumentUpload
                  projectId={projectId}
                  onUploadComplete={handleUploadComplete}
                  maxFiles={10}
                />
              </Box>
              <Divider />
            </>
          )}

          {error && (
            <Alert severity="error">
              Failed to load documents
            </Alert>
          )}

          {showTabs ? (
            <Box>
              <Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)}>
                <Tab label="All Documents" />
                <Tab label="Contracts" />
                <Tab label="Invoices" />
                <Tab label="Photos" />
                <Tab label="Other" />
              </Tabs>

              <TabPanel value={currentTab} index={0}>
                {renderDocuments(documents)}
              </TabPanel>

              <TabPanel value={currentTab} index={1}>
                {renderDocuments(getDocumentsByCategory(DocumentCategory.CONTRACT))}
              </TabPanel>

              <TabPanel value={currentTab} index={2}>
                {renderDocuments([
                  ...getDocumentsByCategory(DocumentCategory.INVOICE),
                  ...getDocumentsByCategory(DocumentCategory.BILL),
                  ...getDocumentsByCategory(DocumentCategory.RECEIPT)
                ])}
              </TabPanel>

              <TabPanel value={currentTab} index={3}>
                {renderDocuments(getDocumentsByCategory(DocumentCategory.PHOTO))}
              </TabPanel>

              <TabPanel value={currentTab} index={4}>
                {renderDocuments(getDocumentsByCategory(DocumentCategory.OTHER))}
              </TabPanel>
            </Box>
          ) : (
            renderDocuments(documents)
          )}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};
