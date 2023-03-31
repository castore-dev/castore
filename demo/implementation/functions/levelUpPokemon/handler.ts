import { levelUpPokemonCommand } from '@castore/demo-blueprint';

import { pokemonsEventStore } from '~/libs/eventStores/pokemons';
import { applyConsoleMiddleware } from '~/libs/middlewares/console';

export const levelUpPokemon = async (
  event: Parameters<typeof levelUpPokemonCommand.handler>[0],
): Promise<void> => {
  await levelUpPokemonCommand.handler(event, [pokemonsEventStore]);
};

export const main = applyConsoleMiddleware(levelUpPokemon, {
  inputSchema: levelUpPokemonCommand.inputSchema,
});
