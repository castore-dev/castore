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

export const useAggregateIds = <EVENT_STORE extends EventStore>(
  eventStore: EVENT_STORE,
  {
    limit: inputLimit,
    pageToken: inputPageToken,
  }: ListAggregateIdsOptions = {},
): ListAggregateIdsOutput => {
  const aggregateIdsWithInitialEventTimestamps = (useSelector<
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

  const aggregateIds = [...aggregateIdsWithInitialEventTimestamps]
    .sort(
      (
        { initialEventTimestamp: initialEventTimestampA },
        { initialEventTimestamp: initialEventTimestampB },
      ) => (initialEventTimestampA > initialEventTimestampB ? 1 : -1),
    )
    .map(({ aggregateId }) => aggregateId);

  const { appliedLimit, appliedStartIndex = 0 } =
    parseAppliedListAggregateIdsOptions({ inputLimit, inputPageToken });

  const appliedExclusiveEndIndex =
    appliedLimit === undefined ? undefined : appliedStartIndex + appliedLimit;

  const hasNextPage =
    appliedExclusiveEndIndex === undefined
      ? false
      : aggregateIds[appliedExclusiveEndIndex] !== undefined;

  const parsedNextPageToken: ParsedPageToken = {
    limit: appliedLimit,
    exclusiveEndIndex: appliedExclusiveEndIndex,
  };

  return {
    aggregateIds: aggregateIds.slice(
      appliedStartIndex,
      appliedExclusiveEndIndex,
    ),
    ...(hasNextPage
      ? { nextPageToken: JSON.stringify(parsedNextPageToken) }
      : {}),
  };
};
