import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Box, Stack, Typography, IconButton, Container } from "@mui/material";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";

import { useGetAnimeDetailQuery, useGetAnimeEpisodesQuery } from "src/store/slices/hiAnimeApi";
import EpisodePlayer from "src/components/watch/EpisodePlayer";
import MainLoadingScreen from "src/components/MainLoadingScreen";
import ErrorMessages from "src/components/ErrorMessages";

export function Component() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get anime and episode from URL parameters
  const animeId = searchParams.get('anime');
  const episodeNumber = parseInt(searchParams.get('episode') || '1');
  
  // Fetch anime details and episodes
  const { data: animeDetail, isLoading: isLoadingDetail, error: detailError } = useGetAnimeDetailQuery(
    animeId!,
    { skip: !animeId }
  );
  
  const { data: episodes, isLoading: isLoadingEpisodes, error: episodesError } = useGetAnimeEpisodesQuery(
    animeId!,
    { skip: !animeId }
  );
  
  // Find the current episode
  const currentEpisode = episodes?.episodes?.find(ep => ep.number === episodeNumber);
  const episodeId = currentEpisode?.id;

  const handleGoBack = () => {
    navigate("/browse");
  };

  // Show loading while fetching data
  if (isLoadingDetail || isLoadingEpisodes) {
    return <MainLoadingScreen />;
  }

  // Show error if no anime ID provided
  if (!animeId) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <ErrorMessages 
          error={{ message: "No anime specified" }} 
          context="general"
        />
      </Container>
    );
  }

  // Show error if anime details failed to load
  if (detailError || episodesError) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <ErrorMessages 
          error={detailError || episodesError} 
          context="api"
          showDetails={import.meta.env.DEV}
        />
      </Container>
    );
  }

  // Show error if episode not found
  if (!episodeId && episodes) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <ErrorMessages 
          error={{ message: `Episode ${episodeNumber} not found` }} 
          context="general"
        />
      </Container>
    );
  }

  return (
    <Box
      sx={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        bgcolor: "black",
      }}
    >
      {/* Back Button */}
      <Box
        sx={{
          position: "absolute",
          top: 20,
          left: 20,
          zIndex: 1000,
        }}
      >
        <IconButton
          onClick={handleGoBack}
          sx={{
            color: "white",
            bgcolor: "rgba(0, 0, 0, 0.5)",
            "&:hover": {
              bgcolor: "rgba(0, 0, 0, 0.7)",
            },
          }}
        >
          <KeyboardBackspaceIcon />
        </IconButton>
      </Box>

      {/* Anime Info Overlay */}
      {animeDetail && (
        <Box
          sx={{
            position: "absolute",
            top: 80,
            left: 20,
            zIndex: 1000,
            maxWidth: 400,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: "white",
              fontWeight: "bold",
              textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
              mb: 1,
            }}
          >
            {animeDetail.title}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "white",
              textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
            }}
          >
            Episode {episodeNumber}
            {currentEpisode?.title && ` - ${currentEpisode.title}`}
          </Typography>
        </Box>
      )}

      {/* Episode Player */}
      {episodeId ? (
        <EpisodePlayer
          episodeId={episodeId}
          autoplay={true}
          muted={false}
        />
      ) : (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            color: "white",
          }}
        >
          <Typography variant="h6">
            Loading episode...
          </Typography>
        </Box>
      )}
    </Box>
  );
}

Component.displayName = "WatchPage";