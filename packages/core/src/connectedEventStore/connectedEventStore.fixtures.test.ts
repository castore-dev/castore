import {
  counterEventStore,
  userEventStore,
} from '~/eventStore/eventStore.fixtures.test';
import { NotificationMessageQueue, StateCarryingMessageBus } from '~/messaging';

import { ConnectedEventStore } from './connectedEventStore';

export const notificationMessageQueue = new NotificationMessageQueue({
  messageQueueId: 'notificationMessageQueue',
  sourceEventStores: [counterEventStore, userEventStore],
});

export const userEventStoreWithNotificationMessageQueue =
  new ConnectedEventStore(userEventStore, notificationMessageQueue);

export const stateCarryingMessageBus = new StateCarryingMessageBus({
  messageBusId: 'stateCarryingMessageBus',
  sourceEventStores: [counterEventStore, userEventStore],
});

export const userEventStoreWithStateCarryingMessageBus =
  new ConnectedEventStore(userEventStore, stateCarryingMessageBus);
