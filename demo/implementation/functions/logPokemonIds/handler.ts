import { pokemonsEventStore } from '~/libs/eventStores/pokemons';
import { applyConsoleMiddleware } from '~/libs/middlewares/console';

export const logPokemonIds = async (): Promise<void> => {
  const listAggregateIdsResponse = await pokemonsEventStore.listAggregateIds();
  console.log('listAggregateIdsResponse');
  console.log(listAggregateIdsResponse);
};

export const main = applyConsoleMiddleware(logPokemonIds);
