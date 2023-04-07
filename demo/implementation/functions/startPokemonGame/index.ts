import type { AWS } from '@serverless/typescript';

export const startPokemonGame: Exclude<AWS['functions'], undefined>[string] = {
  handler: 'functions/startPokemonGame/handler.main',
};
