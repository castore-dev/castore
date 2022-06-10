import { counterEventStore } from '@libs/eventStores/counters';
import { applyConsoleMiddleware } from '@libs/middlewares/console';

import { Input, inputSchema } from './schema';

export const getCounterEvents = async (event: Input): Promise<unknown> => {
  const { counterId } = event;

  const { events, aggregate } = await counterEventStore.getAggregate(counterId);

  console.log('--- Events ---');
  console.log(events);

  console.log('--- Aggregate ---');
  console.log(aggregate);

  return { events };
};

export const main = applyConsoleMiddleware(getCounterEvents, { inputSchema });
