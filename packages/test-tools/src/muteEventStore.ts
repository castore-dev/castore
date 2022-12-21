import { EventStore, EventStoreEventsDetails } from '@castore/core';
import { InMemoryStorageAdapter } from '@castore/inmemory-event-storage-adapter';

export const muteEventStore = <E extends EventStore = EventStore>(
  eventStore: E,
  initialEvents: EventStoreEventsDetails<E>[] = [],
): void => {
  eventStore.storageAdapter = new InMemoryStorageAdapter({ initialEvents });
};
