import { EventTypeDetail } from 'event/eventType';

import { JSONSchemaEventType } from './event/implementations/jsonSchema';
import { EventStore } from './eventStore';
import { StorageAdapter } from './storageAdapter/storageAdapter';

export const counterCreatedEvent = new JSONSchemaEventType({
  type: 'COUNTER_CREATED',
});

export const counterIncrementedEvent = new JSONSchemaEventType({
  type: 'COUNTER_INCREMENTED',
});

export const counterDeletedEvent = new JSONSchemaEventType({
  type: 'COUNTER_DELETED',
});

export type CounterEventsDetails =
  | EventTypeDetail<typeof counterCreatedEvent>
  | EventTypeDetail<typeof counterIncrementedEvent>
  | EventTypeDetail<typeof counterDeletedEvent>;

export type CounterAggregate = {
  aggregateId: string;
  version: number;
  count: number;
  status: string;
};

export const aggregateIdMock = 'aggregateId';
export const mockEvents: CounterEventsDetails[] = [
  {
    aggregateId: aggregateIdMock,
    version: 1,
    type: 'COUNTER_CREATED',
    timestamp: '2022',
  },
  {
    aggregateId: aggregateIdMock,
    version: 2,
    type: 'COUNTER_INCREMENTED',
    timestamp: '2023',
  },
];

export const mockPushEvent = jest.fn();
export const mockPushEventTransaction = jest.fn();
export const mockGetEvents = jest.fn().mockResolvedValue({
  events: mockEvents,
});

export const mockStorageAdapter = new StorageAdapter({
  pushEvent: mockPushEvent,
  pushEventTransaction: mockPushEventTransaction,
  getEvents: mockGetEvents,
});

export const reduce = (
  counterAggregate: CounterAggregate,
  event: CounterEventsDetails,
): CounterAggregate => {
  const { version, aggregateId } = event;

  switch (event.type) {
    case 'COUNTER_CREATED':
      return {
        aggregateId,
        version: event.version,
        count: 0,
        status: 'LIVE',
      };
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
};

export const counterEventStore = new EventStore({
  eventStoreId: 'Counters',
  eventStoreEvents: [
    counterCreatedEvent,
    counterIncrementedEvent,
    counterDeletedEvent,
  ],
  reduce,
  storageAdapter: mockStorageAdapter,
});

export const counterEventStore2 = new EventStore({
  eventStoreId: 'Counters',
  eventStoreEvents: [
    counterCreatedEvent,
    counterIncrementedEvent,
    counterDeletedEvent,
  ],
  reduce,
  storageAdapter: mockStorageAdapter,
});
