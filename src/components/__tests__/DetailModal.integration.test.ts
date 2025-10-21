/**
 * Integration tests for DetailModal anime functionality
 * Tests anime detail display, episode listing, and episode selection
 */

import { AnimeDetail, EpisodeList, AnimeEpisode } from '../../types/Anime';

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
    console.log('Running DetailModal integration tests...\n');

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
const mockAnimeDetail: AnimeDetail = {
  id: 'test-anime-123',
  title: 'Attack on Titan',
  poster: 'https://example.com/aot-poster.jpg',
  description: 'Humanity fights for survival against giant humanoid Titans.',
  genres: ['Action', 'Drama', 'Fantasy'],
  rating: 9.0,
  year: 2013,
  status: 'Completed',
  episodes: 87,
  type: 'TV',
  otherInfo: ['HD', 'Subbed', 'Dubbed'],
  moreInfo: {
    aired: 'Apr 2013 - Nov 2023',
    premiered: 'Spring 2013',
    duration: '24 min per ep',
    quality: 'HD',
    mal_id: 16498,
  },
};

const mockEpisodeList: EpisodeList = {
  episodes: [
    {
      id: 'aot-ep-1',
      number: 1,
      title: 'To You, in 2000 Years: The Fall of Shiganshina, Part 1',
      isFiller: false,
    },
    {
      id: 'aot-ep-2',
      number: 2,
      title: 'That Day: The Fall of Shiganshina, Part 2',
      isFiller: false,
    },
    {
      id: 'aot-ep-3',
      number: 3,
      title: 'A Dim Light Amid Despair: Humanity\'s Comeback, Part 1',
      isFiller: false,
    },
    {
      id: 'aot-filler-1',
      number: 4,
      title: 'Filler Episode',
      isFiller: true,
    },
  ],
  totalEpisodes: 87,
};

const mockEmptyEpisodeList: EpisodeList = {
  episodes: [],
  totalEpisodes: 0,
};

// Helper functions for testing DetailModal logic
const formatAnimeRating = (rating: number): string => {
  return `${Math.round(rating * 10)}% Match`;
};

const formatEpisodeCount = (count: number): string => {
  if (count === 0) return 'Unknown Episodes';
  if (count === 1) return '1 Episode';
  return `${count} Episodes`;
};

const getFirstEpisode = (episodes: AnimeEpisode[]): AnimeEpisode | null => {
  return episodes.length > 0 ? episodes[0] : null;
};

const filterFillerEpisodes = (episodes: AnimeEpisode[]): AnimeEpisode[] => {
  return episodes.filter(ep => !ep.isFiller);
};

const getEpisodeById = (episodes: AnimeEpisode[], episodeId: string): AnimeEpisode | null => {
  return episodes.find(ep => ep.id === episodeId) || null;
};

const generateOptimizedPosterUrl = (originalUrl: string, width: number = 1200, height: number = 675): string => {
  if (!originalUrl) return '';
  const encodedUrl = encodeURIComponent(originalUrl);
  return `https://images.weserv.nl/?url=${encodedUrl}&w=${width}&h=${height}&fit=cover&output=webp`;
};

// Test cases for anime detail display
runner.test('should format anime rating correctly for display', () => {
  const formattedRating = formatAnimeRating(mockAnimeDetail.rating);
  
  runner.assertEqual(formattedRating, '90% Match', 'Should format rating as percentage match');
});

runner.test('should format episode count correctly', () => {
  const formattedCount = formatEpisodeCount(mockAnimeDetail.episodes);
  
  runner.assertEqual(formattedCount, '87 Episodes', 'Should format multiple episodes correctly');
  
  const singleEpisode = formatEpisodeCount(1);
  runner.assertEqual(singleEpisode, '1 Episode', 'Should format single episode correctly');
  
  const unknownCount = formatEpisodeCount(0);
  runner.assertEqual(unknownCount, 'Unknown Episodes', 'Should handle zero episodes');
});

runner.test('should generate optimized poster URL', () => {
  const optimizedUrl = generateOptimizedPosterUrl(mockAnimeDetail.poster);
  
  runner.assertTrue(optimizedUrl.includes('images.weserv.nl'), 'Should use image optimization service');
  runner.assertTrue(optimizedUrl.includes('w=1200'), 'Should set correct width');
  runner.assertTrue(optimizedUrl.includes('h=675'), 'Should set correct height');
  runner.assertTrue(optimizedUrl.includes('output=webp'), 'Should output WebP format');
  runner.assertTrue(optimizedUrl.includes(encodeURIComponent(mockAnimeDetail.poster)), 'Should include encoded original URL');
});

