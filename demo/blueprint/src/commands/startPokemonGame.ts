import { JSONSchemaCommand } from '@castore/command-json-schema';
import { tuple } from '@castore/core';

import { trainersEventStore } from '~/trainers';

export const startPokemonGameCommand = new JSONSchemaCommand({
  commandId: 'START_POKEMON_GAME',
  requiredEventStores: tuple(trainersEventStore),
  inputSchema: {
    type: 'object',
    properties: {
      trainerName: { type: 'string' },
    },
    required: ['trainerName'],
    additionalProperties: false,
  } as const,
  outputSchema: {
    type: 'object',
    properties: {
      trainerId: { type: 'string' },
    },
    required: ['trainerId'],
    additionalProperties: false,
  } as const,
  handler: async (
    input,
    eventStores,
    { generateUuid }: { generateUuid: () => string },
  ) => {
    const { trainerName } = input;
    const [eventStore] = eventStores;

    const trainerId = generateUuid();

    await eventStore.pushEvent({
      aggregateId: trainerId,
      version: 1,
      type: 'GAME_STARTED',
      payload: {
        trainerName,
      },
    });

    return { trainerId };
  },
});
