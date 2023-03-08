import type { EventEmitter } from 'node:events';

import type {
  AnyMessage,
  MessageBusSourceEventStores,
  NotificationMessageBus,
  NotificationMessage,
  StateCarryingMessageBus,
  StateCarryingMessage,
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
  ? AnyMessage
  : Q extends NotificationMessageBus
  ? NotificationMessage<MessageBusSourceEventStores<Q>>
  : Q extends StateCarryingMessageBus
  ? StateCarryingMessage<MessageBusSourceEventStores<Q>>
  : never;

export type FilterPattern<
  E extends string = string,
  T extends string = string,
> = { eventStoreId?: E; type?: never } | { eventStoreId: E; type?: T };
