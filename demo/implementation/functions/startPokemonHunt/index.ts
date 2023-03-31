import type { AWS } from '@serverless/typescript';

export const startPokemonHunt: Exclude<AWS['functions'], undefined>[string] = {
  handler: 'functions/startPokemonHunt/handler.main',
};
