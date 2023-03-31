import { pokemonsEventStore } from '~/libs/eventStores/pokemons';
import { applyConsoleMiddleware } from '~/libs/middlewares/console';

import { Input, inputSchema } from './schema';

export const logPokemonEvents = async (event: Input): Promise<void> => {
  const { pokemonId } = event;

  const getAggregateResponse = await pokemonsEventStore.getAggregate(pokemonId);
  console.log('getAggregateResponse');
  console.log(getAggregateResponse);
};

export const main = applyConsoleMiddleware(logPokemonEvents, { inputSchema });
