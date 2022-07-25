/* eslint-disable max-lines */
import { EventType, EventTypeDetail } from '~/event/eventType';
import { EventStore } from '~/eventStore';
import { StorageAdapter } from '~/storageAdapter';

export const pushEventMock = jest.fn();
export const pushEventTransactionMock = jest.fn();
export const getEventsMock = jest.fn();
export const listAggregateIdsMock = jest.fn();

export const mockStorageAdapter = new StorageAdapter({
  pushEvent: pushEventMock,
  pushEventTransaction: pushEventTransactionMock,
  getEvents: getEventsMock,
  listAggregateIds: listAggregateIdsMock,
});

// Counters

export const counterCreatedEvent = new EventType<
  'COUNTER_CREATED',
  {
    aggregateId: string;
    version: number;
    type: 'COUNTER_CREATED';
    timestamp: string;
  }
>({
  type: 'COUNTER_CREATED',
});

export const counterIncrementedEvent = new EventType<
  'COUNTER_INCREMENTED',
  {
    aggregateId: string;
    version: number;
    type: 'COUNTER_INCREMENTED';
    timestamp: string;
  }
>({
  type: 'COUNTER_INCREMENTED',
});

export const counterDeletedEvent = new EventType<
  'COUNTER_DELETED',
  {
    aggregateId: string;
    version: number;
    type: 'COUNTER_DELETED';
    timestamp: string;
  }
>({
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

export const counterIdMock = 'counterId';
export const counterEventsMocks: [CounterEventsDetails, CounterEventsDetails] =
  [
    {
      aggregateId: counterIdMock,
      version: 1,
      type: 'COUNTER_CREATED',
      timestamp: '2022',
    },
    {
      aggregateId: counterIdMock,
      version: 2,
      type: 'COUNTER_INCREMENTED',
      timestamp: '2023',
    },
  ];

export const countersReducer = (
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
    default: {
      return {
        ...counterAggregate,
        version,
      };
    }
  }
};

export const counterEventStore = new EventStore({
  eventStoreId: 'Counters',
  eventStoreEvents: [
    counterCreatedEvent,
    counterIncrementedEvent,
    counterDeletedEvent,
  ],
  reduce: countersReducer,
  storageAdapter: mockStorageAdapter,
});

// Users

export const userCreatedEvent = new EventType<
  'USER_CREATED',
  {
    aggregateId: string;
    version: number;
    type: 'USER_CREATED';
    timestamp: string;
    payload: { name: string; age: number };
  }
>({
  type: 'USER_CREATED',
});

export const userRemovedEvent = new EventType<
  'USER_REMOVED',
  {
    aggregateId: string;
    version: number;
    type: 'USER_REMOVED';
    timestamp: string;
  }
>({
  type: 'USER_REMOVED',
});

export type UserEventsDetails =
  | EventTypeDetail<typeof userCreatedEvent>
  | EventTypeDetail<typeof userRemovedEvent>;

export type UserAggregate = {
  aggregateId: string;
  version: number;
  name: string;
  age: number;
  status: string;
};

export const userIdMock = 'userId';
export const userEventsMocks: UserEventsDetails[] = [
  {
    aggregateId: counterIdMock,
    version: 1,
    type: 'USER_CREATED',
    timestamp: '2022',
    payload: { name: 'Toto', age: 42 },
  },
  {
    aggregateId: counterIdMock,
    version: 2,
    type: 'USER_REMOVED',
    timestamp: '2023',
  },
];

export const usersReducer = (
  userAggregate: UserAggregate,
  event: UserEventsDetails,
): UserAggregate => {
  const { version, aggregateId } = event;

  switch (event.type) {
    case 'USER_CREATED': {
      const { name, age } = event.payload;

      return {
        aggregateId,
        version: event.version,
        name,
        age,
        status: 'CREATED',
      };
    }
    case 'USER_REMOVED':
      return {
        ...userAggregate,
        version,
        status: 'DELETED',
      };
  }
};

export const userEventStore = new EventStore({
  eventStoreId: 'Users',
  eventStoreEvents: [userCreatedEvent, userRemovedEvent],
  reduce: usersReducer,
  storageAdapter: mockStorageAdapter,
});
