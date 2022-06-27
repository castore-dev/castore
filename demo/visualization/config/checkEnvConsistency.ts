import { loadEnv } from 'vite';

const EXCLUDED_ENV_KEYS = ['VITE_USER_NODE_ENV'];

export const checkEnvConsistency = (mode: string): void => {
  const env = loadEnv(mode, process.cwd());
  const exampleEnv = loadEnv('example', process.cwd());

  const envFilename = mode === 'development' ? '.env' : '.env.' + mode;
  Object.keys(exampleEnv)
    .filter(key => !EXCLUDED_ENV_KEYS.includes(key))
    .forEach(key => {
      if (!(key in env)) {
        throw new Error(`${key} is not defined in ${envFilename}`);
      }
    });

  Object.keys(env)
    .filter(key => !EXCLUDED_ENV_KEYS.includes(key))
    .forEach(key => {
      if (!(key in exampleEnv)) {
        throw new Error(`${key} is not defined in .env.example`);
      }
    });
};
