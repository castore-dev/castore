import { EventStoreEventsDetails } from '@castore/core';

import { pokemonsEventStore } from './eventStore';

export const pikachuId = 'pikachu-id';

export const pikachuAppearedEvent: EventStoreEventsDetails<
  typeof pokemonsEventStore
> = {
  aggregateId: pikachuId,
  version: 1,
  type: 'APPEARED',
  timestamp: '2022-01-01T00:00:00.000Z',
  payload: {
    name: 'Pikachu',
    level: 7,
  },
  metadata: {
    trigger: 'random',
  },
};

export const pikachuCaughtEvent: EventStoreEventsDetails<
  typeof pokemonsEventStore
> = {
  aggregateId: pikachuId,
  version: 2,
  type: 'CAUGHT_BY_TRAINER',
  timestamp: '2023-01-01T00:00:00.000Z',
  payload: {
    trainerId: 'ash-ketchum-id',
  },
};

export const pikachuLevelledUpEvent: EventStoreEventsDetails<
  typeof pokemonsEventStore
> = {
  aggregateId: pikachuId,
  version: 3,
  type: 'LEVELLED_UP',
  timestamp: '2024-01-01T00:00:00.000Z',
};

export const pikachuEvents = [
  pikachuAppearedEvent,
  pikachuCaughtEvent,
  pikachuLevelledUpEvent,
];
