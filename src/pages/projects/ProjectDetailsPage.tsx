// src/pages/projects/ProjectDetailsPage.tsx
import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Breadcrumbs, 
  Link, 
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Alert
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit as EditIcon } from '@mui/icons-material';
import ProjectDetailsPanel from '@components/projects/ProjectDetailsPanel';
import ProjectForm from '@components/projects/ProjectForm';
import { useProject } from '@hooks/useProject';
import { useAuth } from '@contexts/AuthContext';
import { USER_ROLES } from '@/types/auth';
import { Project } from '@/types/project';

const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const projectId = id ? parseInt(id) : null;
  const { data: projectData, error } = useProject(projectId);
  const project = projectData?.data;

  const canEdit = user?.roles?.some(role => 
    [USER_ROLES.SUPER_ADMIN, USER_ROLES.ACCOUNT_MANAGER].includes(role as any)
  );

  const handleEditSuccess = (_updatedProject: Project) => {
    setEditDialogOpen(false);
    // Project will be updated via React Query cache
  };

  if (!projectId) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Invalid project ID</Alert>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Failed to load project details. Please try again.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link 
          color="inherit" 
          href="/projects" 
          onClick={(e) => {
            e.preventDefault();
            navigate('/projects');
          }}
        >
          Projects
        </Link>
        <Typography color="text.primary">
          {project?.name || 'Project Details'}
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {project?.name || 'Project Details'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Complete project overview and management
          </Typography>
        </Box>

        {canEdit && project && (
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => setEditDialogOpen(true)}
          >
            Edit Project
          </Button>
        )}
      </Box>

      {/* Project Details */}
      <ProjectDetailsPanel
        projectId={projectId}
        onEdit={() => setEditDialogOpen(true)}
      />

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { minHeight: 600 }
        }}
      >
        <DialogTitle>Edit Project</DialogTitle>
        <DialogContent>
          {project && (
            <ProjectForm
              project={project}
              mode="edit"
              onSuccess={handleEditSuccess}
              onCancel={() => setEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export { ProjectDetailsPage };