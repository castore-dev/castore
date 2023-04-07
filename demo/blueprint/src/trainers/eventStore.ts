import { EventStore } from '@castore/core';

import type { TrainerAggregate } from './aggregate';
import { gameStartedEvent, pokemonCatchedEvent } from './events';

export const trainersEventStore = new EventStore({
  eventStoreId: 'TRAINERS',
  eventStoreEvents: [gameStartedEvent, pokemonCatchedEvent],
  reduce: (trainerAggregate: TrainerAggregate, event): TrainerAggregate => {
    const { version, aggregateId } = event;

    switch (event.type) {
      case 'GAME_STARTED': {
        const { trainerName } = event.payload;

        return {
          aggregateId,
          version: event.version,
          name: trainerName,
          catchedPokemonIds: [],
          catchedPokemonsCount: 0,
        };
      }
      case 'POKEMON_CATCHED': {
        const { pokemonId } = event.payload;

        return {
          ...trainerAggregate,
          version,
          catchedPokemonIds: [...trainerAggregate.catchedPokemonIds, pokemonId],
          catchedPokemonsCount: trainerAggregate.catchedPokemonsCount + 1,
        };
      }
    }
  },
});
