import { JSONSchemaEventType } from '@castore/event-store';

export const userCreatedEvent = new JSONSchemaEventType({
  type: 'USER_CREATED',
  payloadSchema: {
    type: 'object',
    properties: {
      firstName: { type: 'string', minLength: 3 },
      lastName: { type: 'string', minLength: 3 },
    },
    required: ['firstName', 'lastName'],
    additionalProperties: false,
  } as const,
});

export const userRemovedEvent = new JSONSchemaEventType({
  type: 'USER_REMOVED',
});
