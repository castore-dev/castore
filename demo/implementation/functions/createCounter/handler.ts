import { randomUUID } from 'crypto';

import { createCounterCommand } from '@castore/demo-blueprint';

import { counterEventStore } from '~/libs/eventStores/counters';
import { applyConsoleMiddleware } from '~/libs/middlewares/console';

export const createCounter = async (
  event: Parameters<typeof createCounterCommand.handler>[0],
): Promise<void> => {
  await createCounterCommand.handler(event, [counterEventStore], {
    generateUuid: randomUUID,
  });
};

export const main = applyConsoleMiddleware(createCounter, {
  inputSchema: createCounterCommand.inputSchema,
});
