# Design Document

## Overview

This design outlines the migration from the current Netflix clone that uses Firebase and TMDB API to an anime streaming platform powered by HiAnime API and Yuma API. The migration will maintain the existing Netflix-like UI components while completely replacing the data layer to work with anime content.

The current architecture uses Redux Toolkit Query (RTK Query) with a centralized API slice pattern, which provides an excellent foundation for the new anime APIs. The UI components are well-abstracted and can be adapted to work with anime data structures.

## Architecture

### Current Architecture
- **Frontend**: React + TypeScript + Material-UI
- **State Management**: Redux Toolkit with RTK Query
- **Data Sources**: TMDB API for content, Firebase for hosting
- **Video Player**: Video.js with YouTube integration
- **UI Pattern**: Netflix-like responsive design

### Target Architecture
- **Frontend**: React + TypeScript + Material-UI (unchanged)
- **State Management**: Redux Toolkit with RTK Query (unchanged)
- **Data Sources**: HiAnime API + Yuma API + Image optimization service
- **Video Player**: Video.js with HLS streaming support
- **UI Pattern**: Netflix-like responsive design (unchanged)
- **Future Integration**: Convex database ready for user data

## Components and Interfaces

### API Layer Redesign

#### 1. New API Slice Structure
Replace the current `tmdbApi` with multiple API slices:

```typescript
// Primary API for anime metadata
export const hiAnimeApi = createApi({
  reducerPath: "hiAnimeApi",
  baseQuery: fetchBaseQuery({ 
    baseUrl: "https://hianime-api-jzl7.onrender.com/api/v1" 
  }),
  endpoints: (build) => ({})
});

// Secondary API for streaming data
export const yumaApi = createApi({
  reducerPath: "yumaApi", 
  baseQuery: fetchBaseQuery({ 
    baseUrl: "https://yumaapi.vercel.app" 
  }),
  endpoints: (build) => ({})
});
```

#### 2. Endpoint Mapping
Transform TMDB endpoints to anime API equivalents:

| Current TMDB Endpoint | New Anime Endpoint | Purpose |
|----------------------|-------------------|---------|
| `/discover/movie?popular` | `/home` | Homepage content sections |
| `/genre/movie/list` | `/home` (extract genres) | Genre categories |
| `/movie/{id}` | `/anime/{animeId}` | Detailed anime information |
| `/search/movie` | `/search?keyword={query}` | Search functionality |
| N/A | `/episodes/{animeId}` | Episode listings |
| N/A | `/stream?id={episodeId}` | Streaming URLs |

### Data Model Transformation

#### 1. Content Structure Mapping
Transform TMDB movie structure to anime structure:

```typescript
// Current Movie type -> New Anime type
interface AnimeContent {
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
}

interface AnimeEpisode {
  id: string;           // episodeId for streaming
  number: number;       // episode number
  title: string;        // episode title
  isFiller: boolean;    // filler episode flag
}
```

#### 2. Homepage Data Structure
Transform TMDB discover results to HiAnime home sections:

```typescript
interface HomePageData {
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
}
```

### Video Player Integration

#### 1. Streaming URL Resolution
Replace YouTube video integration with HLS streaming:

```typescript
// Current: YouTube video from TMDB
const videoSource = {
  type: "video/youtube",
  src: `https://www.youtube.com/watch?v=${videoKey}`
};

// New: HLS stream from Yuma API
const videoSource = {
  type: "application/x-mpegURL",
  src: proxyUrl // M3U8 stream through CORS proxy
};
```

#### 2. Subtitle Integration
Add subtitle support using HiAnime API:

```typescript
interface SubtitleTrack {
  label: string;    // Language name
  src: string;      // Subtitle file URL
  default: boolean; // Default track
}
```

### Image Optimization

#### 1. Poster Image Processing
Replace TMDB image URLs with optimized anime posters:

```typescript
// Current: TMDB image URL
const imageUrl = `https://image.tmdb.org/t/p/w500${poster_path}`;

// New: Optimized anime poster
const imageUrl = `https://images.weserv.nl/?url=${encodeURIComponent(posterUrl)}&w=500&h=750&fit=cover&output=webp`;
```

## Error Handling

### API Error Management
Implement robust error handling for multiple API dependencies:

1. **HiAnime API Failures**: Fallback to cached data or error states
2. **Yuma API Failures**: Display streaming unavailable message
3. **Image Service Failures**: Fallback to original image URLs
4. **CORS Proxy Failures**: Retry mechanism with exponential backoff

### Loading States
Maintain existing loading patterns while adapting for anime content:

1. **Homepage Loading**: Skeleton screens for anime cards
2. **Search Loading**: Progressive loading with debounced queries
3. **Video Loading**: Buffer states and retry mechanisms
4. **Image Loading**: Progressive image loading with placeholders

## Testing Strategy

### Unit Testing
- API slice transformations and data mapping
- Component adaptation to anime data structures
- Error handling and fallback mechanisms
- Image URL generation and optimization

### Integration Testing
- End-to-end API data flow from HiAnime/Yuma to UI
- Video player functionality with HLS streams
- Search functionality across anime content
- Navigation and routing with anime IDs

### Performance Testing
- API response times and caching strategies
- Image loading optimization effectiveness
- Video streaming performance and buffering
- Memory usage with large anime catalogs

## Migration Strategy

### Phase 1: API Infrastructure
1. Create new API slices for HiAnime and Yuma
2. Implement data transformation utilities
3. Set up error handling and retry logic
4. Configure CORS proxy for video streaming

### Phase 2: Data Layer Migration
1. Replace TMDB endpoints with anime API calls
2. Transform data structures in existing components
3. Update Redux store configuration
4. Implement image optimization integration

### Phase 3: UI Adaptation
1. Adapt components to work with anime data
2. Update video player for HLS streaming
3. Implement subtitle support
4. Adjust search and filtering for anime content

### Phase 4: Testing and Optimization
1. Comprehensive testing of all functionality
2. Performance optimization and caching
3. Error handling validation
4. User experience refinements

## Future Convex Integration Points

The design prepares for future Convex database integration:

1. **User Authentication**: Placeholder for user session management
2. **Watch History**: Data structure ready for tracking viewing progress
3. **Favorites**: Component structure supports user preference storage
4. **Recommendations**: API layer ready for personalized content
5. **Continue Watching**: UI components prepared for resume functionality

## Security Considerations

1. **API Key Management**: No API keys required for public anime APIs
2. **CORS Handling**: Proper proxy configuration for video streaming
3. **Content Filtering**: Age-appropriate content handling
4. **Rate Limiting**: Implement request throttling for API calls
5. **Data Validation**: Sanitize and validate all API responses