/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type {
  EventStore,
  EventStoreId,
  EventStoreNotificationMessage,
} from '@castore/core';

import type { ScanInfos } from '~/types';
import { EventBook } from '~/utils/eventBook';
import { MessageBatch } from '~/utils/messageBatch';
import { MessagePourer } from '~/utils/messagePourer';
import { updateScanInfos } from '~/utils/updateScanInfos';

interface Props<EVENT_STORES extends EventStore> {
  eventStores: EVENT_STORES[];
  messageChannel: {
    publishMessage: (
      message: EventStoreNotificationMessage<EVENT_STORES>,
    ) => Promise<void>;
  };
  filters?: { from?: string; to?: string };
  rateLimit?: number;
}

export const pourEventStoreCollectionEvents = async <
  EVENT_STORES extends EventStore,
>({
  eventStores,
  messageChannel,
  filters: { from, to } = {},
  rateLimit,
}: Props<EVENT_STORES>): Promise<{
  pouredEventCount: number;
  scans: { [eventStoreId in EventStoreId<EVENT_STORES>]: ScanInfos };
}> => {
  type EVT_STORE_ID = EventStoreId<EVENT_STORES>;

  const eventBooks = {} as { [key in EVT_STORE_ID]: EventBook<EVENT_STORES> };

  const messagePourer: MessagePourer<EVENT_STORES> = new MessagePourer(
    messageChannel,
    rateLimit,
  );

  const pageTokens: { [key in EVT_STORE_ID]?: string } = {};
  const fetchedEventsCursors: { [key in EVT_STORE_ID]?: string } = {};
  const areAllAggregatesScanned = {} as { [key in EVT_STORE_ID]: boolean };

  let collectionFetchedEventsCursor: string | undefined = undefined;
  let areAllCollectionAggregatesScanned = false;
  const scans = {} as { [key in EVT_STORE_ID]: ScanInfos };

  for (const eventStore of eventStores) {
    const eventStoreId: EventStoreId<EVENT_STORES> = eventStore.eventStoreId;
    eventBooks[eventStoreId] = new EventBook(eventStore);
    areAllAggregatesScanned[eventStoreId] = false;
    scans[eventStoreId] = {};
  }

  do {
    const eventStoresToScan = eventStores.filter(eventStore => {
      if (collectionFetchedEventsCursor === undefined) {
        return true;
      }

      const eventStoreId: EventStoreId<EVENT_STORES> = eventStore.eventStoreId;
      const fetchedEventsCursor = fetchedEventsCursors[eventStoreId];

      return (
        fetchedEventsCursor !== undefined &&
        fetchedEventsCursor <= collectionFetchedEventsCursor
      );
    });

    for (const eventStore of eventStoresToScan) {
      const eventStoreId: EventStoreId<EVENT_STORES> = eventStore.eventStoreId;

      const eventStorePageToken = pageTokens[eventStoreId];
      const eventStoreFetchedEventsCursor = fetchedEventsCursors[eventStoreId];

      const { aggregateIds, nextPageToken } = await eventStore.listAggregateIds(
        {
          pageToken: eventStorePageToken,
          limit: 20,
          initialEventAfter: eventStoreFetchedEventsCursor,
          initialEventBefore: to,
        },
      );

      areAllAggregatesScanned[eventStoreId] = nextPageToken === undefined;

      updateScanInfos({
        scanInfos: scans[eventStoreId],
        aggregateIds,
        areAllAggregatesScanned: areAllAggregatesScanned[eventStoreId],
      });

      const lastScannedAggregateId = aggregateIds[aggregateIds.length - 1];
      if (lastScannedAggregateId === undefined) {
        // should only happen if no event must be poured for this event store
        continue;
      }

      const eventBook = eventBooks[eventStoreId];
      await eventBook.feedAggregateEvents(aggregateIds);

      pageTokens[eventStoreId] = nextPageToken;

      const lastScannedAggregateEvents = eventBook.getBookedEvents(
        lastScannedAggregateId,
      );

      /**
       * @debt v2 "make listAggregateIds return initialEventTimestamp and use it here"
       */
      fetchedEventsCursors[eventStoreId] =
        lastScannedAggregateEvents[0]!.timestamp;
    }

    areAllCollectionAggregatesScanned = Object.values(
      areAllAggregatesScanned,
    ).every(Boolean);

    collectionFetchedEventsCursor = Object.values(
      fetchedEventsCursors,
    ).sort()[0] as string | undefined;
    if (collectionFetchedEventsCursor === undefined) {
      // should only happen if no event must be poured at all
      break;
    }

    const messagesToPour = new MessageBatch<EVENT_STORES>();

    for (const eventStore of eventStores) {
      const eventStoreId: EventStoreId<EVENT_STORES> = eventStore.eventStoreId;
      const eventBook = eventBooks[eventStoreId];

      messagesToPour.concat(
        eventBook.getMessagesToPour({
          areAllAggregatesScanned: areAllAggregatesScanned[eventStoreId],
          fetchedEventsCursor: collectionFetchedEventsCursor,
        }),
      );
    }

    messagesToPour.filterByTimestamp({ from, to });
    messagesToPour.sortByTimestamp();

    await messagePourer.pourMessageBatch(messagesToPour);
  } while (!areAllCollectionAggregatesScanned);

  return {
    pouredEventCount: messagePourer.pouredEventCount,
    scans,
  };
};
