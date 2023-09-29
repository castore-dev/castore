import type {
  EventDetail,
  EventStore,
  EventStoreEventDetails,
  EventStoreNotificationMessage,
} from '@castore/core';

import { MessageBatch } from './messageBatch';

export class EventBook<EVENT_STORE extends EventStore> {
  eventStore: EVENT_STORE;
  eventsByAggregateId: Record<string, EventDetail[]>;

  constructor(eventStore: EVENT_STORE) {
    this.eventStore = eventStore;
    this.eventsByAggregateId = {};
  }

  feedAggregateEvents = async (aggregateIds: string[]): Promise<void[]> =>
    Promise.all(
      aggregateIds.map(async aggregateId => {
        const { events } = await this.eventStore.getEvents(aggregateId);
        this.eventsByAggregateId[aggregateId] = events;
      }),
    );

  getBookedEvents = (
    aggregateId: string,
  ): EventStoreEventDetails<EVENT_STORE>[] =>
    this.eventsByAggregateId[aggregateId] ?? [];

  getMessagesToPour = ({
    areAllAggregatesScanned,
    fetchedEventsCursor,
  }: {
    areAllAggregatesScanned: boolean;
    fetchedEventsCursor: string;
  }): MessageBatch<EVENT_STORE> => {
    const eventsToPour: EventStoreEventDetails<EVENT_STORE>[] = [];

    for (const aggregateId in this.eventsByAggregateId) {
      const aggregateEvents = this.getBookedEvents(aggregateId);

      while (
        aggregateEvents[0] &&
        (areAllAggregatesScanned ||
          aggregateEvents[0].timestamp <= fetchedEventsCursor)
      ) {
        eventsToPour.push(aggregateEvents.shift() as EventDetail);
      }

      if (aggregateEvents.length === 0) {
        delete this.eventsByAggregateId[aggregateId];
      }
    }

    return new MessageBatch(
      eventsToPour.map(
        event =>
          ({
            eventStoreId: this.eventStore.eventStoreId,
            event,
          } as EventStoreNotificationMessage<EVENT_STORE>),
      ),
    );
  };
}
