import type { Aggregate } from '~/aggregate';
import type { EventDetail } from '~/event/eventDetail';

export type AggregateExistsMessage<EVENT_STORE_ID extends string = string> = {
  eventStoreId: EVENT_STORE_ID;
  aggregateId: string;
};

export type NotificationMessage<
  EVENT_STORE_ID extends string = string,
  EVENT_DETAIL extends EventDetail = EventDetail,
> = {
  eventStoreId: EVENT_STORE_ID;
  event: EVENT_DETAIL;
};

export type StateCarryingMessage<
  EVENT_STORE_ID extends string = string,
  EVENT_DETAIL extends EventDetail = EventDetail,
  AGGREGATE extends Aggregate = Aggregate,
> = {
  eventStoreId: EVENT_STORE_ID;
  event: EVENT_DETAIL;
  aggregate: AGGREGATE;
};

export type Message =
  | AggregateExistsMessage
  | NotificationMessage
  | StateCarryingMessage;
