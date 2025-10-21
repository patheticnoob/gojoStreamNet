# Implementation Plan

- [x] 1. Set up new API infrastructure for anime streaming





  - Create new API slices for HiAnime and Yuma APIs
  - Replace TMDB API configuration with anime API endpoints
  - Update environment variables and constants
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 1.1 Create HiAnime API slice


  - Write new API slice with HiAnime base URL and endpoints
  - Implement home, search, anime detail, and episodes endpoints
  - Add proper TypeScript types for HiAnime API responses
  - _Requirements: 1.1, 3.1, 4.3_

- [x] 1.2 Create Yuma API slice  


  - Write new API slice with Yuma base URL and endpoints
  - Implement info and watch endpoints for streaming data
  - Add TypeScript types for Yuma API responses
  - _Requirements: 2.1, 4.3_

- [x] 1.3 Update constants and environment configuration


  - Remove TMDB API key and endpoint constants
  - Add new API base URLs for HiAnime and Yuma
  - Update environment example file
  - _Requirements: 4.1, 4.2, 4.5_

- [x] 2. Transform data models and types for anime content





  - Create new TypeScript interfaces for anime data structures
  - Implement data transformation utilities
  - Update existing Movie/TV types to Anime types
  - _Requirements: 1.2, 1.4, 4.4_

- [x] 2.1 Create anime data type definitions


  - Write AnimeContent interface to replace Movie type
  - Create AnimeEpisode interface for episode data
  - Define HomePageData interface for homepage sections
  - _Requirements: 1.2, 1.4, 3.2_

- [x] 2.2 Implement data transformation utilities


  - Write functions to transform HiAnime API responses to internal types
  - Create utilities to transform Yuma API responses
  - Implement image URL optimization helpers
  - _Requirements: 1.1, 1.4, 2.1_

- [x] 2.3 Write unit tests for data transformations


  - Test HiAnime API response transformations
  - Test Yuma API response transformations
  - Test image URL optimization functions
  - _Requirements: 1.1, 1.4, 2.1_

- [x] 3. Update Redux store configuration





  - Replace tmdbApi with new anime API slices
  - Update store reducer configuration
  - Remove old TMDB-related state slices
  - _Requirements: 4.1, 4.2, 4.4_

- [x] 3.1 Update store index configuration


  - Replace tmdbApi reducer with hiAnimeApi and yumaApi reducers
  - Update middleware configuration for new APIs
  - Remove discover slice if no longer needed
  - _Requirements: 4.1, 4.2, 4.4_

- [x] 3.2 Remove TMDB-specific slices


  - Delete or update genre.ts slice for anime genres
  - Delete or update discover.ts slice for anime discovery
  - Delete configuration.ts slice if not needed
  - _Requirements: 4.1, 4.2_

- [x] 4. Migrate homepage components to use anime data





  - Update HeroSection component to use anime content
  - Modify VideoSlider to work with anime categories
  - Adapt homepage layout for anime content sections
  - _Requirements: 1.1, 1.2, 3.2, 3.4_

- [x] 4.1 Update HeroSection component


  - Replace TMDB popular movies query with HiAnime spotlight/trending
  - Update component to use anime data structure
  - Modify video player integration for anime trailers
  - _Requirements: 1.1, 1.2, 1.4_

- [x] 4.2 Update VideoSlider component


  - Modify to work with anime content categories from homepage
  - Update pagination logic for anime content
  - Adapt slider to display anime cards instead of movie cards
  - _Requirements: 1.2, 3.2, 3.4_

- [x] 4.3 Create anime homepage layout


  - Implement sections for spotlight, trending, top airing, etc.
  - Update main browse page to use HiAnime home endpoint
  - Ensure proper loading states for anime content
  - _Requirements: 1.1, 3.2, 3.4_

- [x] 5. Implement anime search functionality





  - Update search components to use HiAnime search API
  - Modify search results display for anime content
  - Implement search pagination and filtering
  - _Requirements: 1.3, 1.5_

- [x] 5.1 Update SearchBox component


  - Modify to call HiAnime search endpoint
  - Update search result handling for anime data
  - Implement debounced search for better performance
  - _Requirements: 1.3, 1.5_

