import {
  Aggregate,
  EventDetail,
  EventStore,
  EventType,
  EventTypesDetails,
  Reducer,
  $Contravariant,
} from '@castore/core';
import { InMemoryStorageAdapter } from '@castore/inmemory-event-storage-adapter';

export class MockedEventStore<
  I extends string = string,
  E extends EventType[] = EventType[],
  D extends EventDetail = EventTypesDetails<E>,
  $D extends EventDetail = $Contravariant<D, EventDetail>,
  R extends Reducer<Aggregate, $D> = Reducer<Aggregate, $D>,
  A extends Aggregate = ReturnType<R>,
> extends EventStore<I, E, D, $D, R, A> {
  initialEvents: D[];
  reset: () => void;

  constructor({
    eventStore,
    initialEvents = [],
  }: {
    eventStore: EventStore<I, E, D, $D, R, A>;
    initialEvents?: D[];
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
