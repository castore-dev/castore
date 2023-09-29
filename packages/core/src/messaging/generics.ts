import type {
  EventStore,
  EventStoreId,
  EventStoreEventDetails,
  EventStoreAggregate,
} from '~/eventStore';

import type {
  AggregateExistsMessage,
  NotificationMessage,
  StateCarryingMessage,
} from './message';

export type EventStoreAggregateExistsMessage<EVENT_STORES extends EventStore> =
  EVENT_STORES extends infer EVENT_STORE
    ? EVENT_STORE extends EventStore
      ? AggregateExistsMessage<EventStoreId<EVENT_STORE>>
      : never
    : never;

export type EventStoreNotificationMessage<EVENT_STORES extends EventStore> =
  EVENT_STORES extends infer EVENT_STORE
    ? EVENT_STORE extends EventStore
      ? NotificationMessage<
          EventStoreId<EVENT_STORE>,
          EventStoreEventDetails<EVENT_STORE>
        >
      : never
    : never;

export type EventStoreStateCarryingMessage<EVENT_STORES extends EventStore> =
  EVENT_STORES extends infer EVENT_STORE
    ? EVENT_STORE extends EventStore
      ? StateCarryingMessage<
          EventStoreId<EVENT_STORE>,
          EventStoreEventDetails<EVENT_STORE>,
          EventStoreAggregate<EVENT_STORE>
        >
      : never
    : never;
