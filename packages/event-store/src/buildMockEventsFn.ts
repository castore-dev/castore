import { O } from 'ts-toolbelt';

import { EventDetail } from './event/eventDetail';
import { EventStore } from './eventStore';

export const buildMockEventsFn =
  <S extends EventStore>(
    aggregateIdMock: string,
  ): ((
    ...partialDetails: (S['_types']['details'] extends infer U
      ? U extends EventDetail
        ? O.Optional<U, 'aggregateId'>
        : never
      : never)[]
  ) => S['_types']['details'][]) =>
  (
    ...partialEvents: (S['_types']['details'] extends infer U
      ? U extends EventDetail
        ? O.Optional<U, 'aggregateId'>
        : never
      : never)[]
  ): S['_types']['details'][] =>
    partialEvents.map(partialEvent =>
      Object.assign({ aggregateId: aggregateIdMock }, partialEvent),
    );
