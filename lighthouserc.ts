
export default {
  ci: {
    collect: {
      staticDistDir: './dist',
      numberOfRuns: 1,
      settings: {
        onlyCategories: ['accessibility'],
        chromeFlags: '--headless --no-sandbox',
      },
    },

    assert: {
      assertions: {
        'categories:accessibility': [
          'error',
          { minScore: 1 },
        ],
      },
    },

    upload: {
      target: 'filesystem',
      outputDir: './lighthouse-report',
    },
  },
};
