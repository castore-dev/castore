import intersectionBy from 'lodash/intersectionBy';

import {
  EventAlreadyExistsError,
  EventDetail,
  EventsQueryOptions,
  PushEventContext,
  PushEventTransactionContext,
  StorageAdapter,
} from '@castore/core';

const getInitialEventTimestamp = (
  aggregateId: string,
  events: EventDetail[],
) => {
  const initialEventTimestamp = events[0]?.timestamp;

  if (initialEventTimestamp === undefined) {
    throw new Error(
      `Unable to find initial timestamp for aggregate ${aggregateId}`,
    );
  }

  return initialEventTimestamp;
};

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

      const aggregateEvents = this.eventStore[aggregateId];

      if (aggregateEvents === undefined) {
        this.eventStore[aggregateId] = [event];

        return;
      }

      aggregateEvents.push(event);
    };

    // eslint-disable-next-line @typescript-eslint/require-await
    this.getEvents = async aggregateId => ({
      events: this.eventStore[aggregateId] ?? [],
    });

    // eslint-disable-next-line @typescript-eslint/require-await
    this.pushEventTransaction = async event => {
      console.log(event);
    };

    // eslint-disable-next-line @typescript-eslint/require-await
    this.listAggregateIds = async () => {
      const aggregateIds = Object.entries(this.eventStore)
        .sort((entryA, entryB) => {
          const initialEventATimestamp = getInitialEventTimestamp(...entryA);
          const initialEventBTimestamp = getInitialEventTimestamp(...entryB);

          return initialEventATimestamp > initialEventBTimestamp ? 1 : -1;
        })
        .map(([aggregateId]) => aggregateId);

      return {
        aggregateIds,
      };
    };
  }
}
