import React from 'react';
import { Box, Skeleton, Typography } from '@mui/material';
import AnimeCardSkeleton from './AnimeCardSkeleton';

interface VideoSliderSkeletonProps {
  title?: string;
  itemCount?: number;
  variant?: 'poster' | 'landscape' | 'compact';
}

const VideoSliderSkeleton: React.FC<VideoSliderSkeletonProps> = ({
  title,
  itemCount = 6,
  variant = 'poster'
}) => {
  return (
    <Box sx={{ mb: 4 }}>
      {/* Section Title */}
      <Box sx={{ mb: 2, px: 2 }}>
        {title ? (
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {title}
          </Typography>
        ) : (
          <Skeleton variant="text" width={200} height={32} />
        )}
      </Box>

      {/* Slider Container */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          overflowX: 'hidden',
          px: 2,
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none',
        }}
      >
        <AnimeCardSkeleton variant={variant} count={itemCount} />
      </Box>
    </Box>
  );
};

export default VideoSliderSkeleton;