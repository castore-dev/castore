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
  EVENT_DETAILS extends EventDetail = EventTypeDetails<EVENT_TYPES>,
  $EVENT_DETAILS extends EventDetail = $Contravariant<
    EVENT_DETAILS,
    EventDetail
  >,
  REDUCERS extends Record<string, Reducer<Aggregate, $EVENT_DETAILS>> = Record<
    string,
    Reducer<Aggregate, $EVENT_DETAILS>
  >,
  CURRENT_REDUCER_VERSION extends keyof REDUCERS & string = keyof REDUCERS &
    string,
  REDUCER extends Reducer<
    Aggregate,
    $EVENT_DETAILS
  > = REDUCERS[CURRENT_REDUCER_VERSION],
  AGGREGATE extends Aggregate = ReturnType<REDUCER>,
> extends EventStore<
  EVENT_STORE_ID,
  EVENT_TYPES,
  EVENT_DETAILS,
  $EVENT_DETAILS,
  REDUCERS,
  CURRENT_REDUCER_VERSION,
  REDUCER,
  AGGREGATE
> {
  initialEvents: EVENT_DETAILS[];
  reset: () => void;

  constructor({
    eventStore,
    initialEvents = [],
  }: {
    eventStore: EventStore<
      EVENT_STORE_ID,
      EVENT_TYPES,
      EVENT_DETAILS,
      $EVENT_DETAILS,
      REDUCERS,
      CURRENT_REDUCER_VERSION,
      REDUCER,
      AGGREGATE
    >;
    initialEvents?: EVENT_DETAILS[];
  }) {
    super({
      eventStoreId: eventStore.eventStoreId,
      eventTypes: eventStore.eventTypes,
      ...(eventStore.snapshotMode === 'custom'
        ? {
            snapshotMode: 'custom',
            reducers: eventStore.reducers,
            currentReducerVersion: eventStore.currentReducerVersion,
          }
        : eventStore.snapshotMode === 'auto'
        ? {
            snapshotMode: 'auto',
            autoSnapshotPeriodVersions:
              eventStore.autoSnapshotPeriodVersions as number,
            currentReducerVersion: eventStore.currentReducerVersion,
            reducer: eventStore.reducer,
          }
        : {
            snapshotMode: 'none',
            reducer: eventStore.reducer,
          }),
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
