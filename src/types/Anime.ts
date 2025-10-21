// Core Anime Data Types (Internal Application Types)

export interface AnimeContent {
  id: string;           // animeId from HiAnime
  title: string;        // anime title
  poster: string;       // poster image URL
  description: string;  // synopsis
  genres: string[];     // genre names
  rating: number;       // user rating
  year: number;         // release year
  status: string;       // airing status
  episodes: number;     // total episodes
  type: string;         // TV/Movie/OVA
  otherInfo?: string[]; // additional metadata
}

export interface AnimeEpisode {
  id: string;           // episodeId for streaming
  number: number;       // episode number
  title: string;        // episode title
  isFiller: boolean;    // filler episode flag
}

export interface AnimeDetail {
  id: string;
  title: string;
  poster: string;
  description: string;
  genres: string[];
  rating: number;
  year: number;
  status: string;
  episodes: number;
  type: string;
  otherInfo: string[];
  moreInfo: {
    aired?: string;
    premiered?: string;
    duration?: string;
    quality?: string;
    mal_id?: number;
  };
}

export interface HomePageSection {
  title: string;
  animes: AnimeContent[];
}

export interface HomePageData {
  spotlight: AnimeContent[];      // Featured anime
  trending: AnimeContent[];       // Trending now
  topAiring: AnimeContent[];      // Currently airing
  mostPopular: AnimeContent[];    // Popular anime
  mostFavorite: AnimeContent[];   // Highly rated
  latestEpisodes: AnimeContent[]; // Recent episodes
  top10: {
    today: AnimeContent[];
    week: AnimeContent[];
    month: AnimeContent[];
  };
  genres: string[];               // Available genres
}

export interface SearchResult {
  animes: AnimeContent[];
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
}

export interface EpisodeList {
  episodes: AnimeEpisode[];
  totalEpisodes: number;
}

// HiAnime API Raw Response Types (for transformation)
export interface HiAnimeRawAnime {
  id: string;
  name: string;
  poster: string;
  description?: string;
  genres?: string[];
  rating?: string;
  releaseDate?: string;
  status?: string;
  totalEpisodes?: number;
  type?: string;
  otherInfo?: string[];
}

export interface HiAnimeHomeResponse {
  spotlight?: HiAnimeRawAnime[];
  trending?: HiAnimeRawAnime[];
  topAiring?: HiAnimeRawAnime[];
  mostPopular?: HiAnimeRawAnime[];
  mostFavorite?: HiAnimeRawAnime[];
  latestEpisodes?: HiAnimeRawAnime[];
  top10?: {
    today?: HiAnimeRawAnime[];
    week?: HiAnimeRawAnime[];
    month?: HiAnimeRawAnime[];
  };
  genres?: string[];
}

export interface HiAnimeSearchResponse {
  animes: HiAnimeRawAnime[];
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
}

export interface HiAnimeDetailResponse {
  anime: {
    id: string;
    name: string;
    poster: string;
    description: string;
    genres: string[];
    rating: string;
    releaseDate: string;
    status: string;
    totalEpisodes: number;
    type: string;
    otherInfo: string[];
    moreInfo: {
      aired?: string;
      premiered?: string;
      duration?: string;
      quality?: string;
      mal_id?: number;
    };
  };
}

export interface HiAnimeEpisodesResponse {
  episodes: Array<{
    id: string;
    number: number;
    title: string;
    isFiller: boolean;
  }>;
  totalEpisodes: number;
}

// Yuma API Types for streaming
export interface StreamingSource {
  url: string;
  quality: string;
  isM3U8: boolean;
}

export interface SubtitleTrack {
  label: string;
  src: string;
  default: boolean;
}

export interface StreamingData {
  sources: StreamingSource[];
  subtitles: SubtitleTrack[];
  intro?: {
    start: number;
    end: number;
  };
  outro?: {
    start: number;
    end: number;
  };
}

export interface EpisodeInfo {
  id: string;
  title: string;
  number: number;
  description?: string;
  thumbnail?: string;
}

// Yuma API Raw Response Types
export interface YumaStreamResponse {
  sources: Array<{
    url: string;
    quality: string;
    isM3U8: boolean;
  }>;
  subtitles: Array<{
    label: string;
    src: string;
    default: boolean;
  }>;
  intro?: {
    start: number;
    end: number;
  };
  outro?: {
    start: number;
    end: number;
  };
}

export interface YumaInfoResponse {
  id: string;
  title: string;
  number: number;
  description?: string;
  thumbnail?: string;
}