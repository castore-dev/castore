import { useSelector } from 'react-redux';

import {
  EventStore,
  ListAggregateIdsOptions,
  ListAggregateIdsOutput,
} from '@castore/core';

import { EventStoreReduxStateNotFoundError } from '~/errors/eventStoreReduxStateNotFound';
import { EventStoreReduxState } from '~/types';
import {
  parseAppliedListAggregateIdsOptions,
  ParsedPageToken,
} from '~/utils/parseAppliedListAggregateIdsOptions';

export const useAggregateIds = <E extends EventStore>(
  eventStore: E,
  {
    limit: inputLimit,
    pageToken: inputPageToken,
  }: ListAggregateIdsOptions = {},
): ListAggregateIdsOutput => {
  const aggregateIdsWithInitialEventTimestamps = (useSelector<
    Record<string, EventStoreReduxState<E>>
  >(state => {
    const eventStoreState = state[eventStore.eventStoreId];

    if (!eventStoreState) {
      throw new EventStoreReduxStateNotFoundError({
        eventStoreId: eventStore.eventStoreId,
      });
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
