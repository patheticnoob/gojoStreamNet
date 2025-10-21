/**
 * Test runner for anime streaming integration tests
 * Executes all test suites and reports results
 */

// Import all test suites
import animeTransformersTests from './utils/__tests__/animeTransformers.test';
import episodePlayerTests from './components/watch/__tests__/EpisodePlayer.integration.test';
import detailModalTests from './components/__tests__/DetailModal.integration.test';
import animeStreamingE2ETests from './components/__tests__/AnimeStreaming.e2e.test';

async function runAllTests() {
  console.log('🧪 Running Anime Streaming Platform Integration Tests\n');
  console.log('=' .repeat(60));
  
  const testSuites = [
    { name: 'Anime Transformers', runner: animeTransformersTests },
    { name: 'Episode Player Integration', runner: episodePlayerTests },
    { name: 'Detail Modal Integration', runner: detailModalTests },
    { name: 'Anime Streaming E2E', runner: animeStreamingE2ETests },
  ];
  
  let totalPassed = 0;
  let totalFailed = 0;
  const results: Array<{ name: string; success: boolean }> = [];
  
  for (const suite of testSuites) {
    console.log(`\n📋 ${suite.name} Tests`);
    console.log('-'.repeat(40));
    
    try {
      const success = await suite.runner.run();
      results.push({ name: suite.name, success });
      
      if (success) {
        console.log(`✅ ${suite.name}: All tests passed`);
      } else {
        console.log(`❌ ${suite.name}: Some tests failed`);
      }
    } catch (error) {
      console.log(`💥 ${suite.name}: Test suite crashed`);
      console.log(`   Error: ${error instanceof Error ? error.message : String(error)}`);
      results.push({ name: suite.name, success: false });
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Summary');
  console.log('='.repeat(60));
  
  const passedSuites = results.filter(r => r.success).length;
  const failedSuites = results.filter(r => !r.success).length;
  
  results.forEach(result => {
    const icon = result.success ? '✅' : '❌';
    console.log(`${icon} ${result.name}`);
  });
  
  console.log(`\n🎯 Overall Results: ${passedSuites}/${results.length} test suites passed`);
  
  if (failedSuites === 0) {
    console.log('🎉 All integration tests passed! The anime streaming functionality is working correctly.');
  } else {
    console.log(`⚠️  ${failedSuites} test suite(s) failed. Please review the failures above.`);
  }
  
  return failedSuites === 0;
}

// Export for use in other contexts
export { runAllTests };

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  // Node.js environment
  runAllTests().then(success => {
    if (typeof globalThis !== 'undefined' && 'process' in globalThis) {
      (globalThis as any).process?.exit(success ? 0 : 1);
    }
  }).catch(error => {
    console.error('Test runner crashed:', error);
    if (typeof globalThis !== 'undefined' && 'process' in globalThis) {
      (globalThis as any).process?.exit(1);
    }
  });
} else {
  // Browser environment - can be called manually
  console.log('Test runner loaded. Call runAllTests() to execute all tests.');
}