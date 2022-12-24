import { useSelector } from 'react-redux';

import {
  EventsQueryOptions,
  EventStore,
  EventStoreEventsDetails,
} from '@castore/core';

import { EventStoreReduxStateNotFoundError } from '~/errors/eventStoreReduxStateNotFound';
import { EventStoresReduxState } from '~/types';

export const useAggregateEvents = <E extends EventStore>(
  eventStore: E,
  aggregateId: string,
  { minVersion, maxVersion, reverse, limit }: EventsQueryOptions = {},
): { events: EventStoreEventsDetails<E>[] } => {
  let events = (useSelector<EventStoresReduxState>(state => {
    const eventStoreState = state[eventStore.eventStoreId];

    if (!eventStoreState) {
      throw new EventStoreReduxStateNotFoundError({
        eventStoreId: eventStore.eventStoreId,
      });
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
