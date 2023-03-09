import type {
  EventStoreEventsTypes,
  EventStoreId,
} from '~/eventStore/generics';

import type { NotificationMessageQueue } from './notificationMessageQueue';
import type { StateCarryingMessageQueue } from './stateCarryingMessageQueue';

export type MessageQueueSourceEventStores<
  M extends NotificationMessageQueue | StateCarryingMessageQueue,
> = M['sourceEventStores'][number];

export type MessageQueueSourceEventStoreIds<
  M extends NotificationMessageQueue | StateCarryingMessageQueue,
> = EventStoreId<MessageQueueSourceEventStores<M>>;

export type MessageQueueSourceEventStoreIdTypes<
  M extends NotificationMessageQueue | StateCarryingMessageQueue,
  S extends MessageQueueSourceEventStoreIds<M> = MessageQueueSourceEventStoreIds<M>,
> = EventStoreEventsTypes<
  Extract<MessageQueueSourceEventStores<M>, { eventStoreId: S }>
>[number]['type'];
