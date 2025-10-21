/**
 * Bundle optimization utilities and lazy loading helpers
 */

// Lazy loading utilities for components
export const lazyWithRetry = (componentImport: () => Promise<any>) => {
  return React.lazy(async () => {
    const pageHasAlreadyBeenForceRefreshed = JSON.parse(
      window.sessionStorage.getItem('page-has-been-force-refreshed') || 'false'
    );

    try {
      const component = await componentImport();
      window.sessionStorage.setItem('page-has-been-force-refreshed', 'false');
      return component;
    } catch (error) {
      if (!pageHasAlreadyBeenForceRefreshed) {
        // Refresh the page to get the latest version
        window.sessionStorage.setItem('page-has-been-force-refreshed', 'true');
        return window.location.reload();
      }
      // The page has already been reloaded, so just throw the error
      throw error;
    }
  });
};

// Preload critical resources
export const preloadCriticalResources = () => {
  // Preload critical fonts
  const fontLinks = [
    'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap',
  ];

  fontLinks.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = href;
    document.head.appendChild(link);
  });
};

// Image optimization and lazy loading
export const createOptimizedImageUrl = (
  originalUrl: string,
  width?: number,
  height?: number,
  quality: number = 80
): string => {
  if (!originalUrl) return '';
  
  const params = new URLSearchParams();
  params.set('url', originalUrl);
  params.set('output', 'webp');
  params.set('q', quality.toString());
  
  if (width) params.set('w', width.toString());
  if (height) params.set('h', height.toString());
  
  return `https://images.weserv.nl/?${params.toString()}`;
};

// Memory management for large lists
export const createVirtualizedListConfig = (itemCount: number) => ({
  // Only render visible items plus buffer
  overscan: Math.min(5, Math.ceil(itemCount * 0.1)),
  // Estimate item size for better performance
  estimatedItemSize: 200,
  // Use window scrolling for better performance
  useIsScrolling: true,
});

// Debounce utility for search and other frequent operations
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate?: boolean
): ((...args: Parameters<T>) => void) => {
  let timeout: number | null = null;
  
  return (...args: Parameters<T>) => {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
};

// Throttle utility for scroll events
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Performance monitoring utilities
export const measurePerformance = (name: string, fn: () => void) => {
  if (import.meta.env.DEV) {
    const start = performance.now();
    fn();
    const end = performance.now();
    console.log(`${name} took ${end - start} milliseconds`);
  } else {
    fn();
  }
};

// Memory usage monitoring
export const logMemoryUsage = (context: string) => {
  if (import.meta.env.DEV && 'memory' in performance) {
    const memInfo = (performance as any).memory;
    console.log(`Memory usage (${context}):`, {
      used: `${Math.round(memInfo.usedJSHeapSize / 1048576)} MB`,
      total: `${Math.round(memInfo.totalJSHeapSize / 1048576)} MB`,
      limit: `${Math.round(memInfo.jsHeapSizeLimit / 1048576)} MB`,
    });
  }
};

// Cleanup utilities for component unmounting
export const createCleanupManager = () => {
  const cleanupFunctions: (() => void)[] = [];
  
  return {
    add: (cleanup: () => void) => {
      cleanupFunctions.push(cleanup);
    },
    cleanup: () => {
      cleanupFunctions.forEach(fn => {
        try {
          fn();
        } catch (error) {
          console.error('Cleanup error:', error);
        }
      });
      cleanupFunctions.length = 0;
    }
  };
};

// Import React for lazy loading
import React from 'react';