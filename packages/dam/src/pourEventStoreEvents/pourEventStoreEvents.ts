import type {
  EventDetail,
  EventStore,
  EventStoreNotificationMessage,
} from '@castore/core';

import type { ScanInfos } from '~/types';
import { updateScanInfos } from '~/utils/updateScanInfos';

import { EventBook } from './eventBook';
import { MessagePourer } from './messagePourer';

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
  const messagePourer = new MessagePourer(
    eventStore,
    messageChannel,
    rateLimit,
  );

  let pageToken: string | undefined;
  let fetchedEventsCursor: string | undefined = undefined;

  const scanInfos: ScanInfos = {};

  do {
    const { aggregateIds, nextPageToken } = await eventStore.listAggregateIds({
      pageToken,
      limit: 20,
      initialEventAfter: fetchedEventsCursor,
      initialEventBefore: to,
    });

    const areAllAggregatesScanned = nextPageToken === undefined;

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

    await eventBook.fetchAndBookAggregateEvents(aggregateIds);

    const lastScannedAggregateEvents = eventBook.getBookedEvents(
      lastScannedAggregateId,
    ) as [EventDetail, ...EventDetail[]];

    /**
     * @debt v2 "make listAggregateIds return initialEventTimestamp and use it here"
     */
    fetchedEventsCursor = lastScannedAggregateEvents[0].timestamp;

    const eventsToPour = eventBook.getEventsToPour({
      areAllAggregatesScanned,
      fetchedEventsCursor,
      from,
      to,
    });

    await messagePourer.pourEvents(eventsToPour);

    pageToken = nextPageToken;
  } while (pageToken !== undefined);

  return {
    pouredEventCount: messagePourer.pouredEventCount,
    ...scanInfos,
  };
};
