import { z } from 'zod';

import {
  EventStoreEvent,
  EventStoreEventDetail,
  JSONSchemaEvent,
  ZodEvent,
} from './event';
import { EventStore } from './eventStore';

const counterCreatedEvent = new JSONSchemaEvent({
  type: 'COUNTER_CREATED',
  payloadSchema: {
    type: 'object',
    properties: {
      userId: { type: 'string' },
    },
    required: ['userId'],
    additionalProperties: false,
  } as const,
});

export type CounterCreatedDetail = EventStoreEventDetail<
  typeof counterCreatedEvent
>;

const counterIncrementedEvent = new EventStoreEvent({
  type: 'COUNTER_INCREMENTED',
});

export type CounterIncrementedDetail = EventStoreEventDetail<
  typeof counterIncrementedEvent
>;

const counterDeletedEvent = new ZodEvent({
  type: 'COUNTER_DELETED',
  payloadSchema: z.object({ reason: z.string() }),
});

export type CounterDeletedDetail = EventStoreEventDetail<
  typeof counterDeletedEvent
>;

type CounterAggregate = {
  aggregateId: string;
  version: number;
  userId: string;
  count: number;
  status: string;
};

export const counterEventStore = new EventStore({
  eventStoreId: 'Counters',
  eventStoreEvents: [
    counterCreatedEvent,
    counterIncrementedEvent,
    counterDeletedEvent,
  ],
  reduce: (counterAggregate: CounterAggregate, event): CounterAggregate => {
    const { version, aggregateId } = event;

    switch (event.type) {
      case 'COUNTER_CREATED': {
        const { userId } = event.payload;

        return { aggregateId, version, userId, count: 0, status: 'LIVE' };
      }

      case 'COUNTER_INCREMENTED':
        return {
          ...counterAggregate,
          version,
          count: counterAggregate.count + 1,
        };
      case 'COUNTER_DELETED':
        return {
          ...counterAggregate,
          version,
          status: 'DELETED',
        };
    }
  },
  tableName: 'toto',
  tableEventStreamArn: 'tata',
});
