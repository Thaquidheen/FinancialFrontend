import React, { useState } from 'react';
import {
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  Chip,
  Paper,
  Alert
} from '@mui/material';
import {
  ExpandMore,
  Clear,
  FilterList,
  SaveAs
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { PaymentSearchParams, PaymentStatus } from '../../../types/payment.types';
import { SAUDI_BANKS } from '../../../types/saudiBanking.types';

interface AdvancedFiltersProps {
  filters: PaymentSearchParams;
  onFiltersChange: (filters: Partial<PaymentSearchParams>) => void;
  onApply: () => void;
  onClear: () => void;
  onSave?: (name: string, filters: PaymentSearchParams) => void;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  onFiltersChange,
  onApply,
  onClear,
  onSave
}) => {
  const [expanded, setExpanded] = useState<string[]>(['basic']);
  const [amountRange, setAmountRange] = useState<[number, number]>([
    filters.amountRange?.min || 0,
    filters.amountRange?.max || 100000
  ]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [savedFilterName, setSavedFilterName] = useState('');

  const handleSectionToggle = (section: string) => {
    setExpanded(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const handleAmountRangeChange = (_event: Event, newValue: number | number[]) => {
    const value = newValue as [number, number];
    setAmountRange(value);
    onFiltersChange({
      amountRange: { min: value[0], max: value[1] }
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.employeeName) count++;
    if (filters.status && filters.status.length > 0) count++;
    if (filters.bankName && filters.bankName.length > 0) count++;
    if (filters.amountRange) count++;
    if (filters.dateRange?.startDate || filters.dateRange?.endDate) count++;
    if (filters.projectName) count++;
    return count;
  };

  const handleSaveFilters = () => {
    if (onSave && savedFilterName.trim()) {
      onSave(savedFilterName.trim(), filters);
      setSaveDialogOpen(false);
      setSavedFilterName('');
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper elevation={1} sx={{ p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" display="flex" alignItems="center" gap={1}>
            <FilterList />
            Advanced Filters
            {getActiveFiltersCount() > 0 && (
              <Chip 
                label={`${getActiveFiltersCount()} active`} 
                size="small" 
                color="primary" 
                variant="outlined" 
              />
            )}
          </Typography>
          <Box display="flex" gap={1}>
            {onSave && (
              <Button
                size="small"
                startIcon={<SaveAs />}
                onClick={() => setSaveDialogOpen(true)}
                disabled={getActiveFiltersCount() === 0}
              >
                Save
              </Button>
            )}
            <Button
              size="small"
              startIcon={<Clear />}
              onClick={onClear}
              disabled={getActiveFiltersCount() === 0}
            >
              Clear All
            </Button>
          </Box>
        </Box>

        {/* Save Filter Dialog */}
        {saveDialogOpen && (
          <Alert 
            severity="info" 
            sx={{ mb: 2 }}
            action={
              <Box display="flex" gap={1}>
                <TextField
                  size="small"
                  placeholder="Filter name..."
                  value={savedFilterName}
                  onChange={(e) => setSavedFilterName(e.target.value)}
                />
                <Button size="small" onClick={handleSaveFilters}>Save</Button>
                <Button size="small" onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
              </Box>
            }
          >
            Save current filters for future use
          </Alert>
        )}

        {/* Basic Filters */}
        <Accordion 
          expanded={expanded.includes('basic')}
          onChange={() => handleSectionToggle('basic')}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle1">Basic Search</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Search Text"
                  placeholder="Employee name, quotation ID..."
                  value={filters.search || ''}
                  onChange={(e) => onFiltersChange({ search: e.target.value })}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Employee Name"
                  value={filters.employeeName || ''}
                  onChange={(e) => onFiltersChange({ employeeName: e.target.value })}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Project Name"
                  value={filters.projectName || ''}
                  onChange={(e) => onFiltersChange({ projectName: e.target.value })}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Bank</InputLabel>
                  <Select
                    value={filters.bankName?.[0] || ''}
                    onChange={(e) => onFiltersChange({ bankName: e.target.value ? [e.target.value] : undefined })}
                    label="Bank"
                  >
                    <MenuItem value="">All Banks</MenuItem>
                    {Object.values(SAUDI_BANKS).map((bank: any) => (
                      <MenuItem key={bank.code} value={bank.name}>
                        {bank.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Status Filters */}
        <Accordion 
          expanded={expanded.includes('status')}
          onChange={() => handleSectionToggle('status')}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle1">Payment Status</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormGroup row>
              {Object.values(PaymentStatus).map(status => (
                <FormControlLabel
                  key={status}
                  control={
                    <Checkbox
                      checked={filters.status?.includes(status) || false}
                      onChange={(e) => {
                        const currentStatuses = filters.status || [];
                        const newStatuses = e.target.checked
                          ? [...currentStatuses, status]
                          : currentStatuses.filter(s => s !== status);
                        onFiltersChange({ status: newStatuses });
                      }}
                    />
                  }
                  label={status}
                />
              ))}
            </FormGroup>
          </AccordionDetails>
        </Accordion>

        {/* Amount Range */}
        <Accordion 
          expanded={expanded.includes('amount')}
          onChange={() => handleSectionToggle('amount')}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle1">Amount Range</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box px={2}>
              <Typography variant="body2" gutterBottom>
                Amount: {amountRange[0].toLocaleString()} SAR - {amountRange[1].toLocaleString()} SAR
              </Typography>
              <Slider
                value={amountRange}
                onChange={handleAmountRangeChange}
                valueLabelDisplay="auto"
                min={0}
                max={200000}
                step={1000}
                valueLabelFormat={(value) => `${value.toLocaleString()} SAR`}
              />
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Date Range */}
        <Accordion 
          expanded={expanded.includes('dates')}
          onChange={() => handleSectionToggle('dates')}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle1">Date Range</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="From Date"
                  value={filters.dateRange?.startDate ? new Date(filters.dateRange.startDate) : null}
                  onChange={(date) => onFiltersChange({
                    dateRange: {
                      ...filters.dateRange,
                      startDate: date?.toISOString().split('T')[0] || ''
                    }
                  })}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="To Date"
                  value={filters.dateRange?.endDate ? new Date(filters.dateRange.endDate) : null}
                  onChange={(date) => onFiltersChange({
                    dateRange: {
                      ...filters.dateRange,
                      endDate: date?.toISOString().split('T')[0] || ''
                    }
                  })}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Action Buttons */}
        <Box display="flex" justifyContent="center" gap={2} mt={3}>
          <Button
            variant="contained"
            onClick={onApply}
            size="large"
            startIcon={<FilterList />}
          >
            Apply Filters
          </Button>
          <Button
            variant="outlined"
            onClick={onClear}
            size="large"
            startIcon={<Clear />}
            disabled={getActiveFiltersCount() === 0}
          >
            Clear All
          </Button>
        </Box>
      </Paper>
    </LocalizationProvider>
  );
};

export default AdvancedFilters;
