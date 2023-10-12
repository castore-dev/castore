import type {
  AggregateExistsMessage,
  EventStore,
  EventStoreId,
  ListAggregateIdsOptions,
  PublishMessageOptions,
} from '@castore/core';

import type { ScanInfos } from '~/types';
import { getThrottle } from '~/utils/getThrottle';
import { updateScanInfos } from '~/utils/updateScanInfos';

interface Props<EVENT_STORE extends EventStore> {
  eventStore: EVENT_STORE;
  messageChannel: {
    publishMessage: (
      messages: AggregateExistsMessage<EventStoreId<EVENT_STORE>>,
      options?: PublishMessageOptions,
    ) => Promise<void>;
  };
  options?: Omit<ListAggregateIdsOptions, 'pageToken'>;
  rateLimit?: number;
}

export const pourEventStoreAggregateIds = async <
  EVENT_STORE extends EventStore,
>({
  eventStore,
  messageChannel,
  options: listAggregateIdsOptions = {},
  rateLimit,
}: Props<EVENT_STORE>): Promise<
  { pouredAggregateIdCount: number } & ScanInfos
> => {
  const throttle = getThrottle(rateLimit);

  const eventStoreId = eventStore.eventStoreId;

  let pageToken: string | undefined;
  let pouredAggregateIdCount = 0;

  const scanInfos: ScanInfos = {};

  do {
    const { aggregateIds, nextPageToken } = await eventStore.listAggregateIds({
      ...listAggregateIdsOptions,
      pageToken,
    });

    updateScanInfos({
      scanInfos,
      aggregateIds,
      areAllAggregatesScanned: nextPageToken === undefined,
    });

    for (const { aggregateId } of aggregateIds) {
      await throttle(() =>
        messageChannel.publishMessage(
          { eventStoreId, aggregateId },
          { replay: true },
        ),
      );
    }

    pageToken = nextPageToken;
    pouredAggregateIdCount += aggregateIds.length;
  } while (pageToken !== undefined);

  return {
    pouredAggregateIdCount,
    ...scanInfos,
  };
};