- [x] 5.2 Update search results display


  - Modify GridPage component to display anime search results
  - Update VideoItemWithHover for anime content cards
  - Ensure proper error handling for failed searches
  - _Requirements: 1.3, 1.5_
-

- [x] 6. Implement anime detail and episode functionality




  - Create anime detail modal with episode listings
  - Implement episode selection and streaming
  - Add subtitle support for anime episodes
  - _Requirements: 2.1, 2.2, 2.3, 2.5_

- [x] 6.1 Update DetailModal for anime content


  - Modify to fetch anime details from HiAnime API
  - Display anime-specific information (genres, status, episodes)
  - Add episode list section with episode selection
  - _Requirements: 2.1, 1.4_

- [x] 6.2 Implement episode streaming functionality


  - Create episode player component using Yuma API
  - Integrate HLS video streaming with Video.js
  - Implement CORS proxy for video stream URLs
  - _Requirements: 2.1, 2.2, 2.4_

- [x] 6.3 Add subtitle support


  - Fetch subtitle tracks from HiAnime API
  - Integrate subtitles with Video.js player
  - Implement subtitle language selection
  - _Requirements: 2.2, 2.3_

- [x] 6.4 Write integration tests for video streaming


  - Test episode streaming functionality
  - Test subtitle integration
  - Test error handling for streaming failures
  - _Requirements: 2.1, 2.2, 2.4_

- [x] 7. Update image handling and optimization





  - Implement anime poster image optimization
  - Update all image URLs to use optimization service
  - Add fallback handling for image loading failures
  - _Requirements: 1.4, 1.5_

- [x] 7.1 Create image optimization utilities


  - Write functions to generate optimized image URLs
  - Implement fallback logic for failed image loads
  - Add responsive image sizing for different screen sizes
  - _Requirements: 1.4, 1.5_

- [x] 7.2 Update components to use optimized images


  - Modify VideoItemWithHover to use optimized anime posters
  - Update HeroSection background images
  - Ensure all anime poster displays use optimization
  - _Requirements: 1.4, 1.5_
-

- [x] 8. Clean up Firebase and TMDB dependencies







  - Remove Firebase configuration files
  - Delete TMDB-related environment variables
  - Update build configuration and Docker files
  - _Requirements: 4.1, 4.2, 4.5_

- [x] 8.1 Remove Firebase configuration


  - Delete firebase.json and .firebaserc files
  - Remove Firebase GitHub Actions workflows (.github/workflows/firebase-*.yml)
  - Clean up any Firebase-related imports or code
  - _Requirements: 4.1, 4.5_

- [x] 8.2 Update build and deployment configuration




  - Remove TMDB API key from Dockerfile and environment variables
  - Update .env.example to remove TMDB variables
  - Remove Firebase references from deployment configuration
  - _Requirements: 4.1, 4.2, 4.5_

- [x] 8.3 Write end-to-end tests for anime platform


  - Test complete user flow from homepage to video streaming
  - Test search and discovery functionality
  - Test error handling and fallback scenarios
  - _Requirements: 1.1, 1.3, 2.1, 2.4_
-



- [x] 9. Final integration and testing





  - Integrate all components and test complete anime streaming flow
  - Implement error boundaries and loading states
  - Optimize performance and add caching where appropriate
  - _Requirements: 1.5, 2.4, 2.5_

- [x] 9.1 Implement comprehensive error handling


  - Add error boundaries for API failures
  - Implement retry logic for failed requests
  - Create user-friendly error messages for streaming issues
  - _Requirements: 1.5, 2.4, 2.5_

- [x] 9.2 Add loading states and performance optimization


  - Implement skeleton loading screens for anime content
  - Add caching strategies for frequently accessed data
  - Optimize bundle size by removing unused TMDB dependencies
  - _Requirements: 1.5, 2.4, 3.5_

- [x] 9.3 Performance testing and optimization


  - Test API response times and implement caching
  - Optimize image loading and video streaming performance
  - Monitor memory usage with large anime catalogs
  - _Requirements: 1.5, 2.4_