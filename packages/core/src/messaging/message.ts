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
> = {
  eventStoreId: I;
  event: E;
};

export type StateCarryingMessage<
  I extends string = string,
  E extends EventDetail = EventDetail,
  A extends Aggregate = Aggregate,
> = {
  eventStoreId: I;
  event: E;
  aggregate: A;
};

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
