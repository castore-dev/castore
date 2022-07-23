import { EventDetail } from 'event/eventDetail';

export type EventsQueryOptions = { maxVersion?: number };
export type PushEventContext = { eventStoreId?: string };
export type PushEventTransactionContext = { eventStoreId?: string };

export type ListAggregateIdsOptions = {
  limit?: number;
  pageToken?: string;
};

export type ListAggregateIdsOutput = {
  aggregateIds: string[];
  nextPageToken?: string;
};

export class StorageAdapter {
  getEvents: (
    aggregateId: string,
    options?: EventsQueryOptions,
  ) => Promise<{ events: EventDetail[] }>;
  pushEvent: (
    eventDetail: EventDetail,
    context: PushEventContext,
  ) => Promise<void>;
  pushEventTransaction: (
    eventDetail: EventDetail,
    context: PushEventTransactionContext,
  ) => unknown;
  listAggregateIds: (
    options?: ListAggregateIdsOptions,
  ) => Promise<ListAggregateIdsOutput>;

  constructor({
    getEvents,
    pushEvent,
    pushEventTransaction,
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
    pushEventTransaction: (
      eventDetail: EventDetail,
      context: PushEventTransactionContext,
    ) => unknown;
    listAggregateIds: (
      options?: ListAggregateIdsOptions,
    ) => Promise<ListAggregateIdsOutput>;
  }) {
    this.getEvents = getEvents;
    this.pushEvent = pushEvent;
    this.pushEventTransaction = pushEventTransaction;
    this.listAggregateIds = listAggregateIds;
  }
}
