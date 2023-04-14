import type { Aggregate } from '~/aggregate';
import type { StorageAdapter } from '~/storageAdapter';

import type { EventDetail } from './eventDetail';

export class GroupedEvent<
  EVENT_DETAILS extends EventDetail = EventDetail,
  AGGREGATE extends Aggregate = Aggregate,
> {
  event: EVENT_DETAILS extends infer EVENT_DETAIL
    ? Omit<EVENT_DETAIL, 'timestamp'>
    : never;
  eventStorageAdapter: StorageAdapter;
  context?: unknown;
  prevAggregate?: AGGREGATE;

  constructor({
    event,
    eventStorageAdapter,
    context,
  }: {
    event: EVENT_DETAILS extends infer EVENT_DETAIL
      ? Omit<EVENT_DETAIL, 'timestamp'>
      : never;
    eventStorageAdapter: StorageAdapter;
    context?: unknown;
  }) {
    this.event = event;
    this.eventStorageAdapter = eventStorageAdapter;

    if (context !== undefined) {
      this.context = context;
    }
  }
}
