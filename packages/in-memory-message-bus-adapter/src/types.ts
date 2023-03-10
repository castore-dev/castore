import type { EventEmitter } from 'node:events';

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
  Q extends NotificationMessageBus | StateCarryingMessageBus,
> = NotificationMessageBus | StateCarryingMessageBus extends Q
  ? Message
  : Q extends NotificationMessageBus
  ? EventStoreNotificationMessage<MessageBusSourceEventStores<Q>>
  : Q extends StateCarryingMessageBus
  ? EventStoreStateCarryingMessage<MessageBusSourceEventStores<Q>>
  : never;

export type FilterPattern<
  E extends string = string,
  T extends string = string,
> =
  | { eventStoreId?: E; eventType?: never }
  | { eventStoreId: E; eventType?: T };
