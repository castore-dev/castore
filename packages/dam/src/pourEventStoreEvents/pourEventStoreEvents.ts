/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { EventStore, EventStoreNotificationMessage } from '@castore/core';

import type { ScanInfos } from '~/types';
import { EventBook } from '~/utils/eventBook';
import { MessagePourer } from '~/utils/messagePourer';
import { updateScanInfos } from '~/utils/updateScanInfos';

interface Props<EVENT_STORE extends EventStore> {
  eventStore: EVENT_STORE;
  messageChannel: {
    publishMessage: (
      message: EventStoreNotificationMessage<EVENT_STORE>,
    ) => Promise<void>;
  };
  filters?: { from?: string; to?: string };
  rateLimit?: number;
}

export const pourEventStoreEvents = async <EVENT_STORE extends EventStore>({
  eventStore,
  messageChannel,
  filters: { from, to } = {},
  rateLimit,
}: Props<EVENT_STORE>): Promise<{ pouredEventCount: number } & ScanInfos> => {
  const eventBook = new EventBook(eventStore);
  const messagePourer = new MessagePourer<EVENT_STORE>(
    messageChannel,
    rateLimit,
  );

  let pageToken: string | undefined;
  let fetchedEventsCursor: string | undefined = undefined;
  let areAllAggregatesScanned = false;

  const scanInfos: ScanInfos = {};

  do {
    const { aggregateIds, nextPageToken } = await eventStore.listAggregateIds({
      pageToken,
      limit: 20,
      initialEventAfter: fetchedEventsCursor,
      initialEventBefore: to,
    });

    areAllAggregatesScanned = nextPageToken === undefined;

    updateScanInfos({
      scanInfos,
      aggregateIds,
      areAllAggregatesScanned,
    });

    const lastScannedAggregateId = aggregateIds[aggregateIds.length - 1];
    if (lastScannedAggregateId === undefined) {
      // should only happen if no event must be poured at all
      break;
    }

    await eventBook.feedAggregateEvents(aggregateIds);

    const lastScannedAggregateEvents = eventBook.getBookedEvents(
      lastScannedAggregateId,
    );

    /**
     * @debt v2 "make listAggregateIds return initialEventTimestamp and use it here"
     */
    fetchedEventsCursor = lastScannedAggregateEvents[0]!.timestamp;

    const messagesToPour = eventBook.getMessagesToPour({
      areAllAggregatesScanned,
      fetchedEventsCursor,
    });

    messagesToPour.filterByTimestamp({ from, to });
    messagesToPour.sortByTimestamp();

    await messagePourer.pourMessageBatch(messagesToPour);

    pageToken = nextPageToken;
  } while (!areAllAggregatesScanned);

  return {
    pouredEventCount: messagePourer.pouredEventCount,
    ...scanInfos,
  };
};
