import type { EventStoreEventDetails } from '@castore/core';
import {
  pokemonsEventStore,
  trainersEventStore,
} from '@castore/demo-blueprint';
import { mockEventStore } from '@castore/test-tools';

export const pokemonEvtStoreId = pokemonsEventStore.eventStoreId;
export const trainerEvtStoreId = trainersEventStore.eventStoreId;

// AGGREGATE IDS

export const pikachuId = 'pikachu1';
export const charizardId = 'charizard1';
export const arcanineId = 'arcanine1';

export const ashKetchumId = 'ashKetchum';
export const garyOakId = 'garyOak';

// POKEMON EVENTS

export const pikachuEvents: EventStoreEventDetails<
  typeof pokemonsEventStore
>[] = [
  {
    aggregateId: pikachuId,
    version: 1,
    type: 'APPEARED',
    timestamp: '2021-01-01T00:00:00.000Z',
    payload: { name: 'Pikachu', level: 2 },
    metadata: {},
  },
  {
    aggregateId: pikachuId,
    version: 2,
    type: 'CAUGHT_BY_TRAINER',
    timestamp: '2022-01-01T00:00:00.000Z',
    payload: { trainerId: ashKetchumId },
  },
  {
    aggregateId: pikachuId,
    version: 3,
    type: 'LEVELLED_UP',
    timestamp: '2023-07-01T00:00:00.000Z',
  },
];

export const charizardEvents: EventStoreEventDetails<
  typeof pokemonsEventStore
>[] = [
  {
    aggregateId: charizardId,
    version: 1,
    type: 'APPEARED',
    timestamp: '2022-07-01T00:00:00.000Z',
    payload: { name: 'Charizard', level: 99 },
    metadata: {},
  },
];

export const arcanineEvents: EventStoreEventDetails<
  typeof pokemonsEventStore
>[] = [
  {
    aggregateId: arcanineId,
    version: 1,
    type: 'APPEARED',
    timestamp: '2023-01-01T00:00:00.000Z',
    payload: { name: 'Pikachu', level: 3 },
    metadata: {},
  },
  {
    aggregateId: arcanineId,
    version: 2,
    type: 'CAUGHT_BY_TRAINER',
    timestamp: '2024-01-01T00:00:00.000Z',
    payload: { trainerId: garyOakId },
  },
];

// TRAINER EVENTS

export const ashKetchumEvents: EventStoreEventDetails<
  typeof trainersEventStore
>[] = [
  {
    aggregateId: ashKetchumId,
    version: 1,
    type: 'GAME_STARTED',
    timestamp: '2020-12-01T00:00:00.000Z',
    payload: { trainerName: 'Ash Ketchum' },
  },
  {
    aggregateId: ashKetchumId,
    version: 2,
    type: 'POKEMON_CAUGHT',
    timestamp: '2022-01-01T00:00:00.000Z',
    payload: { pokemonId: pikachuId },
  },
];

export const garyOakEvents: EventStoreEventDetails<
  typeof trainersEventStore
>[] = [
  {
    aggregateId: garyOakId,
    version: 1,
    type: 'GAME_STARTED',
    timestamp: '2022-12-01T00:00:00.000Z',
    payload: { trainerName: 'Gary Oak' },
  },
  {
    aggregateId: garyOakId,
    version: 2,
    type: 'POKEMON_CAUGHT',
    timestamp: '2024-01-01T00:00:00.000Z',
    payload: { pokemonId: arcanineId },
  },
];

// EVENT STORES

export const trainerEventStore = mockEventStore(trainersEventStore, [
  ...ashKetchumEvents,
  ...garyOakEvents,
]);

export const pokemonEventStore = mockEventStore(pokemonsEventStore, [
  ...pikachuEvents,
  ...charizardEvents,
  ...arcanineEvents,
]);
