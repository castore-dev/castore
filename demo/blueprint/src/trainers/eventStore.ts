import { EventStore } from '@castore/core';

import type { TrainerAggregate } from './aggregate';
import { gameStartedEvent, pokemonCaughtEvent } from './events';

export const trainersEventStore = new EventStore({
  eventStoreId: 'TRAINERS',
  eventStoreEvents: [gameStartedEvent, pokemonCaughtEvent],
  reduce: (trainerAggregate: TrainerAggregate, event): TrainerAggregate => {
    const { version, aggregateId } = event;

    switch (event.type) {
      case 'GAME_STARTED': {
        const { trainerName } = event.payload;

        return {
          aggregateId,
          version: event.version,
          name: trainerName,
          caughtPokemonIds: [],
          caughtPokemonsCount: 0,
        };
      }
      case 'POKEMON_CAUGHT': {
        const { pokemonId } = event.payload;

        return {
          ...trainerAggregate,
          version,
          caughtPokemonIds: [...trainerAggregate.caughtPokemonIds, pokemonId],
          caughtPokemonsCount: trainerAggregate.caughtPokemonsCount + 1,
        };
      }
    }
  },
});
