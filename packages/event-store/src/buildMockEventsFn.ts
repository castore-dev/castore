import { O } from 'ts-toolbelt';

import { EventDetail } from './event/eventDetail';
import { EventStore, EventStoreEventsDetails } from './eventStore';

export const buildMockEventsFn =
  <S extends EventStore>(
    aggregateIdMock: string,
  ): ((
    ...partialDetails: (EventStoreEventsDetails<S> extends infer U
      ? U extends EventDetail
        ? O.Optional<U, 'aggregateId'>
        : never
      : never)[]
  ) => EventStoreEventsDetails<S>[]) =>
  (
    ...partialEvents: (EventStoreEventsDetails<S> extends infer U
      ? U extends EventDetail
        ? O.Optional<U, 'aggregateId'>
        : never
      : never)[]
  ): EventStoreEventsDetails<S>[] =>
    partialEvents.map(partialEvent =>
      Object.assign({ aggregateId: aggregateIdMock }, partialEvent),
    );
