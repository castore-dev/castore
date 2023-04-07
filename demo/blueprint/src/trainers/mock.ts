import { EventStoreEventsDetails } from '@castore/core';

import { trainersEventStore } from './eventStore';

export const ashId = 'ash-ketchum-id';

export const ashPokemonGameStartedEvent: EventStoreEventsDetails<
  typeof trainersEventStore
> = {
  aggregateId: ashId,
  version: 1,
  type: 'GAME_STARTED',
  timestamp: '2022-01-01T00:00:00.000Z',
  payload: {
    trainerName: 'Ash Ketchum',
  },
};

export const ashPokemonCatchedEvent: EventStoreEventsDetails<
  typeof trainersEventStore
> = {
  aggregateId: ashId,
  version: 2,
  type: 'POKEMON_CATCHED',
  timestamp: '2023-01-01T00:00:00.000Z',
  payload: {
    pokemonId: 'pikachu-id',
  },
};

export const ashEvents = [ashPokemonGameStartedEvent, ashPokemonCatchedEvent];
