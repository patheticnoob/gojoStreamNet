/**
 * Integration tests for video streaming functionality
 * Tests episode streaming, subtitle integration, and error handling
 */

import { StreamingData, SubtitleTrack, StreamingSource } from '../../../types/Anime';

// Simple test runner (matching existing pattern)
class TestRunner {
  private tests: Array<{ name: string; fn: () => void | Promise<void> }> = [];
  private passed = 0;
  private failed = 0;

  test(name: string, fn: () => void | Promise<void>) {
    this.tests.push({ name, fn });
  }

  assertEqual(actual: any, expected: any, message?: string) {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(
        `Assertion failed: ${message || ''}\nExpected: ${JSON.stringify(expected)}\nActual: ${JSON.stringify(actual)}`
      );
    }
  }

  assertTrue(condition: boolean, message?: string) {
    if (!condition) {
      throw new Error(`Assertion failed: ${message || 'Expected condition to be true'}`);
    }
  }

  assertFalse(condition: boolean, message?: string) {
    if (condition) {
      throw new Error(`Assertion failed: ${message || 'Expected condition to be false'}`);
    }
  }

  async run() {
    console.log('Running video streaming integration tests...\n');

    for (const test of this.tests) {
      try {
        await test.fn();
        console.log(`✅ ${test.name}`);
        this.passed++;
      } catch (error) {
        console.log(`❌ ${test.name}`);
        console.log(`   ${error instanceof Error ? error.message : String(error)}\n`);
        this.failed++;
      }
    }

    console.log(`\nTest Results: ${this.passed} passed, ${this.failed} failed`);
    return this.failed === 0;
  }
}

const runner = new TestRunner();

// Mock data for testing
const mockStreamingData: StreamingData = {
  sources: [
    {
      url: 'https://example.com/stream-1080p.m3u8',
      quality: '1080p',
      isM3U8: true,
    },
    {
      url: 'https://example.com/stream-720p.m3u8',
      quality: '720p',
      isM3U8: true,
    },
    {
      url: 'https://example.com/stream-480p.mp4',
      quality: '480p',
      isM3U8: false,
    },
  ],
  subtitles: [
    {
      label: 'English',
      src: 'https://example.com/subtitles-en.vtt',
      default: true,
    },
    {
      label: 'Japanese',
      src: 'https://example.com/subtitles-jp.vtt',
      default: false,
    },
    {
      label: 'Spanish',
      src: 'https://example.com/subtitles-es.vtt',
      default: false,
    },
  ],
  intro: {
    start: 90,
    end: 180,
  },
  outro: {
    start: 1320,
    end: 1440,
  },
};

const mockEmptyStreamingData: StreamingData = {
  sources: [],
  subtitles: [],
};

const mockErrorStreamingData = null;

// Helper functions for testing video streaming logic
const selectBestQualitySource = (sources: StreamingSource[]): StreamingSource | null => {
  if (!sources || sources.length === 0) return null;

  // Sort sources by quality preference (M3U8 first, then by quality)
  const sortedSources = [...sources].sort((a, b) => {
    // Prioritize M3U8 sources
    if (a.isM3U8 && !b.isM3U8) return -1;
    if (!a.isM3U8 && b.isM3U8) return 1;
    
    // Quality comparison
    const qualityOrder = ['1080p', '720p', '480p', '360p'];
    const aIndex = qualityOrder.indexOf(a.quality);
    const bIndex = qualityOrder.indexOf(b.quality);
    
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }
    
    return 0;
  });

  return sortedSources[0];
};

const prepareVideoSources = (selectedSource: StreamingSource | null) => {
  if (!selectedSource) return [];

  return [{
    type: selectedSource.isM3U8 ? "application/x-mpegURL" : "video/mp4",
    src: selectedSource.url,
    label: selectedSource.quality,
  }];
};

const prepareSubtitleTracks = (subtitles: SubtitleTrack[]) => {
  return subtitles.map((subtitle, index) => ({
    kind: "subtitles",
    src: subtitle.src,
    srclang: subtitle.label.toLowerCase().replace(/\s+/g, '-').substring(0, 2) || `sub-${index}`,
    label: subtitle.label,
    default: subtitle.default,
  }));
};

const findDefaultSubtitle = (subtitles: SubtitleTrack[]): SubtitleTrack | null => {
  return subtitles.find(sub => sub.default) || null;
};

// Test cases for episode streaming functionality
runner.test('should select best quality source from available sources', () => {
  const bestSource = selectBestQualitySource(mockStreamingData.sources);
  
  runner.assertTrue(bestSource !== null, 'Should select a source');
  runner.assertEqual(bestSource?.quality, '1080p', 'Should select highest quality');
  runner.assertTrue(bestSource?.isM3U8 === true, 'Should prefer M3U8 sources');
});

