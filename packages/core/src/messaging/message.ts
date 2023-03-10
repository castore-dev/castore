import type { Aggregate } from '~/aggregate';
import type { EventDetail } from '~/event/eventDetail';
import type {
  EventStore,
  EventStoreId,
  EventStoreEventsDetails,
  EventStoreAggregate,
} from '~/eventStore';

export type NotificationMessage<
  I extends string = string,
  E extends EventDetail = EventDetail,
> = E extends infer U
  ? U extends EventDetail
    ? {
        eventStoreId: I;
        event: U;
      }
    : never
  : never;

export type StateCarryingMessage<
  I extends string = string,
  E extends EventDetail = EventDetail,
  A extends Aggregate = Aggregate,
> = E extends infer U
  ? U extends EventDetail
    ? {
        eventStoreId: I;
        event: U;
        aggregate: A;
      }
    : never
  : never;

export type Message = NotificationMessage | StateCarryingMessage;

export type EventStoreNotificationMessage<E extends EventStore> =
  E extends infer M
    ? M extends EventStore
      ? NotificationMessage<EventStoreId<E>, EventStoreEventsDetails<E>>
      : never
    : never;

export type EventStoreStateCarryingMessage<E extends EventStore> =
  E extends infer M
    ? M extends EventStore
      ? StateCarryingMessage<
          EventStoreId<E>,
          EventStoreEventsDetails<E>,
          EventStoreAggregate<E>
        >
      : never
    : never;
