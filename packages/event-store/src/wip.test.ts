import { EventStoreEvent, EventStoreEventDetail } from './event';
import { EventStore } from './eventStore';

const counterCreatedEvent = new EventStoreEvent({
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

type CounterAggregate = {
  aggregateId: string;
  version: number;
  userId: string;
  count: number;
};

export const counterEventStore = new EventStore({
  eventStoreId: 'Counters',
  eventStoreEvents: [counterCreatedEvent, counterIncrementedEvent],
  reduce: (counterAggregate: CounterAggregate, event): CounterAggregate => {
    const { version, aggregateId } = event;

    switch (event.type) {
      case 'COUNTER_CREATED': {
        const { userId } = event.payload;

        return { aggregateId, version, userId, count: 0 };
      }

      case 'COUNTER_INCREMENTED':
        return {
          ...counterAggregate,
          version,
          count: counterAggregate.count + 1,
        };
    }
  },
  tableName: 'toto',
  tableEventStreamArn: 'tata',
});