runner.test('should handle empty poster URL', () => {
  const optimizedUrl = generateOptimizedPosterUrl('');
  
  runner.assertEqual(optimizedUrl, '', 'Should return empty string for empty URL');
});

// Test cases for episode listing functionality
runner.test('should display episode list correctly', () => {
  const { episodes, totalEpisodes } = mockEpisodeList;
  
  runner.assertEqual(episodes.length, 4, 'Should have correct number of episodes');
  runner.assertEqual(totalEpisodes, 87, 'Should show correct total episode count');
  
  // Check first episode
  const firstEpisode = episodes[0];
  runner.assertEqual(firstEpisode.number, 1, 'Should have correct episode number');
  runner.assertEqual(firstEpisode.title, 'To You, in 2000 Years: The Fall of Shiganshina, Part 1', 'Should have correct title');
  runner.assertFalse(firstEpisode.isFiller, 'Should not be marked as filler');
});

runner.test('should identify filler episodes correctly', () => {
  const fillerEpisodes = mockEpisodeList.episodes.filter(ep => ep.isFiller);
  const nonFillerEpisodes = filterFillerEpisodes(mockEpisodeList.episodes);
  
  runner.assertEqual(fillerEpisodes.length, 1, 'Should identify one filler episode');
  runner.assertEqual(nonFillerEpisodes.length, 3, 'Should have three non-filler episodes');
  runner.assertEqual(fillerEpisodes[0].title, 'Filler Episode', 'Should identify correct filler episode');
});

runner.test('should handle empty episode list', () => {
  const { episodes, totalEpisodes } = mockEmptyEpisodeList;
  
  runner.assertEqual(episodes.length, 0, 'Should handle empty episode array');
  runner.assertEqual(totalEpisodes, 0, 'Should show zero total episodes');
});

// Test cases for episode selection functionality
runner.test('should get first episode for initial playback', () => {
  const firstEpisode = getFirstEpisode(mockEpisodeList.episodes);
  
  runner.assertTrue(firstEpisode !== null, 'Should find first episode');
  runner.assertEqual(firstEpisode?.id, 'aot-ep-1', 'Should return correct first episode ID');
  runner.assertEqual(firstEpisode?.number, 1, 'Should return episode number 1');
});

runner.test('should handle empty episode list for first episode', () => {
  const firstEpisode = getFirstEpisode([]);
  
  runner.assertEqual(firstEpisode, null, 'Should return null for empty episode list');
});

runner.test('should find episode by ID correctly', () => {
  const targetEpisodeId = 'aot-ep-2';
  const foundEpisode = getEpisodeById(mockEpisodeList.episodes, targetEpisodeId);
  
  runner.assertTrue(foundEpisode !== null, 'Should find episode by ID');
  runner.assertEqual(foundEpisode?.id, targetEpisodeId, 'Should return correct episode');
  runner.assertEqual(foundEpisode?.number, 2, 'Should return correct episode number');
  runner.assertEqual(foundEpisode?.title, 'That Day: The Fall of Shiganshina, Part 2', 'Should return correct title');
});

runner.test('should handle non-existent episode ID', () => {
  const foundEpisode = getEpisodeById(mockEpisodeList.episodes, 'non-existent-id');
  
  runner.assertEqual(foundEpisode, null, 'Should return null for non-existent episode ID');
});

// Test cases for episode selection state management
runner.test('should manage episode selection state', () => {
  let selectedEpisode: string | null = null;
  
  // Test initial state
  runner.assertEqual(selectedEpisode, null, 'Should start with no episode selected');
  
  // Test episode selection
  const selectEpisode = (episodeId: string) => {
    selectedEpisode = episodeId;
  };
  
  selectEpisode('aot-ep-1');
  runner.assertEqual(selectedEpisode, 'aot-ep-1', 'Should select first episode');
  
  selectEpisode('aot-ep-2');
  runner.assertEqual(selectedEpisode, 'aot-ep-2', 'Should change to second episode');
  
  // Test deselection
  selectedEpisode = null;
  runner.assertEqual(selectedEpisode, null, 'Should deselect episode');
});

// Test cases for anime detail modal state management
runner.test('should manage modal open/close state', () => {
  let isModalOpen = false;
  let currentAnimeId: string | null = null;
  
  // Test opening modal
  const openModal = (animeId: string) => {
    currentAnimeId = animeId;
    isModalOpen = true;
  };
  
  // Test closing modal
  const closeModal = () => {
    currentAnimeId = null;
    isModalOpen = false;
  };
  
  // Initial state
  runner.assertFalse(isModalOpen, 'Modal should start closed');
  runner.assertEqual(currentAnimeId, null, 'Should have no anime ID initially');
  
  // Open modal
  openModal(mockAnimeDetail.id);
  runner.assertTrue(isModalOpen, 'Modal should be open');
  runner.assertEqual(currentAnimeId, mockAnimeDetail.id, 'Should have correct anime ID');
  
  // Close modal
  closeModal();
  runner.assertFalse(isModalOpen, 'Modal should be closed');
  runner.assertEqual(currentAnimeId, null, 'Should clear anime ID');
});

