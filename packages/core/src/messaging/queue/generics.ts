import type {
  EventStoreEventsTypes,
  EventStoreId,
} from '~/eventStore/generics';

import type {
  EventStoreNotificationMessage,
  EventStoreStateCarryingMessage,
} from '../message';
import type { NotificationMessageQueue } from './notificationMessageQueue';
import type { StateCarryingMessageQueue } from './stateCarryingMessageQueue';

export type MessageQueueSourceEventStores<
  M extends NotificationMessageQueue | StateCarryingMessageQueue,
> = M['sourceEventStores'][number];

export type MessageQueueMessage<
  Q extends NotificationMessageQueue | StateCarryingMessageQueue,
> = Q extends NotificationMessageQueue
  ? EventStoreNotificationMessage<MessageQueueSourceEventStores<Q>>
  : Q extends StateCarryingMessageQueue
  ? EventStoreStateCarryingMessage<MessageQueueSourceEventStores<Q>>
  : never;

export type MessageQueueSourceEventStoreIds<
  M extends NotificationMessageQueue | StateCarryingMessageQueue,
> = EventStoreId<MessageQueueSourceEventStores<M>>;

export type MessageQueueSourceEventStoreIdTypes<
  M extends NotificationMessageQueue | StateCarryingMessageQueue,
  S extends MessageQueueSourceEventStoreIds<M> = MessageQueueSourceEventStoreIds<M>,
> = EventStoreEventsTypes<
  Extract<MessageQueueSourceEventStores<M>, { eventStoreId: S }>
>[number]['type'];
