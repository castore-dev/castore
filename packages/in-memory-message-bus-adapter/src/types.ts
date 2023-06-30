import type { EventEmitter } from 'events';

import type {
  MessageChannelSourceEventStores,
  AggregateExistsMessage,
  AggregateExistsMessageBus,
  EventStoreAggregateExistsMessage,
  NotificationMessage,
  NotificationMessageBus,
  EventStoreNotificationMessage,
  StateCarryingMessage,
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
  MESSAGE_BUS extends
    | AggregateExistsMessageBus
    | NotificationMessageBus
    | StateCarryingMessageBus,
> =
  | AggregateExistsMessageBus
  | NotificationMessageBus
  | StateCarryingMessageBus extends MESSAGE_BUS
  ? AggregateExistsMessage | StateCarryingMessage | NotificationMessage
  : MESSAGE_BUS extends StateCarryingMessageBus
  ? EventStoreStateCarryingMessage<MessageChannelSourceEventStores<MESSAGE_BUS>>
  : MESSAGE_BUS extends NotificationMessageBus
  ? EventStoreNotificationMessage<MessageChannelSourceEventStores<MESSAGE_BUS>>
  : MESSAGE_BUS extends AggregateExistsMessageBus
  ? EventStoreAggregateExistsMessage<
      MessageChannelSourceEventStores<MESSAGE_BUS>
    >
  : never;

export type FilterPattern<
  EVENT_STORE_ID extends string = string,
  EVENT_TYPE extends string = string,
> =
  | { eventStoreId?: EVENT_STORE_ID; eventType?: never }
  | { eventStoreId: EVENT_STORE_ID; eventType?: EVENT_TYPE };
