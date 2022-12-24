import { loadEnv } from 'vite';

export const getEnvWithProcessPrefix = (mode: string): Record<string, string> =>
  Object.entries(loadEnv(mode, process.cwd())).reduce(
    (prev, [key, val]) => ({
      ...prev,
      ['process.env.' + key]: `"${val}"`,
    }),
    {},
  );
