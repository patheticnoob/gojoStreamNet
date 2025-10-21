/**
 * Performance testing and optimization utilities
 */

interface ApiPerformanceMetrics {
  endpoint: string;
  responseTime: number;
  success: boolean;
  cacheHit: boolean;
  timestamp: number;
}

interface ImageLoadMetrics {
  url: string;
  loadTime: number;
  success: boolean;
  size?: number;
  timestamp: number;
}

interface VideoStreamingMetrics {
  episodeId: string;
  bufferTime: number;
  playbackStartTime: number;
  quality: string;
  success: boolean;
  timestamp: number;
}

class PerformanceTracker {
  private apiMetrics: ApiPerformanceMetrics[] = [];
  private imageMetrics: ImageLoadMetrics[] = [];
  private videoMetrics: VideoStreamingMetrics[] = [];
  private memorySnapshots: Array<{ timestamp: number; usage: number }> = [];

  // Track API performance
  trackApiCall(endpoint: string, startTime: number, success: boolean, cacheHit: boolean = false) {
    const responseTime = performance.now() - startTime;
    this.apiMetrics.push({
      endpoint,
      responseTime,
      success,
      cacheHit,
      timestamp: Date.now(),
    });

    // Keep only last 100 metrics to prevent memory bloat
    if (this.apiMetrics.length > 100) {
      this.apiMetrics = this.apiMetrics.slice(-100);
    }

    // Log slow API calls
    if (responseTime > 5000) {
      console.warn(`🐌 Slow API call: ${endpoint} took ${responseTime.toFixed(2)}ms`);
    }
  }

  // Track image loading performance
  trackImageLoad(url: string, startTime: number, success: boolean, size?: number) {
    const loadTime = performance.now() - startTime;
    this.imageMetrics.push({
      url,
      loadTime,
      success,
      size,
      timestamp: Date.now(),
    });

    // Keep only last 50 image metrics
    if (this.imageMetrics.length > 50) {
      this.imageMetrics = this.imageMetrics.slice(-50);
    }

    // Log slow image loads
    if (loadTime > 3000) {
      console.warn(`🖼️ Slow image load: ${url} took ${loadTime.toFixed(2)}ms`);
    }
  }

  // Track video streaming performance
  trackVideoStreaming(episodeId: string, bufferTime: number, playbackStartTime: number, quality: string, success: boolean) {
    this.videoMetrics.push({
      episodeId,
      bufferTime,
      playbackStartTime,
      quality,
      success,
      timestamp: Date.now(),
    });

    // Keep only last 20 video metrics
    if (this.videoMetrics.length > 20) {
      this.videoMetrics = this.videoMetrics.slice(-20);
    }

    // Log slow video starts
    if (playbackStartTime > 10000) {
      console.warn(`📹 Slow video start: Episode ${episodeId} took ${playbackStartTime.toFixed(2)}ms to start`);
    }
  }

  // Track memory usage
  trackMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usage = memory.usedJSHeapSize / 1048576; // MB
      
      this.memorySnapshots.push({
        timestamp: Date.now(),
        usage,
      });

      // Keep only last 50 snapshots
      if (this.memorySnapshots.length > 50) {
        this.memorySnapshots = this.memorySnapshots.slice(-50);
      }

