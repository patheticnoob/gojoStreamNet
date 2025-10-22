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
    // Get streaming data for an episode
    getStreamingData: build.query<StreamingData, string>({
      query: (episodeId) => `/stream?id=${encodeURIComponent(episodeId)}`,
      transformResponse: (response: any): StreamingData => ({
        sources: response.data?.sources?.map((source: any) => ({
          url: source.url,
          quality: source.quality,
          isM3U8: source.isM3U8,
        })) || response.sources?.map((source: any) => ({
          url: source.url,
          quality: source.quality,
          isM3U8: source.isM3U8,
        })) || [],
        subtitles: response.data?.subtitles?.map((subtitle: any) => ({
          label: subtitle.label,
          src: subtitle.src,
          default: subtitle.default,
        })) || response.subtitles?.map((subtitle: any) => ({
          label: subtitle.label,
          src: subtitle.src,
          default: subtitle.default,
        })) || [],
        intro: response.data?.intro || response.intro,
        outro: response.data?.outro || response.outro,
      }),
      providesTags: (result, error, episodeId) => [
        { type: CACHE_TAGS.STREAM, id: episodeId },
      ],
      keepUnusedDataFor: KEEP_UNUSED_DATA_FOR.STREAMING,
    }),

    // Get episode information
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

export const { useGetStreamingDataQuery, useGetEpisodeInfoQuery } = yumaApi;