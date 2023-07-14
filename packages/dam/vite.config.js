const { defineConfig } = require('vitest/config');
const { default: tsconfigPaths } = require('vite-tsconfig-paths');

const { testConfig } = require('../../commonConfiguration/vite.config');

export default defineConfig({
  test: testConfig,
  plugins: [tsconfigPaths()],
});
