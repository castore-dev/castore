import { tuple } from '@castore/core';
import { JSONSchemaCommand } from '@castore/json-schema-command';

import { userEventStore } from '~/users';

export const createUserCommand = new JSONSchemaCommand({
  commandId: 'CREATE_USER',
  requiredEventStores: tuple(userEventStore),
  inputSchema: {
    type: 'object',
    properties: {
      firstName: { type: 'string', minLength: 3 },
      lastName: { type: 'string', minLength: 3 },
    },
    required: ['firstName', 'lastName'],
    additionalProperties: false,
  } as const,
  outputSchema: {
    type: 'object',
    properties: {
      userId: { type: 'string', format: 'uuid' },
    },
    required: ['userId'],
    additionalProperties: false,
  } as const,
  handler: async (
    input,
    eventStores,
    { generateUuid }: { generateUuid: () => string },
  ) => {
    const { firstName, lastName } = input;
    const [usersStore] = eventStores;

    const userId = generateUuid();

    await usersStore.pushEvent({
      aggregateId: userId,
      version: 1,
      type: 'USER_CREATED',
      payload: {
        firstName,
        lastName,
      },
    });

    return { userId };
  },
});
