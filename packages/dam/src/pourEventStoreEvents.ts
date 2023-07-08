/* eslint-disable complexity */
import type {
  EventDetail,
  EventStore,
  EventStoreNotificationMessage,
} from '@castore/core';

interface PourEventStoreAggregateIdsOptions {
  from?: string;
  to?: string;
}

export const pourEventStoreEvents = async <EVENT_STORE extends EventStore>(
  eventStore: EVENT_STORE,
  messageChannel: {
    publishMessage: (
      message: EventStoreNotificationMessage<EVENT_STORE>,
    ) => Promise<void>;
  },
  { from, to }: PourEventStoreAggregateIdsOptions = {},
): Promise<{
  pouredEventCount: number;
  startAggregateId?: string;
  endAggregateId?: string;
}> => {
  const eventStoreId = eventStore.eventStoreId;

  const eventsByAggregateId: Record<string, EventDetail[]> = {};

  let isFirstQuery = true;
  let pageToken: string | undefined;
  let pouredEventCount = 0;
  let startAggregateId: string | undefined;
  let endAggregateId: string | undefined;

  let nextEventsBatchToPour: EventDetail[] = [];
  let scannedEventsCursor: string | undefined = undefined;

  while (isFirstQuery || pageToken !== undefined) {
    const { aggregateIds, nextPageToken } = await eventStore.listAggregateIds({
      pageToken,
      limit: 20,
      initialEventAfter: scannedEventsCursor,
      initialEventBefore: to,
    });

    // Fetch all aggregateId page events
    await Promise.all(
      aggregateIds.map(async aggregateId => {
        const { events } = await eventStore.getEvents(aggregateId);
        eventsByAggregateId[aggregateId] = events;
      }),
    );

    // Move scannedEventsCursor up
    const lastScannedAggregateId = aggregateIds[aggregateIds.length - 1];

    if (lastScannedAggregateId === undefined) {
      // should only happen if no event must be poured at all
      break;
    }

    const lastScannedAggregateEvents = eventsByAggregateId[
      lastScannedAggregateId
    ] as [EventDetail, ...EventDetail[]];
    scannedEventsCursor = lastScannedAggregateEvents[0].timestamp;

    // Collect events to pour
    for (const aggregateId in eventsByAggregateId) {
      const aggregateEvents = eventsByAggregateId[aggregateId] as EventDetail[];

      while (
        aggregateEvents[0] &&
        (nextPageToken === undefined ||
          aggregateEvents[0].timestamp <= scannedEventsCursor)
      ) {
        nextEventsBatchToPour.push(aggregateEvents.shift() as EventDetail);
      }

      if (aggregateEvents.length === 0) {
        delete eventsByAggregateId[aggregateId];
      }
    }

    // Sort/filter batch events to pour
    nextEventsBatchToPour = nextEventsBatchToPour
      .filter(
        ({ timestamp }) =>
          (from === undefined || from < timestamp) &&
          (to === undefined || to > timestamp),
      )
      .sort((eventA, eventB) =>
        eventA.timestamp <= eventB.timestamp ? -1 : 1,
      );

    // Pour events
    for (const event of nextEventsBatchToPour) {
      await messageChannel.publishMessage({
        eventStoreId,
        event,
      } as EventStoreNotificationMessage<EVENT_STORE>);

      pouredEventCount += 1;
    }

    // Reset batch of events to pour
    nextEventsBatchToPour = [];

    // Update state
    if (isFirstQuery) {
      startAggregateId = aggregateIds[0];
    }

    if (nextPageToken === undefined) {
      endAggregateId = aggregateIds[aggregateIds.length - 1];
    }

    pageToken = nextPageToken;
    isFirstQuery = false;
  }

  return {
    pouredEventCount,
    ...(startAggregateId !== undefined ? { startAggregateId } : {}),
    ...(endAggregateId !== undefined ? { endAggregateId } : {}),
  };
};
