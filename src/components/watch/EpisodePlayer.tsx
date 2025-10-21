import { useEffect, useRef, useState, useCallback } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import Player from "video.js/dist/types/player";

import VideoJSPlayer from "./VideoJSPlayer";
import SubtitleControls from "./SubtitleControls";
import { useGetStreamingDataQuery } from "src/store/slices/yumaApi";
import { StreamingSource, SubtitleTrack } from "src/types/Anime";
import { getCorsProxyUrl, getServiceProxyConfig } from "src/utils/corsProxy";
import StreamingErrorBoundary from "src/components/StreamingErrorBoundary";
import ErrorMessages from "src/components/ErrorMessages";
import { useRetryState } from "src/utils/retryLogic";

interface EpisodePlayerProps {
  episodeId: string;
  onReady?: (player: Player) => void;
  autoplay?: boolean;
  muted?: boolean;
}

export default function EpisodePlayer({
  episodeId,
  onReady,
  autoplay = false,
  muted = true,
}: EpisodePlayerProps) {
  const { data: streamingData, isLoading, error, refetch } = useGetStreamingDataQuery(episodeId);
  const [selectedSource, setSelectedSource] = useState<StreamingSource | null>(null);
  const [videoSources, setVideoSources] = useState<any[]>([]);
  const [subtitleTracks, setSubtitleTracks] = useState<any[]>([]);
  const [player, setPlayer] = useState<Player | null>(null);
  const [currentSubtitle, setCurrentSubtitle] = useState<SubtitleTrack | null>(null);
  const { retry, isRetrying } = useRetryState();

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
          {isRetrying ? "Retrying..." : "Loading episode..."}
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