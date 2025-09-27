// src/components/payments/PaymentQueue/PaymentQueueFilters.tsx

import React, { useState } from 'react';
import {
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Chip,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slider,
  Checkbox,
  Autocomplete
} from '@mui/material';
import {
  ExpandMore,
  Clear,
  Search,
  FilterList,
  AccountBalance,
  AttachMoney,
  DateRange,
  Person
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { PaymentSearchParams } from '../../../types/payment.types';
import { SaudiBankDefinition } from '../../../types/saudiBanking.types';
import { PAYMENT_FILTER_OPTIONS } from '../../../constants/payments/paymentConstants';
import { saudiBankService } from '../../../services/saudiBankService';

interface PaymentQueueFiltersProps {
  filters: PaymentSearchParams;
  onFiltersChange: (filters: Partial<PaymentSearchParams>) => void;
  availableBanks: SaudiBankDefinition[];
  className?: string;
}

const PaymentQueueFilters: React.FC<PaymentQueueFiltersProps> = ({
  filters,
  onFiltersChange,
  availableBanks,
  className
}) => {
  const [expandedSections, setExpandedSections] = useState<string[]>(['basic']);
  const [amountRange, setAmountRange] = useState<[number, number]>([
    filters.amountRange?.min || 0,
    filters.amountRange?.max || 100000
  ]);

  const handleSectionToggle = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const handleFilterChange = (key: keyof PaymentSearchParams, value: any) => {
    onFiltersChange({ [key]: value });
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
      payeeName: '',
      projectId: [],
      amountRange: undefined,
      dateRange: undefined,
      batchId: ''
    });
    setAmountRange([0, 100000]);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status?.length) count++;
    if (filters.bankName?.length) count++;
    if (filters.payeeName) count++;
    if (filters.projectId?.length) count++;
    if (filters.amountRange) count++;
    if (filters.dateRange?.startDate || filters.dateRange?.endDate) count++;
    if (filters.batchId) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Box className={className}>
      {/* Filter Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" display="flex" alignItems="center" gap={1}>
          <FilterList />
          Advanced Filters
          {activeFiltersCount > 0 && (
            <Chip
              label={`${activeFiltersCount} active`}
              size="small"
              color="primary"
              variant="filled"
            />
          )}
        </Typography>
        
        {activeFiltersCount > 0 && (
          <Button
            startIcon={<Clear />}
            onClick={clearAllFilters}
            variant="outlined"
            size="small"
          >
            Clear All
          </Button>
        )}
      </Box>

      {/* Basic Filters */}
      <Accordion 
        expanded={expandedSections.includes('basic')}
        onChange={() => handleSectionToggle('basic')}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="subtitle1" display="flex" alignItems="center" gap={1}>
            <Search />
            Basic Filters
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            {/* Search */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Search Payments"
                placeholder="Search by employee name, quotation ID, or description..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            </Grid>

            {/* Employee Name */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Payee Name"
                placeholder="Filter by specific payee..."
                value={filters.payeeName || ''}
                onChange={(e) => handleFilterChange('payeeName', e.target.value)}
                InputProps={{
                  startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            </Grid>

            {/* Status */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Payment Status</InputLabel>
                <Select
                  multiple
                  value={filters.status || []}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip 
                          key={value} 
                          label={PAYMENT_FILTER_OPTIONS.STATUS.find(s => s.value === value)?.label}
                          size="small" 
                        />
                      ))}
                    </Box>
                  )}
                >
                  {PAYMENT_FILTER_OPTIONS.STATUS.map((status) => (
                    <MenuItem key={status.value} value={status.value}>
                      <Checkbox checked={filters.status?.includes(status.value) || false} />
                      {status.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Banks */}
            <Grid item xs={12} md={6}>
              <Autocomplete
                multiple
                options={availableBanks}
                getOptionLabel={(bank) => bank.name}
                value={availableBanks.filter(bank => 
                  filters.bankName?.includes(bank.code) || filters.bankName?.includes(bank.name)
                )}
                onChange={(_event, newValue) => {
                  handleFilterChange('bankName', newValue.map(bank => bank.code));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Banks"
                    placeholder="Select banks..."
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <AccountBalance sx={{ mr: 1, color: 'action.active' }} />
                          {params.InputProps.startAdornment}
                        </>
                      )
                    }}
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option.shortName || option.name}
                      size="small"
                      {...getTagProps({ index })}
                    />
                  ))
                }
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
          <Typography variant="subtitle1" display="flex" alignItems="center" gap={1}>
            <AttachMoney />
            Amount Range
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12}>
              <Typography gutterBottom>
                Payment Amount (SAR)
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
              />
            </Grid>

            {/* Quick Amount Filters */}
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Quick filters:
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
          <Typography variant="subtitle1" display="flex" alignItems="center" gap={1}>
            <DateRange />
            Date Range
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Start Date"
                  value={filters.dateRange?.startDate ? new Date(filters.dateRange.startDate) : null}
                  onChange={(date) => handleDateRangeChange('startDate', date)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="End Date"
                  value={filters.dateRange?.endDate ? new Date(filters.dateRange.endDate) : null}
                  onChange={(date) => handleDateRangeChange('endDate', date)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>

              {/* Quick Date Filters */}
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Quick filters:
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

      {/* Active Filters Summary */}
      {activeFiltersCount > 0 && (
        <Box mt={3} p={2} bgcolor="primary.50" borderRadius={1}>
          <Typography variant="subtitle2" gutterBottom>
            Active Filters ({activeFiltersCount})
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {filters.search && (
              <Chip
                label={`Search: "${filters.search}"`}
                onDelete={() => handleFilterChange('search', '')}
                size="small"
              />
            )}
            {filters.status?.map(status => (
              <Chip
                key={status}
                label={`Status: ${PAYMENT_FILTER_OPTIONS.STATUS.find(s => s.value === status)?.label}`}
                onDelete={() => handleFilterChange('status', filters.status?.filter(s => s !== status))}
                size="small"
              />
            ))}
            {filters.bankName?.map(bankCode => {
              const bank = availableBanks.find(b => b.code === bankCode);
              return (
                <Chip
                  key={bankCode}
                  label={`Bank: ${bank?.shortName || bankCode}`}
                  onDelete={() => handleFilterChange('bankName', filters.bankName?.filter(b => b !== bankCode))}
                  size="small"
                />
              );
            })}
            {filters.amountRange && (
              <Chip
                label={`Amount: ${saudiBankService.formatSAR(filters.amountRange.min ?? 0)} - ${saudiBankService.formatSAR(filters.amountRange.max ?? 100000)}`}
                onDelete={() => handleFilterChange('amountRange', undefined)}
                size="small"
              />
            )}
            {filters.dateRange && (
              <Chip
                label={`Date: ${filters.dateRange.startDate || 'Any'} to ${filters.dateRange.endDate || 'Any'}`}
                onDelete={() => handleFilterChange('dateRange', undefined)}
                size="small"
              />
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default PaymentQueueFilters;