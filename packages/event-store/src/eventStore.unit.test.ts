import {
  aggregateIdMock,
  CounterAggregate,
  counterCreatedEvent,
  counterDeletedEvent,
  counterEventStore,
  counterIncrementedEvent,
  mockEvents,
  mockGetEvents,
  mockPushEvent,
  reduce,
} from './eventStore.util.test';

describe('event store', () => {
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
    await counterEventStore.pushEvent(mockEvents[0]);

    expect(mockPushEvent).toHaveBeenCalledTimes(1);
    expect(mockPushEvent).toHaveBeenCalledWith(mockEvents[0]);
  });

  it('gets events correctly', async () => {
    const response = await counterEventStore.getEvents(aggregateIdMock);

    expect(mockGetEvents).toHaveBeenCalledTimes(1);
    expect(mockGetEvents).toHaveBeenCalledWith(aggregateIdMock, undefined);
    expect(response).toStrictEqual({ events: mockEvents });
  });

  it('gets aggregate correctly', async () => {
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
