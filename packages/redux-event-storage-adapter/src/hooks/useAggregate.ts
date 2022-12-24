import {
  EventStore,
  EventStoreAggregate,
  EventStoreEventsDetails,
  GetAggregateOptions,
} from '@castore/core';

import { useAggregateEvents } from './useAggregateEvents';

export const useAggregate = <E extends EventStore>(
  eventStore: E,
  aggregateId: string,
  { maxVersion }: GetAggregateOptions = {},
): {
  aggregate?: EventStoreAggregate<E>;
  events: EventStoreEventsDetails<E>[];
  lastEvent?: EventStoreEventsDetails<E>;
} => {
  const { events } = useAggregateEvents(eventStore, aggregateId, {
    maxVersion,
  });

  const aggregate = eventStore.buildAggregate(events);

  const lastEvent = events[events.length - 1];

  return { aggregate, events, lastEvent };
};
