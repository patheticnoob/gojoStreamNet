import { Box, Typography, Chip, Paper, Stack } from "@mui/material";
import { CheckCircle, Error, Pending, Info } from "@mui/icons-material";

interface DebugStep {
  id: string;
  label: string;
  status: 'pending' | 'loading' | 'success' | 'error' | 'info';
  details?: string;
  data?: any;
}

interface StreamingDebugPanelProps {
  steps: DebugStep[];
  isVisible?: boolean;
}

const getStatusIcon = (status: DebugStep['status']) => {
  switch (status) {
    case 'success':
      return <CheckCircle sx={{ color: 'success.main', fontSize: 16 }} />;
    case 'error':
      return <Error sx={{ color: 'error.main', fontSize: 16 }} />;
    case 'loading':
      return <Pending sx={{ color: 'warning.main', fontSize: 16 }} />;
    case 'info':
      return <Info sx={{ color: 'info.main', fontSize: 16 }} />;
    default:
      return <Pending sx={{ color: 'grey.500', fontSize: 16 }} />;
  }
};

const getStatusColor = (status: DebugStep['status']) => {
  switch (status) {
    case 'success':
      return 'success';
    case 'error':
      return 'error';
    case 'loading':
      return 'warning';
    case 'info':
      return 'info';
    default:
      return 'default';
  }
};

export default function StreamingDebugPanel({ steps, isVisible = true }: StreamingDebugPanelProps) {
  if (!isVisible || !import.meta.env.DEV) return null;

  return (
    <Paper
      sx={{
        position: 'fixed',
        top: 20,
        right: 20,
        width: 320,
        maxHeight: '80vh',
        overflow: 'auto',
        p: 2,
        bgcolor: 'rgba(0, 0, 0, 0.9)',
        color: 'white',
        zIndex: 9999,
        border: '1px solid rgba(255, 255, 255, 0.2)',
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
        🔍 Streaming Debug Panel
      </Typography>
      
      <Stack spacing={1.5}>
        {steps.map((step) => (
          <Box key={step.id}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
              {getStatusIcon(step.status)}
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {step.label}
              </Typography>
              <Chip
                size="small"
                label={step.status.toUpperCase()}
                color={getStatusColor(step.status) as any}
                sx={{ ml: 'auto', fontSize: '0.7rem', height: 20 }}
              />
            </Stack>
            
            {step.details && (
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'grey.400', 
                  display: 'block',
                  ml: 3,
                  fontSize: '0.7rem',
                  wordBreak: 'break-word'
                }}
              >
                {step.details}
              </Typography>
            )}
            
            {step.data && (
              <Box 
                sx={{ 
                  ml: 3, 
                  mt: 0.5,
                  p: 1,
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 1,
                  fontSize: '0.7rem',
                  fontFamily: 'monospace',
                  maxHeight: 100,
                  overflow: 'auto'
                }}
              >
                <pre style={{ margin: 0, fontSize: '0.7rem', whiteSpace: 'pre-wrap' }}>
                  {typeof step.data === 'string' ? step.data : JSON.stringify(step.data, null, 2)}
                </pre>
              </Box>
            )}
          </Box>
        ))}
      </Stack>
      
      <Typography 
        variant="caption" 
        sx={{ 
          display: 'block', 
          mt: 2, 
          pt: 1, 
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          color: 'grey.500',
          fontSize: '0.6rem'
        }}
      >
        Debug panel - Development only
      </Typography>
    </Paper>
  );
}