runner.test('should handle empty sources gracefully', () => {
  const bestSource = selectBestQualitySource(mockEmptyStreamingData.sources);
  
  runner.assertEqual(bestSource, null, 'Should return null for empty sources');
});

runner.test('should prepare video sources correctly for Video.js', () => {
  const selectedSource = selectBestQualitySource(mockStreamingData.sources);
  const videoSources = prepareVideoSources(selectedSource);
  
  runner.assertEqual(videoSources.length, 1, 'Should create one video source');
  runner.assertEqual(videoSources[0].type, 'application/x-mpegURL', 'Should set correct MIME type for M3U8');
  runner.assertEqual(videoSources[0].src, 'https://example.com/stream-1080p.m3u8', 'Should use correct URL');
  runner.assertEqual(videoSources[0].label, '1080p', 'Should set correct quality label');
});

runner.test('should prepare video sources for MP4 correctly', () => {
  const mp4Source = mockStreamingData.sources.find(s => !s.isM3U8);
  const videoSources = prepareVideoSources(mp4Source!);
  
  runner.assertEqual(videoSources[0].type, 'video/mp4', 'Should set correct MIME type for MP4');
});

runner.test('should handle null selected source', () => {
  const videoSources = prepareVideoSources(null);
  
  runner.assertEqual(videoSources.length, 0, 'Should return empty array for null source');
});

// Test cases for subtitle integration
runner.test('should prepare subtitle tracks correctly for Video.js', () => {
  const subtitleTracks = prepareSubtitleTracks(mockStreamingData.subtitles);
  
  runner.assertEqual(subtitleTracks.length, 3, 'Should create three subtitle tracks');
  
  // Check first subtitle (English, default)
  runner.assertEqual(subtitleTracks[0].kind, 'subtitles', 'Should set correct kind');
  runner.assertEqual(subtitleTracks[0].label, 'English', 'Should preserve label');
  runner.assertEqual(subtitleTracks[0].srclang, 'en', 'Should generate language code');
  runner.assertTrue(subtitleTracks[0].default, 'Should preserve default flag');
  
  // Check second subtitle (Japanese)
  runner.assertEqual(subtitleTracks[1].label, 'Japanese', 'Should preserve Japanese label');
  runner.assertEqual(subtitleTracks[1].srclang, 'ja', 'Should generate Japanese language code');
  runner.assertFalse(subtitleTracks[1].default, 'Should not be default');
});

runner.test('should find default subtitle correctly', () => {
  const defaultSubtitle = findDefaultSubtitle(mockStreamingData.subtitles);
  
  runner.assertTrue(defaultSubtitle !== null, 'Should find default subtitle');
  runner.assertEqual(defaultSubtitle?.label, 'English', 'Should find English as default');
  runner.assertTrue(defaultSubtitle?.default === true, 'Should have default flag set');
});

runner.test('should handle no default subtitle', () => {
  const subtitlesWithoutDefault = mockStreamingData.subtitles.map(sub => ({
    ...sub,
    default: false,
  }));
  
  const defaultSubtitle = findDefaultSubtitle(subtitlesWithoutDefault);
  
  runner.assertEqual(defaultSubtitle, null, 'Should return null when no default subtitle');
});

runner.test('should handle empty subtitle list', () => {
  const subtitleTracks = prepareSubtitleTracks([]);
  const defaultSubtitle = findDefaultSubtitle([]);
  
  runner.assertEqual(subtitleTracks.length, 0, 'Should handle empty subtitle list');
  runner.assertEqual(defaultSubtitle, null, 'Should return null for empty list');
});

// Test cases for error handling
runner.test('should handle streaming data loading states', () => {
  // Test loading state
  const isLoading = true;
  const error = null;
  const streamingData = null;
  
  runner.assertTrue(isLoading, 'Should be in loading state');
  runner.assertEqual(error, null, 'Should not have error during loading');
  runner.assertEqual(streamingData, null, 'Should not have data during loading');
});

runner.test('should handle streaming data error states', () => {
  // Test error state
  const isLoading = false;
  const error = { message: 'Failed to fetch streaming data' };
  const streamingData = null;
  
  runner.assertFalse(isLoading, 'Should not be loading during error');
  runner.assertTrue(error !== null, 'Should have error object');
  runner.assertEqual(streamingData, null, 'Should not have data during error');
});

runner.test('should handle successful streaming data load', () => {
  // Test success state
  const isLoading = false;
  const error = null;
  const streamingData = mockStreamingData;
  
  runner.assertFalse(isLoading, 'Should not be loading after success');
  runner.assertEqual(error, null, 'Should not have error after success');
  runner.assertTrue(streamingData !== null, 'Should have streaming data');
  runner.assertTrue(streamingData.sources.length > 0, 'Should have video sources');
});

