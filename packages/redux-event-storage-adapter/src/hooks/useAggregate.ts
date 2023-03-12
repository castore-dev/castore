import {
  EventStore,
  EventStoreAggregate,
  EventStoreEventsDetails,
  GetAggregateOptions,
} from '@castore/core';

import { useAggregateEvents } from './useAggregateEvents';

export const useAggregate = <EVENT_STORE extends EventStore>(
  eventStore: EVENT_STORE,
  aggregateId: string,
  { maxVersion }: GetAggregateOptions = {},
): {
  aggregate?: EventStoreAggregate<EVENT_STORE>;
  events: EventStoreEventsDetails<EVENT_STORE>[];
  lastEvent?: EventStoreEventsDetails<EVENT_STORE>;
} => {
  const { events } = useAggregateEvents(eventStore, aggregateId, {
    maxVersion,
  });

  const aggregate = eventStore.buildAggregate(events);

  const lastEvent = events[events.length - 1];

  return { aggregate, events, lastEvent };
};
