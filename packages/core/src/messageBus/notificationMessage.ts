import type { EventStore } from '~/eventStore/eventStore';
import type {
  EventStoreEventsDetails,
  EventStoreId,
} from '~/eventStore/generics';

export type NotificationMessage<E extends EventStore = EventStore> =
  E extends infer M
    ? M extends EventStore
      ? EventStoreEventsDetails<M> & { eventStoreId: EventStoreId<M> }
      : never
    : never;
