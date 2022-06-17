import {
  EventStoreAggregate,
  EventStoreEventsDetails,
} from '@castore/event-store';

import { counterEventStore } from '@libs/eventStores/counters';
import { applyConsoleMiddleware } from '@libs/middlewares/console';

import { Input, inputSchema } from './schema';

export const getCounterEvents = async (
  event: Input,
): Promise<{
  events: EventStoreEventsDetails<typeof counterEventStore>[];
  aggregate: EventStoreAggregate<typeof counterEventStore> | undefined;
}> => {
  const { counterId } = event;

  const { events, aggregate } = await counterEventStore.getAggregate(counterId);

  return { events, aggregate };
};

export const main = applyConsoleMiddleware(getCounterEvents, { inputSchema });
