import {
  configureStore,
  createSlice,
  Draft,
  EnhancedStore,
} from '@reduxjs/toolkit';

import { EventDetail, EventStore } from '@castore/core';

import { ReduxEventStorageAdapter } from '~/reduxAdapter';
import { EventStoresReduxState, EventStoreReduxReducer } from '~/types';

export const configureCastore = <E extends EventStore[]>({
  eventStores,
}: {
  eventStores: E;
}): EnhancedStore<EventStoresReduxState<E>> => {
  const reducersByEventStoreId: Record<string, EventStoreReduxReducer> = {};

  eventStores.forEach(eventStore => {
    const { reducer } = createSlice({
      name: eventStore.eventStoreId,
      initialState: {
        eventsByAggregateId: {} as Record<string, EventDetail[]>,
        aggregateIds: [] as {
          aggregateId: string;
          initialEventTimestamp: string;
        }[],
      },
      reducers: {
        eventPushed: (
          state,
          action: {
            type: string;
            payload: Draft<EventDetail>;
          },
        ) => {
          const event = action.payload;
          const { aggregateId, timestamp } = event;

          const aggregateEvents = state.eventsByAggregateId[aggregateId];

          if (aggregateEvents === undefined) {
            state.eventsByAggregateId[aggregateId] = [event];
            state.aggregateIds.push({
              aggregateId,
              initialEventTimestamp: timestamp,
            });
          } else {
            aggregateEvents.push(event);
          }
        },
      },
    });

    reducersByEventStoreId[eventStore.eventStoreId] = reducer;
  });

  const store = configureStore({ reducer: reducersByEventStoreId });

  eventStores.forEach(eventStore => {
    eventStore.storageAdapter = new ReduxEventStorageAdapter({
      store,
      eventStoreId: eventStore.eventStoreId,
    });
  });

  return store as EnhancedStore<EventStoresReduxState<E>>;
};
