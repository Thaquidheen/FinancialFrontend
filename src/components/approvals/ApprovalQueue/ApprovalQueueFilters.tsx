// components/approvals/ApprovalQueue/ApprovalQueueFilters.tsx
import React, { useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  IconButton,
  Collapse,
  FormControlLabel,
  Switch,
  Slider,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  Clear as ClearIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { ApprovalFilters } from '../../../types/approval.types';
import { FILTER_OPTIONS, DEFAULT_FILTERS } from '../../../constants/approvals/approvalConstants';

interface ApprovalQueueFiltersProps {
  filters: ApprovalFilters;
  onFiltersChange: (filters: Partial<ApprovalFilters>) => void;
  onClose: () => void;
}

const ApprovalQueueFilters: React.FC<ApprovalQueueFiltersProps> = ({
  filters,
  onFiltersChange,
  onClose,
}) => {
  const [expandedSections, setExpandedSections] = useState({
    status: true,
    urgency: true,
    budget: true,
    amount: false,
    date: false,
    other: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleStatusChange = (status: string) => {
    const currentStatuses = filters.status || [];
    const newStatuses = currentStatuses.includes(status as any)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status as any];
    
    onFiltersChange({ status: newStatuses });
  };

  const handleUrgencyChange = (urgency: string) => {
    const currentUrgencies = filters.urgency || [];
    const newUrgencies = currentUrgencies.includes(urgency as any)
      ? currentUrgencies.filter(u => u !== urgency)
      : [...currentUrgencies, urgency as any];
    
    onFiltersChange({ urgency: newUrgencies });
  };

  const handleBudgetComplianceChange = (compliance: string) => {
    const currentCompliances = filters.budgetCompliance || [];
    const newCompliances = currentCompliances.includes(compliance as any)
      ? currentCompliances.filter(c => c !== compliance)
      : [...currentCompliances, compliance as any];
    
    onFiltersChange({ budgetCompliance: newCompliances });
  };

  const handleAmountRangeChange = (event: Event, newValue: number | number[]) => {
    if (Array.isArray(newValue)) {
      onFiltersChange({
        amountRange: {
          min: newValue[0],
          max: newValue[1],
        },
      });
    }
  };

  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    const currentRange = filters.dateRange || { start: new Date(), end: new Date() };
    const newDate = new Date(value);
    
    if (field === 'start') {
      onFiltersChange({
        dateRange: {
          start: newDate,
          end: currentRange.end,
        },
      });
    } else {
      onFiltersChange({
        dateRange: {
          start: currentRange.start,
          end: newDate,
        },
      });
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ searchTerm: event.target.value });
  };

  const handleHasDocumentsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ hasDocuments: event.target.checked ? true : undefined });
  };

  const clearAllFilters = () => {
    onFiltersChange(DEFAULT_FILTERS);
  };

  const clearFilter = (filterType: keyof ApprovalFilters) => {
    onFiltersChange({ [filterType]: DEFAULT_FILTERS[filterType] });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.status && filters.status.length > 0) count++;
    if (filters.urgency && filters.urgency.length > 0) count++;
    if (filters.budgetCompliance && filters.budgetCompliance.length > 0) count++;
    if (filters.amountRange) count++;
    if (filters.dateRange) count++;
    if (filters.hasDocuments !== undefined) count++;
    if (filters.searchTerm) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Paper variant="outlined" sx={{ p: 2, height: 'fit-content' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6">
          Filters
          {activeFiltersCount > 0 && (
            <Chip 
              label={activeFiltersCount} 
              size="small" 
              color="primary" 
              sx={{ ml: 1 }}
            />
          )}
        </Typography>
        <Box>
          {activeFiltersCount > 0 && (
            <IconButton size="small" onClick={clearAllFilters} title="Clear all filters">
              <ClearIcon />
            </IconButton>
          )}
          <IconButton size="small" onClick={onClose} title="Close filters">
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Search */}
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search quotations..."
          value={filters.searchTerm || ''}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
        />
      </Box>

      {/* Status Filter */}
      <Box sx={{ mb: 2 }}>
        <Button
          fullWidth
          onClick={() => toggleSection('status')}
          sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
        >
          <Typography variant="subtitle2">
            Status ({filters.status?.length || 0})
          </Typography>
        </Button>
        <Collapse in={expandedSections.status}>
          <Box sx={{ mt: 1 }}>
            {FILTER_OPTIONS.STATUS.map(option => (
              <Chip
                key={option.value}
                label={option.label}
                size="small"
                variant={filters.status?.includes(option.value as any) ? 'filled' : 'outlined'}
                color={filters.status?.includes(option.value as any) ? 'primary' : 'default'}
                onClick={() => handleStatusChange(option.value)}
                sx={{ mr: 0.5, mb: 0.5 }}
              />
            ))}
          </Box>
        </Collapse>
      </Box>

      {/* Urgency Filter */}
      <Box sx={{ mb: 2 }}>
        <Button
          fullWidth
          onClick={() => toggleSection('urgency')}
          sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
        >
          <Typography variant="subtitle2">
            Priority ({filters.urgency?.length || 0})
          </Typography>
        </Button>
        <Collapse in={expandedSections.urgency}>
          <Box sx={{ mt: 1 }}>
            {FILTER_OPTIONS.URGENCY.map(option => (
              <Chip
                key={option.value}
                label={option.label}
                size="small"
                variant={filters.urgency?.includes(option.value as any) ? 'filled' : 'outlined'}
                color={filters.urgency?.includes(option.value as any) ? 'primary' : 'default'}
                onClick={() => handleUrgencyChange(option.value)}
                sx={{ mr: 0.5, mb: 0.5 }}
              />
            ))}
          </Box>
        </Collapse>
      </Box>

      {/* Budget Compliance Filter */}
      <Box sx={{ mb: 2 }}>
        <Button
          fullWidth
          onClick={() => toggleSection('budget')}
          sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
        >
          <Typography variant="subtitle2">
            Budget ({filters.budgetCompliance?.length || 0})
          </Typography>
        </Button>
        <Collapse in={expandedSections.budget}>
          <Box sx={{ mt: 1 }}>
            {FILTER_OPTIONS.BUDGET_COMPLIANCE.map(option => (
              <Chip
                key={option.value}
                label={option.label}
                size="small"
                variant={filters.budgetCompliance?.includes(option.value as any) ? 'filled' : 'outlined'}
                color={filters.budgetCompliance?.includes(option.value as any) ? 'primary' : 'default'}
                onClick={() => handleBudgetComplianceChange(option.value)}
                sx={{ mr: 0.5, mb: 0.5 }}
              />
            ))}
          </Box>
        </Collapse>
      </Box>

      {/* Amount Range Filter */}
      <Box sx={{ mb: 2 }}>
        <Button
          fullWidth
          onClick={() => toggleSection('amount')}
          sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
        >
          <Typography variant="subtitle2">
            Amount Range {filters.amountRange && '(Active)'}
          </Typography>
        </Button>
        <Collapse in={expandedSections.amount}>
          <Box sx={{ mt: 2, px: 1 }}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {filters.amountRange 
                ? `${filters.amountRange.min.toLocaleString()} - ${filters.amountRange.max.toLocaleString()} SAR`
                : '0 - 1,000,000 SAR'
              }
            </Typography>
            <Slider
              value={filters.amountRange ? [filters.amountRange.min, filters.amountRange.max] : [0, 1000000]}
              onChange={handleAmountRangeChange}
              valueLabelDisplay="auto"
              min={0}
              max={1000000}
              step={1000}
              marks={[
                { value: 0, label: '0' },
                { value: 500000, label: '500K' },
                { value: 1000000, label: '1M' },
              ]}
            />
          </Box>
        </Collapse>
      </Box>

      {/* Date Range Filter */}
      <Box sx={{ mb: 2 }}>
        <Button
          fullWidth
          onClick={() => toggleSection('date')}
          sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
        >
          <Typography variant="subtitle2">
            Date Range {filters.dateRange && '(Active)'}
          </Typography>
        </Button>
        <Collapse in={expandedSections.date}>
          <Box sx={{ mt: 1 }}>
            <TextField
              fullWidth
              size="small"
              label="From Date"
              type="date"
              value={filters.dateRange?.start.toISOString().split('T')[0] || ''}
              onChange={(e) => handleDateRangeChange('start', e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 1 }}
            />
            <TextField
              fullWidth
              size="small"
              label="To Date"
              type="date"
              value={filters.dateRange?.end.toISOString().split('T')[0] || ''}
              onChange={(e) => handleDateRangeChange('end', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </Collapse>
      </Box>

      {/* Other Filters */}
      <Box sx={{ mb: 2 }}>
        <Button
          fullWidth
          onClick={() => toggleSection('other')}
          sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
        >
          <Typography variant="subtitle2">
            Other Options
          </Typography>
        </Button>
        <Collapse in={expandedSections.other}>
          <Box sx={{ mt: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={filters.hasDocuments === true}
                  onChange={handleHasDocumentsChange}
                  size="small"
                />
              }
              label="Has Documents"
            />
          </Box>
        </Collapse>
      </Box>

      {activeFiltersCount > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          <Button
            fullWidth
            variant="outlined"
            size="small"
            onClick={clearAllFilters}
            startIcon={<ClearIcon />}
          >
            Clear All Filters
          </Button>
        </>
      )}
    </Paper>
  );
};

export default ApprovalQueueFilters;