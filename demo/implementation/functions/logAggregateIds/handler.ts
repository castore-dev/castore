import { userEventStore } from '@libs/eventStores/users';
import { applyConsoleMiddleware } from '@libs/middlewares/console';

export const logAggregateIds = async (): Promise<void> => {
  const listAggregateIdsResponse = await userEventStore.listAggregateIds();
  console.log('listAggregateIdsResponse');
  console.log(listAggregateIdsResponse);
};

export const main = applyConsoleMiddleware(logAggregateIds);
