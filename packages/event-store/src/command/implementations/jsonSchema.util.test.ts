import { counterEventStore, userEventStore } from '../../eventStore.util.test';
import { tuple } from '../command';
import { JSONSchemaCommand } from './jsonSchema';

export const inputSchema = {
  type: 'object',
  properties: {
    counterId: { type: 'string' },
  },
  required: ['counterId'],
  additionalProperties: false,
} as const;

export const outputSchema = {
  type: 'object',
  properties: {
    nextCount: { type: 'integer' },
  },
  required: ['nextCount'],
  additionalProperties: false,
} as const;

export const requiredEventStores = tuple(counterEventStore, userEventStore);

export const incrementCounter = new JSONSchemaCommand({
  requiredEventStores,
  inputSchema,
  outputSchema,
  handler: async (input, eventStores) => {
    const { counterId } = input;
    const [countersStore] = eventStores;

    const { aggregate } = await countersStore.getAggregate(counterId);
    if (!aggregate) throw new Error();

    const { count, version } = aggregate;

    await countersStore.pushEvent({
      aggregateId: counterId,
      version: version + 1,
      type: 'COUNTER_INCREMENTED',
      timestamp: new Date().toISOString(),
    });

    return { nextCount: count + 1 };
  },
});

export const incrementCounterNoOutput = new JSONSchemaCommand({
  requiredEventStores: tuple(counterEventStore, userEventStore),
  inputSchema,
  handler: async (input, eventStores) => {
    const { counterId } = input;
    const [countersStore] = eventStores;

    const { aggregate } = await countersStore.getAggregate(counterId);
    if (!aggregate) throw new Error();

    const { version } = aggregate;

    await countersStore.pushEvent({
      aggregateId: counterId,
      type: 'COUNTER_INCREMENTED',
      timestamp: new Date().toISOString(),
      version: version + 1,
    });
  },
});

export const incrementCounterA = new JSONSchemaCommand({
  requiredEventStores: tuple(counterEventStore, userEventStore),
  outputSchema,
  handler: async (_, eventStores) => {
    const counterId = 'A';
    const [countersStore] = eventStores;

    const { aggregate } = await countersStore.getAggregate(counterId);
    if (!aggregate) throw new Error();

    const { count, version } = aggregate;

    await countersStore.pushEvent({
      aggregateId: counterId,
      type: 'COUNTER_INCREMENTED',
      timestamp: new Date().toISOString(),
      version: version + 1,
    });

    return { nextCount: count + 1 };
  },
});

export const incrementCounterANoOutput = new JSONSchemaCommand({
  requiredEventStores: tuple(counterEventStore, userEventStore),
  handler: async (_, eventStores) => {
    const counterId = 'A';
    const [countersStore] = eventStores;

    const { aggregate } = await countersStore.getAggregate(counterId);
    if (!aggregate) throw new Error();

    const { version } = aggregate;

    await countersStore.pushEvent({
      aggregateId: counterId,
      type: 'COUNTER_INCREMENTED',
      timestamp: new Date().toISOString(),
      version: version + 1,
    });
  },
});
