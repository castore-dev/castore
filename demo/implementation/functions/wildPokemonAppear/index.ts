import type { AWS } from '@serverless/typescript';

export const wildPokemonAppear: Exclude<AWS['functions'], undefined>[string] = {
  handler: 'functions/wildPokemonAppear/handler.main',
};
