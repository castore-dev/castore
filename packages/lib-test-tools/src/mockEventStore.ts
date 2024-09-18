import type {
  EventStore,
  EventStoreId,
  EventStoreEventTypes,
  EventStoreEventDetails,
  EventStoreReducer,
  EventStoreReducers,
  EventStoreCurrentReducerVersion,
  EventStoreAggregate,
} from '@castore/core';

import { MockedEventStore } from './mockedEventStore';

export const mockEventStore = <EVENT_STORE extends EventStore = EventStore>(
  eventStore: EVENT_STORE,
  initialEvents: EventStoreEventDetails<EVENT_STORE>[] = [],
): MockedEventStore<
  EventStoreId<EVENT_STORE>,
  EventStoreEventTypes<EVENT_STORE>,
  EventStoreEventDetails<EVENT_STORE>,
  EventStoreEventDetails<EVENT_STORE>,
  EventStoreReducers<EVENT_STORE>,
  EventStoreCurrentReducerVersion<EVENT_STORE>,
  EventStoreReducer<EVENT_STORE>,
  EventStoreAggregate<EVENT_STORE>
> =>
  new MockedEventStore<
    EventStoreId<EVENT_STORE>,
    EventStoreEventTypes<EVENT_STORE>,
    EventStoreEventDetails<EVENT_STORE>,
    EventStoreEventDetails<EVENT_STORE>,
    EventStoreReducers<EVENT_STORE>,
    EventStoreCurrentReducerVersion<EVENT_STORE>,
    EventStoreReducer<EVENT_STORE>,
    EventStoreAggregate<EVENT_STORE>
  >({ eventStore, initialEvents });
