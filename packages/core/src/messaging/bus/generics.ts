import type {
  EventStoreEventsTypes,
  EventStoreId,
} from '~/eventStore/generics';

import type {
  EventStoreNotificationMessage,
  EventStoreStateCarryingMessage,
} from '../message';
import type { NotificationMessageBus } from './notificationMessageBus';
import type { StateCarryingMessageBus } from './stateCarryingMessageBus';

export type MessageBusSourceEventStores<
  MESSAGE_BUS extends StateCarryingMessageBus | NotificationMessageBus,
> = MESSAGE_BUS['sourceEventStores'][number];

export type MessageBusMessage<
  MESSAGE_BUS extends StateCarryingMessageBus | NotificationMessageBus,
> = MESSAGE_BUS extends StateCarryingMessageBus
  ? EventStoreStateCarryingMessage<MessageBusSourceEventStores<MESSAGE_BUS>>
  : MESSAGE_BUS extends NotificationMessageBus
  ? EventStoreNotificationMessage<MessageBusSourceEventStores<MESSAGE_BUS>>
  : never;

export type MessageBusSourceEventStoresIds<
  MESSAGE_BUS extends StateCarryingMessageBus | NotificationMessageBus,
> = EventStoreId<MessageBusSourceEventStores<MESSAGE_BUS>>;

export type MessageBusSourceEventStoreIdTypes<
  MESSAGE_BUS extends StateCarryingMessageBus | NotificationMessageBus,
  EVENT_STORE_ID extends MessageBusSourceEventStoresIds<MESSAGE_BUS> = MessageBusSourceEventStoresIds<MESSAGE_BUS>,
> = EventStoreEventsTypes<
  Extract<
    MessageBusSourceEventStores<MESSAGE_BUS>,
    { eventStoreId: EVENT_STORE_ID }
  >
>[number]['type'];
