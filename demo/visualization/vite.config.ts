import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';
import svgrPlugin from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

import { checkEnvConsistency, getEnvWithProcessPrefix } from './config';

const plugins = [react(), tsconfigPaths(), svgrPlugin()];

if (process.env.ANALYZE === 'true') {
  plugins.push(
    visualizer({
      open: true,
      filename: `bundles/${new Date().toISOString()}.html`,
    }),
  );
}

export default defineConfig(({ mode }) => {
  checkEnvConsistency(mode);

  return {
    define: getEnvWithProcessPrefix(mode),
    plugins,
    resolve: {
      alias: {
        'react/jsx-runtime': 'react/jsx-runtime.js',
      },
    },
  };
});
