import type { EventStore } from '~/eventStore/eventStore';
import type {
  EventStoreAggregate,
  EventStoreEventsDetails,
  EventStoreId,
} from '~/eventStore/generics';

export type StateCarryingMessage<E extends EventStore = EventStore> =
  E extends infer M
    ? M extends EventStore
      ? EventStoreEventsDetails<M> & {
          eventStoreId: EventStoreId<M>;
          aggregate: EventStoreAggregate<M>;
        }
      : never
    : never;
