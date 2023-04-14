import type { Aggregate } from '~/aggregate';

import type { EventDetail } from './eventDetail';

export class GroupedEvent<
  EVENT_DETAILS extends EventDetail = EventDetail,
  AGGREGATE extends Aggregate = Aggregate,
> {
  event: EVENT_DETAILS extends infer EVENT_DETAIL
    ? Omit<EVENT_DETAIL, 'timestamp'>
    : never;
  context?: unknown;
  prevAggregate?: AGGREGATE;

  constructor({
    event,
    context,
  }: {
    event: EVENT_DETAILS extends infer EVENT_DETAIL
      ? Omit<EVENT_DETAIL, 'timestamp'>
      : never;
    context?: unknown;
  }) {
    this.event = event;

    if (context !== undefined) {
      this.context = context;
    }
  }
}
