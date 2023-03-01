import type {
  EventStoreEventsTypes,
  EventStoreId,
} from '~/eventStore/generics';

import type { NotificationMessageBus } from './notificationMessageBus';
import type { StatefulMessageBus } from './statefulMessageBus';

export type MessageBusSourceEventStores<
  M extends NotificationMessageBus | StatefulMessageBus,
> = M['sourceEventStores'][number];

export type MessageBusSourceEventStoresIds<
  M extends NotificationMessageBus | StatefulMessageBus,
> = EventStoreId<MessageBusSourceEventStores<M>>;

export type MessageBusSourceEventStoreIdTypes<
  M extends NotificationMessageBus | StatefulMessageBus,
  S extends MessageBusSourceEventStoresIds<M> = MessageBusSourceEventStoresIds<M>,
> = EventStoreEventsTypes<
  Extract<MessageBusSourceEventStores<M>, { eventStoreId: S }>
>[number]['type'];