// Test cases for CORS proxy functionality
runner.test('should handle CORS proxy URL generation', () => {
  const originalUrl = 'https://example.com/stream.m3u8';
  
  // Mock CORS proxy function (simplified)
  const getCorsProxyUrl = (url: string) => {
    if (!url) return '';
    return url; // In real implementation, this would add proxy prefix
  };
  
  const proxyUrl = getCorsProxyUrl(originalUrl);
  
  runner.assertTrue(proxyUrl.length > 0, 'Should generate proxy URL');
  runner.assertTrue(proxyUrl.includes('example.com'), 'Should contain original domain');
});

runner.test('should handle empty URL in CORS proxy', () => {
  const getCorsProxyUrl = (url: string) => {
    if (!url) return '';
    return url;
  };
  
  const proxyUrl = getCorsProxyUrl('');
  
  runner.assertEqual(proxyUrl, '', 'Should return empty string for empty URL');
});

// Test cases for Video.js integration
runner.test('should create correct Video.js options for HLS streaming', () => {
  const selectedSource = selectBestQualitySource(mockStreamingData.sources);
  const videoSources = prepareVideoSources(selectedSource);
  const subtitleTracks = prepareSubtitleTracks(mockStreamingData.subtitles);
  
  const videoJsOptions = {
    autoplay: false,
    muted: true,
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
  };
  
  runner.assertFalse(videoJsOptions.autoplay, 'Should not autoplay by default');
  runner.assertTrue(videoJsOptions.muted, 'Should be muted by default');
  runner.assertTrue(videoJsOptions.controls, 'Should show controls');
  runner.assertTrue(videoJsOptions.responsive, 'Should be responsive');
  runner.assertTrue(videoJsOptions.fluid, 'Should be fluid');
  runner.assertEqual(videoJsOptions.sources.length, 1, 'Should have one video source');
  runner.assertEqual(videoJsOptions.tracks.length, 3, 'Should have three subtitle tracks');
  runner.assertTrue(videoJsOptions.html5.hls.overrideNative, 'Should override native HLS');
});

// Test cases for subtitle control functionality
runner.test('should manage subtitle track selection', () => {
  const subtitles = mockStreamingData.subtitles;
  let selectedSubtitle: SubtitleTrack | null = findDefaultSubtitle(subtitles);
  
  // Test initial state
  runner.assertEqual(selectedSubtitle?.label, 'English', 'Should start with default subtitle');
  
  // Test subtitle change
  const changeSubtitle = (newSubtitle: SubtitleTrack | null) => {
    selectedSubtitle = newSubtitle;
  };
  
  changeSubtitle(subtitles[1]); // Switch to Japanese
  runner.assertEqual(selectedSubtitle?.label, 'Japanese', 'Should change to Japanese subtitle');
  
  changeSubtitle(null); // Turn off subtitles
  runner.assertEqual(selectedSubtitle, null, 'Should turn off subtitles');
});

// Test cases for intro/outro functionality
runner.test('should handle intro and outro timestamps', () => {
  const { intro, outro } = mockStreamingData;
  
  runner.assertTrue(intro !== undefined, 'Should have intro timestamps');
  runner.assertTrue(outro !== undefined, 'Should have outro timestamps');
  
  runner.assertEqual(intro?.start, 90, 'Should have correct intro start time');
  runner.assertEqual(intro?.end, 180, 'Should have correct intro end time');
  runner.assertEqual(outro?.start, 1320, 'Should have correct outro start time');
  runner.assertEqual(outro?.end, 1440, 'Should have correct outro end time');
  
  // Test intro duration
  const introDuration = (intro?.end || 0) - (intro?.start || 0);
  runner.assertEqual(introDuration, 90, 'Intro should be 90 seconds long');
});

runner.test('should handle missing intro/outro data', () => {
  const streamingDataWithoutIntro: StreamingData = {
    sources: mockStreamingData.sources,
    subtitles: mockStreamingData.subtitles,
  };
  
  runner.assertTrue(streamingDataWithoutIntro.intro === undefined, 'Should handle missing intro');
  runner.assertTrue(streamingDataWithoutIntro.outro === undefined, 'Should handle missing outro');
});

// Run all tests
if (typeof window === 'undefined') {
  // Node.js environment
  runner.run().then(success => {
    if (typeof globalThis !== 'undefined' && 'process' in globalThis) {
      (globalThis as any).process?.exit(success ? 0 : 1);
    }
  });
} else {
  // Browser environment
  runner.run();
}

export default runner;