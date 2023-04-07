import type { AWS } from '@serverless/typescript';

export const logPokemonEvents: Exclude<AWS['functions'], undefined>[string] = {
  handler: 'functions/logPokemonEvents/handler.main',
};
