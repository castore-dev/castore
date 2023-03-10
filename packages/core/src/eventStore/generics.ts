import { EventStore } from './eventStore';

export type EventStoreId<E extends EventStore> = E['eventStoreId'];

/**
 * @debt v2 "rename as EventStoreEventTypes"
 */
export type EventStoreEventsTypes<E extends EventStore> = E['eventStoreEvents'];

/**
 * @debt v2 "rename as EventStoreEventDetails"
 */
export type EventStoreEventsDetails<E extends EventStore> = NonNullable<
  E['_types']
>['details'];

export type EventStoreReducer<E extends EventStore> = E['reduce'];

export type EventStoreAggregate<E extends EventStore> = NonNullable<
  E['_types']
>['aggregate'];
