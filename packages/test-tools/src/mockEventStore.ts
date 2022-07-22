import { EventStore, EventStoreEventsDetails } from '@castore/core';
import { InMemoryStorageAdapter } from '@castore/inmemory-event-storage-adapter';

export const mockEventStore = <E extends EventStore = EventStore>(
  eventStore: E,
  events: EventStoreEventsDetails<E>[],
): void => {
  eventStore.storageAdapter = new InMemoryStorageAdapter();
  events.map(event => eventStore.pushEvent(event));
};
