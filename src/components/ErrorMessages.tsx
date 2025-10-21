import React from 'react';
import { Box, Typography, Alert, AlertTitle, Chip } from '@mui/material';
import { 
  WifiOff as OfflineIcon,
  CloudOff as ServerIcon,
  ErrorOutline as ErrorIcon,
  AccessTime as TimeoutIcon,
  Block as BlockedIcon
} from '@mui/icons-material';

interface ErrorMessageProps {
  error: any;
  context?: 'api' | 'streaming' | 'image' | 'general';
  showDetails?: boolean;
}

const ErrorMessages: React.FC<ErrorMessageProps> = ({ 
  error, 
  context = 'general',
  showDetails = false 
}) => {
  const getErrorInfo = (error: any) => {
    // Network/Connection errors
    if (error?.status === 'FETCH_ERROR' || error?.name === 'NetworkError') {
      return {
        icon: <OfflineIcon />,
        title: 'Connection Problem',
        message: 'Unable to connect to the server. Please check your internet connection.',
        severity: 'error' as const,
        suggestions: [
          'Check your internet connection',
          'Try refreshing the page',
          'Disable VPN if active'
        ]
      };
    }

    // Timeout errors
    if (error?.status === 'TIMEOUT_ERROR' || error?.name === 'TimeoutError') {
      return {
        icon: <TimeoutIcon />,
        title: 'Request Timeout',
        message: 'The request took too long to complete.',
        severity: 'warning' as const,
        suggestions: [
          'Try again in a moment',
          'Check your connection speed',
          'Server might be busy'
        ]
      };
    }

    // Server errors (5xx)
    if (error?.status >= 500 && error?.status < 600) {
      return {
        icon: <ServerIcon />,
        title: 'Server Error',
        message: 'The server is experiencing issues. This is temporary.',
        severity: 'error' as const,
        suggestions: [
          'Try again in a few minutes',
          'Server maintenance might be ongoing',
          'Contact support if problem persists'
        ]
      };
    }

    // Client errors (4xx)
    if (error?.status >= 400 && error?.status < 500) {
      if (error?.status === 404) {
        return {
          icon: <ErrorIcon />,
          title: 'Content Not Found',
          message: context === 'streaming' 
            ? 'This episode is not available for streaming.'
            : 'The requested content could not be found.',
          severity: 'warning' as const,
          suggestions: [
            'Try a different episode or anime',
            'Content might have been removed',
            'Check if the link is correct'
          ]
        };
      }

      if (error?.status === 403) {
        return {
          icon: <BlockedIcon />,
          title: 'Access Denied',
          message: 'You don\'t have permission to access this content.',
          severity: 'error' as const,
          suggestions: [
            'Content might be region-locked',
            'Try using a different server',
            'Contact support for assistance'
          ]
        };
      }

      return {
        icon: <ErrorIcon />,
        title: 'Request Error',
        message: 'There was a problem with your request.',
        severity: 'warning' as const,
        suggestions: [
          'Try refreshing the page',
          'Check your input',
          'Try again later'
        ]
      };
    }

    // Context-specific errors
    if (context === 'streaming') {
      return {
        icon: <ErrorIcon />,
        title: 'Streaming Error',
        message: 'Unable to load the video stream.',
        severity: 'error' as const,
        suggestions: [
          'Try a different quality setting',
          'Switch to another server',
          'Check your internet speed',
          'Disable ad blockers'
        ]
      };
    }

    if (context === 'image') {
      return {
        icon: <ErrorIcon />,
        title: 'Image Load Error',
        message: 'Failed to load image.',
        severity: 'warning' as const,
        suggestions: [
          'Image might be temporarily unavailable',
          'Try refreshing the page'
        ]
      };
    }

    // Generic error
    return {
      icon: <ErrorIcon />,
      title: 'Something Went Wrong',
      message: 'An unexpected error occurred.',
      severity: 'error' as const,
      suggestions: [
        'Try refreshing the page',
        'Clear your browser cache',
        'Try again later'
      ]
    };
  };

  const errorInfo = getErrorInfo(error);

  return (
    <Alert 
      severity={errorInfo.severity}
      icon={errorInfo.icon}
      sx={{ maxWidth: 600 }}
    >
      <AlertTitle>{errorInfo.title}</AlertTitle>
      
      <Typography variant="body2" sx={{ mb: 2 }}>
        {errorInfo.message}
      </Typography>

      {errorInfo.suggestions && errorInfo.suggestions.length > 0 && (
        <Box sx={{ mb: showDetails ? 2 : 0 }}>
          <Typography variant="caption" sx={{ fontWeight: 'medium', mb: 1, display: 'block' }}>
            Try these solutions:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {errorInfo.suggestions.map((suggestion, index) => (
              <Chip
                key={index}
                label={suggestion}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.7rem' }}
              />
            ))}
          </Box>
        </Box>
      )}

      {showDetails && error && (
        <Box sx={{ mt: 2, p: 1, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 1 }}>
          <Typography variant="caption" component="div" sx={{ fontFamily: 'monospace' }}>
            <strong>Error Details:</strong><br />
            Status: {error?.status || 'Unknown'}<br />
            {error?.data?.message && `Message: ${error.data.message}`}<br />
            {import.meta.env.DEV && error?.stack && (
              <>Stack: {error.stack.substring(0, 200)}...</>
            )}
          </Typography>
        </Box>
      )}
    </Alert>
  );
};

export default ErrorMessages;