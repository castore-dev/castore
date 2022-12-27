import { tuple } from '@castore/core';
import { JSONSchemaCommand } from '@castore/json-schema-command';

import { counterEventStore } from '~/counters';

export const createCounterCommand = new JSONSchemaCommand({
  commandId: 'CREATE_COUNTER',
  requiredEventStores: tuple(counterEventStore),
  inputSchema: {
    type: 'object',
    properties: {
      userId: { type: 'string', format: 'uuid' },
      startCount: { type: 'number' },
    },
    required: ['userId', 'startCount'],
    additionalProperties: false,
  } as const,
  outputSchema: {
    type: 'object',
    properties: {
      counterId: { type: 'string', format: 'uuid' },
    },
    required: ['counterId'],
    additionalProperties: false,
  } as const,
  handler: async (
    input,
    eventStores,
    { generateUuid }: { generateUuid: () => string },
  ) => {
    const { userId, startCount } = input;
    const [countersStore] = eventStores;

    const counterId = generateUuid();

    await countersStore.pushEvent({
      aggregateId: counterId,
      version: 1,
      type: 'COUNTER_CREATED',
      payload: {
        userId,
        startCount,
      },
    });

    return { counterId };
  },
});
