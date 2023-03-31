import { tuple } from '@castore/core';
import { JSONSchemaCommand } from '@castore/json-schema-command';

import { pokemonsEventStore } from '~/pokemons';

export const levelUpPokemonCommand = new JSONSchemaCommand({
  commandId: 'LEVEL_UP_POKEMON',
  requiredEventStores: tuple(pokemonsEventStore),
  inputSchema: {
    type: 'object',
    properties: {
      pokemonId: { type: 'string' },
    },
    required: ['pokemonId'],
    additionalProperties: false,
  } as const,
  outputSchema: {
    type: 'object',
    properties: {
      nextLevel: { type: 'number' },
    },
    required: ['nextLevel'],
    additionalProperties: false,
  } as const,
  handler: async (input, eventStores) => {
    const { pokemonId } = input;
    const [eventStore] = eventStores;

    const { aggregate } = await eventStore.getAggregate(pokemonId);

    if (aggregate === undefined) {
      throw new Error('Pokemon not found');
    }

    const { version, level } = aggregate;
    if (level === 99) {
      throw new Error('Pokemon level maxed out');
    }

    const { nextAggregate } = await eventStore.pushEvent(
      {
        aggregateId: pokemonId,
        version: version + 1,
        type: 'LEVELLED_UP',
      },
      { prevAggregate: aggregate },
    );

    if (!nextAggregate) {
      throw new Error();
    }

    return { nextLevel: nextAggregate.level };
  },
});
