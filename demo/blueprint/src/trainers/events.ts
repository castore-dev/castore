import { JSONSchemaEventType } from '@castore/json-schema-event';

export const gameStartedEvent = new JSONSchemaEventType({
  type: 'GAME_STARTED',
  payloadSchema: {
    type: 'object',
    properties: {
      trainerName: { type: 'string' },
    },
    required: ['trainerName'],
    additionalProperties: false,
  } as const,
});

export const pokemonCaughtEvent = new JSONSchemaEventType({
  type: 'POKEMON_CAUGHT',
  payloadSchema: {
    type: 'object',
    properties: {
      pokemonId: { type: 'string', format: 'uuid' },
    },
    required: ['pokemonId'],
    additionalProperties: false,
  } as const,
});
