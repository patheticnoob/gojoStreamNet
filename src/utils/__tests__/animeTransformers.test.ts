import {
  transformHiAnimeToAnimeContent,
  transformHiAnimeHomeResponse,
  transformHiAnimeSearchResponse,
  transformHiAnimeDetailResponse,
  transformHiAnimeEpisodesResponse,
  transformYumaStreamResponse,
  transformYumaInfoResponse,
  optimizeImageUrl,
  generateResponsiveImageUrls,
  extractYearFromDate,
  createProxyUrl,
  sanitizeAnimeContent,
  formatAnimeRating,
  formatEpisodeCount,
  generateAnimeCardData,
} from '../animeTransformers';

import {
  HiAnimeRawAnime,
  HiAnimeHomeResponse,
  HiAnimeSearchResponse,
  HiAnimeDetailResponse,
  HiAnimeEpisodesResponse,
  YumaStreamResponse,
  YumaInfoResponse,
} from '../../types/Anime';

// Simple test runner
class TestRunner {
  private tests: Array<{ name: string; fn: () => void }> = [];
  private passed = 0;
  private failed = 0;

  test(name: string, fn: () => void) {
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

  run() {
    console.log('Running anime transformer tests...\n');

    for (const test of this.tests) {
      try {
        test.fn();
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

// Test data
const mockHiAnimeRawAnime: HiAnimeRawAnime = {
  id: 'test-anime-1',
  name: 'Test Anime',
  poster: 'https://example.com/poster.jpg',
  description: 'A test anime description',
  genres: ['Action', 'Adventure'],
  rating: '8.5',
  releaseDate: '2023-01-15',
  status: 'Ongoing',
  totalEpisodes: 24,
  type: 'TV',
  otherInfo: ['HD', 'Subbed'],
};

const mockHiAnimeHomeResponse: HiAnimeHomeResponse = {
  spotlight: [mockHiAnimeRawAnime],
  trending: [mockHiAnimeRawAnime],
  topAiring: [mockHiAnimeRawAnime],
  mostPopular: [mockHiAnimeRawAnime],
  mostFavorite: [mockHiAnimeRawAnime],
  latestEpisodes: [mockHiAnimeRawAnime],
  top10: {
    today: [mockHiAnimeRawAnime],
    week: [mockHiAnimeRawAnime],
    month: [mockHiAnimeRawAnime],
  },
  genres: ['Action', 'Adventure', 'Comedy'],
};

const mockYumaStreamResponse: YumaStreamResponse = {
  sources: [
    {
      url: 'https://example.com/stream.m3u8',
      quality: '1080p',
      isM3U8: true,
    },
  ],
  subtitles: [
    {
      label: 'English',
      src: 'https://example.com/subtitles.vtt',
      default: true,
    },
  ],
  intro: {
    start: 90,
    end: 180,
  },
};

// HiAnime API transformation tests
runner.test('transformHiAnimeToAnimeContent should transform raw anime data correctly', () => {
  const result = transformHiAnimeToAnimeContent(mockHiAnimeRawAnime);
  
  runner.assertEqual(result.id, 'test-anime-1');
  runner.assertEqual(result.title, 'Test Anime');
  runner.assertTrue(result.poster.includes('images.weserv.nl'));
  runner.assertEqual(result.description, 'A test anime description');
  runner.assertEqual(result.genres, ['Action', 'Adventure']);
  runner.assertEqual(result.rating, 8.5);
  runner.assertEqual(result.year, 2023);
  runner.assertEqual(result.status, 'Ongoing');
  runner.assertEqual(result.episodes, 24);
  runner.assertEqual(result.type, 'TV');
});

runner.test('transformHiAnimeHomeResponse should transform home page data correctly', () => {
  const result = transformHiAnimeHomeResponse(mockHiAnimeHomeResponse);
  
  runner.assertEqual(result.spotlight.length, 1);
  runner.assertEqual(result.trending.length, 1);
  runner.assertEqual(result.topAiring.length, 1);
  runner.assertEqual(result.mostPopular.length, 1);
  runner.assertEqual(result.mostFavorite.length, 1);
  runner.assertEqual(result.latestEpisodes.length, 1);
  runner.assertEqual(result.top10.today.length, 1);
  runner.assertEqual(result.top10.week.length, 1);
  runner.assertEqual(result.top10.month.length, 1);
  runner.assertEqual(result.genres, ['Action', 'Adventure', 'Comedy']);
});

runner.test('transformHiAnimeSearchResponse should transform search results correctly', () => {
  const mockSearchResponse: HiAnimeSearchResponse = {
    animes: [mockHiAnimeRawAnime],
    totalPages: 5,
    currentPage: 1,
    hasNextPage: true,
  };
  
  const result = transformHiAnimeSearchResponse(mockSearchResponse);
  
  runner.assertEqual(result.animes.length, 1);
  runner.assertEqual(result.totalPages, 5);
  runner.assertEqual(result.currentPage, 1);
  runner.assertEqual(result.hasNextPage, true);
});

runner.test('transformHiAnimeDetailResponse should transform detail data correctly', () => {
  const mockDetailResponse: HiAnimeDetailResponse = {
    anime: {
      id: 'test-anime-1',
      name: 'Test Anime',
      poster: 'https://example.com/poster.jpg',
      description: 'A test anime description',
      genres: ['Action', 'Adventure'],
      rating: '8.5',
      releaseDate: '2023-01-15',
      status: 'Ongoing',
      totalEpisodes: 24,
      type: 'TV',
      otherInfo: ['HD', 'Subbed'],
      moreInfo: {
        aired: 'Jan 2023',
        premiered: 'Winter 2023',
        duration: '24 min',
        quality: 'HD',
        mal_id: 12345,
      },
    },
  };
  
  const result = transformHiAnimeDetailResponse(mockDetailResponse);
  
  runner.assertEqual(result.id, 'test-anime-1');
  runner.assertEqual(result.title, 'Test Anime');
  runner.assertEqual(result.rating, 8.5);
  runner.assertEqual(result.year, 2023);
  runner.assertTrue(Boolean(result.moreInfo?.mal_id === 12345));
});

runner.test('transformHiAnimeEpisodesResponse should transform episodes correctly', () => {
  const mockEpisodesResponse: HiAnimeEpisodesResponse = {
    episodes: [
      {
        id: 'ep-1',
        number: 1,
        title: 'Episode 1',
        isFiller: false,
      },
      {
        id: 'ep-2',
        number: 2,
        title: 'Episode 2',
        isFiller: true,
      },
    ],
    totalEpisodes: 24,
  };
  
  const result = transformHiAnimeEpisodesResponse(mockEpisodesResponse);
  
  runner.assertEqual(result.episodes.length, 2);
  runner.assertEqual(result.episodes[0].id, 'ep-1');
  runner.assertEqual(result.episodes[0].number, 1);
  runner.assertEqual(result.episodes[0].isFiller, false);
  runner.assertEqual(result.episodes[1].isFiller, true);
  runner.assertEqual(result.totalEpisodes, 24);
});

// Yuma API transformation tests
runner.test('transformYumaStreamResponse should transform streaming data correctly', () => {
  const result = transformYumaStreamResponse(mockYumaStreamResponse);
  
  runner.assertEqual(result.sources.length, 1);
  runner.assertEqual(result.sources[0].url, 'https://example.com/stream.m3u8');
  runner.assertEqual(result.sources[0].quality, '1080p');
  runner.assertEqual(result.sources[0].isM3U8, true);
  
  runner.assertEqual(result.subtitles.length, 1);
  runner.assertEqual(result.subtitles[0].label, 'English');
  runner.assertEqual(result.subtitles[0].default, true);
  
  runner.assertTrue(Boolean(result.intro?.start === 90));
  runner.assertTrue(Boolean(result.intro?.end === 180));
});

runner.test('transformYumaInfoResponse should transform episode info correctly', () => {
  const mockInfoResponse: YumaInfoResponse = {
    id: 'ep-1',
    title: 'Episode 1 Title',
    number: 1,
    description: 'Episode description',
    thumbnail: 'https://example.com/thumb.jpg',
  };
  
  const result = transformYumaInfoResponse(mockInfoResponse);
  
  runner.assertEqual(result.id, 'ep-1');
  runner.assertEqual(result.title, 'Episode 1 Title');
  runner.assertEqual(result.number, 1);
  runner.assertEqual(result.description, 'Episode description');
  runner.assertTrue(result.thumbnail?.includes('images.weserv.nl') ?? false);
});

// Image optimization tests
runner.test('optimizeImageUrl should generate correct optimized URLs', () => {
  const originalUrl = 'https://example.com/image.jpg';
  const result = optimizeImageUrl(originalUrl, 300, 450, 'webp');
  
  runner.assertTrue(result.includes('images.weserv.nl'));
  runner.assertTrue(result.includes('w=300'));
  runner.assertTrue(result.includes('h=450'));
  runner.assertTrue(result.includes('output=webp'));
  runner.assertTrue(result.includes(encodeURIComponent(originalUrl)));
});

runner.test('optimizeImageUrl should return original URL on error', () => {
  const originalUrl = 'https://example.com/image.jpg';
  const result = optimizeImageUrl('');
  
  runner.assertEqual(result, '');
});

runner.test('generateResponsiveImageUrls should create multiple sizes', () => {
  const originalUrl = 'https://example.com/image.jpg';
  const result = generateResponsiveImageUrls(originalUrl);
  
  runner.assertTrue(result.small?.includes('w=300') ?? false);
  runner.assertTrue(result.medium?.includes('w=500') ?? false);
  runner.assertTrue(result.large?.includes('w=800') ?? false);
  runner.assertEqual(result.original, originalUrl);
});

// Utility function tests
runner.test('extractYearFromDate should extract year from various date formats', () => {
  runner.assertEqual(extractYearFromDate('2023-01-15'), 2023);
  runner.assertEqual(extractYearFromDate('Jan 15, 2023'), 2023);
  runner.assertEqual(extractYearFromDate('2023'), 2023);
  runner.assertEqual(extractYearFromDate(''), 0);
  runner.assertEqual(extractYearFromDate('invalid'), 0);
});

runner.test('createProxyUrl should generate proxy URLs', () => {
  const originalUrl = 'https://example.com/stream.m3u8';
  const result = createProxyUrl(originalUrl);
  
  runner.assertTrue(result.includes('/api/proxy'));
  runner.assertTrue(result.includes(encodeURIComponent(originalUrl)));
});

runner.test('sanitizeAnimeContent should handle missing or invalid data', () => {
  const partialContent = {
    id: 'test-1',
    title: 'Test Anime',
    rating: 'invalid' as any,
    genres: 'not-array' as any,
  };
  
  const result = sanitizeAnimeContent(partialContent);
  
  runner.assertEqual(result.id, 'test-1');
  runner.assertEqual(result.title, 'Test Anime');
  runner.assertEqual(result.rating, 0);
  runner.assertEqual(result.genres, []);
  runner.assertEqual(result.description, '');
  runner.assertEqual(result.status, 'Unknown');
});

runner.test('formatAnimeRating should format ratings correctly', () => {
  runner.assertEqual(formatAnimeRating(8.5), '8.5');
  runner.assertEqual(formatAnimeRating(0), 'N/A');
  runner.assertEqual(formatAnimeRating(7.123), '7.1');
});

runner.test('formatEpisodeCount should format episode counts correctly', () => {
  runner.assertEqual(formatEpisodeCount(0), 'Unknown');
  runner.assertEqual(formatEpisodeCount(1), '1 Episode');
  runner.assertEqual(formatEpisodeCount(24), '24 Episodes');
});

runner.test('generateAnimeCardData should create display-ready data', () => {
  const anime = transformHiAnimeToAnimeContent(mockHiAnimeRawAnime);
  const result = generateAnimeCardData(anime);
  
  runner.assertEqual(result.id, 'test-anime-1');
  runner.assertEqual(result.title, 'Test Anime');
  runner.assertEqual(result.rating, '8.5');
  runner.assertEqual(result.year, 2023);
  runner.assertEqual(result.type, 'TV');
  runner.assertEqual(result.episodes, '24 Episodes');
  runner.assertEqual(result.genres.length, 2);
});

// Run all tests
if (typeof window === 'undefined') {
  // Node.js environment
  const success = runner.run();
  // Exit with appropriate code if in Node.js environment
  if (typeof globalThis !== 'undefined' && 'process' in globalThis) {
    (globalThis as any).process?.exit(success ? 0 : 1);
  }
} else {
  // Browser environment
  runner.run();
}

export default runner;