import { pokemonsEventStore } from '~/eventStore/eventStore.fixtures.test';

import { NotificationMessageQueue } from './notificationMessageQueue';

export const notificationMessageQueue = new NotificationMessageQueue({
  messageQueueId: 'test',
  sourceEventStores: [pokemonsEventStore],
});
