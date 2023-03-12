import type { Aggregate } from '~/aggregate';
import type { EventDetail } from '~/event/eventDetail';
import type {
  EventStore,
  EventStoreId,
  EventStoreEventsDetails,
  EventStoreAggregate,
} from '~/eventStore';

export type NotificationMessage<
  EVENT_STORE_ID extends string = string,
  EVENT_DETAILS extends EventDetail = EventDetail,
> = EVENT_DETAILS extends infer EVENT_DETAIL
  ? EVENT_DETAIL extends EventDetail
    ? {
        eventStoreId: EVENT_STORE_ID;
        event: EVENT_DETAIL;
      }
    : never
  : never;

export type StateCarryingMessage<
  EVENT_STORE_ID extends string = string,
  EVENT_DETAILS extends EventDetail = EventDetail,
  AGGREGATE extends Aggregate = Aggregate,
> = EVENT_DETAILS extends infer EVENT_DETAIL
  ? EVENT_DETAIL extends EventDetail
    ? {
        eventStoreId: EVENT_STORE_ID;
        event: EVENT_DETAIL;
        aggregate: AGGREGATE;
      }
    : never
  : never;

export type Message = NotificationMessage | StateCarryingMessage;

export type EventStoreNotificationMessage<EVENT_STORES extends EventStore> =
  EVENT_STORES extends infer EVENT_STORE
    ? EVENT_STORE extends EventStore
      ? NotificationMessage<
          EventStoreId<EVENT_STORE>,
          EventStoreEventsDetails<EVENT_STORE>
        >
      : never
    : never;

export type EventStoreStateCarryingMessage<EVENT_STORES extends EventStore> =
  EVENT_STORES extends infer EVENT_STORE
    ? EVENT_STORE extends EventStore
      ? StateCarryingMessage<
          EventStoreId<EVENT_STORE>,
          EventStoreEventsDetails<EVENT_STORE>,
          EventStoreAggregate<EVENT_STORE>
        >
      : never
    : never;
