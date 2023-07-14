import {
  EventDetail,
  EventStore,
  EventStoreEventsDetails,
} from '@castore/core';

export class EventBook<EVENT_STORE extends EventStore> {
  eventStore: EVENT_STORE;
  eventsByAggregateId: Record<string, EventDetail[]>;

  constructor(eventStore: EVENT_STORE) {
    this.eventStore = eventStore;
    this.eventsByAggregateId = {};
  }

  fetchAndBookAggregateEvents = async (
    aggregateIds: string[],
  ): Promise<void[]> =>
    Promise.all(
      aggregateIds.map(async aggregateId => {
        const { events } = await this.eventStore.getEvents(aggregateId);
        this.eventsByAggregateId[aggregateId] = events;
      }),
    );

  getBookedEvents = (
    aggregateId: string,
  ): EventStoreEventsDetails<EVENT_STORE>[] =>
    this.eventsByAggregateId[aggregateId] ?? [];

  getEventsToPour = ({
    areAllAggregatesScanned,
    fetchedEventsCursor,
    from,
    to,
  }: {
    areAllAggregatesScanned: boolean;
    fetchedEventsCursor: string;
    from?: string;
    to?: string;
  }): EventStoreEventsDetails<EVENT_STORE>[] => {
    const eventsToPour: EventStoreEventsDetails<EVENT_STORE>[] = [];

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

    return eventsToPour
      .filter(
        ({ timestamp }) =>
          (from === undefined || from <= timestamp) &&
          (to === undefined || to >= timestamp),
      )
      .sort((eventA, eventB) =>
        eventA.timestamp <= eventB.timestamp ? -1 : 1,
      );
  };
}
