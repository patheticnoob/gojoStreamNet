import { useEffect, useState, useCallback } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Player from "video.js/dist/types/player";

import VideoJSPlayer from "./VideoJSPlayer";
import SubtitleControls from "./SubtitleControls";
import { useGetYumaAnimeInfoQuery, useGetStreamingDataQuery } from "src/store/slices/yumaApi";
import { StreamingSource, SubtitleTrack } from "src/types/Anime";
import { getCorsProxyUrl, getServiceProxyConfig } from "src/utils/corsProxy";
import StreamingErrorBoundary from "src/components/StreamingErrorBoundary";
import ErrorMessages from "src/components/ErrorMessages";
import { useRetryState } from "src/utils/retryLogic";

interface EpisodePlayerProps {
  animeId: string;
  episodeNumber: number;
  hiAnimeEpisodeId?: string; // For subtitle fetching
  onReady?: (player: Player) => void;
  autoplay?: boolean;
  muted?: boolean;
}

export default function EpisodePlayer({
  animeId,
  episodeNumber,
  hiAnimeEpisodeId,
  onReady,
  autoplay = false,
  muted = true,
}: EpisodePlayerProps) {
  const [selectedSource, setSelectedSource] = useState<StreamingSource | null>(null);
  const [videoSources, setVideoSources] = useState<any[]>([]);
  const [subtitleTracks, setSubtitleTracks] = useState<any[]>([]);
  const [player, setPlayer] = useState<Player | null>(null);
  const [currentSubtitle, setCurrentSubtitle] = useState<SubtitleTrack | null>(null);
  const [yumaEpisodeId, setYumaEpisodeId] = useState<string | null>(null);
  const { retry, isRetrying } = useRetryState();

  // Step 1: Get Yuma anime info to find the correct episode ID
  const { data: yumaAnimeInfo, isLoading: isLoadingYumaInfo, error: yumaInfoError } = useGetYumaAnimeInfoQuery(animeId);

  // Step 2: Get streaming data using the Yuma episode ID
  const { data: streamingData, isLoading: isLoadingStream, error: streamError, refetch } = useGetStreamingDataQuery(
    { episodeId: yumaEpisodeId!, type: "sub" },
    { skip: !yumaEpisodeId }
  );

  // Debug logging for streaming
  console.log('🎥 EpisodePlayer Debug Info:');
  console.log('- Anime ID:', animeId);
  console.log('- Episode Number:', episodeNumber);
  console.log('- Yuma Anime Info:', yumaAnimeInfo);
  console.log('- Yuma Episode ID:', yumaEpisodeId);
  console.log('- Streaming Data:', streamingData);
  console.log('- Loading Yuma Info:', isLoadingYumaInfo);
  console.log('- Loading Stream:', isLoadingStream);
  console.log('- Yuma Info Error:', yumaInfoError);
  console.log('- Stream Error:', streamError);
  console.log('- Selected Source:', selectedSource);
  console.log('- Video Sources:', videoSources);

  // Extract Yuma episode ID from the anime info
  useEffect(() => {
    if (yumaAnimeInfo && yumaAnimeInfo.episodes) {
      console.log('🔍 Looking for episode', episodeNumber, 'in:', yumaAnimeInfo.episodes);

      // Find the episode by number (ensure both are numbers for comparison)
      const episode = yumaAnimeInfo.episodes.find((ep: any) => {
        const epNumber = typeof ep.number === 'string' ? parseInt(ep.number) : ep.number;
        return epNumber === episodeNumber;
      });

      if (episode && episode.id) {
        console.log('✅ Found Yuma episode ID:', episode.id);
        setYumaEpisodeId(episode.id);
      } else {
        console.error('❌ Episode not found in Yuma data for episode number:', episodeNumber);
        // Try constructing the episode ID based on common patterns
        console.log('Available episodes:', yumaAnimeInfo.episodes.map((ep: any) => ({ number: ep.number, id: ep.id })));

        // Try to construct episode ID based on the pattern from available episodes
        if (yumaAnimeInfo.episodes.length > 0) {
          const firstEpisode = yumaAnimeInfo.episodes[0];
          if (firstEpisode.id && firstEpisode.id.includes('$episode$')) {
            // Extract the base pattern and construct the episode ID
            const basePart = firstEpisode.id.split('$episode$')[0];
            
            // Try to find the episode number pattern in the first episode
            const firstEpIdParts = firstEpisode.id.split('$episode$');
            if (firstEpIdParts.length === 2) {
              // Use the same pattern but with our episode number
              const constructedId = `${basePart}$episode$${episodeNumber}`;
              console.log('🔧 Constructed episode ID based on pattern:', constructedId);
              setYumaEpisodeId(constructedId);
            }
          } else {
            // If no $episode$ pattern, try to find a different pattern
            console.log('🔧 No standard pattern found, trying alternative construction');
            
            // Look for any episode that might match our number and use its pattern
            const sampleEpisode = yumaAnimeInfo.episodes.find((ep: any) => ep.number === 1);
            if (sampleEpisode && sampleEpisode.id) {
              // Try to replace the episode number in the sample ID
              const sampleId = sampleEpisode.id;
              const constructedId = sampleId.replace(/\d+$/, episodeNumber.toString());
              console.log('🔧 Constructed ID by replacing number:', constructedId);
              setYumaEpisodeId(constructedId);
            } else {
              // Final fallback
              const constructedId = `${animeId}$episode$${episodeNumber}`;
              console.log('🔧 Final fallback constructed episode ID:', constructedId);
              setYumaEpisodeId(constructedId);
            }
          }
        }
      }
    }
  }, [yumaAnimeInfo, episodeNumber, animeId]);

  // Fetch subtitles from HiAnime API (parallel to Yuma stream)
  // Note: According to your docs, we should use the HiAnime episode ID for subtitles, not Yuma ID
  useEffect(() => {
    const fetchSubtitles = async () => {
      if (!hiAnimeEpisodeId) return;

      try {
        console.log('📝 Fetching subtitles from HiAnime for episode:', hiAnimeEpisodeId);
        const response = await fetch(`https://hianime-api-jzl7.onrender.com/api/v1/stream?id=${encodeURIComponent(hiAnimeEpisodeId)}`);
        const data = await response.json();

        console.log('📝 HiAnime subtitle response:', data);

        if (data.success && data.data && data.data.tracks) {
          const subtitles = data.data.tracks
            .filter((track: any) => track.kind === "captions")
            .map((track: any) => ({
              label: track.label,
              src: track.file,
              default: track.label.toLowerCase().includes('english'),
            }));

          console.log('📝 Processed subtitles:', subtitles);

          // Merge with existing subtitles from Yuma
          setSubtitleTracks(prev => [...prev, ...subtitles]);
        }
      } catch (error) {
        console.error('❌ Failed to fetch subtitles:', error);
      }
    };

    fetchSubtitles();
  }, [hiAnimeEpisodeId]);

  // Select the best quality source when streaming data is available
  useEffect(() => {
    if (streamingData?.sources && streamingData.sources.length > 0) {
      // Sort sources by quality (assuming higher quality comes first or has specific quality indicators)
      const sortedSources = [...streamingData.sources].sort((a, b) => {
        // Prioritize M3U8 sources and higher quality
        if (a.isM3U8 && !b.isM3U8) return -1;
        if (!a.isM3U8 && b.isM3U8) return 1;

        // Simple quality comparison (this could be more sophisticated)
        const qualityOrder = ['1080p', '720p', '480p', '360p'];
        const aIndex = qualityOrder.indexOf(a.quality);
        const bIndex = qualityOrder.indexOf(b.quality);

        if (aIndex !== -1 && bIndex !== -1) {
          return aIndex - bIndex;
        }

        return 0;
      });

      setSelectedSource(sortedSources[0]);
    }
  }, [streamingData]);

  // Prepare video sources for Video.js
  useEffect(() => {
    if (selectedSource) {
      const proxyConfig = getServiceProxyConfig('yuma');
      const sources = [{
        type: selectedSource.isM3U8 ? "application/x-mpegURL" : "video/mp4",
        src: getCorsProxyUrl(selectedSource.url, proxyConfig),
        label: selectedSource.quality,
      }];

      setVideoSources(sources);
    }
  }, [selectedSource]);

  // Prepare subtitle tracks for Video.js
  useEffect(() => {
    if (streamingData?.subtitles) {
      const tracks = streamingData.subtitles.map((subtitle: SubtitleTrack, index: number) => ({
        kind: "subtitles",
        src: subtitle.src,
        srclang: subtitle.label.toLowerCase().replace(/\s+/g, '-').substring(0, 2) || `sub-${index}`,
        label: subtitle.label,
        default: subtitle.default,
      }));

      setSubtitleTracks(tracks);

      // Set default subtitle
      const defaultSubtitle = streamingData.subtitles.find(sub => sub.default);
      if (defaultSubtitle) {
        setCurrentSubtitle(defaultSubtitle);
      }
    }
  }, [streamingData]);

  const handlePlayerReady = useCallback((player: Player) => {
    setPlayer(player);

    // Add subtitle tracks to the player
    subtitleTracks.forEach((track) => {
      player.addRemoteTextTrack(track, false);
    });

    // Enable default subtitle if available
    if (currentSubtitle) {
      const textTracks = (player as any).textTracks();
      for (let i = 0; i < textTracks.length; i++) {
        const track = textTracks[i];
        if (track.label === currentSubtitle.label) {
          track.mode = 'showing';
          break;
        }
      }
    }

    if (onReady) {
      onReady(player);
    }
  }, [subtitleTracks, currentSubtitle, onReady]);

  const handleSubtitleChange = useCallback((subtitle: SubtitleTrack | null) => {
    setCurrentSubtitle(subtitle);
  }, []);

  const handleRetry = useCallback(async () => {
    await retry(async () => {
      await refetch();
    });
  }, [retry, refetch]);

  const handleSelectDifferentSource = useCallback(() => {
    if (streamingData?.sources && streamingData.sources.length > 1) {
      const currentIndex = streamingData.sources.findIndex(s => s.url === selectedSource?.url);
      const nextIndex = (currentIndex + 1) % streamingData.sources.length;
      setSelectedSource(streamingData.sources[nextIndex]);
    }
  }, [streamingData, selectedSource]);

  const isLoading = isLoadingYumaInfo || isLoadingStream;
  const error = yumaInfoError || streamError;

  if (isLoading || isRetrying) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          minHeight: 200,
        }}
      >
        <CircularProgress />
        <Typography variant="body2" sx={{ ml: 2 }}>
          {isRetrying ? "Retrying..." : isLoadingYumaInfo ? "Finding episode..." : "Loading stream..."}
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <ErrorMessages
          error={error}
          context="streaming"
          showDetails={import.meta.env.DEV}
        />
      </Box>
    );
  }

  if (!selectedSource || videoSources.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="warning">
          No streaming sources available for this episode.
        </Alert>
      </Box>
    );
  }

  return (
    <StreamingErrorBoundary
      onRetry={handleRetry}
      onSelectDifferentSource={
        streamingData?.sources && streamingData.sources.length > 1
          ? handleSelectDifferentSource
          : undefined
      }
    >
      <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
        <VideoJSPlayer
          options={{
            autoplay,
            muted,
            controls: true,
            responsive: true,
            fluid: true,
            playbackRates: [0.5, 1, 1.25, 1.5, 2],
            sources: videoSources,
            tracks: subtitleTracks,
            html5: {
              hls: {
                enableLowInitialPlaylist: true,
                smoothQualityChange: true,
                overrideNative: true,
              },
            },
          }}
          onReady={handlePlayerReady}
        />

        {/* Subtitle Controls Overlay */}
        {streamingData?.subtitles && streamingData.subtitles.length > 0 && (
          <Box
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              zIndex: 10,
            }}
          >
            <SubtitleControls
              player={player}
              subtitles={streamingData.subtitles}
              onSubtitleChange={handleSubtitleChange}
            />
          </Box>
        )}
      </Box>
    </StreamingErrorBoundary>
  );
}