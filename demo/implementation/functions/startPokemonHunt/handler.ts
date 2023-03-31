import { randomUUID } from 'crypto';

import { startPokemonHuntCommand } from '@castore/demo-blueprint';

import { trainersEventStore } from '~/libs/eventStores/trainers';
import { applyConsoleMiddleware } from '~/libs/middlewares/console';

export const deleteUser = async (
  event: Parameters<typeof startPokemonHuntCommand.handler>[0],
): Promise<void> => {
  await startPokemonHuntCommand.handler(event, [trainersEventStore], {
    generateUuid: randomUUID,
  });
};

export const main = applyConsoleMiddleware(deleteUser, {
  inputSchema: startPokemonHuntCommand.inputSchema,
});
