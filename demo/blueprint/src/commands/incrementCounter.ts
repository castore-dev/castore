import { tuple } from '@castore/core';
import { JSONSchemaCommand } from '@castore/json-schema-command';

import { counterEventStore, CounterStatus } from '~/counters';

export const incrementCounterCommand = new JSONSchemaCommand({
  commandId: 'INCREMENT_COUNTER',
  requiredEventStores: tuple(counterEventStore),
  inputSchema: {
    type: 'object',
    properties: {
      counterId: { type: 'string', format: 'uuid' },
    },
    required: ['counterId'],
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
  handler: async (input, eventStores) => {
    const { counterId } = input;
    const [countersStore] = eventStores;

    const { aggregate } = await countersStore.getAggregate(counterId);

    if (aggregate === undefined) {
      throw new Error('Counter not found');
    }

    const { version, status } = aggregate;
    if (status === CounterStatus.REMOVED) {
      throw new Error('Counter removed');
    }

    await countersStore.pushEvent({
      aggregateId: counterId,
      version: version + 1,
      type: 'COUNTER_INCREMENTED',
      timestamp: new Date().toISOString(),
    });

    return { counterId };
  },
});
