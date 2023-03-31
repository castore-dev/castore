import type { AWS } from '@serverless/typescript';

export const logPokemonIds: Exclude<AWS['functions'], undefined>[string] = {
  handler: 'functions/logPokemonIds/handler.main',
};
