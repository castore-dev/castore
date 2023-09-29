import { EventStore } from './eventStore';

export type EventStoreId<EVENT_STORE extends EventStore> =
  EVENT_STORE['eventStoreId'];

export type EventStoreEventTypes<EVENT_STORE extends EventStore> =
  EVENT_STORE['eventStoreEvents'];

export type EventStoreEventDetails<EVENT_STORE extends EventStore> =
  NonNullable<EVENT_STORE['_types']>['details'];

export type EventStoreReducer<EVENT_STORE extends EventStore> =
  EVENT_STORE['reducer'];

export type EventStoreAggregate<EVENT_STORE extends EventStore> = NonNullable<
  EVENT_STORE['_types']
>['aggregate'];