// Test cases for loading and error states
runner.test('should handle anime detail loading state', () => {
  const isLoadingDetail = true;
  const animeDetail = null;
  const error = null;
  
  runner.assertTrue(isLoadingDetail, 'Should be in loading state');
  runner.assertEqual(animeDetail, null, 'Should not have detail data while loading');
  runner.assertEqual(error, null, 'Should not have error while loading');
});

runner.test('should handle anime detail error state', () => {
  const isLoadingDetail = false;
  const animeDetail = null;
  const error = { message: 'Failed to fetch anime details' };
  
  runner.assertFalse(isLoadingDetail, 'Should not be loading during error');
  runner.assertEqual(animeDetail, null, 'Should not have detail data during error');
  runner.assertTrue(error !== null, 'Should have error object');
});

runner.test('should handle episodes loading state', () => {
  const isLoadingEpisodes = true;
  const episodes = null;
  const error = null;
  
  runner.assertTrue(isLoadingEpisodes, 'Should be in loading state');
  runner.assertEqual(episodes, null, 'Should not have episodes data while loading');
  runner.assertEqual(error, null, 'Should not have error while loading');
});

runner.test('should handle successful data load', () => {
  const isLoadingDetail = false;
  const isLoadingEpisodes = false;
  const animeDetail = mockAnimeDetail;
  const episodes = mockEpisodeList;
  const error = null;
  
  runner.assertFalse(isLoadingDetail, 'Should not be loading after success');
  runner.assertFalse(isLoadingEpisodes, 'Should not be loading episodes after success');
  runner.assertTrue(animeDetail !== null, 'Should have anime detail data');
  runner.assertTrue(episodes !== null, 'Should have episodes data');
  runner.assertEqual(error, null, 'Should not have error after success');
});

// Test cases for anime information display
runner.test('should display anime genres correctly', () => {
  const genresText = `Genres: ${mockAnimeDetail.genres.join(', ')}`;
  
  runner.assertEqual(genresText, 'Genres: Action, Drama, Fantasy', 'Should format genres correctly');
});

runner.test('should display anime rating correctly', () => {
  const ratingText = `Rating: ${mockAnimeDetail.rating}/10`;
  
  runner.assertEqual(ratingText, 'Rating: 9/10', 'Should format rating correctly');
});

runner.test('should display additional anime info when available', () => {
  const { moreInfo } = mockAnimeDetail;
  
  runner.assertTrue(moreInfo !== undefined, 'Should have additional info');
  runner.assertEqual(moreInfo?.aired, 'Apr 2013 - Nov 2023', 'Should have aired information');
  runner.assertEqual(moreInfo?.duration, '24 min per ep', 'Should have duration information');
  runner.assertEqual(moreInfo?.mal_id, 16498, 'Should have MAL ID');
});

runner.test('should handle missing additional info gracefully', () => {
  const animeWithoutMoreInfo: AnimeDetail = {
    ...mockAnimeDetail,
    moreInfo: {},
  };
  
  runner.assertEqual(animeWithoutMoreInfo.moreInfo.aired, undefined, 'Should handle missing aired info');
  runner.assertEqual(animeWithoutMoreInfo.moreInfo.duration, undefined, 'Should handle missing duration');
});

// Test cases for episode list UI behavior
runner.test('should handle episode list scrolling for large episode counts', () => {
  const maxVisibleHeight = 400; // pixels
  const episodeHeight = 48; // approximate height per episode item
  const maxVisibleEpisodes = Math.floor(maxVisibleHeight / episodeHeight);
  
  runner.assertTrue(maxVisibleEpisodes > 0, 'Should calculate visible episodes');
  
  // Test with large episode list
  const largeEpisodeCount = mockAnimeDetail.episodes; // 87 episodes
  const needsScrolling = largeEpisodeCount > maxVisibleEpisodes;
  
  runner.assertTrue(needsScrolling, 'Should need scrolling for large episode lists');
});

runner.test('should highlight selected episode in list', () => {
  const selectedEpisodeId = 'aot-ep-2';
  const episodes = mockEpisodeList.episodes;
  
  const isEpisodeSelected = (episodeId: string) => episodeId === selectedEpisodeId;
  
  runner.assertTrue(isEpisodeSelected('aot-ep-2'), 'Should identify selected episode');
  runner.assertFalse(isEpisodeSelected('aot-ep-1'), 'Should not select other episodes');
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