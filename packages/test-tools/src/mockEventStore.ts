import {
  EventStore,
  EventStoreId,
  EventStoreEventsTypes,
  EventStoreEventsDetails,
  EventStoreReducer,
  EventStoreAggregate,
} from '@castore/core';

import { MockedEventStore } from './mockedEventStore';

export const mockEventStore = <E extends EventStore = EventStore>(
  eventStore: E,
  initialEvents: EventStoreEventsDetails<E>[] = [],
): MockedEventStore<
  EventStoreId<E>,
  EventStoreEventsTypes<E>,
  EventStoreEventsDetails<E>,
  EventStoreEventsDetails<E>,
  EventStoreReducer<E>,
  EventStoreAggregate<E>
> =>
  new MockedEventStore<
    EventStoreId<E>,
    EventStoreEventsTypes<E>,
    EventStoreEventsDetails<E>,
    EventStoreEventsDetails<E>,
    EventStoreReducer<E>,
    EventStoreAggregate<E>
  >({ eventStore, initialEvents });
