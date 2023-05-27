import { JSONSchemaEventType } from '@castore/json-schema-event';

export const appearedEvent = new JSONSchemaEventType({
  type: 'APPEARED',
  payloadSchema: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      level: { type: 'number' },
    },
    required: ['name', 'level'],
    additionalProperties: false,
  } as const,
  metadataSchema: {
    type: 'object',
    properties: {
      trigger: { enum: ['random', 'scripted'] },
    },
    additionalProperties: false,
  } as const,
});

export const caughtByTrainerEvent = new JSONSchemaEventType({
  type: 'CAUGHT_BY_TRAINER',
  payloadSchema: {
    type: 'object',
    properties: {
      trainerId: { type: 'string' },
    },
    required: ['trainerId'],
    additionalProperties: false,
  } as const,
});

export const levelledUpEvent = new JSONSchemaEventType({
  type: 'LEVELLED_UP',
});
