import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Chip,
  Button,
  Skeleton,
  Collapse,
} from '@mui/material';
import {
  Warning,
  Error,
  Info,
  CheckCircle,
  ExpandMore,
  ExpandLess,
  Close,
  Refresh,
} from '@mui/icons-material';
import { BudgetAlert, AlertSeverity } from '../../types/dashboard';
import { formatCurrency } from '@utils/helpers';

interface AlertsPanelProps {
  alerts: BudgetAlert[];
  isLoading?: boolean;
  error?: any;
  onRefresh?: () => void;
  onAlertDismiss?: (alertId: string) => void;
  onViewProject?: (projectId: string) => void;
  maxItems?: number;
}

const AlertsPanel: React.FC<AlertsPanelProps> = ({
  alerts,
  isLoading = false,
  error,
  onRefresh,
  onAlertDismiss,
  onViewProject,
  maxItems = 5,
}) => {
  const [expanded, setExpanded] = React.useState(false);

  const getSeverityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case AlertSeverity.CRITICAL:
        return <Error color="error" />;
      case AlertSeverity.HIGH:
        return <Warning color="warning" />;
      case AlertSeverity.MEDIUM:
        return <Info color="info" />;
      case AlertSeverity.LOW:
      default:
        return <CheckCircle color="success" />;
    }
  };

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case AlertSeverity.CRITICAL:
        return 'error' as const;
      case AlertSeverity.HIGH:
        return 'warning' as const;
      case AlertSeverity.MEDIUM:
        return 'info' as const;
      case AlertSeverity.LOW:
      default:
        return 'success' as const;
    }
  };

  const getAlertVariant = (severity: AlertSeverity) => {
    switch (severity) {
      case AlertSeverity.CRITICAL:
        return 'filled' as const;
      case AlertSeverity.HIGH:
        return 'outlined' as const;
      case AlertSeverity.MEDIUM:
      case AlertSeverity.LOW:
      default:
        return 'standard' as const;
    }
  };

  const sortedAlerts = alerts.sort((a, b) => {
    const severityOrder = {
      [AlertSeverity.CRITICAL]: 4,
      [AlertSeverity.HIGH]: 3,
      [AlertSeverity.MEDIUM]: 2,
      [AlertSeverity.LOW]: 1,
    };
    return severityOrder[b.severity] - severityOrder[a.severity];
  });

  const displayAlerts = expanded ? sortedAlerts : sortedAlerts.slice(0, maxItems);

  if (error) {
    return (
      <Card elevation={2}>
        <CardContent>
          <Alert 
            severity="error" 
            action={
              onRefresh && (
                <IconButton color="inherit" size="small" onClick={onRefresh}>
                  <Refresh />
                </IconButton>
              )
            }
          >
            Failed to load alerts
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card elevation={2}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">
            Budget Alerts
            {alerts.length > 0 && (
              <Chip
                label={alerts.length}
                size="small"
                color={alerts.some(a => a.severity === AlertSeverity.CRITICAL) ? 'error' : 'warning'}
                sx={{ ml: 1 }}
              />
            )}
          </Typography>
          {onRefresh && (
            <IconButton size="small" onClick={onRefresh} disabled={isLoading}>
              <Refresh />
            </IconButton>
          )}
        </Box>

        {isLoading ? (
          <Box>
            {Array.from({ length: 3 }).map((_, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 1 }} />
              </Box>
            ))}
          </Box>
        ) : alerts.length === 0 ? (
          <Alert severity="success" variant="outlined">
            <AlertTitle>All Clear!</AlertTitle>
            No budget alerts at this time. All projects are within their allocated budgets.
          </Alert>
        ) : (
          <Box>
            {displayAlerts.map((alert) => (
              <Alert
                key={alert.id}
                severity={getSeverityColor(alert.severity)}
                variant={getAlertVariant(alert.severity)}
                sx={{ mb: 2 }}
                action={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {onViewProject && (
                      <Button
                        color="inherit"
                        size="small"
                        onClick={() => onViewProject(alert.projectId)}
                      >
                        View
                      </Button>
                    )}
                    {onAlertDismiss && (
                      <IconButton
                        color="inherit"
                        size="small"
                        onClick={() => onAlertDismiss(alert.id)}
                      >
                        <Close />
                      </IconButton>
                    )}
                  </Box>
                }
              >
                <AlertTitle>
                  {alert.projectName}
                  <Chip
                    label={`${alert.currentUtilization.toFixed(1)}%`}
                    size="small"
                    color={getSeverityColor(alert.severity)}
                    sx={{ ml: 1, height: 20 }}
                  />
                </AlertTitle>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {alert.message}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Threshold: {alert.threshold}% • Current: {alert.currentUtilization.toFixed(1)}%
                </Typography>
              </Alert>
            ))}

            {alerts.length > maxItems && (
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Button
                  variant="text"
                  onClick={() => setExpanded(!expanded)}
                  endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
                >
                  {expanded ? 'Show Less' : `Show ${alerts.length - maxItems} More`}
                </Button>
              </Box>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default AlertsPanel;