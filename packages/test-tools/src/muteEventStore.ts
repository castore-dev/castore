import { EventStore, EventStoreEventsDetails } from '@castore/core';
import { InMemoryEventStorageAdapter } from '@castore/inmemory-event-storage-adapter';

export const muteEventStore = <EVENT_STORE extends EventStore = EventStore>(
  eventStore: EVENT_STORE,
  initialEvents: EventStoreEventsDetails<EVENT_STORE>[] = [],
): void => {
  eventStore.eventStorageAdapter = new InMemoryEventStorageAdapter({
    initialEvents,
  });
};
