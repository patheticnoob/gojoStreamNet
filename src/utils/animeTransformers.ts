import {
  AnimeContent,
  AnimeEpisode,
  AnimeDetail,
  HomePageData,
  SearchResult,
  EpisodeList,
  StreamingData,
  EpisodeInfo,
  HiAnimeRawAnime,
  HiAnimeHomeResponse,
  HiAnimeSearchResponse,
  HiAnimeDetailResponse,
  HiAnimeEpisodesResponse,
  YumaStreamResponse,
  YumaInfoResponse,
} from '../types/Anime';

/**
 * Transform HiAnime API raw anime data to internal AnimeContent format
 */
export const transformHiAnimeToAnimeContent = (rawAnime: HiAnimeRawAnime): AnimeContent => {
  return {
    id: rawAnime.id,
    title: rawAnime.name,
    poster: optimizeImageUrl(rawAnime.poster),
    description: rawAnime.description || '',
    genres: rawAnime.genres || [],
    rating: parseFloat(rawAnime.rating || '0'),
    year: extractYearFromDate(rawAnime.releaseDate || ''),
    status: rawAnime.status || 'Unknown',
    episodes: rawAnime.totalEpisodes || 0,
    type: rawAnime.type || 'TV',
    otherInfo: rawAnime.otherInfo || [],
  };
};

/**
 * Transform HiAnime home page response to internal HomePageData format
 */
export const transformHiAnimeHomeResponse = (response: HiAnimeHomeResponse): HomePageData => {
  return {
    spotlight: (response.spotlight || []).map(transformHiAnimeToAnimeContent),
    trending: (response.trending || []).map(transformHiAnimeToAnimeContent),
    topAiring: (response.topAiring || []).map(transformHiAnimeToAnimeContent),
    mostPopular: (response.mostPopular || []).map(transformHiAnimeToAnimeContent),
    mostFavorite: (response.mostFavorite || []).map(transformHiAnimeToAnimeContent),
    latestEpisodes: (response.latestEpisodes || []).map(transformHiAnimeToAnimeContent),
    top10: {
      today: (response.top10?.today || []).map(transformHiAnimeToAnimeContent),
      week: (response.top10?.week || []).map(transformHiAnimeToAnimeContent),
      month: (response.top10?.month || []).map(transformHiAnimeToAnimeContent),
    },
    genres: response.genres || [],
  };
};

/**
 * Transform HiAnime search response to internal SearchResult format
 */
export const transformHiAnimeSearchResponse = (response: HiAnimeSearchResponse): SearchResult => {
  return {
    animes: response.animes.map(transformHiAnimeToAnimeContent),
    totalPages: response.totalPages,
    currentPage: response.currentPage,
    hasNextPage: response.hasNextPage,
  };
};

/**
 * Transform HiAnime detail response to internal AnimeDetail format
 */
export const transformHiAnimeDetailResponse = (response: HiAnimeDetailResponse): AnimeDetail => {
  const anime = response.anime;
  return {
    id: anime.id,
    title: anime.name,
    poster: optimizeImageUrl(anime.poster),
    description: anime.description,
    genres: anime.genres,
    rating: parseFloat(anime.rating),
    year: extractYearFromDate(anime.releaseDate),
    status: anime.status,
    episodes: anime.totalEpisodes,
    type: anime.type,
    otherInfo: anime.otherInfo,
    moreInfo: anime.moreInfo,
  };
};

/**
 * Transform HiAnime episodes response to internal EpisodeList format
 */
export const transformHiAnimeEpisodesResponse = (response: HiAnimeEpisodesResponse): EpisodeList => {
  return {
    episodes: response.episodes.map((episode): AnimeEpisode => ({
      id: episode.id,
      number: episode.number,
      title: episode.title,
      isFiller: episode.isFiller,
    })),
    totalEpisodes: response.totalEpisodes,
  };
};

/**
 * Transform Yuma API stream response to internal StreamingData format
 */
