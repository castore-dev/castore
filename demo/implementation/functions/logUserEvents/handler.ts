import { userEventStore } from '@libs/eventStores/users';
import { applyConsoleMiddleware } from '@libs/middlewares/console';

import { Input, inputSchema } from './schema';

export const logUserEvents = async (event: Input): Promise<void> => {
  const { userId } = event;

  const getAggregateResponse = await userEventStore.getAggregate(userId);
  console.log('getAggregateResponse');
  console.log(getAggregateResponse);
};

export const main = applyConsoleMiddleware(logUserEvents, { inputSchema });
