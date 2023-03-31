import { pokemonsEventStore } from '~/eventStore/eventStore.fixtures.test';
import { NotificationMessageQueue, StateCarryingMessageBus } from '~/messaging';

import { ConnectedEventStore } from './connectedEventStore';

export const notificationMessageQueue = new NotificationMessageQueue({
  messageQueueId: 'notificationMessageQueue',
  sourceEventStores: [pokemonsEventStore],
});

export const pokemonsEventStoreWithNotificationMessageQueue =
  new ConnectedEventStore(pokemonsEventStore, notificationMessageQueue);

export const stateCarryingMessageBus = new StateCarryingMessageBus({
  messageBusId: 'stateCarryingMessageBus',
  sourceEventStores: [pokemonsEventStore],
});

export const pokemonsEventStoreWithStateCarryingMessageBus =
  new ConnectedEventStore(pokemonsEventStore, stateCarryingMessageBus);
