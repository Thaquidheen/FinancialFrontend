
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
    <Box sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: '#f8fafc',
    }}>
      <Box sx={{ flex: 1, overflow: 'hidden', p: 3 }}>
        {/* Header Section */}
        <Box 
          sx={{ 
            mb: 3,
            p: 3,
            bgcolor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          }}
        >
          {/* Breadcrumbs */}
          <Breadcrumbs sx={{ mb: 2 }}>
            <Link 
              sx={{ 
                color: '#64748b',
                textDecoration: 'none',
                '&:hover': { color: '#3b82f6' }
              }}
              href="/projects" 
              onClick={(e) => {
                e.preventDefault();
                navigate('/projects');
              }}
            >
              Projects
            </Link>
            <Typography sx={{ color: '#1a202c', fontWeight: 500 }}>
              Create Project
            </Typography>
          </Breadcrumbs>

          {/* Header */}
          <Box>
            <Typography 
              variant="h4" 
              component="h1" 
              sx={{ 
                color: '#1a202c',
                fontSize: '1.875rem',
                fontWeight: 700,
                letterSpacing: '-0.025em',
                mb: 1
              }}
            >
              Create New Project
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#64748b',
                fontSize: '0.875rem'
              }}
            >
              Set up a new project with budget allocation and timeline
            </Typography>
          </Box>
        </Box>

        {/* Form Section */}
        <Box
          sx={{
            bgcolor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
          }}
        >
          <ProjectForm
            mode="create"
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </Box>
      </Box>
    </Box>
  );
};

export { CreateProjectPage };