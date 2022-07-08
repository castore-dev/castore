import intersectionBy from 'lodash/intersectionBy';

import {
  EventAlreadyExistsError,
  EventDetail,
  EventsQueryOptions,
  PushEventContext,
  PushEventTransactionContext,
  StorageAdapter,
} from '@castore/event-store';

export class InMemoryStorageAdapter implements StorageAdapter {
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
  listAggregateIds: () => Promise<{ aggregateIds: string[] }>;

  eventStore: { [aggregateId: string]: EventDetail[] };

  constructor() {
    this.eventStore = {};

    // eslint-disable-next-line @typescript-eslint/require-await
    this.pushEvent = async (event, context) => {
      const { aggregateId, version } = event;
      const events = this.eventStore[aggregateId];
      if (intersectionBy(events, [event], 'version').length > 0) {
        const { eventStoreId } = context;

        throw new EventAlreadyExistsError({
          eventStoreId,
          aggregateId,
          version,
        });
      }
      aggregateId in this.eventStore
        ? this.eventStore[aggregateId].push(event)
        : (this.eventStore[aggregateId] = [event]);
    };

    // eslint-disable-next-line @typescript-eslint/require-await
    this.getEvents = async aggregateId => {
      const events =
        aggregateId in this.eventStore ? this.eventStore[aggregateId] : [];

      return { events };
    };

    // eslint-disable-next-line @typescript-eslint/require-await
    this.pushEventTransaction = async event => {
      console.log(event);
    };

    // eslint-disable-next-line @typescript-eslint/require-await
    this.listAggregateIds = async () => {
      const aggregateIds = Object.entries(this.eventStore)
        .map(([aggregateId, events]) => ({
          aggregateId,
          timestamp: events[0].timestamp,
        }))
        .sort(({ timestamp: timestamp1 }, { timestamp: timestamp2 }) =>
          timestamp1 > timestamp2 ? 1 : -1,
        )
        .map(({ aggregateId }) => aggregateId);

      return {
        aggregateIds,
      };
    };
  }
}
