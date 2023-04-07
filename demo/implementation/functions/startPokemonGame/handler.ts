import { randomUUID } from 'crypto';

import { startPokemonGameCommand } from '@castore/demo-blueprint';

import { trainersEventStore } from '~/libs/eventStores/trainers';
import { applyConsoleMiddleware } from '~/libs/middlewares/console';

export const deleteUser = async (
  event: Parameters<typeof startPokemonGameCommand.handler>[0],
): Promise<void> => {
  await startPokemonGameCommand.handler(event, [trainersEventStore], {
    generateUuid: randomUUID,
  });
};

export const main = applyConsoleMiddleware(deleteUser, {
  inputSchema: startPokemonGameCommand.inputSchema,
});
