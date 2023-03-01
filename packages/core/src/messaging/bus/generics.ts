import type {
  EventStoreEventsTypes,
  EventStoreId,
} from '~/eventStore/generics';

import type { NotificationMessageBus } from './notificationMessageBus';
import type { StateCarryingMessageBus } from './stateCarryingMessageBus';

export type MessageBusSourceEventStores<
  M extends NotificationMessageBus | StateCarryingMessageBus,
> = M['sourceEventStores'][number];

export type MessageBusSourceEventStoresIds<
  M extends NotificationMessageBus | StateCarryingMessageBus,
> = EventStoreId<MessageBusSourceEventStores<M>>;

export type MessageBusSourceEventStoreIdTypes<
  M extends NotificationMessageBus | StateCarryingMessageBus,
  S extends MessageBusSourceEventStoresIds<M> = MessageBusSourceEventStoresIds<M>,
> = EventStoreEventsTypes<
  Extract<MessageBusSourceEventStores<M>, { eventStoreId: S }>
>[number]['type'];
