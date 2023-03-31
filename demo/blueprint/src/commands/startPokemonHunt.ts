import { tuple } from '@castore/core';
import { JSONSchemaCommand } from '@castore/json-schema-command';

import { trainersEventStore } from '~/trainers';

export const startPokemonHuntCommand = new JSONSchemaCommand({
  commandId: 'START_POKEMON_HUNT',
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
      type: 'HUNT_STARTED',
      payload: {
        trainerName,
      },
    });

    return { trainerId };
  },
});
