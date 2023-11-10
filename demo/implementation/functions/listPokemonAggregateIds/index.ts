import type { AWS } from '@serverless/typescript';

export const listPokemonAggregateIds: Exclude<
  AWS['functions'],
  undefined
>[string] = {
  handler: 'functions/listPokemonAggregateIds/handler.main',
  events: [
    {
      httpApi: {
        method: 'GET',
        path: '/aggregateIds',
      },
    },
  ],
};
