import { useState, useEffect } from 'react';
import {
  getOptimizedPosterUrl,
  getOptimizedBackdropUrl,
  getOptimizedThumbnailUrl,
  getFallbackImageUrl,
  validateImageUrl,
  ImageType,
  ImageSize
} from 'src/utils/imageOptimization';

interface UseImageWithFallbackOptions {
  imageType?: ImageType;
  size?: ImageSize;
  enableFallback?: boolean;
}

interface UseImageWithFallbackReturn {
  src: string;
  isLoading: boolean;
  hasError: boolean;
  retry: () => void;
}

/**
 * Custom hook for handling image loading with optimization and fallback
 * @param originalUrl - Original image URL
 * @param options - Configuration options
 * @returns Object with optimized src, loading state, error state, and retry function
 */
export function useImageWithFallback(
  originalUrl: string | undefined | null,
  options: UseImageWithFallbackOptions = {}
): UseImageWithFallbackReturn {
  const {
    imageType = 'poster',
    size = 'medium',
    enableFallback = true
  } = options;

  const [src, setSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 2;

  const loadImage = async () => {
    setIsLoading(true);
    setHasError(false);

    // If we've exceeded max retries, show fallback immediately
    if (retryCount >= MAX_RETRIES) {
      console.warn(`Max retries (${MAX_RETRIES}) reached for image:`, originalUrl);
      if (enableFallback) {
        setSrc(getFallbackImageUrl(imageType, size));
      } else {
        setSrc('');
        setHasError(true);
      }
      setIsLoading(false);
      return;
    }

    // If no URL provided, use fallback immediately
    if (!originalUrl || originalUrl.trim() === '') {
      if (enableFallback) {
        setSrc(getFallbackImageUrl(imageType, size));
      } else {
        setSrc('');
      }
      setIsLoading(false);
      return;
    }

    try {
      // Get optimized URL based on image type
      let optimizedUrl: string;

      switch (imageType) {
        case 'backdrop':
          optimizedUrl = getOptimizedBackdropUrl(originalUrl, size);
          break;
        case 'thumbnail':
          optimizedUrl = getOptimizedThumbnailUrl(originalUrl, size as Exclude<ImageSize, 'xlarge'>);
          break;
        case 'poster':
        default:
          optimizedUrl = getOptimizedPosterUrl(originalUrl, size);
          break;
      }

      // Validate the optimized URL
      const isOptimizedValid = await validateImageUrl(optimizedUrl);

      if (isOptimizedValid) {
        setSrc(optimizedUrl);
        setIsLoading(false);
        return;
      }

      // If optimized URL fails, try original URL
      const isOriginalValid = await validateImageUrl(originalUrl);

      if (isOriginalValid) {
        setSrc(originalUrl);
        setIsLoading(false);
        return;
      }

      // If both fail, use fallback
      if (enableFallback) {
        setSrc(getFallbackImageUrl(imageType, size));
      } else {
        setSrc('');
        setHasError(true);
      }

    } catch (error) {
      console.warn('Error loading image:', error);

      if (enableFallback) {
        setSrc(getFallbackImageUrl(imageType, size));
      } else {
        setSrc('');
        setHasError(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const retry = () => {
    if (retryCount < MAX_RETRIES) {
      setRetryCount(prev => prev + 1);
    } else {
      console.warn('Cannot retry: Max retries reached');
    }
  };

  useEffect(() => {
    loadImage();
  }, [originalUrl, imageType, size, enableFallback, retryCount]);

  return {
    src,
    isLoading,
    hasError,
    retry
  };
}

/**
 * Simplified hook for poster images specifically
 * @param posterUrl - Poster image URL
 * @param size - Image size
 * @returns Optimized poster src with fallback handling
 */
export function usePosterImage(
  posterUrl: string | undefined | null,
  size: ImageSize = 'medium'
): UseImageWithFallbackReturn {
  return useImageWithFallback(posterUrl, {
    imageType: 'poster',
    size,
    enableFallback: true
  });
}

/**
 * Simplified hook for backdrop images specifically
 * @param backdropUrl - Backdrop image URL
 * @param size - Image size
 * @returns Optimized backdrop src with fallback handling
 */
export function useBackdropImage(
  backdropUrl: string | undefined | null,
  size: ImageSize = 'medium'
): UseImageWithFallbackReturn {
  return useImageWithFallback(backdropUrl, {
    imageType: 'backdrop',
    size,
    enableFallback: true
  });
}

/**
 * Simplified hook for thumbnail images specifically
 * @param thumbnailUrl - Thumbnail image URL
 * @param size - Image size (excluding xlarge)
 * @returns Optimized thumbnail src with fallback handling
 */
export function useThumbnailImage(
  thumbnailUrl: string | undefined | null,
  size: Exclude<ImageSize, 'xlarge'> = 'medium'
): UseImageWithFallbackReturn {
  return useImageWithFallback(thumbnailUrl, {
    imageType: 'thumbnail',
    size,
    enableFallback: true
  });
}