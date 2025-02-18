/* eslint-disable max-lines */
import { vi } from 'vitest';

import { EventType, EventTypeDetail } from '~/event/eventType';
import { EventStorageAdapter } from '~/eventStorageAdapter';
import { EventStore } from '~/eventStore';

export const pushEventMock = vi.fn();
export const pushEventGroupMock = vi.fn();
export const groupEventMock = vi.fn();
export const getEventsMock = vi.fn();
export const listAggregateIdsMock = vi.fn();

export const eventStorageAdapterMock: EventStorageAdapter = {
  pushEvent: pushEventMock,
  pushEventGroup: pushEventGroupMock,
  groupEvent: groupEventMock,
  getEvents: getEventsMock,
  listAggregateIds: listAggregateIdsMock,
};

// Pokemons

export const pokemonAppearedEvent = new EventType<
  'POKEMON_APPEARED',
  { name: string; level: number }
>({ type: 'POKEMON_APPEARED' });

export const pokemonCaughtEvent = new EventType({
  type: 'POKEMON_CAUGHT',
});

export const pokemonLeveledUpEvent = new EventType({
  type: 'POKEMON_LEVELED_UP',
});

export type PokemonEventDetails =
  | EventTypeDetail<typeof pokemonAppearedEvent>
  | EventTypeDetail<typeof pokemonCaughtEvent>
  | EventTypeDetail<typeof pokemonLeveledUpEvent>;

export type PokemonAggregate = {
  aggregateId: string;
  version: number;
  name: string;
  level: number;
  status: 'wild' | 'caught';
};

export const pikachuId = 'pikachuId';
export const pikachuAppearedEvent: PokemonEventDetails = {
  aggregateId: pikachuId,
  version: 1,
  type: 'POKEMON_APPEARED',
  timestamp: '2022',
  payload: { name: 'Pikachu', level: 42 },
};
export const pikachuCaughtEvent: PokemonEventDetails = {
  aggregateId: pikachuId,
  version: 2,
  type: 'POKEMON_CAUGHT',
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
  pikachuCaughtEvent,
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
    case 'POKEMON_CAUGHT':
      return {
        ...pokemonAggregate,
        version,
        status: 'caught',
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
  eventTypes: [pokemonAppearedEvent, pokemonCaughtEvent, pokemonLeveledUpEvent],
  reducer: pokemonsReducer,
  eventStorageAdapter: eventStorageAdapterMock,
});

// With snapshots

export type PokemonAggregate2 = {
  aggregateId: string;
  version: number;
  name: string;
  power: number;
  status: 'wild' | 'caught';
};

export const pokemonsEventStoreAutoSnapshots = new EventStore({
  eventStoreId: 'POKEMONS_2',
  eventTypes: [pokemonAppearedEvent, pokemonCaughtEvent, pokemonLeveledUpEvent],
  snapshotMode: 'auto',
  autoSnapshotPeriodVersions: 10,
  reducer: pokemonsReducer,
  currentReducerVersion: 'v1',
  eventStorageAdapter: eventStorageAdapterMock,
});

export const pokemonsEventStoreCustomSnapshot = new EventStore({
  eventStoreId: 'POKEMONS_3',
  eventTypes: [pokemonAppearedEvent, pokemonCaughtEvent, pokemonLeveledUpEvent],
  snapshotMode: 'custom',
  reducers: {
    v1: pokemonsReducer,
    v2: (pokemonAggregate: PokemonAggregate2, event): PokemonAggregate2 => {
      const { version, aggregateId } = event;

      switch (event.type) {
        case 'POKEMON_APPEARED': {
          const { name, level } = event.payload;

          return {
            aggregateId,
            version: event.version,
            name,
            power: level,
            status: 'wild',
          };
        }
        case 'POKEMON_CAUGHT':
          return {
            ...pokemonAggregate,
            version,
            status: 'caught',
          };
        case 'POKEMON_LEVELED_UP':
          return {
            ...pokemonAggregate,
            version,
            power: pokemonAggregate.power + 1,
          };
      }
    },
  },
  currentReducerVersion: 'v2',
  eventStorageAdapter: eventStorageAdapterMock,
});
