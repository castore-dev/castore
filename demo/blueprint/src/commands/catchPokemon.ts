import { tuple } from '@castore/core';
import { JSONSchemaCommand } from '@castore/json-schema-command';

import { pokemonsEventStore } from '~/pokemons';
import { trainersEventStore } from '~/trainers';

export const catchPokemonCommand = new JSONSchemaCommand({
  commandId: 'CATCH_POKEMON',
  requiredEventStores: tuple(pokemonsEventStore, trainersEventStore),
  inputSchema: {
    type: 'object',
    properties: {
      pokemonId: { type: 'string' },
      trainerId: { type: 'string' },
    },
    required: ['pokemonId', 'trainerId'],
    additionalProperties: false,
  } as const,
  handler: async (input, eventStores) => {
    const { pokemonId, trainerId } = input;
    const [pokemonsStore, trainersStore] = eventStores;

    const [{ aggregate: pokemonAggregate }, { aggregate: trainerAggregate }] =
      await Promise.all([
        pokemonsStore.getAggregate(pokemonId),
        trainersStore.getAggregate(trainerId),
      ]);

    if (pokemonAggregate === undefined) {
      throw new Error('Pokemon not found');
    }

    if (trainerAggregate === undefined) {
      throw new Error('Trainer not found');
    }

    const { version: pokemonVersion, status: pokemonStatus } = pokemonAggregate;
    if (pokemonStatus === 'catched') {
      throw new Error('Pokemon already catched');
    }

    const { version: trainerVersion } = trainerAggregate;

    // TODO: Abstract transaction API
    await Promise.all([
      pokemonsStore.pushEvent({
        aggregateId: pokemonId,
        version: pokemonVersion + 1,
        type: 'CATCHED_BY_TRAINER',
        payload: {
          trainerId,
        },
      }),
      trainersStore.pushEvent({
        aggregateId: trainerId,
        version: trainerVersion + 1,
        type: 'POKEMON_CATCHED',
        payload: {
          pokemonId,
        },
      }),
    ]);
  },
});
