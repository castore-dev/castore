import type { AWS } from '@serverless/typescript';

export const catchPokemon: Exclude<AWS['functions'], undefined>[string] = {
  handler: 'functions/catchPokemon/handler.main',
};
