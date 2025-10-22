import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import {
  HomePageData,
  SearchResult,
  AnimeDetail,
  EpisodeList,
  HiAnimeHomeResponse,
  HiAnimeSearchResponse,
  HiAnimeDetailResponse,
  HiAnimeEpisodesResponse,
  AnimeContent,
  HiAnimeRawAnime,
} from "src/types/Anime";
import { retryConfigs } from "src/utils/retryLogic";
import { CACHE_TIMES, KEEP_UNUSED_DATA_FOR, CACHE_TAGS } from "src/utils/cacheConfig";
import performanceTracker from "src/utils/performanceTesting";

// Data transformation utilities
const transformAnimeContent = (rawAnime: any): AnimeContent => ({
  id: rawAnime.id,
  title: rawAnime.title || rawAnime.name,
  poster: rawAnime.poster,
  description: rawAnime.synopsis || rawAnime.description || "",
  genres: rawAnime.genres || [],
  rating: parseFloat(rawAnime.rating || "0"),
  year: rawAnime.aired ? new Date(rawAnime.aired).getFullYear() : (rawAnime.releaseDate ? new Date(rawAnime.releaseDate).getFullYear() : 0),
  status: rawAnime.status || "Unknown",
  episodes: rawAnime.episodes || rawAnime.totalEpisodes || 0,
  type: rawAnime.type || "TV",
  otherInfo: rawAnime.otherInfo,
});

const transformHomePageData = (response: any): HomePageData => ({
  spotlight: response.data?.spotlight?.map(transformAnimeContent) || [],
  trending: response.data?.trending?.map(transformAnimeContent) || [],
  topAiring: response.data?.topAiring?.map(transformAnimeContent) || [],
  mostPopular: response.data?.mostPopular?.map(transformAnimeContent) || [],
  mostFavorite: response.data?.mostFavorite?.map(transformAnimeContent) || [],
  latestEpisodes: response.data?.latestEpisode?.map(transformAnimeContent) || [],
  top10: {
    today: response.data?.top10?.today?.map(transformAnimeContent) || [],
    week: response.data?.top10?.week?.map(transformAnimeContent) || [],
    month: response.data?.top10?.month?.map(transformAnimeContent) || [],
  },
  genres: response.data?.genres || [],
});

// Enhanced base query with retry logic, error handling, and performance tracking
const baseQueryWithRetry = retry(
  fetchBaseQuery({
    baseUrl: "https://hianime-api-jzl7.onrender.com/api/v1",
  }),
  {
    maxRetries: retryConfigs.critical.maxAttempts - 1,
  }
);

// Wrap base query to track performance
const performanceTrackingBaseQuery: typeof baseQueryWithRetry = async (args, api, extraOptions) => {
  const startTime = performance.now();
  const endpoint = typeof args === 'string' ? args : args.url;
  
  try {
    const result = await baseQueryWithRetry(args, api, extraOptions);
    
    // Track successful API call
    performanceTracker.trackApiCall(
      endpoint, 
      startTime, 
      !result.error,
      false // We'll implement cache hit detection later
    );
    
    return result;
  } catch (error) {
    // Track failed API call
    performanceTracker.trackApiCall(endpoint, startTime, false, false);
    throw error;
  }
};

export const hiAnimeApi = createApi({
  reducerPath: "hiAnimeApi",
  baseQuery: performanceTrackingBaseQuery,
  tagTypes: [CACHE_TAGS.HOME, CACHE_TAGS.SEARCH, CACHE_TAGS.ANIME_DETAIL, CACHE_TAGS.EPISODES],
  keepUnusedDataFor: KEEP_UNUSED_DATA_FOR.DEFAULT,
  endpoints: (build) => ({
    // Get homepage content with all sections
    getHome: build.query<HomePageData, void>({
      query: () => "/home",
      transformResponse: (response: HiAnimeHomeResponse) =>
        transformHomePageData(response),
      providesTags: [CACHE_TAGS.HOME],
      keepUnusedDataFor: KEEP_UNUSED_DATA_FOR.CRITICAL,
    }),

    // Search anime by keyword with pagination
    searchAnime: build.query<
      SearchResult,
      { keyword: string; page?: number }
    >({
      query: ({ keyword, page = 1 }) =>
        `/search?keyword=${encodeURIComponent(keyword)}&page=${page}`,
      transformResponse: (response: any): SearchResult => ({
        animes: response.data?.animes?.map(transformAnimeContent) || [],
        totalPages: response.data?.totalPages || 1,
        currentPage: response.data?.currentPage || 1,
        hasNextPage: response.data?.hasNextPage || false,
      }),
      providesTags: (result, error, { keyword, page = 1 }) => [
        { type: CACHE_TAGS.SEARCH, id: `${keyword}_${page}` }
      ],
    }),

    // Get detailed anime information
    getAnimeDetail: build.query<AnimeDetail, string>({
      query: (animeId) => `/anime/${animeId}`,
      transformResponse: (response: any): AnimeDetail => ({
        id: response.data?.anime?.id || response.data?.id,
        title: response.data?.anime?.title || response.data?.anime?.name || response.data?.title,
        poster: response.data?.anime?.poster || response.data?.poster,
        description: response.data?.anime?.synopsis || response.data?.anime?.description || response.data?.synopsis || "",
        genres: response.data?.anime?.genres || response.data?.genres || [],
        rating: parseFloat(response.data?.anime?.rating || response.data?.rating || "0"),
        year: response.data?.anime?.aired ? new Date(response.data.anime.aired).getFullYear() : 0,
        status: response.data?.anime?.status || response.data?.status || "Unknown",
        episodes: response.data?.anime?.episodes || response.data?.anime?.totalEpisodes || response.data?.episodes || 0,
        type: response.data?.anime?.type || response.data?.type || "TV",
        otherInfo: response.data?.anime?.otherInfo || response.data?.otherInfo,
        moreInfo: response.data?.anime?.moreInfo || response.data?.moreInfo,
      }),
      providesTags: (result, error, animeId) => [
        { type: CACHE_TAGS.ANIME_DETAIL, id: animeId },
      ],
      keepUnusedDataFor: KEEP_UNUSED_DATA_FOR.CRITICAL,
    }),

    // Get episode list for an anime
    getAnimeEpisodes: build.query<EpisodeList, string>({
      query: (animeId) => `/episodes/${animeId}`,
      transformResponse: (response: any): EpisodeList => ({
        episodes: response.data?.episodes?.map((ep: any) => ({
          id: ep.id,
          number: ep.number,
          title: ep.title,
          isFiller: ep.isFiller,
        })) || [],
        totalEpisodes: response.data?.totalEpisodes || 0,
      }),
      providesTags: (result, error, animeId) => [
        { type: CACHE_TAGS.EPISODES, id: animeId },
      ],
      keepUnusedDataFor: KEEP_UNUSED_DATA_FOR.CRITICAL,
    }),
  }),
});

export const {
  useGetHomeQuery,
  useSearchAnimeQuery,
  useGetAnimeDetailQuery,
  useGetAnimeEpisodesQuery,
} = hiAnimeApi;