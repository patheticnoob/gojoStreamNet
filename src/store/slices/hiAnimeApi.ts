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
const transformAnimeContent = (rawAnime: HiAnimeRawAnime): AnimeContent => ({
  id: rawAnime.id,
  title: rawAnime.name,
  poster: rawAnime.poster,
  description: rawAnime.description || "",
  genres: rawAnime.genres || [],
  rating: parseFloat(rawAnime.rating || "0"),
  year: rawAnime.releaseDate ? new Date(rawAnime.releaseDate).getFullYear() : 0,
  status: rawAnime.status || "Unknown",
  episodes: rawAnime.totalEpisodes || 0,
  type: rawAnime.type || "TV",
  otherInfo: rawAnime.otherInfo,
});

const transformHomePageData = (response: HiAnimeHomeResponse): HomePageData => ({
  spotlight: response.spotlight?.map(transformAnimeContent) || [],
  trending: response.trending?.map(transformAnimeContent) || [],
  topAiring: response.topAiring?.map(transformAnimeContent) || [],
  mostPopular: response.mostPopular?.map(transformAnimeContent) || [],
  mostFavorite: response.mostFavorite?.map(transformAnimeContent) || [],
  latestEpisodes: response.latestEpisodes?.map(transformAnimeContent) || [],
  top10: {
    today: response.top10?.today?.map(transformAnimeContent) || [],
    week: response.top10?.week?.map(transformAnimeContent) || [],
    month: response.top10?.month?.map(transformAnimeContent) || [],
  },
  genres: response.genres || [],
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
      transformResponse: (response: HiAnimeSearchResponse): SearchResult => ({
        animes: response.animes.map(transformAnimeContent),
        totalPages: response.totalPages,
        currentPage: response.currentPage,
        hasNextPage: response.hasNextPage,
      }),
      providesTags: (result, error, { keyword, page = 1 }) => [
        { type: CACHE_TAGS.SEARCH, id: `${keyword}_${page}` }
      ],
    }),

    // Get detailed anime information
    getAnimeDetail: build.query<AnimeDetail, string>({
      query: (animeId) => `/anime/${animeId}`,
      transformResponse: (response: HiAnimeDetailResponse): AnimeDetail => ({
        id: response.anime.id,
        title: response.anime.name,
        poster: response.anime.poster,
        description: response.anime.description,
        genres: response.anime.genres,
        rating: parseFloat(response.anime.rating || "0"),
        year: response.anime.releaseDate
          ? new Date(response.anime.releaseDate).getFullYear()
          : 0,
        status: response.anime.status,
        episodes: response.anime.totalEpisodes,
        type: response.anime.type,
        otherInfo: response.anime.otherInfo,
        moreInfo: response.anime.moreInfo,
      }),
      providesTags: (result, error, animeId) => [
        { type: CACHE_TAGS.ANIME_DETAIL, id: animeId },
      ],
      keepUnusedDataFor: KEEP_UNUSED_DATA_FOR.CRITICAL,
    }),

    // Get episode list for an anime
    getAnimeEpisodes: build.query<EpisodeList, string>({
      query: (animeId) => `/episodes/${animeId}`,
      transformResponse: (response: HiAnimeEpisodesResponse): EpisodeList => ({
        episodes: response.episodes.map((ep) => ({
          id: ep.id,
          number: ep.number,
          title: ep.title,
          isFiller: ep.isFiller,
        })),
        totalEpisodes: response.totalEpisodes,
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