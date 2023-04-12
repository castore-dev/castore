import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import svgrPlugin from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

const getEnvWithProcessPrefix = (mode: string): Record<string, string> =>
  Object.entries(loadEnv(mode, process.cwd())).reduce(
    (prev, [key, val]) => ({
      ...prev,
      ['process.env.' + key]: `"${val}"`,
    }),
    {},
  );

export default defineConfig(({ mode }) => ({
  define: getEnvWithProcessPrefix(mode),
  plugins: [react(), tsconfigPaths(), svgrPlugin()],
  resolve: {
    alias: {
      'react/jsx-runtime': 'react/jsx-runtime.js',
    },
  },
}));
