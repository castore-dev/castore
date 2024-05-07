import { EventStore } from './eventStore';

export type EventStoreId<EVENT_STORE extends EventStore> =
  EVENT_STORE['eventStoreId'];

export type EventStoreEventTypes<EVENT_STORE extends EventStore> =
  EVENT_STORE['eventTypes'];

export type EventStoreEventDetails<EVENT_STORE extends EventStore> =
  NonNullable<EVENT_STORE['_types']>['details'];

export type EventStoreReducers<EVENT_STORE extends EventStore> =
  EVENT_STORE['reducers'];

export type EventStoreCurrentReducerVersion<EVENT_STORE extends EventStore> =
  EVENT_STORE['currentReducerVersion'];

export type EventStoreReducer<EVENT_STORE extends EventStore> =
  EVENT_STORE['reducer'];

export type EventStoreAggregate<EVENT_STORE extends EventStore> = NonNullable<
  EVENT_STORE['_types']
>['aggregate'];
