import { useSelector } from 'react-redux';

import {
  EventStore,
  ListAggregateIdsOptions,
  ListAggregateIdsOutput,
} from '@castore/core';

import { ReduxEventStorageAdapter } from '~/adapter';
import { EventStoreReduxStateNotFoundError } from '~/errors/eventStoreReduxStateNotFound';
import { EventStoreReduxStorageAdapterNotFoundError } from '~/errors/reduxEventStorageAdapterNotFound';
import { EventStoreReduxState } from '~/types';
import {
  parseAppliedListAggregateIdsOptions,
  ParsedPageToken,
} from '~/utils/parseAppliedListAggregateIdsOptions';

// eslint-disable-next-line complexity
export const useAggregateIds = <EVENT_STORE extends EventStore>(
  eventStore: EVENT_STORE,
  { pageToken: inputPageToken, ...inputOptions }: ListAggregateIdsOptions = {},
): ListAggregateIdsOutput => {
  const storeAggregateEntries = (useSelector<
    Record<string, EventStoreReduxState<EVENT_STORE>>
  >(state => {
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

    return eventStoreState.aggregateIds;
  }) ?? []) as {
    aggregateId: string;
    initialEventTimestamp: string;
  }[];

  const {
    limit,
    initialEventAfter,
    initialEventBefore,
    reverse,
    exclusiveStartKey,
  } = parseAppliedListAggregateIdsOptions({
    inputPageToken,
    inputOptions,
  });

  let aggregateEntries = [...storeAggregateEntries].sort(
    (
      { initialEventTimestamp: initialEventTimestampA },
      { initialEventTimestamp: initialEventTimestampB },
    ) => (initialEventTimestampA > initialEventTimestampB ? 1 : -1),
  );

  if (initialEventAfter !== undefined) {
    aggregateEntries = aggregateEntries.filter(
      ({ initialEventTimestamp }) => initialEventAfter <= initialEventTimestamp,
    );
  }

  if (initialEventBefore !== undefined) {
    aggregateEntries = aggregateEntries.filter(
      ({ initialEventTimestamp }) =>
        initialEventTimestamp <= initialEventBefore,
    );
  }

  let aggregateIds = aggregateEntries.map(({ aggregateId }) => aggregateId);

  if (reverse === true) {
    aggregateIds = aggregateIds.reverse();
  }

  if (exclusiveStartKey !== undefined) {
    const exclusiveStartKeyIndex = aggregateIds.findIndex(
      aggregateId => aggregateId === exclusiveStartKey,
    );

    aggregateIds = aggregateIds.slice(exclusiveStartKeyIndex + 1);
  }

  const numberOfAggregateIdsBeforeLimit = aggregateIds.length;
  if (limit !== undefined) {
    aggregateIds = aggregateIds.slice(0, limit);
  }

  const hasNextPage =
    limit === undefined ? false : numberOfAggregateIdsBeforeLimit > limit;

  const parsedNextPageToken: ParsedPageToken = {
    limit,
    initialEventAfter,
    initialEventBefore,
    reverse,
    lastEvaluatedKey: aggregateIds[aggregateIds.length - 1],
  };

  return {
    aggregateIds,
    ...(hasNextPage
      ? { nextPageToken: JSON.stringify(parsedNextPageToken) }
      : {}),
  };
};
