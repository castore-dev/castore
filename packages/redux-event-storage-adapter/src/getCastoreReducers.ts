import { createSlice, Draft } from '@reduxjs/toolkit';

import { EventDetail, EventStore } from '@castore/core';

import { EventStoreReduxReducer } from '~/types';
import {
  DEFAULT_PREFIX,
  getEventStoreSliceName,
} from '~/utils/getEventStoreSliceName';

export const getCastoreReducers = ({
  prefix = DEFAULT_PREFIX,
  eventStores,
}: {
  prefix?: string;
  eventStores: EventStore[];
}): Record<string, EventStoreReduxReducer> => {
  const castoreReducers: Record<string, EventStoreReduxReducer> = {};

  eventStores.forEach(eventStore => {
    const { eventStoreId } = eventStore;
    const eventStoreSliceName = getEventStoreSliceName({
      prefix,
      eventStoreId,
    });

    const { reducer } = createSlice({
      name: eventStoreSliceName,
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

    castoreReducers[eventStoreSliceName] = reducer;
  });

  return castoreReducers;
};
