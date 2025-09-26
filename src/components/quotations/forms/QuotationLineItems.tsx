// src/components/quotations/forms/QuotationLineItems.tsx
import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Divider,
  Alert,
  Chip,
  Tooltip,
  Collapse
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LineItem, LineItemCategory, AccountHead, UnitOfMeasure, Currency } from '@/types/quotation';

interface QuotationLineItemsProps {
  items: LineItem[];
  currency: Currency;
  errors: Record<string, string>;
  onItemsChange: (items: LineItem[]) => void;
}

interface LineItemFormData {
  description: string;
  amount: number;
  quantity: number;
  unitPrice: number;
  unitOfMeasure: UnitOfMeasure;
  category: LineItemCategory;
  accountHead: string;
  itemDate: string;
  expectedDeliveryDate: string;
  vendorName: string;
  vendorContact: string;
  vendorEmail: string;
  plateNumber: string;
  currentKM: string;
  startLocation: string;
  endLocation: string;
  notes: string;
  taxRate: number;
  discountAmount: number;
  specifications: string;
  brandModel: string;
  warrantyPeriod: string;
}

const QuotationLineItems: React.FC<QuotationLineItemsProps> = ({
  items,
  currency,
  errors,
  onItemsChange
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [formData, setFormData] = useState<LineItemFormData>({
    description: '',
    amount: 0,
    quantity: 1,
    unitPrice: 0,
    unitOfMeasure: UnitOfMeasure.PIECES,
    category: LineItemCategory.OTHER,
    accountHead: '',
    itemDate: new Date().toISOString().split('T')[0],
    expectedDeliveryDate: '',
    vendorName: '',
    vendorContact: '',
    vendorEmail: '',
    plateNumber: '',
    currentKM: '',
    startLocation: '',
    endLocation: '',
    notes: '',
    taxRate: 0,
    discountAmount: 0,
    specifications: '',
    brandModel: '',
    warrantyPeriod: ''
  });

  const categoryOptions = Object.values(LineItemCategory);
  const accountHeadOptions = Object.values(AccountHead);
  const unitOptions = Object.values(UnitOfMeasure);

  const handleAddItem = () => {
    if (!formData.description.trim() || formData.amount <= 0) {
      return;
    }

    const newItem: LineItem = {
      ...formData,
      currency,
      itemOrder: items.length
    };

    onItemsChange([...items, newItem]);
    resetForm();
  };

  const handleEditItem = (index: number) => {
    const item = items[index];
    setFormData({
      description: item.description,
      amount: item.amount,
      quantity: item.quantity || 1,
      unitPrice: item.unitPrice || 0,
      unitOfMeasure: item.unitOfMeasure || UnitOfMeasure.PIECES,
      category: item.category,
      accountHead: item.accountHead,
      itemDate: item.itemDate,
      expectedDeliveryDate: item.expectedDeliveryDate || '',
      vendorName: item.vendorName || '',
      vendorContact: item.vendorContact || '',
      vendorEmail: item.vendorEmail || '',
      plateNumber: item.plateNumber || '',
      currentKM: item.currentKM || '',
      startLocation: item.startLocation || '',
      endLocation: item.endLocation || '',
      notes: item.notes || '',
      taxRate: item.taxRate || 0,
      discountAmount: item.discountAmount || 0,
      specifications: item.specifications || '',
      brandModel: item.brandModel || '',
      warrantyPeriod: item.warrantyPeriod || ''
    });
    setEditingIndex(index);
  };

  const handleUpdateItem = () => {
    if (editingIndex === null || !formData.description.trim() || formData.amount <= 0) {
      return;
    }

    const updatedItems = [...items];
    updatedItems[editingIndex] = {
      ...formData,
      currency,
      itemOrder: editingIndex
    };

    onItemsChange(updatedItems);
    resetForm();
    setEditingIndex(null);
  };

  const handleDeleteItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    // Reorder items
    updatedItems.forEach((item, i) => {
      item.itemOrder = i;
    });
    onItemsChange(updatedItems);
  };

  const handleCopyItem = (index: number) => {
    const itemToCopy = items[index];
    const newItem: LineItem = {
      ...itemToCopy,
      itemOrder: items.length
    };
    onItemsChange([...items, newItem]);
  };

  const resetForm = () => {
    setFormData({
      description: '',
      amount: 0,
      quantity: 1,
      unitPrice: 0,
      unitOfMeasure: UnitOfMeasure.PIECES,
      category: LineItemCategory.OTHER,
      accountHead: '',
      itemDate: new Date().toISOString().split('T')[0],
      expectedDeliveryDate: '',
      vendorName: '',
      vendorContact: '',
      vendorEmail: '',
      plateNumber: '',
      currentKM: '',
      startLocation: '',
      endLocation: '',
      notes: '',
      taxRate: 0,
      discountAmount: 0,
      specifications: '',
      brandModel: '',
      warrantyPeriod: ''
    });
  };

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + item.amount, 0);
  };

  const getTotalItems = () => items.length;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">
            Line Items ({getTotalItems()})
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Typography variant="h6" color="primary">
              Total: {calculateTotal().toLocaleString()} {currency}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={resetForm}
              disabled={editingIndex !== null}
            >
              Add Item
            </Button>
          </Box>
        </Box>

        {errors.items && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.items}
          </Alert>
        )}

        {/* Add/Edit Form */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              {editingIndex !== null ? `Edit Item ${editingIndex + 1}` : 'Add New Item'}
            </Typography>
            
            <Grid container spacing={2}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description *"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  multiline
                  rows={2}
                  error={!!errors[`item_${editingIndex}_description`]}
                  helperText={errors[`item_${editingIndex}_description`]}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Amount *"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  error={!!errors[`item_${editingIndex}_amount`]}
                  helperText={errors[`item_${editingIndex}_amount`]}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Unit Price"
                  type="number"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Unit of Measure</InputLabel>
                  <Select
                    value={formData.unitOfMeasure}
                    onChange={(e) => setFormData({ ...formData, unitOfMeasure: e.target.value as UnitOfMeasure })}
                    label="Unit of Measure"
                  >
                    {unitOptions.map((unit) => (
                      <MenuItem key={unit} value={unit}>
                        {unit}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Category *</InputLabel>
                  <Select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as LineItemCategory })}
                    label="Category *"
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
                  <InputLabel>Account Head *</InputLabel>
                  <Select
                    value={formData.accountHead}
                    onChange={(e) => setFormData({ ...formData, accountHead: e.target.value })}
                    label="Account Head *"
                  >
                    {accountHeadOptions.map((head) => (
                      <MenuItem key={head} value={head}>
                        {head.replace(/_/g, ' ')}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Item Date *"
                  value={formData.itemDate ? new Date(formData.itemDate) : null}
                  onChange={(date) => setFormData({ ...formData, itemDate: date ? date.toISOString().split('T')[0] : '' })}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors[`item_${editingIndex}_itemDate`],
                      helperText: errors[`item_${editingIndex}_itemDate`]
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Expected Delivery Date"
                  value={formData.expectedDeliveryDate ? new Date(formData.expectedDeliveryDate) : null}
                  onChange={(date) => setFormData({ ...formData, expectedDeliveryDate: date ? date.toISOString().split('T')[0] : '' })}
                  slotProps={{
                    textField: {
                      fullWidth: true
                    }
                  }}
                />
              </Grid>

              {/* Vendor Information */}
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }}>Vendor Information</Divider>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Vendor Name"
                  value={formData.vendorName}
                  onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Vendor Contact"
                  value={formData.vendorContact}
                  onChange={(e) => setFormData({ ...formData, vendorContact: e.target.value })}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Vendor Email"
                  type="email"
                  value={formData.vendorEmail}
                  onChange={(e) => setFormData({ ...formData, vendorEmail: e.target.value })}
                />
              </Grid>

              {/* Additional Details */}
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }}>Additional Details</Divider>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  multiline
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Specifications"
                  multiline
                  rows={2}
                  value={formData.specifications}
                  onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Brand/Model"
                  value={formData.brandModel}
                  onChange={(e) => setFormData({ ...formData, brandModel: e.target.value })}
                />
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              {editingIndex !== null ? (
                <>
                  <Button variant="contained" onClick={handleUpdateItem}>
                    Update Item
                  </Button>
                  <Button onClick={() => { setEditingIndex(null); resetForm(); }}>
                    Cancel
                  </Button>
                </>
              ) : (
                <Button variant="contained" onClick={handleAddItem}>
                  Add Item
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Items List */}
        {items.length === 0 ? (
          <Card>
            <CardContent>
              <Typography variant="body1" color="text.secondary" textAlign="center" py={4}>
                No line items added yet. Click "Add Item" to get started.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          items.map((item, index) => (
            <Card key={index} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="h6">
                        Item {index + 1}
                      </Typography>
                      <Chip 
                        label={item.category.replace(/_/g, ' ')} 
                        size="small" 
                        color="primary" 
                        variant="outlined" 
                      />
                      <Chip 
                        label={item.accountHead.replace(/_/g, ' ')} 
                        size="small" 
                        color="secondary" 
                        variant="outlined" 
                      />
                    </Box>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      {item.description}
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {item.amount.toLocaleString()} {currency}
                    </Typography>
                    {item.vendorName && (
                      <Typography variant="body2" color="text.secondary">
                        Vendor: {item.vendorName}
                      </Typography>
                    )}
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Edit">
                      <IconButton onClick={() => handleEditItem(index)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Copy">
                      <IconButton onClick={() => handleCopyItem(index)}>
                        <CopyIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton onClick={() => handleDeleteItem(index)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={expandedItems.has(index) ? "Collapse" : "Expand"}>
                      <IconButton onClick={() => toggleExpanded(index)}>
                        {expandedItems.has(index) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Collapse in={expandedItems.has(index)}>
                  <Divider sx={{ my: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Quantity:</strong> {item.quantity || 1} {item.unitOfMeasure || 'units'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Unit Price:</strong> {(item.unitPrice || 0).toLocaleString()} {currency}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Item Date:</strong> {new Date(item.itemDate).toLocaleDateString()}
                      </Typography>
                    </Grid>
                    {item.expectedDeliveryDate && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Expected Delivery:</strong> {new Date(item.expectedDeliveryDate).toLocaleDateString()}
                        </Typography>
                      </Grid>
                    )}
                    {item.vendorContact && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Vendor Contact:</strong> {item.vendorContact}
                        </Typography>
                      </Grid>
                    )}
                    {item.vendorEmail && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Vendor Email:</strong> {item.vendorEmail}
                        </Typography>
                      </Grid>
                    )}
                    {item.notes && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Notes:</strong> {item.notes}
                        </Typography>
                      </Grid>
                    )}
                    {item.specifications && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Specifications:</strong> {item.specifications}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Collapse>
              </CardContent>
            </Card>
          ))
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default QuotationLineItems;
