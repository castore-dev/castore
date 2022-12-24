import { Reducer } from '@reduxjs/toolkit';

import {
  EventStore,
  EventStoreEventsDetails,
  EventStoreId,
} from '@castore/core';

export type EventStoreReduxState<E extends EventStore = EventStore> = {
  eventsByAggregateId: Record<string, EventStoreEventsDetails<E>[]>;
  aggregateIds: {
    aggregateId: string;
    initialEventTimestamp: string;
  }[];
};

export type EventStoresReduxState<E extends EventStore[] = EventStore[]> =
  EventStore[] extends E
    ? Record<string, EventStoreReduxState>
    : E extends [infer H, ...infer T]
    ? H extends EventStore
      ? T extends EventStore[]
        ? Record<EventStoreId<H>, EventStoreReduxState<H>> &
            EventStoresReduxState<T>
        : never
      : never
    : unknown;

export type EventStoreReduxReducer<E extends EventStore = EventStore> = Reducer<
  EventStoreReduxState<E>
>;
