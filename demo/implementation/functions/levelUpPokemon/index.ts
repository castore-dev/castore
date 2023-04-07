import type { AWS } from '@serverless/typescript';

export const levelUpPokemon: Exclude<AWS['functions'], undefined>[string] = {
  handler: 'functions/levelUpPokemon/handler.main',
};
