import { EventDetail } from 'event/eventDetail';

export type EventsQueryOptions = { maxVersion?: number };
export type PushEventContext = { eventStoreId?: string };

export type ListAggregateIdsOptions = {
  limit?: number;
  pageToken?: string;
};

export type ListAggregateIdsOutput = {
  aggregateIds: string[];
  nextPageToken?: string;
};

/**
 * @name StorageAdapter
 * @description Base class for all implementations of storage adapters.
 * Defines the default interfaces of the storage adapters.
 */
export class StorageAdapter {
  /**
   * @name getEvents
   * @description Get a list of all events with the same aggregateId.
   * @param aggregateId - The ID of the aggregate to get events for.
   * @param options - Options to filter the events.
   * @param options.maxVersion - Retrieve all events with version < maxVersion.
   * @returns An object containing the list of events.
   */
  getEvents: (
    aggregateId: string,
    options?: EventsQueryOptions,
  ) => Promise<{ events: EventDetail[] }>;
  /**
   * @name pushEvent
   * @description Asynchronously pushes a new event to the event store.
   * @param eventDetail - Details of the event to push. Strongly typed according to eventStoreEvents the EventStore has been instantiated with.
   * @returns void
   */
  pushEvent: (
    eventDetail: EventDetail,
    context: PushEventContext,
  ) => Promise<void>;
  /**
   * @name listAggregateIds
   * @description Asynchronously lists all aggregateIds in the event store.
   * @param listAggregateOptions - listAggregateIds options
   * @param listAggregateOptions.limit - maximum number of aggregateIds to return per page
   * @param listAggregateOptions.pageToken - token to access next page of aggregateIds
   * @returns void
   */
  listAggregateIds: (
    options?: ListAggregateIdsOptions,
  ) => Promise<ListAggregateIdsOutput>;

  constructor({
    getEvents,
    pushEvent,
    listAggregateIds,
  }: {
    getEvents: (
      aggregateId: string,
      options?: EventsQueryOptions,
    ) => Promise<{ events: EventDetail[] }>;
    pushEvent: (
      eventDetail: EventDetail,
      context: PushEventContext,
    ) => Promise<void>;
    listAggregateIds: (
      options?: ListAggregateIdsOptions,
    ) => Promise<ListAggregateIdsOutput>;
  }) {
    this.getEvents = getEvents;
    this.pushEvent = pushEvent;
    this.listAggregateIds = listAggregateIds;
  }
}
