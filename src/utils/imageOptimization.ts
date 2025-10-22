import { IMAGE_OPTIMIZATION_SERVICE } from "src/constant";
import performanceTracker from "src/utils/performanceTesting";

// Image size presets for different use cases
export interface ImageDimensions {
  width: number;
  height: number;
}

export const IMAGE_SIZES = {
  // Poster sizes (2:3 aspect ratio)
  poster: {
    small: { width: 200, height: 300 },
    medium: { width: 400, height: 600 },
    large: { width: 600, height: 900 },
    xlarge: { width: 800, height: 1200 },
  },
  // Backdrop sizes (16:9 aspect ratio)
  backdrop: {
    small: { width: 320, height: 180 },
    medium: { width: 640, height: 360 },
    large: { width: 1280, height: 720 },
    xlarge: { width: 1920, height: 1080 },
  },
  // Thumbnail sizes (16:9 aspect ratio)
  thumbnail: {
    small: { width: 160, height: 90 },
    medium: { width: 320, height: 180 },
    large: { width: 480, height: 270 },
  },
} as const;

export type ImageType = keyof typeof IMAGE_SIZES;
export type ImageSize = keyof typeof IMAGE_SIZES.poster;

/**
 * Generate optimized image URL using weserv.nl service
 * @param originalUrl - The original image URL
 * @param dimensions - Width and height for the optimized image
 * @param options - Additional optimization options
 * @returns Optimized image URL
 */
export function getOptimizedImageUrl(
  originalUrl: string,
  dimensions: ImageDimensions,
  options: {
    format?: 'webp' | 'jpeg' | 'png';
    quality?: number;
    fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  } = {}
): string {
  if (!originalUrl || originalUrl.trim() === '') {
    return '';
  }

  const {
    format = 'webp',
    quality = 85,
    fit = 'cover'
  } = options;

  const params = new URLSearchParams({
    url: originalUrl,
    w: dimensions.width.toString(),
    h: dimensions.height.toString(),
    fit,
    output: format,
    q: quality.toString(),
  });

  return `${IMAGE_OPTIMIZATION_SERVICE}/?${params.toString()}`;
}

/**
 * Get optimized image URL for anime posters
 * @param posterUrl - Original poster URL
 * @param size - Predefined size (small, medium, large, xlarge)
 * @returns Optimized poster URL
 */
export function getOptimizedPosterUrl(
  posterUrl: string,
  size: ImageSize = 'medium'
): string {
  const dimensions = IMAGE_SIZES.poster[size];
  return getOptimizedImageUrl(posterUrl, dimensions);
}

/**
 * Get optimized image URL for backdrop images
 * @param backdropUrl - Original backdrop URL
 * @param size - Predefined size (small, medium, large, xlarge)
 * @returns Optimized backdrop URL
 */
export function getOptimizedBackdropUrl(
  backdropUrl: string,
  size: ImageSize = 'medium'
): string {
  const dimensions = IMAGE_SIZES.backdrop[size];
  return getOptimizedImageUrl(backdropUrl, dimensions);
}

/**
 * Get optimized image URL for thumbnails
 * @param thumbnailUrl - Original thumbnail URL
 * @param size - Predefined size (small, medium, large)
 * @returns Optimized thumbnail URL
 */
export function getOptimizedThumbnailUrl(
  thumbnailUrl: string,
  size: Exclude<ImageSize, 'xlarge'> = 'medium'
): string {
  const dimensions = IMAGE_SIZES.thumbnail[size];
  return getOptimizedImageUrl(thumbnailUrl, dimensions);
}

/**
 * Get responsive image URL based on screen size
 * @param originalUrl - Original image URL
 * @param imageType - Type of image (poster, backdrop, thumbnail)
 * @param screenWidth - Current screen width in pixels
 * @returns Optimized image URL for the screen size
 */
export function getResponsiveImageUrl(
  originalUrl: string,
  imageType: ImageType = 'poster',
  screenWidth: number = window.innerWidth
): string {
  let size: ImageSize;

  // Determine size based on screen width
  if (screenWidth < 600) {
    size = 'small';
  } else if (screenWidth < 1200) {
    size = 'medium';
  } else if (screenWidth < 1920) {
    size = 'large';
  } else {
    size = 'xlarge';
  }

  // For thumbnails, cap at large size
  if (imageType === 'thumbnail' && size === 'xlarge') {
    size = 'large';
  }

  const dimensions = IMAGE_SIZES[imageType][size as keyof typeof IMAGE_SIZES[typeof imageType]];
  return getOptimizedImageUrl(originalUrl, dimensions);
}

