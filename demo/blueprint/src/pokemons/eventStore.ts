import { EventStore } from '@castore/core';

import type { PokemonAggregate } from './aggregate';
import { appearedEvent, caughtByTrainerEvent, levelledUpEvent } from './events';

export const pokemonsEventStore = new EventStore({
  eventStoreId: 'POKEMONS',
  eventTypes: [appearedEvent, caughtByTrainerEvent, levelledUpEvent],
  reducer: (pokemonAggregate: PokemonAggregate, event): PokemonAggregate => {
    const { version, aggregateId } = event;

    switch (event.type) {
      case 'APPEARED': {
        const { name, level } = event.payload;

        return {
          aggregateId,
          version: event.version,
          name,
          level,
          status: 'wild',
        };
      }
      case 'CAUGHT_BY_TRAINER': {
        const { trainerId } = event.payload;

        return {
          ...pokemonAggregate,
          version,
          status: 'caught',
          trainerId,
        };
      }
      case 'LEVELLED_UP':
        return {
          ...pokemonAggregate,
          version,
          level: pokemonAggregate.level + 1,
        };
    }
  },
});
