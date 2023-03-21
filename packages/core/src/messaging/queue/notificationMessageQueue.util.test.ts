import {
  userEventStore,
  counterEventStore,
} from '~/eventStore/eventStore.util.test';

import { NotificationMessageQueue } from './notificationMessageQueue';

export const notificationMessageQueue = new NotificationMessageQueue({
  messageQueueId: 'test',
  sourceEventStores: [userEventStore, counterEventStore],
});
