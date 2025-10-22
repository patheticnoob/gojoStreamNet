import { useNavigate, useSearchParams } from "react-router-dom";
import { Box, Typography, IconButton, Container } from "@mui/material";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";

import { useGetAnimeDetailQuery, useGetAnimeEpisodesQuery } from "src/store/slices/hiAnimeApi";
import EpisodePlayer from "src/components/watch/EpisodePlayer";
import MainLoadingScreen from "src/components/MainLoadingScreen";
import ErrorMessages from "src/components/ErrorMessages";
import StreamingErrorBoundary from "src/components/StreamingErrorBoundary";

export function Component() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get anime and episode from URL parameters
  const animeId = searchParams.get('anime');
  const episodeNumber = parseInt(searchParams.get('episode') || '1');

  // Debug logging
  console.log('🎬 WatchPage Debug Info:');
  console.log('- Current URL:', window.location.href);
  console.log('- Search Params:', Object.fromEntries(searchParams.entries()));
  console.log('- Anime ID:', animeId);
  console.log('- Episode Number:', episodeNumber);

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

  // More debug logging
  console.log('📺 Episode Debug Info:');
  console.log('- Anime Detail:', animeDetail);
  console.log('- Episodes Data:', episodes);
  console.log('- Current Episode:', currentEpisode);
  console.log('- Episode ID:', episodeId);
  console.log('- Loading Detail:', isLoadingDetail);
  console.log('- Loading Episodes:', isLoadingEpisodes);
  console.log('- Detail Error:', detailError);
  console.log('- Episodes Error:', episodesError);

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
  if (!episodeId && episodes && !isLoadingEpisodes) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <ErrorMessages
          error={{ message: `Episode ${episodeNumber} not found for anime "${animeDetail?.title || animeId}"` }}
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
      {animeId ? (
        <StreamingErrorBoundary
          onRetry={() => window.location.reload()}
        >
          <EpisodePlayer
            animeId={animeId}
            episodeNumber={episodeNumber}
            hiAnimeEpisodeId={episodeId}
            autoplay={true}
            muted={false}
          />
        </StreamingErrorBoundary>
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
            No anime specified
          </Typography>
        </Box>
      )}
    </Box>
  );
}

Component.displayName = "WatchPage";