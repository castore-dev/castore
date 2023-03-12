import { EventStore, EventStoreEventsDetails } from '@castore/core';
import { InMemoryStorageAdapter } from '@castore/inmemory-event-storage-adapter';

export const muteEventStore = <EVENT_STORE extends EventStore = EventStore>(
  eventStore: EVENT_STORE,
  initialEvents: EventStoreEventsDetails<EVENT_STORE>[] = [],
): void => {
  eventStore.storageAdapter = new InMemoryStorageAdapter({ initialEvents });
};
