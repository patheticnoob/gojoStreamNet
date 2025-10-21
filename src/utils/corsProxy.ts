/**
 * CORS Proxy utilities for handling video streaming URLs
 * 
 * In a production environment, these functions would route requests
 * through a backend CORS proxy service to handle M3U8 streams and
 * other video sources that may have CORS restrictions.
 */

export interface ProxyConfig {
  baseUrl?: string;
  headers?: Record<string, string>;
}

/**
 * Get a CORS-proxied URL for video streaming
 * 
 * @param originalUrl - The original video stream URL
 * @param config - Optional proxy configuration
 * @returns Proxied URL that can be used for streaming
 */
export const getCorsProxyUrl = (
  originalUrl: string, 
  config?: ProxyConfig
): string => {
  // For development/testing, we'll try the original URL first
  // In production, this should route through a proper CORS proxy
  
  if (!originalUrl) {
    return "";
  }

  // Check if the URL is already accessible (same origin or CORS-enabled)
  try {
    const url = new URL(originalUrl);
    
    // If it's a data URL or blob URL, return as-is
    if (url.protocol === 'data:' || url.protocol === 'blob:') {
      return originalUrl;
    }
    
    // For now, return the original URL
    // TODO: Implement actual CORS proxy routing
    return originalUrl;
    
  } catch (error) {
    console.warn('Invalid URL provided to CORS proxy:', originalUrl);
    return originalUrl;
  }
};

/**
 * Check if a URL needs CORS proxying
 * 
 * @param url - The URL to check
 * @returns True if the URL likely needs CORS proxying
 */
export const needsCorsProxy = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    const currentOrigin = window.location.origin;
    
    // Same origin doesn't need proxy
    if (urlObj.origin === currentOrigin) {
      return false;
    }
    
    // Data and blob URLs don't need proxy
    if (urlObj.protocol === 'data:' || urlObj.protocol === 'blob:') {
      return false;
    }
    
    // Most external URLs will need CORS proxy for video streaming
    return true;
    
  } catch (error) {
    return false;
  }
};

/**
 * Create a proxy configuration for specific streaming services
 * 
 * @param service - The streaming service name
 * @returns Proxy configuration for the service
 */
export const getServiceProxyConfig = (service: string): ProxyConfig => {
  const configs: Record<string, ProxyConfig> = {
    'hianime': {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://hianime.to/',
      },
    },
    'yuma': {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    },
  };
  
  return configs[service] || {};
};