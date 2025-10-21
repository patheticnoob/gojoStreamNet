import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Grid,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  Image as ImageIcon,
  VideoLibrary as VideoIcon,
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { performanceTracker, performanceTests } from 'src/utils/performanceTesting';

interface PerformanceMonitorProps {
  enabled?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  enabled = import.meta.env.DEV,
  position = 'bottom-right'
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);

  // Update metrics every 5 seconds
  useEffect(() => {
    if (!enabled) return;

    const updateMetrics = () => {
      const summary = performanceTracker.getPerformanceSummary();
      setMetrics(summary);
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000);

    return () => clearInterval(interval);
  }, [enabled]);

  const handleRunTests = async () => {
    setIsRunningTests(true);
    try {
      await performanceTests.testApiPerformance();
      await performanceTests.testImagePerformance();
      performanceTests.generateComprehensiveReport();
    } catch (error) {
      console.error('Performance test failed:', error);
    } finally {
      setIsRunningTests(false);
    }
  };

  const getPositionStyles = () => {
    const baseStyles = {
      position: 'fixed' as const,
      zIndex: 9999,
      maxWidth: 400,
    };

    switch (position) {
      case 'top-left':
        return { ...baseStyles, top: 16, left: 16 };
      case 'top-right':
        return { ...baseStyles, top: 16, right: 16 };
      case 'bottom-left':
        return { ...baseStyles, bottom: 16, left: 16 };
      case 'bottom-right':
      default:
        return { ...baseStyles, bottom: 16, right: 16 };
    }
  };

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'success';
    if (value <= thresholds.warning) return 'warning';
    return 'error';
  };

  if (!enabled || !metrics) return null;

  return (
    <Box sx={getPositionStyles()}>
      <Card sx={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', color: 'white' }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SpeedIcon fontSize="small" />
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                Performance
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={() => setIsExpanded(!isExpanded)}
              sx={{ color: 'white' }}
            >
              <ExpandMoreIcon 
                sx={{ 
                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s'
                }} 
              />
            </IconButton>
          </Box>

          {/* Quick Stats */}
          <Grid container spacing={1} sx={{ mb: 1 }}>
            <Grid item xs={6}>
              <Chip
                icon={<SpeedIcon />}
                label={`API: ${metrics.api.avgResponseTime.toFixed(0)}ms`}
                size="small"
                color={getStatusColor(metrics.api.avgResponseTime, { good: 1000, warning: 3000 })}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={6}>
              <Chip
                icon={<MemoryIcon />}
                label={`Mem: ${metrics.memory.current.toFixed(0)}MB`}
                size="small"
                color={getStatusColor(metrics.memory.current, { good: 50, warning: 100 })}
                variant="outlined"
              />
            </Grid>
          </Grid>

          {/* Expanded Details */}
          <Collapse in={isExpanded}>
            <Box sx={{ mt: 2 }}>
              {/* API Metrics */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                  <SpeedIcon fontSize="small" />
                  API Performance
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="caption">
                      Response: {metrics.api.avgResponseTime.toFixed(0)}ms
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption">
                      Success: {metrics.api.successRate.toFixed(1)}%
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption">
                      Cache: {metrics.api.cacheHitRate.toFixed(1)}%
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption">
                      Calls: {metrics.api.totalCalls}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              {/* Image Metrics */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                  <ImageIcon fontSize="small" />
                  Image Performance
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="caption">
                      Load: {metrics.images.avgLoadTime.toFixed(0)}ms
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption">
                      Success: {metrics.images.successRate.toFixed(1)}%
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              {/* Video Metrics */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                  <VideoIcon fontSize="small" />
                  Video Performance
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="caption">
                      Start: {metrics.video.avgStartTime.toFixed(0)}ms
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption">
                      Success: {metrics.video.successRate.toFixed(1)}%
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              {/* Actions */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={handleRunTests}
                  disabled={isRunningTests}
                  sx={{ 
                    color: 'white', 
                    borderColor: 'white',
                    '&:hover': { borderColor: 'rgba(255, 255, 255, 0.7)' }
                  }}
                >
                  {isRunningTests ? 'Testing...' : 'Run Tests'}
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => performanceTracker.generateReport()}
                  sx={{ 
                    color: 'white', 
                    borderColor: 'white',
                    '&:hover': { borderColor: 'rgba(255, 255, 255, 0.7)' }
                  }}
                >
                  Report
                </Button>
              </Box>
            </Box>
          </Collapse>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PerformanceMonitor;