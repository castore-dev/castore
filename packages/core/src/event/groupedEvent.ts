import type { Aggregate } from '~/aggregate';
import type { EventStore } from '~/eventStore/eventStore';
import type { StorageAdapter, PushEventContext } from '~/storageAdapter';

import type { EventDetail, OmitTimestamp } from './eventDetail';

export class GroupedEvent<
  EVENT_DETAILS extends EventDetail = EventDetail,
  AGGREGATE extends Aggregate = Aggregate,
> {
  _types?: {
    details: EVENT_DETAILS;
    aggregate: AGGREGATE;
  };
  event: OmitTimestamp<EVENT_DETAILS>;
  context?: PushEventContext;
  prevAggregate?: AGGREGATE;

  eventStorageAdapter: StorageAdapter;
  eventStore?: EventStore;

  constructor({
    event,
    context,
    prevAggregate,
    eventStorageAdapter,
    eventStore,
  }: {
    event: OmitTimestamp<EVENT_DETAILS>;
    context?: PushEventContext;
    prevAggregate?: AGGREGATE;
    eventStore?: EventStore;
    eventStorageAdapter: StorageAdapter;
  }) {
    this.event = event;
    if (context !== undefined) {
      this.context = context;
    }
    if (prevAggregate !== undefined) {
      this.prevAggregate = prevAggregate;
    }

    this.eventStorageAdapter = eventStorageAdapter;
    if (eventStore !== undefined) {
      this.eventStore = eventStore;
    }
  }
}
