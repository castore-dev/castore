/* eslint-disable max-lines */
import { vi } from 'vitest';

import { EventType, EventTypeDetail } from '~/event/eventType';
import { EventStore } from '~/eventStore';
import { StorageAdapter } from '~/storageAdapter';

export const pushEventMock = vi.fn();
export const getEventsMock = vi.fn();
export const listAggregateIdsMock = vi.fn();
export const putSnapshotMock = vi.fn();
export const getLastSnapshotMock = vi.fn();
export const listSnapshotsMock = vi.fn();

export const storageAdapterMock: StorageAdapter = {
  pushEvent: pushEventMock,
  getEvents: getEventsMock,
  listAggregateIds: listAggregateIdsMock,
  putSnapshot: putSnapshotMock,
  getLastSnapshot: getLastSnapshotMock,
  listSnapshots: listSnapshotsMock,
};

// Pokemons

export const pokemonAppearedEvent = new EventType<
  'POKEMON_APPEARED',
  { name: string; level: number }
>({ type: 'POKEMON_APPEARED' });

export const pokemonCatchedEvent = new EventType({
  type: 'POKEMON_CATCHED',
});

export const pokemonLeveledUpEvent = new EventType({
  type: 'POKEMON_LEVELED_UP',
});

export type PokemonEventDetails =
  | EventTypeDetail<typeof pokemonAppearedEvent>
  | EventTypeDetail<typeof pokemonCatchedEvent>
  | EventTypeDetail<typeof pokemonLeveledUpEvent>;

export type PokemonAggregate = {
  aggregateId: string;
  version: number;
  name: string;
  level: number;
  status: 'wild' | 'catched';
};

export const pikachuId = 'pikachuId';
export const pikachuAppearedEvent: PokemonEventDetails = {
  aggregateId: pikachuId,
  version: 1,
  type: 'POKEMON_APPEARED',
  timestamp: '2022',
  payload: { name: 'Pikachu', level: 42 },
};
export const pikachuCatchedEvent: PokemonEventDetails = {
  aggregateId: pikachuId,
  version: 2,
  type: 'POKEMON_CATCHED',
  timestamp: '2023',
};
export const pikachuLeveledUpEvent: PokemonEventDetails = {
  aggregateId: pikachuId,
  version: 3,
  type: 'POKEMON_LEVELED_UP',
  timestamp: '2024',
};
export const pikachuEventsMocks = [
  pikachuAppearedEvent,
  pikachuCatchedEvent,
  pikachuLeveledUpEvent,
];

export const pokemonsReducer = (
  pokemonAggregate: PokemonAggregate,
  event: PokemonEventDetails,
): PokemonAggregate => {
  const { version, aggregateId } = event;

  switch (event.type) {
    case 'POKEMON_APPEARED': {
      const { name, level } = event.payload;

      return {
        aggregateId,
        version: event.version,
        name,
        level,
        status: 'wild',
      };
    }
    case 'POKEMON_CATCHED':
      return {
        ...pokemonAggregate,
        version,
        status: 'catched',
      };
    case 'POKEMON_LEVELED_UP':
      return {
        ...pokemonAggregate,
        version,
        level: pokemonAggregate.level + 1,
      };
  }
};

export const pokemonsEventStore = new EventStore({
  eventStoreId: 'POKEMONS',
  eventStoreEvents: [
    pokemonAppearedEvent,
    pokemonCatchedEvent,
    pokemonLeveledUpEvent,
  ],
  reduce: pokemonsReducer,
  storageAdapter: storageAdapterMock,
});
