import intersectionBy from 'lodash/intersectionBy';

import { EventDetail } from 'event/eventDetail';

import { EventAlreadyExistsError } from '../../errors/eventAlreadyExists';
import {
  EventsQueryOptions,
  PushEventContext,
  PushEventTransactionContext,
  StorageAdapter,
} from '../storageAdapter';

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
  }
}
