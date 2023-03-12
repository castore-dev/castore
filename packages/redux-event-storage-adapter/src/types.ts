import { Reducer } from '@reduxjs/toolkit';

import {
  EventStore,
  EventStoreEventsDetails,
  EventStoreId,
} from '@castore/core';

export type EventStoreReduxState<EVENT_STORE extends EventStore = EventStore> =
  {
    eventsByAggregateId: Record<string, EventStoreEventsDetails<EVENT_STORE>[]>;
    aggregateIds: {
      aggregateId: string;
      initialEventTimestamp: string;
    }[];
  };

export type EventStoresReduxState<
  EVENT_STORES extends EventStore[] = EventStore[],
> = EventStore[] extends EVENT_STORES
  ? Record<string, EventStoreReduxState>
  : EVENT_STORES extends [infer HEAD_EVENT_STORE, ...infer TAIL_EVENT_STORES]
  ? HEAD_EVENT_STORE extends EventStore
    ? TAIL_EVENT_STORES extends EventStore[]
      ? Record<
          EventStoreId<HEAD_EVENT_STORE>,
          EventStoreReduxState<HEAD_EVENT_STORE>
        > &
          EventStoresReduxState<TAIL_EVENT_STORES>
      : never
    : never
  : unknown;

export type EventStoreReduxReducer<
  EVENT_STORE extends EventStore = EventStore,
> = Reducer<EventStoreReduxState<EVENT_STORE>>;
