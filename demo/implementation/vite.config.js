const { defineConfig } = require('vitest/config');

const { testConfig } = require('../../commonConfiguration/vite.config');

export default defineConfig({
  test: testConfig,
  resolve: {
    alias: {
      '~': __dirname,
    },
  },
});
