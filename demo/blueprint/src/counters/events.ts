import { JSONSchemaEventType } from '@castore/json-schema-event';

export const counterCreatedEvent = new JSONSchemaEventType({
  type: 'COUNTER_CREATED',
  payloadSchema: {
    type: 'object',
    properties: {
      userId: { type: 'string', format: 'uuid' },
      startCount: { type: 'number' },
    },
    required: ['userId'],
    additionalProperties: false,
  } as const,
});

export const counterIncrementedEvent = new JSONSchemaEventType({
  type: 'COUNTER_INCREMENTED',
});

export const counterDecrementedEvent = new JSONSchemaEventType({
  type: 'COUNTER_DECREMENTED',
});

export const counterRemovedEvent = new JSONSchemaEventType({
  type: 'COUNTER_REMOVED',
});
