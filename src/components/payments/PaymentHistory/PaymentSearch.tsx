// src/components/payments/PaymentHistory/PaymentSearch.tsx

import React, { useState } from 'react';
import {
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Chip,
  Button,
  Paper,
  Typography,
  Slider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert
} from '@mui/material';
import {
  ExpandMore,
  Search,
  Clear,
  Save
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { 
  PaymentSearchParams, 
  PaymentStatus 
} from '../../../types/payment.types';
import { SaudiBankDefinition } from '../../../types/saudiBanking.types';
import { saudiBankService } from '../../../services/saudiBankService';
import { PAYMENT_FILTER_OPTIONS } from '../../../constants/payments/paymentConstants';

interface PaymentSearchProps {
  filters: PaymentSearchParams;
  onFiltersChange: (filters: Partial<PaymentSearchParams>) => void;
  onSearch: () => void;
  savedSearches?: SavedSearch[];
  onSaveSearch?: (search: SavedSearch) => void;
  onLoadSearch?: (search: SavedSearch) => void;
  className?: string;
}

interface SavedSearch {
  id: string;
  name: string;
  filters: PaymentSearchParams;
  createdAt: string;
}

const PaymentSearch: React.FC<PaymentSearchProps> = ({
  filters,
  onFiltersChange,
  onSearch,
  savedSearches = [],
  onSaveSearch,
  onLoadSearch,
  className
}) => {
  const [expandedSections, setExpandedSections] = useState<string[]>(['basic']);
  const [amountRange, setAmountRange] = useState<[number, number]>([
    filters.amountRange?.min || 0,
    filters.amountRange?.max || 100000
  ]);
  const [saveSearchName, setSaveSearchName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const allBanks = saudiBankService.getAllBanks();
  
  const handleSectionToggle = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const handleAmountRangeChange = (_event: Event, newValue: number | number[]) => {
    const range = newValue as [number, number];
    setAmountRange(range);
    onFiltersChange({
      amountRange: {
        min: range[0],
        max: range[1]
      }
    });
  };

  const handleDateRangeChange = (field: 'startDate' | 'endDate', date: Date | null) => {
    const dateString = date?.toISOString().split('T')[0];
    onFiltersChange({
      dateRange: {
        ...filters.dateRange,
        [field]: dateString
      }
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      search: '',
      status: [],
      bankName: [],
      employeeName: '',
      projectId: [],
      amountRange: undefined,
      dateRange: undefined,
      batchId: ''
    });
    setAmountRange([0, 100000]);
  };

  const handleSaveSearch = () => {
    if (saveSearchName.trim() && onSaveSearch) {
      const savedSearch: SavedSearch = {
        id: Date.now().toString(),
        name: saveSearchName.trim(),
        filters: { ...filters },
        createdAt: new Date().toISOString()
      };
      onSaveSearch(savedSearch);
      setSaveSearchName('');
      setShowSaveDialog(false);
    }
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status?.length) count++;
    if (filters.bankName?.length) count++;
    if (filters.employeeName) count++;
    if (filters.projectId?.length) count++;
    if (filters.amountRange) count++;
    if (filters.dateRange?.startDate || filters.dateRange?.endDate) count++;
    if (filters.batchId) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Box className={className}>
      {/* Search Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" display="flex" alignItems="center" gap={1}>
          <Search />
          Advanced Payment Search
          {activeFiltersCount > 0 && (
            <Chip
              label={`${activeFiltersCount} active filter${activeFiltersCount === 1 ? '' : 's'}`}
              size="small"
              color="primary"
            />
          )}
        </Typography>
        
        <Box display="flex" gap={1}>
          {savedSearches.length > 0 && (
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Saved Searches</InputLabel>
              <Select
                label="Saved Searches"
                onChange={(e) => {
                  const search = savedSearches.find(s => s.id === e.target.value);
                  if (search && onLoadSearch) {
                    onLoadSearch(search);
                  }
                }}
              >
                {savedSearches.map(search => (
                  <MenuItem key={search.id} value={search.id}>
                    <Box>
                      <Typography variant="body2">{search.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(search.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          
          <Button
            startIcon={<Save />}
            onClick={() => setShowSaveDialog(true)}
            variant="outlined"
            size="small"
            disabled={activeFiltersCount === 0}
          >
            Save Search
          </Button>
          
          <Button
            startIcon={<Clear />}
            onClick={clearAllFilters}
            variant="outlined"
            size="small"
            disabled={activeFiltersCount === 0}
          >
            Clear All
          </Button>
        </Box>
      </Box>

      {/* Save Search Dialog */}
      {showSaveDialog && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Box display="flex" alignItems="center" gap={2}>
            <TextField
              size="small"
              label="Search Name"
              value={saveSearchName}
              onChange={(e) => setSaveSearchName(e.target.value)}
              placeholder="Enter a name for this search..."
            />
            <Button
              variant="contained"
              size="small"
              onClick={handleSaveSearch}
              disabled={!saveSearchName.trim()}
            >
              Save
            </Button>
            <Button
              size="small"
              onClick={() => {
                setShowSaveDialog(false);
                setSaveSearchName('');
              }}
            >
              Cancel
            </Button>
          </Box>
        </Alert>
      )}

      {/* Basic Search */}
      <Accordion 
        expanded={expandedSections.includes('basic')}
        onChange={() => handleSectionToggle('basic')}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="subtitle1">
            Basic Search & Filters
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            {/* Text Search */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Search Text"
                placeholder="Employee name, quotation ID, description..."
                value={filters.search || ''}
                onChange={(e) => onFiltersChange({ search: e.target.value })}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            </Grid>

            {/* Employee Name */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Employee Name"
                placeholder="Specific employee name..."
                value={filters.employeeName || ''}
                onChange={(e) => onFiltersChange({ employeeName: e.target.value })}
              />
            </Grid>

            {/* Status Multi-Select */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Payment Status</InputLabel>
                <Select
                  multiple
                  value={filters.status || []}
                  onChange={(e) => onFiltersChange({ status: e.target.value as PaymentStatus[] })}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip 
                          key={value} 
                          label={PAYMENT_FILTER_OPTIONS.STATUS.find(s => s.value === value)?.label}
                          size="small" 
                          color={PAYMENT_FILTER_OPTIONS.STATUS.find(s => s.value === value)?.color}
                        />
                      ))}
                    </Box>
                  )}
                >
                  {PAYMENT_FILTER_OPTIONS.STATUS.map((status) => (
                    <MenuItem key={status.value} value={status.value}>
                      <Checkbox checked={filters.status?.includes(status.value) || false} />
                      <Chip 
                        label={status.label}
                        size="small"
                        color={status.color}
                        sx={{ ml: 1 }}
                      />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Banks Multi-Select */}
            <Grid item xs={12} md={6}>
              <Autocomplete
                multiple
                options={allBanks}
                getOptionLabel={(bank: SaudiBankDefinition) => bank.name}
                value={allBanks.filter((bank: SaudiBankDefinition) => 
                  filters.bankName?.includes(bank.code) || filters.bankName?.includes(bank.name)
                )}
                onChange={(_event, newValue: SaudiBankDefinition[]) => {
                  onFiltersChange({ bankName: newValue.map((bank: SaudiBankDefinition) => bank.code) });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Banks"
                    placeholder="Select banks..."
                  />
                )}
                renderTags={(value: SaudiBankDefinition[], getTagProps) =>
                  value.map((option: SaudiBankDefinition, index: number) => (
                    <Chip
                      variant="outlined"
                      label={option.shortName || option.name}
                      size="small"
                      {...getTagProps({ index })}
                      sx={{ 
                        bgcolor: option.primaryColor + '20',
                        borderColor: option.primaryColor
                      }}
                    />
                  ))
                }
                renderOption={(props, option: SaudiBankDefinition) => {
                  const { key, ...otherProps } = props;
                  return (
                    <Box component="li" key={key} {...otherProps}>
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        bgcolor: option.primaryColor,
                        mr: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '0.7rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {option.shortName?.substring(0, 2) || option.name.substring(0, 2)}
                    </Box>
                    <Box>
                      <Typography variant="body2">{option.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.arabicName}
                      </Typography>
                    </Box>
                  </Box>
                  );
                }}
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Amount Filters */}
      <Accordion 
        expanded={expandedSections.includes('amount')}
        onChange={() => handleSectionToggle('amount')}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="subtitle1">
            Amount Range
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography gutterBottom>
                Payment Amount Range (SAR)
              </Typography>
              <Box px={2}>
                <Slider
                  value={amountRange}
                  onChange={handleAmountRangeChange}
                  valueLabelDisplay="auto"
                  min={0}
                  max={100000}
                  step={1000}
                  marks={[
                    { value: 0, label: 'SAR 0' },
                    { value: 25000, label: 'SAR 25K' },
                    { value: 50000, label: 'SAR 50K' },
                    { value: 75000, label: 'SAR 75K' },
                    { value: 100000, label: 'SAR 100K+' }
                  ]}
                  valueLabelFormat={(value) => saudiBankService.formatSAR(value)}
                />
              </Box>
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Minimum Amount"
                type="number"
                value={amountRange[0]}
                onChange={(e) => {
                  const newMin = Math.max(0, parseInt(e.target.value) || 0);
                  const newRange: [number, number] = [newMin, Math.max(newMin, amountRange[1])];
                  setAmountRange(newRange);
                  handleAmountRangeChange({} as Event, newRange);
                }}
                InputProps={{
                  startAdornment: <Typography variant="body2" color="text.secondary">SAR</Typography>
                }}
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Maximum Amount"
                type="number"
                value={amountRange[1]}
                onChange={(e) => {
                  const newMax = parseInt(e.target.value) || 100000;
                  const newRange: [number, number] = [Math.min(amountRange[0], newMax), newMax];
                  setAmountRange(newRange);
                  handleAmountRangeChange({} as Event, newRange);
                }}
                InputProps={{
                  startAdornment: <Typography variant="body2" color="text.secondary">SAR</Typography>
                }}
              />
            </Grid>

            {/* Quick Amount Filters */}
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Quick amount filters:
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                {PAYMENT_FILTER_OPTIONS.AMOUNT_RANGES.map((range) => (
                  <Chip
                    key={range.label}
                    label={range.label}
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      const newRange: [number, number] = [
                        range.min,
                        range.max || 100000
                      ];
                      setAmountRange(newRange);
                      handleAmountRangeChange({} as Event, newRange);
                    }}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Date Filters */}
      <Accordion 
        expanded={expandedSections.includes('date')}
        onChange={() => handleSectionToggle('date')}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="subtitle1">
            Date Range
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="From Date"
                  value={filters.dateRange?.startDate ? new Date(filters.dateRange.startDate) : null}
                  onChange={(date) => handleDateRangeChange('startDate', date)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="To Date"
                  value={filters.dateRange?.endDate ? new Date(filters.dateRange.endDate) : null}
                  onChange={(date) => handleDateRangeChange('endDate', date)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>

              {/* Quick Date Filters */}
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Quick date filters:
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {PAYMENT_FILTER_OPTIONS.DATE_RANGES.filter(range => range.days !== null).map((range) => (
                    <Chip
                      key={range.label}
                      label={range.label}
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        const endDate = new Date();
                        const startDate = new Date();
                        startDate.setDate(endDate.getDate() - range.days!);
                        
                        onFiltersChange({
                          dateRange: {
                            startDate: startDate.toISOString().split('T')[0],
                            endDate: endDate.toISOString().split('T')[0]
                          }
                        });
                      }}
                      sx={{ cursor: 'pointer' }}
                    />
                  ))}
                </Box>
              </Grid>
            </Grid>
          </LocalizationProvider>
        </AccordionDetails>
      </Accordion>

      {/* Advanced Filters */}
      <Accordion 
        expanded={expandedSections.includes('advanced')}
        onChange={() => handleSectionToggle('advanced')}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="subtitle1">
            Advanced Filters
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            {/* Batch ID */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Batch ID"
                placeholder="Specific batch number or ID..."
                value={filters.batchId || ''}
                onChange={(e) => onFiltersChange({ batchId: e.target.value })}
              />
            </Grid>

            {/* Project Filter */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Project Name"
                placeholder="Filter by project name..."
                value={filters.projectName || ''}
                onChange={(e) => onFiltersChange({ projectName: e.target.value })}
              />
            </Grid>

            {/* High-Value Payments Toggle */}
            <Grid item xs={12}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={filters.highValue || false}
                      onChange={(e) => onFiltersChange({ highValue: e.target.checked })}
                    />
                  }
                  label="High-value payments only (> SAR 50,000)"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={filters.hasErrors || false}
                      onChange={(e) => onFiltersChange({ hasErrors: e.target.checked })}
                    />
                  }
                  label="Payments with processing errors"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={filters.recentlyProcessed || false}
                      onChange={(e) => onFiltersChange({ recentlyProcessed: e.target.checked })}
                    />
                  }
                  label="Recently processed (last 7 days)"
                />
              </FormGroup>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Active Filters Summary */}
      {activeFiltersCount > 0 && (
        <Paper sx={{ mt: 3, p: 2, bgcolor: 'primary.50' }}>
          <Typography variant="subtitle2" gutterBottom>
            Active Filters ({activeFiltersCount})
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {filters.search && (
              <Chip
                label={`Search: "${filters.search}"`}
                onDelete={() => onFiltersChange({ search: '' })}
                size="small"
              />
            )}
            {filters.status?.map(status => (
              <Chip
                key={status}
                label={`Status: ${PAYMENT_FILTER_OPTIONS.STATUS.find(s => s.value === status)?.label}`}
                onDelete={() => onFiltersChange({ 
                  status: filters.status?.filter(s => s !== status) 
                })}
                size="small"
                color="primary"
              />
            ))}
            {filters.bankName?.map((bankCode) => {
              const bank = allBanks.find((b: SaudiBankDefinition) => b.code === bankCode);
              return (
                <Chip
                  key={bankCode}
                  label={`Bank: ${bank?.shortName || bankCode}`}
                  onDelete={() => onFiltersChange({ 
                    bankName: filters.bankName?.filter(b => b !== bankCode) 
                  })}
                  size="small"
                  color="primary"
                />
              );
            })}
            {filters.amountRange && (
              <Chip
                label={`Amount: ${saudiBankService.formatSAR(filters.amountRange.min ?? 0)} - ${saudiBankService.formatSAR(filters.amountRange.max ?? 0)}`}
                onDelete={() => onFiltersChange({ amountRange: undefined })}
                size="small"
                color="primary"
              />
            )}
            {filters.dateRange && (filters.dateRange.startDate || filters.dateRange.endDate) && (
              <Chip
                label={`Date: ${filters.dateRange.startDate || 'Any'} to ${filters.dateRange.endDate || 'Any'}`}
                onDelete={() => onFiltersChange({ dateRange: undefined })}
                size="small"
                color="primary"
              />
            )}
            {filters.batchId && (
              <Chip
                label={`Batch: ${filters.batchId}`}
                onDelete={() => onFiltersChange({ batchId: '' })}
                size="small"
                color="primary"
              />
            )}
          </Box>
        </Paper>
      )}

      {/* Search Actions */}
      <Box display="flex" justifyContent="center" gap={2} mt={3}>
        <Button
          variant="contained"
          size="large"
          onClick={onSearch}
          startIcon={<Search />}
          disabled={activeFiltersCount === 0}
        >
          Search Payments
        </Button>
        
        <Button
          variant="outlined"
          size="large"
          onClick={clearAllFilters}
          startIcon={<Clear />}
          disabled={activeFiltersCount === 0}
        >
          Clear All Filters
        </Button>
      </Box>
    </Box>
  );
};

export default PaymentSearch;