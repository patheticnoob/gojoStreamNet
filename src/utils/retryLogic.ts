interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  shouldRetry?: (error: any) => boolean;
  onRetry?: (attempt: number, error: any) => void;
}

const defaultOptions: Required<RetryOptions> = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffFactor: 2,
  shouldRetry: (error) => {
    // Retry on network errors, 5xx server errors, and timeouts
    if (error?.status >= 500 && error?.status < 600) return true;
    if (error?.name === 'NetworkError') return true;
    if (error?.name === 'TimeoutError') return true;
    if (error?.code === 'NETWORK_ERROR') return true;
    return false;
  },
  onRetry: () => {},
};

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...defaultOptions, ...options };
  let lastError: any;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry if this is the last attempt or if we shouldn't retry this error
      if (attempt === opts.maxAttempts || !opts.shouldRetry(error)) {
        throw error;
      }

      // Calculate delay with exponential backoff and jitter
      const delay = Math.min(
        opts.baseDelay * Math.pow(opts.backoffFactor, attempt - 1),
        opts.maxDelay
      );
      
      // Add jitter to prevent thundering herd
      const jitteredDelay = delay + Math.random() * 1000;

      opts.onRetry(attempt, error);

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, jitteredDelay));
    }
  }

  throw lastError;
}

/**
 * Create a retry wrapper for RTK Query endpoints
 */
export function createRetryQuery<T>(
  queryFn: () => Promise<T>,
  options: RetryOptions = {}
) {
  return () => retryWithBackoff(queryFn, {
    ...options,
    onRetry: (attempt, error) => {
      console.warn(`Query retry attempt ${attempt}:`, error?.message || error);
      options.onRetry?.(attempt, error);
    },
  });
}

/**
 * Retry configuration for different types of operations
 */
export const retryConfigs = {
  // For critical API calls (home page, search)
  critical: {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 5000,
    backoffFactor: 2,
  },
  
  // For streaming operations
  streaming: {
    maxAttempts: 5,
    baseDelay: 500,
    maxDelay: 3000,
    backoffFactor: 1.5,
    shouldRetry: (error: any) => {
      // More aggressive retry for streaming
      if (error?.status >= 400) return true;
      if (error?.name?.includes('Network')) return true;
      if (error?.name?.includes('Timeout')) return true;
      return false;
    },
  },
  
  // For image loading
  images: {
    maxAttempts: 2,
    baseDelay: 500,
    maxDelay: 2000,
    backoffFactor: 2,
  },
  
  // For non-critical operations
  optional: {
    maxAttempts: 2,
    baseDelay: 2000,
    maxDelay: 4000,
    backoffFactor: 2,
  },
};

/**
 * Hook for managing retry state in components
 */
export function useRetryState() {
  const [retryCount, setRetryCount] = React.useState(0);
  const [isRetrying, setIsRetrying] = React.useState(false);

  const retry = React.useCallback(async (fn: () => Promise<any>) => {
    setIsRetrying(true);
    try {
      await fn();
      setRetryCount(0);
    } catch (error) {
      setRetryCount(prev => prev + 1);
      throw error;
    } finally {
      setIsRetrying(false);
    }
  }, []);

  const reset = React.useCallback(() => {
    setRetryCount(0);
    setIsRetrying(false);
  }, []);

  return {
    retryCount,
    isRetrying,
    retry,
    reset,
  };
}

// Import React for the hook
import React from 'react';