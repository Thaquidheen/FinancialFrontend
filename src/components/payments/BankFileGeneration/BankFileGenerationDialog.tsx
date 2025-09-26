

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  AccountBalance,
  AttachMoney,
  Person,
  Warning,
  CheckCircle,
  Error,
  ExpandMore,
  Description,
  CalendarToday,
  Schedule
} from '@mui/icons-material';
import { PaymentSummaryResponse } from '../../../types/payment.types';
import { SaudiBankDefinition } from '../../../types/saudiBanking.types';
import { saudiBankService } from '../../../services/api/saudiBankService';

interface BankFileGenerationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedPayments: PaymentSummaryResponse[];
  availableBanks: SaudiBankDefinition[];
  selectedBank: string;
  onBankChange: (bank: string) => void;
  comments: string;
  onCommentsChange: (comments: string) => void;
  isGenerating: boolean;
  validationResult: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  };
}

const BankFileGenerationDialog: React.FC<BankFileGenerationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  selectedPayments,
  availableBanks,
  selectedBank,
  onBankChange