/**
 * Generate fallback image URL for when original image fails to load
 * @param imageType - Type of image for appropriate placeholder
 * @param size - Size of the placeholder
 * @returns Placeholder image URL
 */
export function getFallbackImageUrl(
  imageType: ImageType = 'poster',
  size: ImageSize = 'medium'
): string {
  const dimensions = IMAGE_SIZES[imageType][size as keyof typeof IMAGE_SIZES[typeof imageType]];
  
  // Generate a placeholder using a solid color service with better styling
  const backgroundColor = '2d2d2d'; // Darker gray matching app theme
  const textColor = 'ffffff';
  const text = imageType === 'poster' ? 'NO+IMAGE' : 'NO+IMAGE';
  
  return `https://via.placeholder.com/${dimensions.width}x${dimensions.height}/${backgroundColor}/${textColor}?text=${encodeURIComponent(text)}&font=Arial`;
}

/**
 * Check if an image URL is valid and accessible
 * @param imageUrl - Image URL to validate
 * @returns Promise that resolves to true if image is accessible
 */
export function validateImageUrl(imageUrl: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (!imageUrl || imageUrl.trim() === '') {
      resolve(false);
      return;
    }

    // Don't validate placeholder URLs (they should always work)
    if (imageUrl.includes('via.placeholder.com')) {
      resolve(true);
      return;
    }

    const startTime = performance.now();
    const img = new Image();
    let resolved = false;
    
    const resolveOnce = (success: boolean) => {
      if (!resolved) {
        resolved = true;
        performanceTracker.trackImageLoad(imageUrl, startTime, success);
        resolve(success);
      }
    };
    
    img.onload = () => resolveOnce(true);
    img.onerror = () => resolveOnce(false);
    
    // Set crossOrigin to handle CORS issues
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
    
    // Timeout after 3 seconds (reduced from 5)
    setTimeout(() => resolveOnce(false), 3000);
  });
}

/**
 * Get image URL with fallback handling
 * @param originalUrl - Original image URL
 * @param imageType - Type of image
 * @param size - Image size
 * @returns Promise that resolves to optimized URL or fallback URL
 */
export async function getImageUrlWithFallback(
  originalUrl: string,
  imageType: ImageType = 'poster',
  size: ImageSize = 'medium'
): Promise<string> {
  if (!originalUrl || originalUrl.trim() === '') {
    return getFallbackImageUrl(imageType, size);
  }

  const optimizedUrl = imageType === 'poster' 
    ? getOptimizedPosterUrl(originalUrl, size)
    : imageType === 'backdrop'
    ? getOptimizedBackdropUrl(originalUrl, size)
    : getOptimizedThumbnailUrl(originalUrl, size as Exclude<ImageSize, 'xlarge'>);

  const isValid = await validateImageUrl(optimizedUrl);
  
  if (isValid) {
    return optimizedUrl;
  }

  // Try original URL as fallback
  const isOriginalValid = await validateImageUrl(originalUrl);
  if (isOriginalValid) {
    return originalUrl;
  }

  // Return placeholder as final fallback
  return getFallbackImageUrl(imageType, size);
}

/**
 * Preload image for better user experience
 * @param imageUrl - Image URL to preload
 * @returns Promise that resolves when image is loaded
 */
export function preloadImage(imageUrl: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!imageUrl || imageUrl.trim() === '') {
      resolve();
      return;
    }

    const startTime = performance.now();
    const img = new Image();
    
    img.onload = () => {
      performanceTracker.trackImageLoad(imageUrl, startTime, true);
      resolve();
    };
    
    img.onerror = () => {
      performanceTracker.trackImageLoad(imageUrl, startTime, false);
      reject(new Error(`Failed to preload image: ${imageUrl}`));
    };
    
    img.src = imageUrl;
  });
}

/**
 * Batch preload multiple images
 * @param imageUrls - Array of image URLs to preload
 * @returns Promise that resolves when all images are loaded or failed
 */
export function preloadImages(imageUrls: string[]): Promise<void[]> {
  const preloadPromises = imageUrls.map(url => 
    preloadImage(url).catch(() => {
      // Ignore individual failures, just log them
      console.warn(`Failed to preload image: ${url}`);
    })
  );
  
  return Promise.all(preloadPromises);
}