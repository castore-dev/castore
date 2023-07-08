import type { EventStoreEventsDetails } from '@castore/core';
import { pokemonsEventStore } from '@castore/demo-blueprint';
import { mockEventStore } from '@castore/test-tools';

export const eventStoreId = pokemonsEventStore.eventStoreId;

export const aggregate1Id = 'pikachu1';
export const aggregate2Id = 'charizard1';
export const aggregate3Id = 'pikachu2';

export const aggregate1Events: EventStoreEventsDetails<
  typeof pokemonsEventStore
>[] = [
  {
    aggregateId: aggregate1Id,
    version: 1,
    type: 'APPEARED',
    timestamp: '2021-01-01T00:00:00.000Z',
    payload: { name: 'Pikachu', level: 2 },
    metadata: {},
  },
  {
    aggregateId: aggregate1Id,
    version: 2,
    type: 'CAUGHT_BY_TRAINER',
    timestamp: '2022-01-01T00:00:00.000Z',
    payload: { trainerId: 'ashKetchum' },
  },
  {
    aggregateId: aggregate1Id,
    version: 3,
    type: 'LEVELLED_UP',
    timestamp: '2023-07-01T00:00:00.000Z',
  },
];

export const aggregate2Events: EventStoreEventsDetails<
  typeof pokemonsEventStore
>[] = [
  {
    aggregateId: aggregate2Id,
    version: 1,
    type: 'APPEARED',
    timestamp: '2022-07-01T00:00:00.000Z',
    payload: { name: 'Charizard', level: 99 },
    metadata: {},
  },
];

export const aggregate3Events: EventStoreEventsDetails<
  typeof pokemonsEventStore
>[] = [
  {
    aggregateId: aggregate3Id,
    version: 1,
    type: 'APPEARED',
    timestamp: '2023-01-01T00:00:00.000Z',
    payload: { name: 'Pikachu', level: 3 },
    metadata: {},
  },
];

export const mockedEventStore = mockEventStore(pokemonsEventStore, [
  ...aggregate1Events,
  ...aggregate2Events,
  ...aggregate3Events,
]);
