import {
  EventStore,
  EventStoreAggregate,
  EventStoreEventsDetails,
  GetAggregateOptions,
  AggregateNotFoundError,
} from '@castore/core';

import { useAggregate } from './useAggregate';

export const useExistingAggregate = <E extends EventStore>(
  eventStore: E,
  aggregateId: string,
  options: GetAggregateOptions = {},
): {
  aggregate: EventStoreAggregate<E>;
  events: EventStoreEventsDetails<E>[];
  lastEvent: EventStoreEventsDetails<E>;
} => {
  const { aggregate, events, lastEvent } = useAggregate(
    eventStore,
    aggregateId,
    options,
  );

  if (aggregate === undefined || lastEvent === undefined) {
    throw new AggregateNotFoundError({
      eventStoreId: eventStore.eventStoreId,
      aggregateId,
    });
  }

  return { aggregate, events, lastEvent };
};
