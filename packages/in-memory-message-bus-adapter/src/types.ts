import type { EventEmitter } from 'events';

import type {
  Message,
  MessageBusSourceEventStores,
  NotificationMessageBus,
  EventStoreNotificationMessage,
  StateCarryingMessageBus,
  EventStoreStateCarryingMessage,
} from '@castore/core';

export type ConstructorArgs = {
  eventEmitter: EventEmitter;
  retryAttempts?: number;
  retryDelayInMs?: number;
  retryBackoffRate?: number;
};

export type InMemoryBusMessage<
  MESSAGE_BUS extends StateCarryingMessageBus | NotificationMessageBus,
> = StateCarryingMessageBus | NotificationMessageBus extends MESSAGE_BUS
  ? Message
  : MESSAGE_BUS extends StateCarryingMessageBus
  ? EventStoreStateCarryingMessage<MessageBusSourceEventStores<MESSAGE_BUS>>
  : MESSAGE_BUS extends NotificationMessageBus
  ? EventStoreNotificationMessage<MessageBusSourceEventStores<MESSAGE_BUS>>
  : never;

export type FilterPattern<
  EVENT_STORE_ID extends string = string,
  EVENT_TYPE extends string = string,
> =
  | { eventStoreId?: EVENT_STORE_ID; eventType?: never }
  | { eventStoreId: EVENT_STORE_ID; eventType?: EVENT_TYPE };
