import { useSelector } from 'react-redux';

import {
  EventsQueryOptions,
  EventStore,
  EventStoreEventDetails,
} from '@castore/core';

import { ReduxEventStorageAdapter } from '~/adapter';
import { ReduxEventStorageAdapterNotFoundError } from '~/errors/reduxEventStorageAdapterNotFound';
import { ReduxStateNotFoundError } from '~/errors/reduxStateNotFound';
import { EventStoresReduxState } from '~/types';

export const useAggregateEvents = <EVENT_STORE extends EventStore>(
  eventStore: EVENT_STORE,
  aggregateId: string,
  { minVersion, maxVersion, reverse, limit }: EventsQueryOptions = {},
): { events: EventStoreEventDetails<EVENT_STORE>[] } => {
  let events = (useSelector<EventStoresReduxState>(state => {
    const eventStorageAdapter = eventStore.getEventStorageAdapter();

    if (!(eventStorageAdapter instanceof ReduxEventStorageAdapter)) {
      throw new ReduxEventStorageAdapterNotFoundError({
        eventStoreId: eventStore.eventStoreId,
      });
    }

    const eventStoreSliceName = eventStorageAdapter.eventStoreSliceName;
    const eventStoreState = state[eventStoreSliceName];

    if (!eventStoreState) {
      throw new ReduxStateNotFoundError({ eventStoreSliceName });
    }

    return eventStoreState.eventsByAggregateId[aggregateId];
  }) ?? []) as EventStoreEventDetails<EVENT_STORE>[];

  if (minVersion !== undefined) {
    events = events.filter(({ version }) => version >= minVersion);
  }

  if (maxVersion !== undefined) {
    events = events.filter(({ version }) => version <= maxVersion);
  }

  if (reverse === true) {
    events = events.reverse();
  }

  if (limit !== undefined) {
    events = events.slice(0, limit);
  }

  return { events };
};
