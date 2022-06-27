import { loadEnv } from 'vite';

// expose .env as process.env instead of import.meta since jest does not import meta yet
export const getEnvWithProcessPrefix = (mode: string): Record<string, string> =>
  Object.entries(loadEnv(mode, process.cwd())).reduce(
    (prev, [key, val]) => ({
      ...prev,
      ['process.env.' + key]: `"${val}"`,
    }),
    {},
  );
