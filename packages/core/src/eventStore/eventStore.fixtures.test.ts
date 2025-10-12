import { vi } from 'vitest';

import { OptionalTimestamp, EventDetail } from '~/event/eventDetail';
import { EventType, EventTypeDetail } from '~/event/eventType';
import { GroupedEvent } from '~/event/groupedEvent';
import { EventStorageAdapter } from '~/eventStorageAdapter';
import { EventStore } from '~/eventStore';
import {
  cleanUpLastSnapshot,
  createShouldSaveForRecurentSnapshots,
  SnapshotStorageAdapter,
} from '~/snapshot';

export const pushEventMock = vi.fn();
export const pushEventGroupMock = vi.fn();
export const groupEventMock = vi.fn(
  (event: OptionalTimestamp<EventDetail>) =>
    new GroupedEvent({ event, eventStorageAdapter: eventStorageAdapterMock }),
);
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
export const getPikachuLeveledUpEvent = (
  version: number,
): PokemonEventDetails => ({
  aggregateId: pikachuId,
  version,
  type: 'POKEMON_LEVELED_UP',
  timestamp: '2024',
});
export const pikachuLeveledUpEvent = getPikachuLeveledUpEvent(3);

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

export const getSnapshotMock = vi.fn();
export const saveSnapshotMock = vi.fn();
export const deleteSnapshotMock = vi.fn();

export const snapshotStorageAdapter: SnapshotStorageAdapter = {
  getSnapshot: getSnapshotMock,
  saveSnapshot: saveSnapshotMock,
  deleteSnapshot: deleteSnapshotMock,
};

export const pikachuMultipleLevelUpEvents1Mocks = [
  getPikachuLeveledUpEvent(4),
  getPikachuLeveledUpEvent(5),
];
export const pikachuMultipleLevelUpEvents2Mocks = [
  getPikachuLeveledUpEvent(6),
  getPikachuLeveledUpEvent(7),
  getPikachuLeveledUpEvent(8),
  getPikachuLeveledUpEvent(9),
  getPikachuLeveledUpEvent(10),
];
export const pikachuCompleteEventsMocks = [
  ...pikachuEventsMocks,
  ...pikachuMultipleLevelUpEvents1Mocks,
  ...pikachuMultipleLevelUpEvents2Mocks,
];

export const snapshotV5 = {
  aggregate: {
    aggregateId: pikachuId,
    version: 5,
    name: 'Pikachu',
    level: 45,
    status: 'caught',
  },
  reducerVersion: 'v1.0.0',
  eventStoreId: 'POKEMONS',
};

export const snapshotV10 = {
  aggregate: {
    aggregateId: pikachuId,
    version: 10,
    name: 'Pikachu',
    level: 50,
    status: 'caught',
  },
  reducerVersion: 'v1.0.0',
  eventStoreId: 'POKEMONS',
};

export const pokemonsEventStoreWithSnapshot = new EventStore({
  eventStoreId: 'POKEMONS',
  eventTypes: [pokemonAppearedEvent, pokemonCaughtEvent, pokemonLeveledUpEvent],
  reducer: pokemonsReducer,
  eventStorageAdapter: eventStorageAdapterMock,
  snapshotConfig: {
    currentReducerVersion: 'v1.0.0',
    shouldSaveSnapshot: createShouldSaveForRecurentSnapshots(5),
    cleanUpAfterSnapshotSave: cleanUpLastSnapshot,
  },
  snapshotStorageAdapter,
});
