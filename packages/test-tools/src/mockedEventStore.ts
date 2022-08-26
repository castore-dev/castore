import {
  Aggregate,
  EventDetail,
  EventStore,
  EventType,
  EventTypesDetails,
} from '@castore/core';
import { InMemoryStorageAdapter } from '@castore/inmemory-event-storage-adapter';

export class MockedEventStore<
  I extends string = string,
  E extends EventType[] = EventType[],
  $D extends EventDetail = EventTypesDetails<E>,
  // see original EventStore implementation for more details
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  D extends EventDetail = EventDetail extends $D ? any : $D,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  R extends (aggregate: any, event: D) => Aggregate = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    aggregate: any,
    event: D,
  ) => Aggregate,
  A extends Aggregate = ReturnType<R>,
> extends EventStore<I, E, $D, D, R, A> {
  initialEvents: $D[];
  reset: () => void;

  constructor({
    eventStore,
    initialEvents = [],
  }: {
    eventStore: EventStore<I, E, $D, D, R, A>;
    initialEvents?: $D[];
  }) {
    super({
      eventStoreId: eventStore.eventStoreId,
      eventStoreEvents: eventStore.eventStoreEvents,
      reduce: eventStore.reduce,
      simulateSideEffect: eventStore.simulateSideEffect,
      storageAdapter: new InMemoryStorageAdapter({ initialEvents }),
    });

    this.initialEvents = initialEvents;
    this.reset = () =>
      (this.storageAdapter = new InMemoryStorageAdapter({ initialEvents }));
  }
}
