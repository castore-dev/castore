import { randomUUID } from 'crypto';

import { wildPokemonAppearCommand } from '@castore/demo-blueprint';

import { pokemonsEventStore } from '~/libs/eventStores/pokemons';
import { applyConsoleMiddleware } from '~/libs/middlewares/console';

export const wildPokemonAppear = async (
  event: Parameters<typeof wildPokemonAppearCommand.handler>[0],
): Promise<void> => {
  await wildPokemonAppearCommand.handler(event, [pokemonsEventStore], {
    generateUuid: randomUUID,
  });
};

export const main = applyConsoleMiddleware(wildPokemonAppear, {
  inputSchema: wildPokemonAppearCommand.inputSchema,
});
