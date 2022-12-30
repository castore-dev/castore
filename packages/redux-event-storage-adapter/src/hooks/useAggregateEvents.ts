import { useSelector } from 'react-redux';

import {
  EventsQueryOptions,
  EventStore,
  EventStoreEventsDetails,
} from '@castore/core';

import { EventStoreReduxStateNotFoundError } from '~/errors/eventStoreReduxStateNotFound';
import { EventStoreReduxStorageAdapterNotFoundError } from '~/errors/reduxEventStorageAdapterNotFound';
import { ReduxEventStorageAdapter } from '~/reduxAdapter';
import { EventStoresReduxState } from '~/types';

export const useAggregateEvents = <E extends EventStore>(
  eventStore: E,
  aggregateId: string,
  { minVersion, maxVersion, reverse, limit }: EventsQueryOptions = {},
): { events: EventStoreEventsDetails<E>[] } => {
  let events = (useSelector<EventStoresReduxState>(state => {
    const storageAdapter = eventStore.getStorageAdapter();

    if (!(storageAdapter instanceof ReduxEventStorageAdapter)) {
      throw new EventStoreReduxStorageAdapterNotFoundError({
        eventStoreId: eventStore.eventStoreId,
      });
    }

    const eventStoreSliceName = storageAdapter.eventStoreSliceName;
    const eventStoreState = state[eventStoreSliceName];

    if (!eventStoreState) {
      throw new EventStoreReduxStateNotFoundError({ eventStoreSliceName });
    }

    return eventStoreState.eventsByAggregateId[aggregateId];
  }) ?? []) as EventStoreEventsDetails<E>[];

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
