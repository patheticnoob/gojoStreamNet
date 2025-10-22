import { useEffect, useState, useCallback } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Player from "video.js/dist/types/player";

import VideoJSPlayer from "./VideoJSPlayer";
import SubtitleControls from "./SubtitleControls";
import StreamingDebugPanel from "./StreamingDebugPanel";
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
  const [debugSteps, setDebugSteps] = useState<Array<{
    id: string;
    label: string;
    status: 'pending' | 'loading' | 'success' | 'error' | 'info';
    details?: string;
    data?: any;
  }>>([
    { id: 'init', label: '1. Initialize Player', status: 'info', details: `Anime: ${animeId}, Episode: ${episodeNumber}` },
    { id: 'yuma-info', label: '2. Get Yuma Anime Info', status: 'pending' },
    { id: 'episode-mapping', label: '3. Map Episode Number to Yuma ID', status: 'pending' },
    { id: 'streaming', label: '4. Get Streaming Data', status: 'pending' },
    { id: 'subtitles', label: '5. Fetch Subtitles', status: 'pending' },
    { id: 'video-setup', label: '6. Setup Video Player', status: 'pending' },
  ]);

  const { retry, isRetrying } = useRetryState();

  // Helper function to update debug steps
  const updateDebugStep = useCallback((stepId: string, status: 'pending' | 'loading' | 'success' | 'error' | 'info', details?: string, data?: any) => {
    setDebugSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status, details, data }
        : step
    ));
  }, []);

  // Step 1: Get Yuma anime info to find the Yuma episode ID
  const { data: yumaAnimeInfo, isLoading: isLoadingYumaInfo, error: yumaInfoError } = useGetYumaAnimeInfoQuery(animeId);
  
  // Step 2: Map episode number to Yuma episode ID
  const yumaEpisodeId = yumaAnimeInfo?.episodes?.find((ep: any) => ep.number === episodeNumber)?.id;
  
  // Step 3: Get streaming data using Yuma episode ID
  const { data: streamingData, isLoading: isLoadingStream, error: streamError, refetch } = useGetStreamingDataQuery(
    { episodeId: yumaEpisodeId!, type: "sub" },
    { skip: !yumaEpisodeId }
  );

  // Track Yuma anime info loading
  useEffect(() => {
    if (isLoadingYumaInfo) {
      updateDebugStep('yuma-info', 'loading', 'Fetching anime info from Yuma API...');
    } else if (yumaInfoError) {
      updateDebugStep('yuma-info', 'error', `Error: ${JSON.stringify(yumaInfoError)}`, yumaInfoError);
    } else if (yumaAnimeInfo) {
      updateDebugStep('yuma-info', 'success', `Found ${yumaAnimeInfo.episodes?.length || 0} episodes`, {
        totalEpisodes: yumaAnimeInfo.episodes?.length,
        title: yumaAnimeInfo.title
      });
    }
  }, [isLoadingYumaInfo, yumaInfoError, yumaAnimeInfo, updateDebugStep]);

  // Track episode mapping
  useEffect(() => {
    if (yumaAnimeInfo?.episodes) {
      const episode = yumaAnimeInfo.episodes.find((ep: any) => ep.number === episodeNumber);
      if (episode?.id) {
        updateDebugStep('episode-mapping', 'success', `Episode ${episodeNumber} → ${episode.id}`, {
          episodeNumber,
          yumaEpisodeId: episode.id,
          episodeTitle: episode.title
        });
      } else {
        updateDebugStep('episode-mapping', 'error', `Episode ${episodeNumber} not found in Yuma data`, {
          episodeNumber,
          availableEpisodes: yumaAnimeInfo.episodes.map((ep: any) => ({ number: ep.number, id: ep.id }))
        });
      }
    }
  }, [yumaAnimeInfo, episodeNumber, updateDebugStep]);

  // Track streaming data loading
  useEffect(() => {
    if (yumaEpisodeId) {
      if (isLoadingStream) {
        updateDebugStep('streaming', 'loading', `Getting stream for: ${yumaEpisodeId}`);
      } else if (streamError) {
        updateDebugStep('streaming', 'error', `Stream error: ${JSON.stringify(streamError)}`, streamError);
      } else if (streamingData) {
        updateDebugStep('streaming', 'success', `Found ${streamingData.sources?.length || 0} sources`, {
          sources: streamingData.sources?.map(s => ({ quality: s.quality, isM3U8: s.isM3U8 })),
          subtitles: streamingData.subtitles?.length
        });
      }
    }
  }, [yumaEpisodeId, isLoadingStream, streamError, streamingData, updateDebugStep]);

  // Using HiAnime episode ID directly for Yuma streaming API
  console.log('🔍 Using HiAnime episode ID directly:', hiAnimeEpisodeId);

  // Direct API calls for testing (will show CORS errors but we can see the URLs)
  useEffect(() => {
    if (!animeId || !episodeNumber) return;

    const testDirectApiCalls = async () => {
      console.log('🧪 TESTING CORRECT API FLOW:');
      console.log('🧪 Step 1: HiAnime Episode ID (for subtitles):', hiAnimeEpisodeId);
      console.log('🧪 Step 2: Need to get Yuma Episode ID for episode number:', episodeNumber);
      
      // Test Yuma anime info API call
      const yumaInfoUrl = `https://yumaapi.vercel.app/info/${encodeURIComponent(animeId)}`;
      console.log('🔍 Yuma Anime Info API URL:', yumaInfoUrl);
      
      try {
        console.log('🔍 Making direct call to Yuma anime info API...');
        const yumaInfoResponse = await fetch(yumaInfoUrl);
        const yumaInfoData = await yumaInfoResponse.json();
        console.log('🔍 Yuma Anime Info Response:', yumaInfoData);
        
        // Find the Yuma episode ID for our episode number
        const yumaEpisode = yumaInfoData.episodes?.find((ep: any) => ep.number === episodeNumber);
        console.log('🔍 Found Yuma Episode for number', episodeNumber, ':', yumaEpisode);
        
        if (yumaEpisode?.id) {
          // Test Yuma streaming API call with correct Yuma episode ID
          const yumaStreamUrl = `https://yumaapi.vercel.app/watch?episodeId=${encodeURIComponent(yumaEpisode.id)}&type=sub`;
          console.log('🎬 Yuma Stream API URL (with Yuma episode ID):', yumaStreamUrl);
          
          try {
            console.log('🎬 Making direct call to Yuma streaming API...');
            const yumaStreamResponse = await fetch(yumaStreamUrl);
            const yumaStreamData = await yumaStreamResponse.json();
            console.log('🎬 Yuma Stream Response:', yumaStreamData);
          } catch (error) {
            console.log('🎬 Yuma Stream API Error (expected CORS):', error);
            console.log('🎬 But the URL is correct:', yumaStreamUrl);
          }
        }
      } catch (error) {
        console.log('🔍 Yuma Anime Info API Error (expected CORS):', error);
        console.log('🔍 But the URL is correct:', yumaInfoUrl);
      }

      // Test HiAnime subtitles API call (uses HiAnime episode ID)
      if (hiAnimeEpisodeId) {
        const hiAnimeSubtitlesUrl = `https://hianime-api-jzl7.onrender.com/api/v1/stream?id=${encodeURIComponent(hiAnimeEpisodeId)}&type=sub&server=hd-2`;
        console.log('📝 HiAnime Subtitles API URL:', hiAnimeSubtitlesUrl);
        
        try {
          console.log('📝 Making direct call to HiAnime subtitles API...');
          const subtitlesResponse = await fetch(hiAnimeSubtitlesUrl);
          const subtitlesData = await subtitlesResponse.json();
          console.log('📝 HiAnime Subtitles Response:', subtitlesData);
        } catch (error) {
          console.log('📝 HiAnime Subtitles API Error (expected CORS):', error);
          console.log('📝 But the URL is correct:', hiAnimeSubtitlesUrl);
        }
      }
    };

    testDirectApiCalls();
  }, [animeId, episodeNumber, hiAnimeEpisodeId]);

  // Fetch subtitles from HiAnime API (parallel to Yuma stream)
  // Note: According to your docs, we should use the HiAnime episode ID for subtitles, not Yuma ID
  useEffect(() => {
    const fetchSubtitles = async () => {
      if (!hiAnimeEpisodeId) return;

      try {
        updateDebugStep('subtitles', 'loading', 'Fetching subtitles from HiAnime...');
        console.log('📝 Fetching subtitles from HiAnime for episode:', hiAnimeEpisodeId);
        const response = await fetch(`https://hianime-api-jzl7.onrender.com/api/v1/stream?id=${encodeURIComponent(hiAnimeEpisodeId)}&type=sub&server=hd-2`);
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
          updateDebugStep('subtitles', 'success', `Found ${subtitles.length} subtitle tracks`, {
            tracks: subtitles.map((s: any) => s.label)
          });

          // Merge with existing subtitles from Yuma
          setSubtitleTracks(prev => [...prev, ...subtitles]);
        } else {
          updateDebugStep('subtitles', 'error', 'No subtitle tracks found in response', data);
        }
      } catch (error) {
        console.error('❌ Failed to fetch subtitles:', error);
        updateDebugStep('subtitles', 'error', `Subtitle fetch failed: ${error}`, error);
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
      updateDebugStep('video-setup', 'loading', 'Setting up video sources...');
      const proxyConfig = getServiceProxyConfig('yuma');
      const sources = [{
        type: selectedSource.isM3U8 ? "application/x-mpegURL" : "video/mp4",
        src: getCorsProxyUrl(selectedSource.url, proxyConfig),
        label: selectedSource.quality,
      }];

      setVideoSources(sources);
      updateDebugStep('video-setup', 'success', `Video source ready: ${selectedSource.quality}`, {
        quality: selectedSource.quality,
        isM3U8: selectedSource.isM3U8,
        sourceUrl: selectedSource.url
      });
    }
  }, [selectedSource, updateDebugStep]);

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
    <>
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
      
      {/* Debug Panel */}
      <StreamingDebugPanel steps={debugSteps} />
    </>
  );
}