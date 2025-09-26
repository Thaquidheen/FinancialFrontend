// src/components/quotations/QuotationFilters.tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Typography,
  Divider,
  FormControlLabel,
  Switch,
  Autocomplete,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
  Bookmark as BookmarkIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { QuotationFilters, QUOTATION_FILTER_PRESETS } from '@/types/quotation/filters';
import { QuotationStatus, Currency } from '@/types/quotation';
import { LineItemCategory, AccountHead } from '@/types/quotation';
import { useMyProjects } from '@/hooks/useProject';

interface QuotationFiltersProps {
  open: boolean;
  onClose: () => void;
  filters: QuotationFilters;
  onFiltersChange: (filters: QuotationFilters) => void;
}

const QuotationFiltersComponent: React.FC<QuotationFiltersProps> = ({
  open,
  onClose,
  filters,
  onFiltersChange
}) => {
  const [localFilters, setLocalFilters] = useState<QuotationFilters>(filters);
  const [expandedSections, setExpandedSections] = useState<string[]>(['basic', 'dates', 'amounts']);

  // Fetch projects for project filter
  const { data: projectsResponse } = useMyProjects();
  const projects = (projectsResponse as any)?.data ?? [];

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key: keyof QuotationFilters, value: any) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleMultiSelectChange = (key: keyof QuotationFilters, value: any[]) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value.length > 0 ? value : undefined
    }));
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleClearFilters = () => {
    const clearedFilters: QuotationFilters = {
      page: 0,
      size: 20,
      sortBy: 'createdDate',
      sortDir: 'desc'
    };
    setLocalFilters(clearedFilters);
  };

  const handlePresetApply = (preset: any) => {
    const presetFilters = {
      ...localFilters,
      ...preset.filters,
      page: 0 // Reset to first page when applying preset
    };
    setLocalFilters(presetFilters);
  };

  const handleSectionToggle = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    Object.entries(localFilters).forEach(([key, value]) => {
      if (key !== 'page' && key !== 'size' && key !== 'sortBy' && key !== 'sortDir' && value !== undefined) {
        if (Array.isArray(value)) {
          count += value.length;
        } else {
          count += 1;
        }
      }
    });
    return count;
  };

  const statusOptions = Object.values(QuotationStatus);
  const currencyOptions = Object.values(Currency);
  const categoryOptions = Object.values(LineItemCategory);
  const accountHeadOptions = Object.values(AccountHead);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FilterIcon />
              <Typography variant="h6">Filter Quotations</Typography>
              {getActiveFiltersCount() > 0 && (
                <Chip 
                  label={getActiveFiltersCount()} 
                  size="small" 
                  color="primary" 
                />
              )}
            </Box>
            <IconButton onClick={onClose} size="small">
              <ClearIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Quick Filters
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {QUOTATION_FILTER_PRESETS.map((preset) => (
                <Chip
                  key={preset.id}
                  label={preset.name}
                  onClick={() => handlePresetApply(preset)}
                  variant="outlined"
                  size="small"
                  icon={<BookmarkIcon />}
                />
              ))}
            </Stack>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Basic Filters */}
          <Accordion 
            expanded={expandedSections.includes('basic')} 
            onChange={() => handleSectionToggle('basic')}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">Basic Filters</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      multiple
                      value={localFilters.status || []}
                      onChange={(e) => handleMultiSelectChange('status', e.target.value as QuotationStatus[])}
                      label="Status"
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {(selected as QuotationStatus[]).map((value) => (
                            <Chip key={value} label={value} size="small" />
                          ))}
                        </Box>
                      )}
                    >
                      {statusOptions.map((status) => (
                        <MenuItem key={status} value={status}>
                          {status.replace(/_/g, ' ')}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Currency</InputLabel>
                    <Select
                      multiple
                      value={localFilters.currency || []}
                      onChange={(e) => handleMultiSelectChange('currency', e.target.value as Currency[])}
                      label="Currency"
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {(selected as Currency[]).map((value) => (
                            <Chip key={value} label={value} size="small" />
                          ))}
                        </Box>
                      )}
                    >
                      {currencyOptions.map((currency) => (
                        <MenuItem key={currency} value={currency}>
                          {currency}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <Autocomplete
                    multiple
                    options={projects}
                    getOptionLabel={(option) => `${option.name} (${option.code})`}
                    value={projects.filter((p: any) => localFilters.projectId?.includes(p.id))}
                    onChange={(_, newValue) => handleMultiSelectChange('projectId', newValue.map(p => p.id))}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Projects"
                        placeholder="Select projects..."
                      />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          {...getTagProps({ index })}
                          key={option.id}
                          label={`${option.name} (${option.code})`}
                          size="small"
                        />
                      ))
                    }
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Search"
                    value={localFilters.search || ''}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Search in description, project name, etc."
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Date Filters */}
          <Accordion 
            expanded={expandedSections.includes('dates')} 
            onChange={() => handleSectionToggle('dates')}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">Date Filters</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Created From"
                    value={localFilters.startDate ? new Date(localFilters.startDate) : null}
                    onChange={(date) => handleFilterChange('startDate', date ? date.toISOString().split('T')[0] : undefined)}
                    slotProps={{
                      textField: { fullWidth: true }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Created To"
                    value={localFilters.endDate ? new Date(localFilters.endDate) : null}
                    onChange={(date) => handleFilterChange('endDate', date ? date.toISOString().split('T')[0] : undefined)}
                    slotProps={{
                      textField: { fullWidth: true }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Submitted From"
                    value={localFilters.submittedStartDate ? new Date(localFilters.submittedStartDate) : null}
                    onChange={(date) => handleFilterChange('submittedStartDate', date ? date.toISOString().split('T')[0] : undefined)}
                    slotProps={{
                      textField: { fullWidth: true }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Submitted To"
                    value={localFilters.submittedEndDate ? new Date(localFilters.submittedEndDate) : null}
                    onChange={(date) => handleFilterChange('submittedEndDate', date ? date.toISOString().split('T')[0] : undefined)}
                    slotProps={{
                      textField: { fullWidth: true }
                    }}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Amount Filters */}
          <Accordion 
            expanded={expandedSections.includes('amounts')} 
            onChange={() => handleSectionToggle('amounts')}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">Amount Filters</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Minimum Amount"
                    type="number"
                    value={localFilters.minAmount || ''}
                    onChange={(e) => handleFilterChange('minAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="0"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Maximum Amount"
                    type="number"
                    value={localFilters.maxAmount || ''}
                    onChange={(e) => handleFilterChange('maxAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="No limit"
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Advanced Filters */}
          <Accordion 
            expanded={expandedSections.includes('advanced')} 
            onChange={() => handleSectionToggle('advanced')}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">Advanced Filters</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Categories</InputLabel>
                    <Select
                      multiple
                      value={localFilters.categoryIds || []}
                      onChange={(e) => handleMultiSelectChange('categoryIds', e.target.value as LineItemCategory[])}
                      label="Categories"
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {(selected as LineItemCategory[]).map((value) => (
                            <Chip key={value} label={value.replace(/_/g, ' ')} size="small" />
                          ))}
                        </Box>
                      )}
                    >
                      {categoryOptions.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category.replace(/_/g, ' ')}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Account Heads</InputLabel>
                    <Select
                      multiple
                      value={localFilters.accountHeads || []}
                      onChange={(e) => handleMultiSelectChange('accountHeads', e.target.value as AccountHead[])}
                      label="Account Heads"
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {(selected as AccountHead[]).map((value) => (
                            <Chip key={value} label={value.replace(/_/g, ' ')} size="small" />
                          ))}
                        </Box>
                      )}
                    >
                      {accountHeadOptions.map((head) => (
                        <MenuItem key={head} value={head}>
                          {head.replace(/_/g, ' ')}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={localFilters.exceedsBudget || false}
                          onChange={(e) => handleFilterChange('exceedsBudget', e.target.checked ? true : undefined)}
                        />
                      }
                      label="Exceeds Budget"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={localFilters.urgentApproval || false}
                          onChange={(e) => handleFilterChange('urgentApproval', e.target.checked ? true : undefined)}
                        />
                      }
                      label="Urgent Approval Required"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={localFilters.hasDocuments || false}
                          onChange={(e) => handleFilterChange('hasDocuments', e.target.checked ? true : undefined)}
                        />
                      }
                      label="Has Documents"
                    />
                  </Box>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClearFilters} startIcon={<ClearIcon />}>
            Clear All
          </Button>
          <Button onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleApplyFilters} variant="contained" startIcon={<FilterIcon />}>
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default QuotationFiltersComponent;
