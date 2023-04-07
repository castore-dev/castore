import { catchPokemonCommand } from '@castore/demo-blueprint';

import { pokemonsEventStore } from '~/libs/eventStores/pokemons';
import { trainersEventStore } from '~/libs/eventStores/trainers';
import { applyConsoleMiddleware } from '~/libs/middlewares/console';

export const catchPokemon = async (
  event: Parameters<typeof catchPokemonCommand.handler>[0],
): Promise<void> => {
  await catchPokemonCommand.handler(event, [
    pokemonsEventStore,
    trainersEventStore,
  ]);
};

export const main = applyConsoleMiddleware(catchPokemon, {
  inputSchema: catchPokemonCommand.inputSchema,
});
