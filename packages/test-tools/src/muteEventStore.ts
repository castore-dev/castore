import { EventStore, EventStoreEventDetails } from '@castore/core';
import { InMemoryEventStorageAdapter } from '@castore/event-storage-adapter-in-memory';

export const muteEventStore = <EVENT_STORE extends EventStore = EventStore>(
  eventStore: EVENT_STORE,
  initialEvents: EventStoreEventDetails<EVENT_STORE>[] = [],
): void => {
  eventStore.eventStorageAdapter = new InMemoryEventStorageAdapter({
    initialEvents,
  });
};
