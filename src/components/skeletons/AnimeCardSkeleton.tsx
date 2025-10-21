import React from 'react';
import { Box, Skeleton, Card, CardContent } from '@mui/material';

interface AnimeCardSkeletonProps {
  variant?: 'poster' | 'landscape' | 'compact';
  count?: number;
}

const AnimeCardSkeleton: React.FC<AnimeCardSkeletonProps> = ({ 
  variant = 'poster', 
  count = 1 
}) => {
  const renderSkeleton = () => {
    switch (variant) {
      case 'landscape':
        return (
          <Card sx={{ width: 300, height: 169 }}>
            <Skeleton variant="rectangular" width="100%" height="100%" />
            <CardContent sx={{ p: 1 }}>
              <Skeleton variant="text" width="80%" height={20} />
              <Skeleton variant="text" width="60%" height={16} />
            </CardContent>
          </Card>
        );
      
      case 'compact':
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1 }}>
            <Skeleton variant="rectangular" width={60} height={80} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="90%" height={20} />
              <Skeleton variant="text" width="70%" height={16} />
              <Skeleton variant="text" width="50%" height={14} />
            </Box>
          </Box>
        );
      
      default: // poster
        return (
          <Card sx={{ width: 200, height: 300 }}>
            <Skeleton variant="rectangular" width="100%" height={240} />
            <CardContent sx={{ p: 1 }}>
              <Skeleton variant="text" width="90%" height={18} />
              <Skeleton variant="text" width="70%" height={14} />
            </CardContent>
          </Card>
        );
    }
  };

  if (count === 1) {
    return renderSkeleton();
  }

  return (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      {Array.from({ length: count }, (_, index) => (
        <Box key={index}>
          {renderSkeleton()}
        </Box>
      ))}
    </Box>
  );
};

export default AnimeCardSkeleton;