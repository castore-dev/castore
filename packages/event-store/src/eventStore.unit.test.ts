/* eslint-disable max-lines */
import { A } from 'ts-toolbelt';

import { EventTypeDetail } from 'event/eventType';

import { JSONSchemaEventType } from './event/implementations/jsonSchema';
import { EventStore } from './eventStore';
import {
  EventsQueryOptions,
  StorageAdapter,
} from './storageAdapter/storageAdapter';

const counterCreatedEvent = new JSONSchemaEventType({
  type: 'COUNTER_CREATED',
});

const counterIncrementedEvent = new JSONSchemaEventType({
  type: 'COUNTER_INCREMENTED',
});

const counterDeletedEvent = new JSONSchemaEventType({
  type: 'COUNTER_DELETED',
});

type CounterEventsDetails =
  | EventTypeDetail<typeof counterCreatedEvent>
  | EventTypeDetail<typeof counterIncrementedEvent>
  | EventTypeDetail<typeof counterDeletedEvent>;

type CounterAggregate = {
  aggregateId: string;
  version: number;
  count: number;
  status: string;
};

const aggregateIdMock = 'aggregateId';
const mockEvents: CounterEventsDetails[] = [
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

const mockPushEvent = jest.fn();
const mockPushEventTransaction = jest.fn();
const mockGetEvents = jest.fn().mockResolvedValue({
  events: mockEvents,
});

const mockStorageAdapter = new StorageAdapter({
  pushEvent: mockPushEvent,
  pushEventTransaction: mockPushEventTransaction,
  getEvents: mockGetEvents,
});

const reduce = (
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

const counterEventStore = new EventStore({
  eventStoreId: 'Counters',
  eventStoreEvents: [
    counterCreatedEvent,
    counterIncrementedEvent,
    counterDeletedEvent,
  ],
  reduce,
  storageAdapter: mockStorageAdapter,
});

describe('event store', () => {
  // beforeEach(() => {

  // })

  it('has correct properties', () => {
    expect(new Set(Object.keys(counterEventStore))).toStrictEqual(
      new Set([
        'eventStoreId',
        'eventStoreEvents',
        'reduce',
        'simulateSideEffect',
        'storageAdapter',
        'pushEvent',
        'pushEventTransaction',
        'buildAggregate',
        'getEvents',
        'getAggregate',
        'simulateAggregate',
      ]),
    );

    expect(counterEventStore.eventStoreId).toBe('Counters');

    expect(counterEventStore.eventStoreEvents).toStrictEqual([
      counterCreatedEvent,
      counterIncrementedEvent,
      counterDeletedEvent,
    ]);
  });

  it('pushes new event correctly', async () => {
    const assertPushEventInput: A.Equals<
      Parameters<typeof counterEventStore.pushEvent>,
      [CounterEventsDetails]
    > = 1;
    assertPushEventInput;

    const assertPushEventOutput: A.Equals<
      ReturnType<typeof counterEventStore.pushEvent>,
      Promise<void>
    > = 1;
    assertPushEventOutput;

    await counterEventStore.pushEvent(mockEvents[0]);

    expect(mockPushEvent).toHaveBeenCalledTimes(1);
    expect(mockPushEvent).toHaveBeenCalledWith(mockEvents[0]);
  });

  it('gets events correctly', async () => {
    const assertGetEventsInput: A.Equals<
      Parameters<typeof counterEventStore.getEvents>,
      [aggregateId: string, options?: EventsQueryOptions]
    > = 1;
    assertGetEventsInput;

    const assertGetEventsOutput: A.Equals<
      ReturnType<typeof counterEventStore.getEvents>,
      Promise<{ events: CounterEventsDetails[] }>
    > = 1;
    assertGetEventsOutput;

    const response = await counterEventStore.getEvents(aggregateIdMock);

    expect(mockGetEvents).toHaveBeenCalledTimes(1);
    expect(mockGetEvents).toHaveBeenCalledWith(aggregateIdMock, undefined);
    expect(response).toStrictEqual({ events: mockEvents });
  });

  it('gets aggregate correctly', async () => {
    const assertGetAggregateInput: A.Equals<
      Parameters<typeof counterEventStore.getAggregate>,
      [aggregateId: string, options?: EventsQueryOptions]
    > = 1;
    assertGetAggregateInput;

    const assertGetAggregateOutput: A.Equals<
      ReturnType<typeof counterEventStore.getAggregate>,
      Promise<{
        aggregate: CounterAggregate | undefined;
        events: CounterEventsDetails[];
        lastEvent: CounterEventsDetails | undefined;
      }>
    > = 1;
    assertGetAggregateOutput;

    const response = await counterEventStore.getAggregate(aggregateIdMock);

    expect(mockGetEvents).toHaveBeenCalledTimes(1);
    expect(mockGetEvents).toHaveBeenCalledWith(aggregateIdMock, undefined);
    expect(response).toStrictEqual({
      aggregate: mockEvents.reduce(
        reduce,
        undefined as unknown as CounterAggregate,
      ),
      events: mockEvents,
      lastEvent: mockEvents[mockEvents.length - 1],
    });
  });
});
