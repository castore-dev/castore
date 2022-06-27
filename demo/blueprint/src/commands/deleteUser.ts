import { JSONSchemaCommand, tuple } from '@castore/event-store';

import { userEventStore, UserStatus } from 'users';

export const deleteUser = new JSONSchemaCommand({
  commandId: 'DELETE_USER',
  requiredEventStores: tuple(userEventStore),
  inputSchema: {
    type: 'object',
    properties: {
      userId: { type: 'string', format: 'uuid' },
    },
    required: ['userId'],
    additionalProperties: false,
  } as const,
  handler: async (input, eventStores) => {
    const { userId } = input;
    const [usersStore] = eventStores;

    const { aggregate } = await usersStore.getAggregate(userId);

    if (aggregate === undefined) {
      throw new Error('User not found');
    }

    const { version, status } = aggregate;
    if (status === UserStatus.REMOVED) {
      throw new Error('User already removed');
    }

    await usersStore.pushEvent({
      aggregateId: userId,
      version: version + 1,
      type: 'USER_REMOVED',
      timestamp: new Date().toISOString(),
    });
  },
});
