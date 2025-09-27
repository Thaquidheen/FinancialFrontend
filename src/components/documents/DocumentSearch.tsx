import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  Grid,
  Paper,
  Typography,
  Autocomplete,
  Stack,
  IconButton,
  Collapse
} from '@mui/material';
import {
  Search,
  FilterList,
  Clear,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material';
import { DocumentCategory } from '../../types/document';
import { useDocumentCategories, useDocumentTags } from '../../hooks/useDocuments';

interface DocumentSearchProps {
  searchParams: {
    searchTerm?: string;
    projectId?: number;
    category?: DocumentCategory;
    tags?: string[];
    startDate?: string;
    endDate?: string;
  };
  onSearchChange: (params: any) => void;
  onReset: () => void;
  showAdvancedFilters?: boolean;
  showProjectFilter?: boolean;
  projects?: Array<{ id: number; name: string }>;
}

export const DocumentSearch: React.FC<DocumentSearchProps> = ({
  searchParams,
  onSearchChange,
  onReset,
  showAdvancedFilters = true,
  showProjectFilter = true,
  projects = []
}) => {
  const [expanded, setExpanded] = useState(false);
  const [localParams, setLocalParams] = useState(searchParams);
  const [tagInput, setTagInput] = useState('');

  const { data: categories = [] } = useDocumentCategories();
  const { data: availableTags = [] } = useDocumentTags();

  useEffect(() => {
    setLocalParams(searchParams);
  }, [searchParams]);

  const handleSearchTermChange = (value: string) => {
    const newParams = { ...localParams, searchTerm: value };
    setLocalParams(newParams);
    onSearchChange(newParams);
  };

  const handleCategoryChange = (category: DocumentCategory | '') => {
    const newParams = { 
      ...localParams, 
      category: category || undefined 
    };
    setLocalParams(newParams);
    onSearchChange(newParams);
  };

  const handleProjectChange = (projectId: number | '') => {
    const newParams = { 
      ...localParams, 
      projectId: projectId || undefined 
    };
    setLocalParams(newParams);
    onSearchChange(newParams);
  };

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    const newParams = { 
      ...localParams, 
      [field]: value || undefined 
    };
    setLocalParams(newParams);
    onSearchChange(newParams);
  };

  const handleTagAdd = (tag: string) => {
    if (tag && !localParams.tags?.includes(tag)) {
      const newTags = [...(localParams.tags || []), tag];
      const newParams = { ...localParams, tags: newTags };
      setLocalParams(newParams);
      onSearchChange(newParams);
    }
    setTagInput('');
  };

  const handleTagRemove = (tagToRemove: string) => {
    const newTags = localParams.tags?.filter(tag => tag !== tagToRemove) || [];
    const newParams = { ...localParams, tags: newTags };
    setLocalParams(newParams);
    onSearchChange(newParams);
  };

  const handleReset = () => {
    const resetParams = {
      searchTerm: '',
      projectId: undefined,
      category: undefined,
      tags: [],
      startDate: '',
      endDate: ''
    };
    setLocalParams(resetParams);
    onReset();
  };

  const hasActiveFilters = () => {
    return !!(
      localParams.searchTerm ||
      localParams.projectId ||
      localParams.category ||
      localParams.tags?.length ||
      localParams.startDate ||
      localParams.endDate
    );
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (localParams.searchTerm) count++;
    if (localParams.projectId) count++;
    if (localParams.category) count++;
    if (localParams.tags?.length) count++;
    if (localParams.startDate) count++;
    if (localParams.endDate) count++;
    return count;
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Stack spacing={2}>
        {/* Basic Search */}
        <Box display="flex" gap={2} alignItems="center">
          <TextField
            fullWidth
            placeholder="Search documents..."
            value={localParams.searchTerm || ''}
            onChange={(e) => handleSearchTermChange(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
          {showAdvancedFilters && (
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() => setExpanded(!expanded)}
              endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
            >
              Filters
              {getActiveFilterCount() > 0 && (
                <Chip 
                  label={getActiveFilterCount()} 
                  size="small" 
                  sx={{ ml: 1 }}
                  color="primary"
                />
              )}
            </Button>
          )}
          {hasActiveFilters() && (
            <Button
              variant="outlined"
              startIcon={<Clear />}
              onClick={handleReset}
            >
              Clear
            </Button>
          )}
        </Box>

        {/* Advanced Filters */}
        <Collapse in={expanded}>
          <Grid container spacing={2}>
            {/* Category Filter */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={localParams.category || ''}
                  onChange={(e) => handleCategoryChange(e.target.value as DocumentCategory)}
                  label="Category"
                >
                  <MenuItem value="">
                    <em>All Categories</em>
                  </MenuItem>
                  {Object.values(DocumentCategory).map(category => (
                    <MenuItem key={category} value={category}>
                      {category.replace(/_/g, ' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Project Filter */}
            {showProjectFilter && (
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Project</InputLabel>
                  <Select
                    value={localParams.projectId || ''}
                    onChange={(e) => handleProjectChange(e.target.value as number)}
                    label="Project"
                  >
                    <MenuItem value="">
                      <em>All Projects</em>
                    </MenuItem>
                    {projects.map(project => (
                      <MenuItem key={project.id} value={project.id}>
                        {project.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {/* Date Range */}
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                type="date"
                label="From Date"
                value={localParams.startDate || ''}
                onChange={(e) => handleDateChange('startDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                type="date"
                label="To Date"
                value={localParams.endDate || ''}
                onChange={(e) => handleDateChange('endDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Tags */}
            <Grid item xs={12}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Tags
                </Typography>
                <Box display="flex" gap={1} mb={1} flexWrap="wrap">
                  {localParams.tags?.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      onDelete={() => handleTagRemove(tag)}
                      size="small"
                    />
                  ))}
                </Box>
                <Autocomplete
                  freeSolo
                  options={availableTags.map(tag => tag.name)}
                  value={tagInput}
                  onChange={(_, newValue) => {
                    if (newValue) {
                      handleTagAdd(newValue);
                    }
                  }}
                  onInputChange={(_, newInputValue) => {
                    setTagInput(newInputValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Add tags..."
                      size="small"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleTagAdd(tagInput);
                        }
                      }}
                    />
                  )}
                />
              </Box>
            </Grid>
          </Grid>
        </Collapse>

        {/* Active Filters Summary */}
        {hasActiveFilters() && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Active Filters:
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              {localParams.searchTerm && (
                <Chip
                  label={`Search: "${localParams.searchTerm}"`}
                  onDelete={() => handleSearchTermChange('')}
                  size="small"
                />
              )}
              {localParams.category && (
                <Chip
                  label={`Category: ${localParams.category.replace(/_/g, ' ')}`}
                  onDelete={() => handleCategoryChange('')}
                  size="small"
                />
              )}
              {localParams.projectId && (
                <Chip
                  label={`Project: ${projects.find(p => p.id === localParams.projectId)?.name || localParams.projectId}`}
                  onDelete={() => handleProjectChange('')}
                  size="small"
                />
              )}
              {localParams.startDate && (
                <Chip
                  label={`From: ${localParams.startDate}`}
                  onDelete={() => handleDateChange('startDate', '')}
                  size="small"
                />
              )}
              {localParams.endDate && (
                <Chip
                  label={`To: ${localParams.endDate}`}
                  onDelete={() => handleDateChange('endDate', '')}
                  size="small"
                />
              )}
              {localParams.tags?.map((tag) => (
                <Chip
                  key={tag}
                  label={`Tag: ${tag}`}
                  onDelete={() => handleTagRemove(tag)}
                  size="small"
                />
              ))}
            </Box>
          </Box>
        )}
      </Stack>
    </Paper>
  );
};
