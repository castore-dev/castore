import type {
  AggregateExistsMessage,
  EventStore,
  EventStoreId,
} from '@castore/core';

import type { ScannedAggregate } from '~/types';

interface PourEventStoreAggregateIdsOptions {
  reverse?: boolean;
  initialEventAfter?: string;
  initialEventBefore?: string;
}

export const pourEventStoreAggregateIds = async <
  EVENT_STORE extends EventStore,
>(
  eventStore: EVENT_STORE,
  messageChannel: {
    publishMessages: (
      messages: AggregateExistsMessage<EventStoreId<EVENT_STORE>>[],
    ) => Promise<void>;
  },
  {
    reverse,
    initialEventAfter,
    initialEventBefore,
  }: PourEventStoreAggregateIdsOptions = {},
): Promise<{
  pouredAggregateIdCount: number;
  firstScannedAggregate?: ScannedAggregate;
  lastScannedAggregate?: ScannedAggregate;
}> => {
  const eventStoreId = eventStore.eventStoreId;

  let pageToken: string | undefined;
  let pouredAggregateIdCount = 0;

  let firstScannedAggregate: ScannedAggregate | undefined;
  let lastScannedAggregate: ScannedAggregate | undefined;

  do {
    const { aggregateIds, nextPageToken } = await eventStore.listAggregateIds({
      pageToken: pageToken,
      reverse,
      initialEventAfter,
      initialEventBefore,
    });

    const areAllAggregatesScanned = nextPageToken === undefined;

    if (firstScannedAggregate === undefined && aggregateIds[0] !== undefined) {
      firstScannedAggregate = {
        aggregateId: aggregateIds[0],
      };
    }

    const lastScannedAggregateId = aggregateIds[aggregateIds.length - 1];
    if (lastScannedAggregateId === undefined) {
      // should only happen if no event must be poured at all
      break;
    }

    if (areAllAggregatesScanned) {
      lastScannedAggregate = {
        aggregateId: lastScannedAggregateId,
      };
    }

    await messageChannel.publishMessages(
      aggregateIds.map(aggregateId => ({ eventStoreId, aggregateId })),
    );

    pageToken = nextPageToken;
    pouredAggregateIdCount += aggregateIds.length;
  } while (pageToken !== undefined);

  return {
    pouredAggregateIdCount,
    ...(firstScannedAggregate !== undefined ? { firstScannedAggregate } : {}),
    ...(lastScannedAggregate !== undefined ? { lastScannedAggregate } : {}),
  };
};
