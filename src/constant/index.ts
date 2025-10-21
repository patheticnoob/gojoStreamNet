import { CustomGenre } from "src/types/Genre";

// Anime API Configuration
export const HIANIME_API_BASE_URL = "https://hianime-api-jzl7.onrender.com/api/v1";
export const YUMA_API_BASE_URL = "https://yumaapi.vercel.app";
export const IMAGE_OPTIMIZATION_SERVICE = "https://images.weserv.nl";

export const MAIN_PATH = {
  root: "",
  browse: "browse",
  genreExplore: "genre",
  watch: "watch",
};

export const ARROW_MAX_WIDTH = 60;
// Anime content categories for homepage sections
export const ANIME_CATEGORIES: CustomGenre[] = [
  { name: "Trending", apiString: "trending" },
  { name: "Top Airing", apiString: "topAiring" },
  { name: "Most Popular", apiString: "mostPopular" },
  { name: "Most Favorite", apiString: "mostFavorite" },
  { name: "Latest Episodes", apiString: "latestEpisodes" },
];

// CORS proxy for M3U8 streams (to be implemented)
export const CORS_PROXY_URL = "/api/proxy";
export const APP_BAR_HEIGHT = 70;

export const INITIAL_DETAIL_STATE = {
  id: undefined,
  animeDetail: undefined,
  episodes: undefined,
};

// Note: Image optimization utilities have been moved to src/utils/imageOptimization.ts
// Import from there for more comprehensive image handling functionality