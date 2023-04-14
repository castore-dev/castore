import { vi } from 'vitest';

import { EventType, EventTypeDetail } from '~/event/eventType';
import {
  eventAlreadyExistsErrorCode,
  EventAlreadyExistsError,
  EventStore,
} from '~/eventStore';
import { StorageAdapter } from '~/storageAdapter';

import { tuple, Command } from './command';

export const pushEventMock = vi.fn();
export const pushEventGroupMock = vi.fn();
export const groupEventMock = vi.fn();
export const getEventsMock = vi.fn();
export const listAggregateIdsMock = vi.fn();
export const putSnapshotMock = vi.fn();
export const getLastSnapshotMock = vi.fn();
export const listSnapshotsMock = vi.fn();

export const mockStorageAdapter: StorageAdapter = {
  pushEvent: pushEventMock,
  pushEventGroup: pushEventGroupMock,
  groupEvent: groupEventMock,
  getEvents: getEventsMock,
  listAggregateIds: listAggregateIdsMock,
  putSnapshot: putSnapshotMock,
  getLastSnapshot: getLastSnapshotMock,
  listSnapshots: listSnapshotsMock,
};

// Counters

export const counterCreatedEvent = new EventType<'COUNTER_CREATED'>({
  type: 'COUNTER_CREATED',
});

export const counterIncrementedEvent = new EventType<'COUNTER_INCREMENTED'>({
  type: 'COUNTER_INCREMENTED',
});

export const counterDeletedEvent = new EventType<'COUNTER_DELETED'>({
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

export const requiredEventStores = tuple(counterEventStore);

export const onEventAlreadyExistsMock = vi.fn();

export type Input = { counterId: string };
export type Output = { nextCount: number };
export type Context = { generateUuid: () => string };

export const incrementCounter = new Command({
  commandId: 'INCREMENT_COUNTER',
  requiredEventStores,
  handler: async (
    input: Input,
    eventStores: typeof requiredEventStores,
    context: Context,
  ): Promise<Output> => {
    const { generateUuid } = context;
    generateUuid();

    const { counterId } = input;
    const [countersStore] = eventStores;

    const { aggregate } = await countersStore.getAggregate(counterId);
    if (!aggregate) throw new Error();

    const { count, version } = aggregate;

    await countersStore.pushEvent({
      aggregateId: counterId,
      version: version + 1,
      type: 'COUNTER_INCREMENTED',
    });

    return { nextCount: count + 1 };
  },
  eventAlreadyExistsRetries: 2,
  onEventAlreadyExists: onEventAlreadyExistsMock,
});

export class MockedEventAlreadyExistsError
  extends Error
  implements EventAlreadyExistsError
{
  code: typeof eventAlreadyExistsErrorCode;
  eventStoreId?: string;
  aggregateId: string;
  version: number;

  constructor({
    eventStoreId = '',
    aggregateId,
    version,
  }: {
    eventStoreId?: string;
    aggregateId: string;
    version: number;
  }) {
    super(
      `Event already exists for ${eventStoreId} aggregate ${aggregateId} and version ${version}`,
    );

    this.code = eventAlreadyExistsErrorCode;
    if (eventStoreId) {
      this.eventStoreId = eventStoreId;
    }
    this.aggregateId = aggregateId;
    this.version = version;
  }
}
