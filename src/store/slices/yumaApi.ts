import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import {
  StreamingData,
  EpisodeInfo,
  YumaStreamResponse,
  YumaInfoResponse,
} from "src/types/Anime";
import { retryConfigs } from "src/utils/retryLogic";
import { CACHE_TIMES, KEEP_UNUSED_DATA_FOR, CACHE_TAGS } from "src/utils/cacheConfig";

// Enhanced base query with retry logic for streaming operations
const baseQueryWithRetry = retry(
  fetchBaseQuery({
    baseUrl: "https://yumaapi.vercel.app",
  }),
  {
    maxRetries: retryConfigs.streaming.maxAttempts - 1,
  }
);

export const yumaApi = createApi({
  reducerPath: "yumaApi",
  baseQuery: baseQueryWithRetry,
  tagTypes: [CACHE_TAGS.STREAM, CACHE_TAGS.EPISODE_INFO],
  keepUnusedDataFor: KEEP_UNUSED_DATA_FOR.STREAMING,
  endpoints: (build) => ({
    // Step 1: Get Yuma anime info to find episode IDs
    getYumaAnimeInfo: build.query<any, string>({
      query: (animeId) => `/info/${encodeURIComponent(animeId)}`,
      transformResponse: (response: any) => {
        console.log('🔍 Yuma Anime Info Response:', response);
        // The response should contain episodes array with Yuma-specific episode IDs
        return response;
      },
      providesTags: (result, error, animeId) => [
        { type: CACHE_TAGS.EPISODE_INFO, id: `anime-${animeId}` },
      ],
      keepUnusedDataFor: KEEP_UNUSED_DATA_FOR.CRITICAL,
    }),

    // Step 2: Get streaming data using Yuma episode ID
    getStreamingData: build.query<StreamingData, { episodeId: string; type?: string }>({
      query: ({ episodeId, type = "sub" }) => {
        const url = `/watch?episodeId=${encodeURIComponent(episodeId)}&type=${type}`;
        console.log('🎥 Requesting stream from:', url);
        return url;
      },
      transformResponse: (response: any): StreamingData => {
        console.log('🎬 Stream Response:', response);
        return {
          sources: response.sources?.map((source: any) => ({
            url: source.url,
            quality: source.quality,
            isM3U8: source.isM3U8,
          })) || [],
          subtitles: response.subtitles?.map((subtitle: any) => ({
            label: subtitle.label,
            src: subtitle.src,
            default: subtitle.default,
          })) || [],
          intro: response.intro,
          outro: response.outro,
        };
      },
      providesTags: (result, error, { episodeId }) => [
        { type: CACHE_TAGS.STREAM, id: episodeId },
      ],
      keepUnusedDataFor: KEEP_UNUSED_DATA_FOR.STREAMING,
    }),

    // Get episode information (legacy - keeping for compatibility)
    getEpisodeInfo: build.query<EpisodeInfo, string>({
      query: (episodeId) => `/info?id=${encodeURIComponent(episodeId)}`,
      transformResponse: (response: any): EpisodeInfo => ({
        id: response.data?.id || response.id,
        title: response.data?.title || response.title,
        number: response.data?.number || response.number,
        description: response.data?.description || response.description || "",
        thumbnail: response.data?.thumbnail || response.thumbnail,
      }),
      providesTags: (result, error, episodeId) => [
        { type: CACHE_TAGS.EPISODE_INFO, id: episodeId },
      ],
      keepUnusedDataFor: KEEP_UNUSED_DATA_FOR.CRITICAL,
    }),
  }),
});

export const { 
  useGetYumaAnimeInfoQuery,
  useGetStreamingDataQuery, 
  useGetEpisodeInfoQuery 
} = yumaApi;