export const transformYumaStreamResponse = (response: YumaStreamResponse): StreamingData => {
  return {
    sources: response.sources.map(source => ({
      url: source.url,
      quality: source.quality,
      isM3U8: source.isM3U8,
    })),
    subtitles: response.subtitles.map(subtitle => ({
      label: subtitle.label,
      src: subtitle.src,
      default: subtitle.default,
    })),
    intro: response.intro,
    outro: response.outro,
  };
};

/**
 * Transform Yuma API info response to internal EpisodeInfo format
 */
export const transformYumaInfoResponse = (response: YumaInfoResponse): EpisodeInfo => {
  return {
    id: response.id,
    title: response.title,
    number: response.number,
    description: response.description,
    thumbnail: response.thumbnail ? optimizeImageUrl(response.thumbnail) : undefined,
  };
};

/**
 * Optimize image URL using weserv.nl service
 */
export const optimizeImageUrl = (
  originalUrl: string,
  width: number = 500,
  height: number = 750,
  format: 'webp' | 'jpeg' | 'png' = 'webp'
): string => {
  if (!originalUrl) return '';
  
  try {
    const encodedUrl = encodeURIComponent(originalUrl);
    return `https://images.weserv.nl/?url=${encodedUrl}&w=${width}&h=${height}&fit=cover&output=${format}`;
  } catch (error) {
    // Fallback to original URL if optimization fails
    return originalUrl;
  }
};

/**
 * Generate responsive image URLs for different screen sizes
 */
export const generateResponsiveImageUrls = (originalUrl: string) => {
  if (!originalUrl) return {};
  
  return {
    small: optimizeImageUrl(originalUrl, 300, 450),
    medium: optimizeImageUrl(originalUrl, 500, 750),
    large: optimizeImageUrl(originalUrl, 800, 1200),
    original: originalUrl,
  };
};

/**
 * Extract year from date string (handles various formats)
 */
export const extractYearFromDate = (dateString: string): number => {
  if (!dateString) return 0;
  
  // Try to extract year from various date formats
  const yearMatch = dateString.match(/(\d{4})/);
  return yearMatch ? parseInt(yearMatch[1], 10) : 0;
};

/**
 * Create CORS proxy URL for M3U8 streams
 */
export const createProxyUrl = (originalUrl: string): string => {
  if (!originalUrl) return '';
  
  // Use internal CORS proxy (to be implemented)
  const proxyBase = '/api/proxy';
  return `${proxyBase}?url=${encodeURIComponent(originalUrl)}`;
};

/**
 * Validate and sanitize anime content data
 */
export const sanitizeAnimeContent = (content: Partial<AnimeContent>): AnimeContent => {
  return {
    id: content.id || '',
    title: content.title || 'Unknown Title',
    poster: content.poster || '',
    description: content.description || '',
    genres: Array.isArray(content.genres) ? content.genres : [],
    rating: typeof content.rating === 'number' ? content.rating : 0,
    year: typeof content.year === 'number' ? content.year : 0,
    status: content.status || 'Unknown',
    episodes: typeof content.episodes === 'number' ? content.episodes : 0,
    type: content.type || 'TV',
    otherInfo: Array.isArray(content.otherInfo) ? content.otherInfo : [],
  };
};

/**
 * Format anime rating for display
 */
export const formatAnimeRating = (rating: number): string => {
  if (rating === 0) return 'N/A';
  return rating.toFixed(1);
};

/**
 * Format episode count for display
 */
export const formatEpisodeCount = (episodes: number): string => {
  if (episodes === 0) return 'Unknown';
  if (episodes === 1) return '1 Episode';
  return `${episodes} Episodes`;
};

/**
 * Generate anime card data for UI components
 */
export const generateAnimeCardData = (anime: AnimeContent) => {
  return {
    id: anime.id,
    title: anime.title,
    poster: anime.poster,
    rating: formatAnimeRating(anime.rating),
    year: anime.year,
    type: anime.type,
    episodes: formatEpisodeCount(anime.episodes),
    genres: anime.genres.slice(0, 3), // Limit to first 3 genres for display
  };
};