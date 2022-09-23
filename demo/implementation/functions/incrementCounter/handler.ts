import { incrementCounterCommand } from '@castore/demo-blueprint';

import { counterEventStore } from '~/libs/eventStores/counters';
import { applyConsoleMiddleware } from '~/libs/middlewares/console';

export const incrementCounter = async (
  event: Parameters<typeof incrementCounterCommand.handler>[0],
): Promise<void> => {
  await incrementCounterCommand.handler(event, [counterEventStore]);
};

export const main = applyConsoleMiddleware(incrementCounter, {
  inputSchema: incrementCounterCommand.inputSchema,
});
