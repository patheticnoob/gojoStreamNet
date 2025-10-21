import React from 'react';
import { Box, Skeleton, Container, Stack } from '@mui/material';

const HeroSectionSkeleton: React.FC = () => {
  return (
    <Box
      sx={{
        position: 'relative',
        height: { xs: '50vh', md: '70vh' },
        minHeight: 400,
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        overflow: 'hidden',
      }}
    >
      {/* Background Image Skeleton */}
      <Skeleton
        variant="rectangular"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
        }}
      />

      {/* Gradient Overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.8) 100%)',
          zIndex: 1,
        }}
      />

      {/* Content */}
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2 }}>
        <Box
          sx={{
            maxWidth: { xs: '100%', md: '50%' },
            color: 'white',
          }}
        >
          <Stack spacing={3}>
            {/* Title */}
            <Skeleton
              variant="text"
              sx={{
                fontSize: { xs: '2rem', md: '3rem' },
                height: { xs: 60, md: 80 },
                width: '80%',
                bgcolor: 'rgba(255, 255, 255, 0.1)',
              }}
            />

            {/* Description */}
            <Stack spacing={1}>
              <Skeleton
                variant="text"
                sx={{
                  height: 24,
                  width: '90%',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                }}
              />
              <Skeleton
                variant="text"
                sx={{
                  height: 24,
                  width: '75%',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                }}
              />
              <Skeleton
                variant="text"
                sx={{
                  height: 24,
                  width: '60%',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                }}
              />
            </Stack>

            {/* Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Skeleton
                variant="rectangular"
                width={120}
                height={48}
                sx={{
                  borderRadius: 1,
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                }}
              />
              <Skeleton
                variant="rectangular"
                width={140}
                height={48}
                sx={{
                  borderRadius: 1,
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                }}
              />
            </Box>

            {/* Metadata */}
            <Box sx={{ display: 'flex', gap: 3, mt: 2 }}>
              <Skeleton
                variant="text"
                width={60}
                height={20}
                sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }}
              />
              <Skeleton
                variant="text"
                width={80}
                height={20}
                sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }}
              />
              <Skeleton
                variant="text"
                width={100}
                height={20}
                sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }}
              />
            </Box>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default HeroSectionSkeleton;