import {
  Aggregate,
  EventDetail,
  EventStore,
  EventType,
  EventTypeDetails,
  Reducer,
  $Contravariant,
} from '@castore/core';
import { InMemoryEventStorageAdapter } from '@castore/event-storage-adapter-in-memory';

export class MockedEventStore<
  EVENT_STORE_ID extends string = string,
  EVENT_TYPES extends EventType[] = EventType[],
  EVENT_DETAIL extends EventDetail = EventTypeDetails<EVENT_TYPES>,
  $EVENT_DETAIL extends EventDetail = $Contravariant<EVENT_DETAIL, EventDetail>,
  REDUCER extends Reducer<Aggregate, $EVENT_DETAIL> = Reducer<
    Aggregate,
    $EVENT_DETAIL
  >,
  AGGREGATE extends Aggregate = ReturnType<REDUCER>,
> extends EventStore<
  EVENT_STORE_ID,
  EVENT_TYPES,
  EVENT_DETAIL,
  $EVENT_DETAIL,
  REDUCER,
  AGGREGATE
> {
  initialEvents: EVENT_DETAIL[];
  reset: () => void;

  constructor({
    eventStore,
    initialEvents = [],
  }: {
    eventStore: EventStore<
      EVENT_STORE_ID,
      EVENT_TYPES,
      EVENT_DETAIL,
      $EVENT_DETAIL,
      REDUCER,
      AGGREGATE
    >;
    initialEvents?: EVENT_DETAIL[];
  }) {
    super({
      eventStoreId: eventStore.eventStoreId,
      eventTypes: eventStore.eventTypes,
      reducer: eventStore.reducer,
      simulateSideEffect: eventStore.simulateSideEffect,
      eventStorageAdapter: new InMemoryEventStorageAdapter({ initialEvents }),
    });

    this.initialEvents = initialEvents;
    this.reset = () =>
      (this.eventStorageAdapter = new InMemoryEventStorageAdapter({
        initialEvents,
      }));
  }
}
