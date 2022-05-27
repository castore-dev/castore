import { EventDetail } from 'event/eventDetail';

export type EventsQueryOptions = { maxVersion?: number };

export class StorageAdapter {
  pushEvent: (eventDetail: EventDetail) => Promise<void>;
  getEvents: (
    aggregateId: string,
    options?: EventsQueryOptions,
  ) => Promise<EventDetail[]>;
  pushEventTransaction: (eventDetail: EventDetail) => unknown;

  constructor({
    pushEvent,
    getEvents,
    pushEventTransaction,
  }: {
    pushEvent: (eventDetail: EventDetail) => Promise<void>;
    getEvents: (
      aggregateId: string,
      options?: EventsQueryOptions,
    ) => Promise<EventDetail[]>;
    pushEventTransaction: (eventDetail: EventDetail) => unknown;
  }) {
    this.getEvents = getEvents;
    this.pushEvent = pushEvent;
    this.pushEventTransaction = pushEventTransaction;
  }
}
