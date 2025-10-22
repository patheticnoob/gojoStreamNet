import React from "react";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import HeroSection from "src/components/HeroSection";
import AnimeSlider from "src/components/VideoSlider";
import { useGetHomeQuery } from "src/store/slices/hiAnimeApi";
import MainLoadingScreen from "src/components/MainLoadingScreen";
import { HeroSectionSkeleton, VideoSliderSkeleton } from "src/components/skeletons";
import ErrorMessages from "src/components/ErrorMessages";

export async function loader() {
  // No longer need to preload genres since we're using anime API
  return null;
}

export function Component() {
  const { data: homeData, isLoading, error } = useGetHomeQuery();

  // Debug logging
  console.log('HomePage - Loading:', isLoading);
  console.log('HomePage - Error:', error);
  console.log('HomePage - Data:', homeData);

  // Test API directly
  React.useEffect(() => {
    fetch('https://hianime-api-jzl7.onrender.com/api/v1/home')
      .then(res => res.json())
      .then(data => console.log('Direct API test:', data))
      .catch(err => console.error('Direct API error:', err));
  }, []);

  if (isLoading) {
    return (
      <Stack spacing={2}>
        <HeroSectionSkeleton />
        <VideoSliderSkeleton title="Trending Now" />
        <VideoSliderSkeleton title="Top Airing" />
        <VideoSliderSkeleton title="Most Popular" />
        <VideoSliderSkeleton title="Most Favorite" />
        <VideoSliderSkeleton title="Latest Episodes" />
      </Stack>
    );
  }

  if (error || !homeData) {
    return (
      <Stack spacing={2}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "50vh",
            p: 3,
          }}
        >
          <ErrorMessages 
            error={error} 
            context="api"
            showDetails={import.meta.env.DEV}
          />
        </Box>
        
        {/* Show basic hero section even on error */}
        <Box
          sx={{
            height: "70vh",
            background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            textAlign: "center",
          }}
        >
          <Stack spacing={2}>
            <h1>GojoStreamNet</h1>
            <p>Anime Streaming Platform</p>
            <p>Loading anime content...</p>
          </Stack>
        </Box>
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <HeroSection />
      
      {/* Trending Anime */}
      {homeData.trending && homeData.trending.length > 0 && (
        <AnimeSlider
          title="Trending Now"
          animes={homeData.trending}
          exploreLink="/trending"
        />
      )}

      {/* Top Airing */}
      {homeData.topAiring && homeData.topAiring.length > 0 && (
        <AnimeSlider
          title="Top Airing"
          animes={homeData.topAiring}
          exploreLink="/top-airing"
        />
      )}

      {/* Most Popular */}
      {homeData.mostPopular && homeData.mostPopular.length > 0 && (
        <AnimeSlider
          title="Most Popular"
          animes={homeData.mostPopular}
          exploreLink="/popular"
        />
      )}

      {/* Most Favorite */}
      {homeData.mostFavorite && homeData.mostFavorite.length > 0 && (
        <AnimeSlider
          title="Most Favorite"
          animes={homeData.mostFavorite}
          exploreLink="/favorite"
        />
      )}

      {/* Latest Episodes */}
      {homeData.latestEpisodes && homeData.latestEpisodes.length > 0 && (
        <AnimeSlider
          title="Latest Episodes"
          animes={homeData.latestEpisodes}
          exploreLink="/latest"
        />
      )}

      {/* Top 10 Today */}
      {homeData.top10?.today && homeData.top10.today.length > 0 && (
        <AnimeSlider
          title="Top 10 Today"
          animes={homeData.top10.today}
          exploreLink="/top10/today"
        />
      )}

      {/* Top 10 This Week */}
      {homeData.top10?.week && homeData.top10.week.length > 0 && (
        <AnimeSlider
          title="Top 10 This Week"
          animes={homeData.top10.week}
          exploreLink="/top10/week"
        />
      )}

      {/* Top 10 This Month */}
      {homeData.top10?.month && homeData.top10.month.length > 0 && (
        <AnimeSlider
          title="Top 10 This Month"
          animes={homeData.top10.month}
          exploreLink="/top10/month"
        />
      )}
    </Stack>
  );
}

Component.displayName = "HomePage";
