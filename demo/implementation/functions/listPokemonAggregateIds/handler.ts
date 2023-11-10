import { ListAggregateIdsOutput } from '@castore/core';

import { pokemonsEventStore } from '~/libs/eventStores/pokemons';
import { applyConsoleMiddleware } from '~/libs/middlewares/console';

export const listPokemonAggregateIds =
  async (): Promise<ListAggregateIdsOutput> => {
    const { aggregateIds } = await pokemonsEventStore.listAggregateIds();

    return { aggregateIds };
  };

export const main = applyConsoleMiddleware(listPokemonAggregateIds);
