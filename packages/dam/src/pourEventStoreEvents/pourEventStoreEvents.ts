import type {
  EventDetail,
  EventStore,
  EventStoreNotificationMessage,
} from '@castore/core';

import type { ScannedAggregate } from '~/types';

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
}

export const pourEventStoreEvents = async <EVENT_STORE extends EventStore>({
  eventStore,
  messageChannel,
  filters: { from, to } = {},
}: Props<EVENT_STORE>): Promise<{
  pouredEventCount: number;
  firstScannedAggregate?: ScannedAggregate;
  lastScannedAggregate?: ScannedAggregate;
}> => {
  const eventBook = new EventBook(eventStore);
  const messagePourer = new MessagePourer(eventStore, messageChannel);

  let pageToken: string | undefined;
  let fetchedEventsCursor: string | undefined = undefined;

  let firstScannedAggregate: ScannedAggregate | undefined;
  let lastScannedAggregate: ScannedAggregate | undefined;

  do {
    const { aggregateIds, nextPageToken } = await eventStore.listAggregateIds({
      pageToken,
      limit: 20,
      initialEventAfter: fetchedEventsCursor,
      initialEventBefore: to,
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
    ...(firstScannedAggregate !== undefined ? { firstScannedAggregate } : {}),
    ...(lastScannedAggregate !== undefined ? { lastScannedAggregate } : {}),
  };
};
