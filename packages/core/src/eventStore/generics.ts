import { EventStore } from './eventStore';

export type EventStoreId<EVENT_STORE extends EventStore> =
  EVENT_STORE['eventStoreId'];

/**
 * @debt v2 "rename as EventStoreEventTypes"
 */
export type EventStoreEventsTypes<EVENT_STORE extends EventStore> =
  EVENT_STORE['eventStoreEvents'];

/**
 * @debt v2 "rename as EventStoreEventDetails"
 */
export type EventStoreEventsDetails<EVENT_STORE extends EventStore> =
  NonNullable<EVENT_STORE['_types']>['details'];

export type EventStoreReducer<EVENT_STORE extends EventStore> =
  EVENT_STORE['reducer'];

export type EventStoreAggregate<EVENT_STORE extends EventStore> = NonNullable<
  EVENT_STORE['_types']
>['aggregate'];
