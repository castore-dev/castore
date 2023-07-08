import type {
  AggregateExistsMessage,
  EventStore,
  EventStoreId,
} from '@castore/core';

interface PourEventStoreAggregateIdsOptions {
  batchSize?: number;
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
    batchSize,
    reverse,
    initialEventAfter,
    initialEventBefore,
  }: PourEventStoreAggregateIdsOptions = {},
): Promise<{
  pouredAggregateIdCount: number;
  startAggregateId?: string;
  endAggregateId?: string;
}> => {
  const eventStoreId = eventStore.eventStoreId;

  let isFirstQuery = true;
  let pageToken: string | undefined;
  let pouredAggregateIdCount = 0;
  let startAggregateId: string | undefined;
  let endAggregateId: string | undefined;

  while (isFirstQuery || pageToken !== undefined) {
    const { aggregateIds, nextPageToken } = await eventStore.listAggregateIds({
      pageToken: pageToken,
      limit: batchSize,
      reverse,
      initialEventAfter,
      initialEventBefore,
    });

    await messageChannel.publishMessages(
      aggregateIds.map(aggregateId => ({ eventStoreId, aggregateId })),
    );

    if (isFirstQuery) {
      startAggregateId = aggregateIds[0];
    }

    if (nextPageToken === undefined) {
      endAggregateId = aggregateIds[aggregateIds.length - 1];
    }

    pageToken = nextPageToken;
    isFirstQuery = false;
    pouredAggregateIdCount += aggregateIds.length;
  }

  return {
    pouredAggregateIdCount,
    ...(startAggregateId !== undefined ? { startAggregateId } : {}),
    ...(endAggregateId !== undefined ? { endAggregateId } : {}),
  };
};
