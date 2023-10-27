import type { AWS } from '@serverless/typescript';

export const getPokemonEvents: Exclude<AWS['functions'], undefined>[string] = {
  handler: 'functions/getPokemonEvents/handler.main',
  events: [
    {
      httpApi: {
        method: 'GET',
        path: '/getEvents',
      },
    },
  ],
};
