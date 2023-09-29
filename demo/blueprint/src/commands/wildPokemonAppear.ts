import { JSONSchemaCommand } from '@castore/command-json-schema';
import { tuple } from '@castore/core';

import { pokemonsEventStore } from '~/pokemons';

export const wildPokemonAppearCommand = new JSONSchemaCommand({
  commandId: 'WILD_POKEMON_APPEAR',
  requiredEventStores: tuple(pokemonsEventStore),
  inputSchema: {
    type: 'object',
    properties: {
      pokemonName: { type: 'string' },
      pokemonLevel: { type: 'number' },
    },
    required: ['pokemonName', 'pokemonLevel'],
    additionalProperties: false,
  } as const,
  outputSchema: {
    type: 'object',
    properties: {
      pokemonId: { type: 'string' },
    },
    required: ['pokemonId'],
    additionalProperties: false,
  } as const,
  handler: async (
    input,
    eventStores,
    { generateUuid }: { generateUuid: () => string },
  ) => {
    const { pokemonName, pokemonLevel } = input;
    const [eventStore] = eventStores;

    const pokemonId = generateUuid();

    await eventStore.pushEvent({
      aggregateId: pokemonId,
      version: 1,
      type: 'APPEARED',
      payload: {
        name: pokemonName,
        level: pokemonLevel,
      },
      metadata: {
        trigger: 'random',
      },
    });

    return { pokemonId };
  },
});
