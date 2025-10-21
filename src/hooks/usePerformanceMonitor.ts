import { useEffect, useRef, useCallback } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage?: {
    used: number;
    total: number;
    limit: number;
  };
}

interface UsePerformanceMonitorOptions {
  enabled?: boolean;
  logToConsole?: boolean;
  onMetrics?: (metrics: PerformanceMetrics) => void;
}

export const usePerformanceMonitor = (
  componentName: string,
  options: UsePerformanceMonitorOptions = {}
) => {
  const {
    enabled = import.meta.env.DEV,
    logToConsole = true,
    onMetrics
  } = options;

  const renderStartTime = useRef<number>(0);
  const mountTime = useRef<number>(0);

  // Start measuring render time
  const startMeasure = useCallback(() => {
    if (!enabled) return;
    renderStartTime.current = performance.now();
  }, [enabled]);

  // End measuring and log results
  const endMeasure = useCallback(() => {
    if (!enabled || renderStartTime.current === 0) return;

    const renderTime = performance.now() - renderStartTime.current;
    let memoryUsage: PerformanceMetrics['memoryUsage'];

    // Get memory usage if available
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      memoryUsage = {
        used: Math.round(memory.usedJSHeapSize / 1048576), // MB
        total: Math.round(memory.totalJSHeapSize / 1048576), // MB
        limit: Math.round(memory.jsHeapSizeLimit / 1048576), // MB
      };
    }

    const metrics: PerformanceMetrics = {
      renderTime,
      memoryUsage,
    };

    if (logToConsole) {
      console.group(`🔍 Performance: ${componentName}`);
      console.log(`Render time: ${renderTime.toFixed(2)}ms`);
      if (memoryUsage) {
        console.log(`Memory: ${memoryUsage.used}MB / ${memoryUsage.total}MB (limit: ${memoryUsage.limit}MB)`);
      }
      console.groupEnd();
    }

    onMetrics?.(metrics);
    renderStartTime.current = 0;
  }, [enabled, componentName, logToConsole, onMetrics]);

  // Track component mount time
  useEffect(() => {
    if (!enabled) return;
    
    mountTime.current = performance.now();
    startMeasure();

    return () => {
      if (mountTime.current > 0) {
        const totalLifetime = performance.now() - mountTime.current;
        if (logToConsole) {
          console.log(`📊 ${componentName} lifetime: ${totalLifetime.toFixed(2)}ms`);
        }
      }
    };
  }, [enabled, componentName, logToConsole, startMeasure]);

  // Measure specific operations
  const measureOperation = useCallback(
    <T>(operationName: string, operation: () => T): T => {
      if (!enabled) return operation();

      const start = performance.now();
      const result = operation();
      const duration = performance.now() - start;

      if (logToConsole) {
        console.log(`⚡ ${componentName} - ${operationName}: ${duration.toFixed(2)}ms`);
      }

      return result;
    },
    [enabled, componentName, logToConsole]
  );

  // Measure async operations
  const measureAsyncOperation = useCallback(
    async <T>(operationName: string, operation: () => Promise<T>): Promise<T> => {
      if (!enabled) return operation();

      const start = performance.now();
      const result = await operation();
      const duration = performance.now() - start;

      if (logToConsole) {
        console.log(`⚡ ${componentName} - ${operationName} (async): ${duration.toFixed(2)}ms`);
      }

      return result;
    },
    [enabled, componentName, logToConsole]
  );

  return {
    startMeasure,
    endMeasure,
    measureOperation,
    measureAsyncOperation,
  };
};

// Hook for monitoring API call performance
export const useApiPerformanceMonitor = (apiName: string) => {
  const logApiCall = useCallback(
    (endpoint: string, duration: number, success: boolean) => {
      if (import.meta.env.DEV) {
        const status = success ? '✅' : '❌';
        console.log(`${status} API ${apiName} - ${endpoint}: ${duration.toFixed(2)}ms`);
      }
    },
    [apiName]
  );

  const measureApiCall = useCallback(
    async <T>(endpoint: string, apiCall: () => Promise<T>): Promise<T> => {
      const start = performance.now();
      let success = false;

      try {
        const result = await apiCall();
        success = true;
        return result;
      } catch (error) {
        throw error;
      } finally {
        const duration = performance.now() - start;
        logApiCall(endpoint, duration, success);
      }
    },
    [logApiCall]
  );

  return { measureApiCall };
};

// Hook for monitoring memory usage
export const useMemoryMonitor = (componentName: string, interval: number = 10000) => {
  useEffect(() => {
    if (!import.meta.env.DEV || !('memory' in performance)) {
      return;
    }

    const checkMemory = () => {
      const memory = (performance as any).memory;
      const used = Math.round(memory.usedJSHeapSize / 1048576);
      const total = Math.round(memory.totalJSHeapSize / 1048576);
      const limit = Math.round(memory.jsHeapSizeLimit / 1048576);

      // Warn if memory usage is high
      if (used > limit * 0.8) {
        console.warn(`🚨 High memory usage in ${componentName}: ${used}MB / ${limit}MB`);
      }
    };

    const intervalId = setInterval(checkMemory, interval);
    return () => clearInterval(intervalId);
  }, [componentName, interval]);
};