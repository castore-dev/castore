import { EventDetail } from 'event/eventDetail';

export type EventsQueryOptions = { maxVersion?: number };
export type PushEventContext = { eventStoreId?: string };
export type PushEventTransactionContext = { eventStoreId?: string };

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

  constructor({
    getEvents,
    pushEvent,
    pushEventTransaction,
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
  }) {
    this.getEvents = getEvents;
    this.pushEvent = pushEvent;
    this.pushEventTransaction = pushEventTransaction;
  }
}
