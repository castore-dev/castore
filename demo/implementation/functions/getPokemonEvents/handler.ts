import { EventDetail } from '@castore/core';

import { pokemonsEventStore } from '~/libs/eventStores/pokemons';
import { applyConsoleMiddleware } from '~/libs/middlewares/console';

import { Input, inputSchema } from './schema';

export const getPokemonEvents = async (
  event: Input,
): Promise<{ events: EventDetail[] }> => {
  const {
    queryStringParameters: { aggregateId },
  } = event;

  return pokemonsEventStore.getEvents(aggregateId);
};

export const main = applyConsoleMiddleware(getPokemonEvents, { inputSchema });
