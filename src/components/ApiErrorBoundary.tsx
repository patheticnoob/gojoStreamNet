import React from 'react';
import { Box, Typography, Button, Alert, AlertTitle } from '@mui/material';
import { Refresh as RefreshIcon, Warning as WarningIcon } from '@mui/icons-material';
import ErrorBoundary from './ErrorBoundary';

interface ApiErrorFallbackProps {
  error?: Error;
  onRetry?: () => void;
  message?: string;
}

const ApiErrorFallback: React.FC<ApiErrorFallbackProps> = ({ 
  error, 
  onRetry, 
  message = "Failed to load content" 
}) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 200,
      padding: 2,
      textAlign: 'center',
    }}
  >
    <Alert severity="warning" sx={{ mb: 2, maxWidth: 400 }}>
      <AlertTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <WarningIcon fontSize="small" />
        Connection Issue
      </AlertTitle>
      <Typography variant="body2">
        {message}. Please check your internet connection and try again.
      </Typography>
    </Alert>

    {onRetry && (
      <Button
        variant="contained"
        startIcon={<RefreshIcon />}
        onClick={onRetry}
        size="small"
      >
        Retry
      </Button>
    )}
  </Box>
);

interface ApiErrorBoundaryProps {
  children: React.ReactNode;
  onRetry?: () => void;
  message?: string;
}

const ApiErrorBoundary: React.FC<ApiErrorBoundaryProps> = ({ 
  children, 
  onRetry, 
  message 
}) => {
  return (
    <ErrorBoundary
      fallback={
        <ApiErrorFallback 
          onRetry={onRetry} 
          message={message}
        />
      }
      onError={(error, errorInfo) => {
        // Log API errors specifically
        console.error('API Error:', error.message, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
};

export default ApiErrorBoundary;
export { ApiErrorFallback };