
// src/pages/projects/CreateProjectPage.tsx
import React from 'react';
import { Box, Typography, Breadcrumbs, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ProjectForm from '@components/projects/ProjectForm';
import { Project } from '@/types/project';

const CreateProjectPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = (project: Project) => {
    navigate(`/projects/${project.id}`);
  };

  const handleCancel = () => {
    navigate('/projects');
  };

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
        <Typography color="text.primary">Create Project</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Project
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Set up a new project with budget allocation and timeline
        </Typography>
      </Box>

      {/* Form */}
      <ProjectForm
        mode="create"
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </Box>
  );
};

export { CreateProjectPage };