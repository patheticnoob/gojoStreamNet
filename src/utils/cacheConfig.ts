/**
 * Cache configuration and utilities for RTK Query
 */

// Cache durations in seconds
export const CACHE_TIMES = {
  // Homepage data changes frequently but not constantly
  HOME_DATA: 5 * 60, // 5 minutes
  
  // Search results can be cached for a moderate time
  SEARCH_RESULTS: 3 * 60, // 3 minutes
  
  // Anime details don't change often
  ANIME_DETAILS: 15 * 60, // 15 minutes
  
  // Episode lists are relatively static
  EPISODE_LISTS: 30 * 60, // 30 minutes
  
  // Streaming data should be fresh but can have short cache
  STREAMING_DATA: 2 * 60, // 2 minutes
  
  // Episode info is static
  EPISODE_INFO: 60 * 60, // 1 hour
} as const;

// Keep alive times (how long to keep unused data in cache)
export const KEEP_UNUSED_DATA_FOR = {
  DEFAULT: 5 * 60, // 5 minutes
  CRITICAL: 10 * 60, // 10 minutes for important data
  STREAMING: 2 * 60, // 2 minutes for streaming data
} as const;

/**
 * Generate cache key for search queries
 */
export function generateSearchCacheKey(keyword: string, page: number = 1): string {
  return `search_${keyword.toLowerCase().trim()}_page_${page}`;
}

/**
 * Generate cache key for anime details
 */
export function generateAnimeCacheKey(animeId: string): string {
  return `anime_${animeId}`;
}

/**
 * Generate cache key for episodes
 */
export function generateEpisodesCacheKey(animeId: string): string {
  return `episodes_${animeId}`;
}

/**
 * Generate cache key for streaming data
 */
export function generateStreamingCacheKey(episodeId: string): string {
  return `stream_${episodeId}`;
}

/**
 * Cache invalidation strategies
 */
export const CACHE_TAGS = {
  HOME: 'Home',
  SEARCH: 'Search', 
  ANIME_DETAIL: 'AnimeDetail',
  EPISODES: 'Episodes',
  STREAM: 'Stream',
  EPISODE_INFO: 'EpisodeInfo',
} as const;

/**
 * Selective cache invalidation based on data freshness
 */
export function shouldInvalidateCache(lastFetch: number, cacheTime: number): boolean {
  return Date.now() - lastFetch > cacheTime * 1000;
}

/**
 * Memory management for large datasets
 */
export const MEMORY_LIMITS = {
  MAX_SEARCH_RESULTS_CACHED: 50, // Maximum number of search result pages to keep
  MAX_ANIME_DETAILS_CACHED: 100, // Maximum number of anime details to keep
  MAX_STREAMING_DATA_CACHED: 20, // Maximum number of streaming data entries
} as const;

/**
 * Performance optimization settings
 */
export const PERFORMANCE_CONFIG = {
  // Prefetch related data
  PREFETCH_EPISODES_ON_DETAIL_VIEW: true,
  PREFETCH_STREAMING_ON_EPISODE_SELECT: true,
  
  // Background refetch settings
  REFETCH_ON_FOCUS: false, // Don't refetch when window gains focus
  REFETCH_ON_RECONNECT: true, // Refetch when network reconnects
  
  // Polling settings (disabled by default for performance)
  ENABLE_POLLING: false,
  POLLING_INTERVAL: 5 * 60 * 1000, // 5 minutes if enabled
} as const;