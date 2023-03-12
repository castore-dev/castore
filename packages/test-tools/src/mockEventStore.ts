import {
  EventStore,
  EventStoreId,
  EventStoreEventsTypes,
  EventStoreEventsDetails,
  EventStoreReducer,
  EventStoreAggregate,
} from '@castore/core';

import { MockedEventStore } from './mockedEventStore';

export const mockEventStore = <EVENT_STORE extends EventStore = EventStore>(
  eventStore: EVENT_STORE,
  initialEvents: EventStoreEventsDetails<EVENT_STORE>[] = [],
): MockedEventStore<
  EventStoreId<EVENT_STORE>,
  EventStoreEventsTypes<EVENT_STORE>,
  EventStoreEventsDetails<EVENT_STORE>,
  EventStoreEventsDetails<EVENT_STORE>,
  EventStoreReducer<EVENT_STORE>,
  EventStoreAggregate<EVENT_STORE>
> =>
  new MockedEventStore<
    EventStoreId<EVENT_STORE>,
    EventStoreEventsTypes<EVENT_STORE>,
    EventStoreEventsDetails<EVENT_STORE>,
    EventStoreEventsDetails<EVENT_STORE>,
    EventStoreReducer<EVENT_STORE>,
    EventStoreAggregate<EVENT_STORE>
  >({ eventStore, initialEvents });
