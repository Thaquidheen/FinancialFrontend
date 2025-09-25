import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Grid,
  MenuItem,
  Chip,
  CircularProgress,
  Divider,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { AccountBalance, Warning } from '@mui/icons-material';
import { User, UpdateBankDetailsRequest } from '../../types/user';

// Saudi banks list
const SAUDI_BANKS = [
  { value: 'NCB', label: 'National Commercial Bank (Al Ahli)' },
  { value: 'RIYAD', label: 'Riyad Bank' },
  { value: 'SAMBA', label: 'Samba Financial Group' },
  { value: 'RAJHI', label: 'Al Rajhi Bank' },
  { value: 'FRANSI', label: 'Banque Saudi Fransi' },
  { value: 'ANB', label: 'Arab National Bank' },
  { value: 'SAUDI_INVESTMENT', label: 'Saudi Investment Bank' },
  { value: 'BSF', label: 'Bank Saudi Fransi' },
  { value: 'ALINMA', label: 'Alinma Bank' },
  { value: 'ALBILAD', label: 'Bank Albilad' },
  { value: 'ALJAZIRA', label: 'Bank Aljazira' },
];

// Validation schema
const bankDetailsSchema = yup.object().shape({
  bankName: yup.string().required('Bank name is required'),
  accountNumber: yup
    .string()
    .required('Account number is required')
    .min(10, 'Account number must be at least 10 digits')
    .max(20, 'Account number cannot exceed 20 digits')
    .matches(/^\d+$/, 'Account number must contain only digits'),
  iban: yup
    .string()
    .required('IBAN is required')
    .matches(/^SA\d{22}$/, 'Invalid Saudi IBAN format (SA + 22 digits)'),
  beneficiaryAddress: yup
    .string()
    .min(10, 'Address must be at least 10 characters')
    .max(255, 'Address cannot exceed 255 characters'),
});

interface BankDetailsPanelProps {
  user?: User;
  onBankDetailsUpdate: (data: UpdateBankDetailsRequest) => Promise<void>;
  isLoading?: boolean;
  error?: Error | null;
}

const BankDetailsPanel: React.FC<BankDetailsPanelProps> = ({
  user,
  onBankDetailsUpdate,
  isLoading = false,
  error,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty, isValid },
  } = useForm({
    resolver: yupResolver(bankDetailsSchema),
    defaultValues: {
      bankName: user?.bankDetails?.bankName || '',
      accountNumber: user?.bankDetails?.accountNumber || '',
      iban: user?.bankDetails?.iban || '',
      beneficiaryAddress: user?.bankDetails?.beneficiaryAddress || '',
    },
    mode: 'onChange',
  });

  // Watch account number to auto-generate IBAN
  const accountNumber = watch('accountNumber');
  const selectedBank = watch('bankName');

  // Auto-generate IBAN when account number changes
  useEffect(() => {
    if (accountNumber && selectedBank && accountNumber.length >= 10) {
      // This is a simplified IBAN generation - in real app, you'd use proper IBAN calculation
      const bankCode = getBankCode(selectedBank);
      if (bankCode) {
        const paddedAccountNumber = accountNumber.padStart(12, '0');
        const checkDigits = '00'; // In real implementation, calculate check digits
        const generatedIban = `SA${checkDigits}${bankCode}${paddedAccountNumber}`;
        setValue('iban', generatedIban, { shouldValidate: true });
      }
    }
  }, [accountNumber, selectedBank, setValue]);

  // Reset form when user data changes
  useEffect(() => {
    if (user?.bankDetails) {
      reset({
        bankName: user.bankDetails.bankName,
        accountNumber: user.bankDetails.accountNumber,
        iban: user.bankDetails.iban,
        beneficiaryAddress: user.bankDetails.beneficiaryAddress,
      });
    }
  }, [user, reset]);

  const getBankCode = (bankName: string): string => {
    const bankCodes: Record<string, string> = {
      NCB: '0010',
      RIYAD: '1010',
      SAMBA: '8000',
      RAJHI: '8001',
      FRANSI: '5500',
      ANB: '0400',
      SAUDI_INVESTMENT: '2020',
      BSF: '5500',
      ALINMA: '8020',
      ALBILAD: '0590',
      ALJAZIRA: '8030',
    };
    return bankCodes[bankName] || '0000';
  };

  const handleSave = async (data: any) => {
    try {
      await onBankDetailsUpdate(data as UpdateBankDetailsRequest);
      setIsEditing(false);
    } catch (error) {
      // Error handling is managed by parent component
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  const getBankLabel = (bankCode: string) => {
    return SAUDI_BANKS.find(bank => bank.value === bankCode)?.label || bankCode;
  };

  if (!user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AccountBalance />
        Bank Details for {user.fullName}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error.message || 'Failed to update bank details'}
        </Alert>
      )}

      <Card>
        <CardContent>
          {!isEditing && user.bankDetails ? (
            // Display Mode
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Current Bank Details
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Chip
                    icon={<Warning />}
                    label="Pending Verification"
                    color="warning"
                    size="small"
                  />
                  <Button
                    variant="outlined"
                    onClick={() => setIsEditing(true)}
                    size="small"
                  >
                    Edit
                  </Button>
                </Box>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Bank Name
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {getBankLabel(user.bankDetails.bankName)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Account Number
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {user.bankDetails.accountNumber}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    IBAN
                  </Typography>
                  <Typography variant="body1" fontWeight="medium" sx={{ fontFamily: 'monospace' }}>
                    {user.bankDetails.iban}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Beneficiary Address
                  </Typography>
                  <Typography variant="body1">
                    {user.bankDetails.beneficiaryAddress}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          ) : (
            // Edit Mode or No Bank Details
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {user.bankDetails ? 'Edit Bank Details' : 'Add Bank Details'}
                </Typography>
                {isEditing && (
                  <Button
                    variant="text"
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                )}
              </Box>

              <form onSubmit={handleSubmit(handleSave)}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="bankName"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          select
                          label="Bank Name"
                          fullWidth
                          error={!!errors.bankName}
                          helperText={errors.bankName?.message}
                          disabled={isLoading}
                        >
                          {SAUDI_BANKS.map((bank) => (
                            <MenuItem key={bank.value} value={bank.value}>
                              {bank.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="accountNumber"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Account Number"
                          fullWidth
                          error={!!errors.accountNumber}
                          helperText={errors.accountNumber?.message}
                          disabled={isLoading}
                          placeholder="Enter 10-20 digit account number"
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Controller
                      name="iban"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="IBAN"
                          fullWidth
                          error={!!errors.iban}
                          helperText={errors.iban?.message || "Format: SA + 22 digits (auto-generated)"}
                          disabled={isLoading}
                          placeholder="SA0000000000000000000000"
                          sx={{ '& input': { fontFamily: 'monospace' } }}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Controller
                      name="beneficiaryAddress"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Beneficiary Address"
                          fullWidth
                          multiline
                          rows={3}
                          error={!!errors.beneficiaryAddress}
                          helperText={errors.beneficiaryAddress?.message}
                          disabled={isLoading}
                          placeholder="Enter complete address for bank transfers"
                        />
                      )}
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Box display="flex" gap={2} justifyContent="flex-end">
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isLoading || !isDirty || !isValid}
                    startIcon={isLoading ? <CircularProgress size={20} /> : <AccountBalance />}
                  >
                    {isLoading ? 'Saving...' : user.bankDetails ? 'Update Details' : 'Save Details'}
                  </Button>
                </Box>
              </form>

              {!user.bankDetails && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Bank details are required for receiving payments. Please ensure all information is accurate.
                </Alert>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default BankDetailsPanel;