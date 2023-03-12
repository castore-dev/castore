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
  MESSAGE_QUEUE extends NotificationMessageQueue | StateCarryingMessageQueue,
> = MESSAGE_QUEUE['sourceEventStores'][number];

export type MessageQueueMessage<
  MESSAGE_QUEUE extends NotificationMessageQueue | StateCarryingMessageQueue,
> = MESSAGE_QUEUE extends NotificationMessageQueue
  ? EventStoreNotificationMessage<MessageQueueSourceEventStores<MESSAGE_QUEUE>>
  : MESSAGE_QUEUE extends StateCarryingMessageQueue
  ? EventStoreStateCarryingMessage<MessageQueueSourceEventStores<MESSAGE_QUEUE>>
  : never;

export type MessageQueueSourceEventStoreIds<
  MESSAGE_QUEUE extends NotificationMessageQueue | StateCarryingMessageQueue,
> = EventStoreId<MessageQueueSourceEventStores<MESSAGE_QUEUE>>;

export type MessageQueueSourceEventStoreIdTypes<
  MESSAGE_QUEUE extends NotificationMessageQueue | StateCarryingMessageQueue,
  EVENT_STORE_ID extends MessageQueueSourceEventStoreIds<MESSAGE_QUEUE> = MessageQueueSourceEventStoreIds<MESSAGE_QUEUE>,
> = EventStoreEventsTypes<
  Extract<
    MessageQueueSourceEventStores<MESSAGE_QUEUE>,
    { eventStoreId: EVENT_STORE_ID }
  >
>[number]['type'];
