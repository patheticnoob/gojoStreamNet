import React, { ImgHTMLAttributes } from 'react';
import { Box, Skeleton } from '@mui/material';
import { useImageWithFallback } from 'src/hooks/useImageWithFallback';
import { ImageType, ImageSize } from 'src/utils/imageOptimization';

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string | undefined | null;
  imageType?: ImageType;
  size?: ImageSize;
  enableFallback?: boolean;
  showSkeleton?: boolean;
  skeletonVariant?: 'rectangular' | 'circular' | 'rounded';
  alt: string;
}

/**
 * Optimized image component with automatic fallback handling and loading states
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src: originalSrc,
  imageType = 'poster',
  size = 'medium',
  enableFallback = true,
  showSkeleton = true,
  skeletonVariant = 'rectangular',
  alt,
  style,
  ...imgProps
}) => {
  const { src, isLoading, hasError, retry } = useImageWithFallback(originalSrc, {
    imageType,
    size,
    enableFallback
  });

  // Show skeleton while loading
  if (isLoading && showSkeleton) {
    return (
      <Skeleton
        variant={skeletonVariant}
        width="100%"
        height="100%"
        sx={{
          bgcolor: 'rgba(255, 255, 255, 0.1)',
          ...style
        }}
      />
    );
  }

  // Show nothing if error and no fallback
  if (hasError && !enableFallback) {
    return null;
  }

  return (
    <img
      {...imgProps}
      src={src}
      alt={alt}
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        ...style
      }}
      onError={() => {
        // Only retry if we haven't already had an error (prevents infinite loops)
        if (!hasError) {
          retry();
        }
      }}
    />
  );
};

/**
 * Specialized component for anime poster images
 */
export const AnimePosterImage: React.FC<Omit<OptimizedImageProps, 'imageType'>> = (props) => (
  <OptimizedImage {...props} imageType="poster" />
);

/**
 * Specialized component for backdrop images
 */
export const BackdropImage: React.FC<Omit<OptimizedImageProps, 'imageType'>> = (props) => (
  <OptimizedImage {...props} imageType="backdrop" />
);

/**
 * Specialized component for thumbnail images
 */
export const ThumbnailImage: React.FC<Omit<OptimizedImageProps, 'imageType' | 'size'> & { 
  size?: Exclude<ImageSize, 'xlarge'> 
}> = (props) => (
  <OptimizedImage {...props} imageType="thumbnail" />
);

export default OptimizedImage;