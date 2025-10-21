import React from 'react';
import { Box, Typography, Button, Alert, AlertTitle } from '@mui/material';
import { 
  PlayArrow as PlayIcon, 
  Refresh as RefreshIcon,
  ErrorOutline as ErrorIcon 
} from '@mui/icons-material';
import ErrorBoundary from './ErrorBoundary';

interface StreamingErrorFallbackProps {
  error?: Error;
  onRetry?: () => void;
  onSelectDifferentSource?: () => void;
}

const StreamingErrorFallback: React.FC<StreamingErrorFallbackProps> = ({ 
  error, 
  onRetry,
  onSelectDifferentSource
}) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 300,
      padding: 3,
      textAlign: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      borderRadius: 1,
    }}
  >
    <Alert 
      severity="error" 
      sx={{ 
        mb: 3, 
        maxWidth: 500,
        backgroundColor: 'rgba(211, 47, 47, 0.1)',
        color: 'white',
        '& .MuiAlert-icon': { color: '#f44336' }
      }}
    >
      <AlertTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ErrorIcon fontSize="small" />
        Streaming Error
      </AlertTitle>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Unable to load the video stream. This could be due to:
      </Typography>
      <Box component="ul" sx={{ textAlign: 'left', pl: 2, mb: 0 }}>
        <li>Network connectivity issues</li>
        <li>Server overload or maintenance</li>
        <li>Content temporarily unavailable</li>
        <li>Browser compatibility issues</li>
      </Box>
    </Alert>

    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
      {onRetry && (
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={onRetry}
          sx={{ minWidth: 140 }}
        >
          Retry Stream
        </Button>
      )}
      {onSelectDifferentSource && (
        <Button
          variant="outlined"
          startIcon={<PlayIcon />}
          onClick={onSelectDifferentSource}
          sx={{ 
            minWidth: 140,
            borderColor: 'white',
            color: 'white',
            '&:hover': {
              borderColor: 'rgba(255, 255, 255, 0.7)',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            }
          }}
        >
          Try Different Source
        </Button>
      )}
    </Box>

    <Typography variant="caption" sx={{ mt: 2, opacity: 0.7 }}>
      If the problem persists, please try again later or contact support.
    </Typography>
  </Box>
);

interface StreamingErrorBoundaryProps {
  children: React.ReactNode;
  onRetry?: () => void;
  onSelectDifferentSource?: () => void;
}

const StreamingErrorBoundary: React.FC<StreamingErrorBoundaryProps> = ({ 
  children, 
  onRetry,
  onSelectDifferentSource
}) => {
  return (
    <ErrorBoundary
      fallback={
        <StreamingErrorFallback 
          onRetry={onRetry}
          onSelectDifferentSource={onSelectDifferentSource}
        />
      }
      onError={(error, errorInfo) => {
        // Log streaming errors with additional context
        console.error('Streaming Error:', {
          error: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
        });
      }}
    >
      {children}
    </ErrorBoundary>
  );
};

export default StreamingErrorBoundary;
export { StreamingErrorFallback };