      // Warn on high memory usage
      const limit = memory.jsHeapSizeLimit / 1048576;
      if (usage > limit * 0.8) {
        console.warn(`🚨 High memory usage: ${usage.toFixed(2)}MB / ${limit.toFixed(2)}MB`);
      }
    }
  }

  // Get performance summary
  getPerformanceSummary() {
    const now = Date.now();
    const last5Minutes = now - 5 * 60 * 1000;

    // API performance in last 5 minutes
    const recentApiCalls = this.apiMetrics.filter(m => m.timestamp > last5Minutes);
    const avgApiResponseTime = recentApiCalls.length > 0 
      ? recentApiCalls.reduce((sum, m) => sum + m.responseTime, 0) / recentApiCalls.length 
      : 0;
    const apiSuccessRate = recentApiCalls.length > 0 
      ? (recentApiCalls.filter(m => m.success).length / recentApiCalls.length) * 100 
      : 100;
    const cacheHitRate = recentApiCalls.length > 0 
      ? (recentApiCalls.filter(m => m.cacheHit).length / recentApiCalls.length) * 100 
      : 0;

    // Image performance in last 5 minutes
    const recentImageLoads = this.imageMetrics.filter(m => m.timestamp > last5Minutes);
    const avgImageLoadTime = recentImageLoads.length > 0 
      ? recentImageLoads.reduce((sum, m) => sum + m.loadTime, 0) / recentImageLoads.length 
      : 0;
    const imageSuccessRate = recentImageLoads.length > 0 
      ? (recentImageLoads.filter(m => m.success).length / recentImageLoads.length) * 100 
      : 100;

    // Video performance in last 5 minutes
    const recentVideoStreams = this.videoMetrics.filter(m => m.timestamp > last5Minutes);
    const avgVideoStartTime = recentVideoStreams.length > 0 
      ? recentVideoStreams.reduce((sum, m) => sum + m.playbackStartTime, 0) / recentVideoStreams.length 
      : 0;
    const videoSuccessRate = recentVideoStreams.length > 0 
      ? (recentVideoStreams.filter(m => m.success).length / recentVideoStreams.length) * 100 
      : 100;

    // Memory usage
    const currentMemory = this.memorySnapshots.length > 0 
      ? this.memorySnapshots[this.memorySnapshots.length - 1].usage 
      : 0;

    return {
      api: {
        avgResponseTime: avgApiResponseTime,
        successRate: apiSuccessRate,
        cacheHitRate: cacheHitRate,
        totalCalls: recentApiCalls.length,
      },
      images: {
        avgLoadTime: avgImageLoadTime,
        successRate: imageSuccessRate,
        totalLoads: recentImageLoads.length,
      },
      video: {
        avgStartTime: avgVideoStartTime,
        successRate: videoSuccessRate,
        totalStreams: recentVideoStreams.length,
      },
      memory: {
        current: currentMemory,
        snapshots: this.memorySnapshots.length,
      },
    };
  }

  // Generate performance report
  generateReport() {
    const summary = this.getPerformanceSummary();
    
    console.group('📊 Performance Report');
    console.log('API Performance:', {
      'Avg Response Time': `${summary.api.avgResponseTime.toFixed(2)}ms`,
      'Success Rate': `${summary.api.successRate.toFixed(1)}%`,
      'Cache Hit Rate': `${summary.api.cacheHitRate.toFixed(1)}%`,
      'Total Calls': summary.api.totalCalls,
    });
    console.log('Image Performance:', {
      'Avg Load Time': `${summary.images.avgLoadTime.toFixed(2)}ms`,
      'Success Rate': `${summary.images.successRate.toFixed(1)}%`,
      'Total Loads': summary.images.totalLoads,
    });
    console.log('Video Performance:', {
      'Avg Start Time': `${summary.video.avgStartTime.toFixed(2)}ms`,
      'Success Rate': `${summary.video.successRate.toFixed(1)}%`,
      'Total Streams': summary.video.totalStreams,
    });
    console.log('Memory Usage:', {
      'Current': `${summary.memory.current.toFixed(2)}MB`,
      'Snapshots': summary.memory.snapshots,
    });
    console.groupEnd();

    return summary;
  }

  // Clear all metrics
  clear() {
    this.apiMetrics = [];
    this.imageMetrics = [];
    this.videoMetrics = [];
    this.memorySnapshots = [];
  }
}

// Global performance tracker instance
export const performanceTracker = new PerformanceTracker();

// Auto-track memory usage every 30 seconds in development
if (import.meta.env.DEV) {
  setInterval(() => {
    performanceTracker.trackMemoryUsage();
  }, 30000);
}

// Performance testing utilities
export const performanceTests = {
  // Test API response times
  async testApiPerformance() {
    console.log('🧪 Testing API performance...');
    
    // Test multiple endpoints
    const endpoints = [
      { name: 'Home', url: 'https://hianime-api-jzl7.onrender.com/api/v1/home' },
      { name: 'Search', url: 'https://hianime-api-jzl7.onrender.com/api/v1/search?keyword=naruto' },
    ];

    const results = [];
    
    for (const endpoint of endpoints) {
      const start = performance.now();
      try {
        const response = await fetch(endpoint.url);
        const duration = performance.now() - start;
        results.push({
          name: endpoint.name,
          duration,
          success: response.ok,
          status: response.status,
        });
      } catch (error) {
        const duration = performance.now() - start;
        results.push({
          name: endpoint.name,
          duration,
          success: false,
          error: (error as Error).message,
        });
      }
    }

    console.table(results);
    return results;
  },

  // Test image loading performance
  async testImagePerformance() {
    console.log('🧪 Testing image loading performance...');
    
    const testImages = [
      'https://cdn.myanimelist.net/images/anime/1208/94745.jpg', // Sample anime poster
    ];

    const results = [];
    
    for (const imageUrl of testImages) {
      const start = performance.now();
      try {
        await new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = resolve;
          img.onerror = reject;
          img.src = imageUrl;
        });
        const duration = performance.now() - start;
        results.push({
          url: imageUrl,
          duration,
          success: true,
        });
      } catch (error) {
        const duration = performance.now() - start;
        results.push({
          url: imageUrl,
          duration,
          success: false,
        });
      }
    }

    console.table(results);
    return results;
  },

  // Generate comprehensive performance report
  generateComprehensiveReport() {
    const summary = performanceTracker.getPerformanceSummary();
    
    // Performance recommendations
    const recommendations = [];
    
    if (summary.api.avgResponseTime > 3000) {
      recommendations.push('Consider implementing request caching or using a CDN');
    }
    
    if (summary.api.cacheHitRate < 50) {
      recommendations.push('Improve caching strategy to reduce API calls');
    }
    
    if (summary.images.avgLoadTime > 2000) {
      recommendations.push('Optimize image sizes or implement progressive loading');
    }
    
    if (summary.video.avgStartTime > 8000) {
      recommendations.push('Optimize video streaming or implement preloading');
    }
    
    if (summary.memory.current > 100) {
      recommendations.push('Monitor memory usage - consider implementing cleanup strategies');
    }

    console.group('🎯 Performance Recommendations');
    recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });
    console.groupEnd();

    return { summary, recommendations };
  }
};

// Export performance tracker for use in components
export default performanceTracker;