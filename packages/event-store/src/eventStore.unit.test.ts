import {
  CounterAggregate,
  counterCreatedEvent,
  counterDeletedEvent,
  counterEventsMocks,
  counterEventStore,
  counterIdMock,
  counterIncrementedEvent,
  countersReducer,
  mockGetEvents,
  mockPushEvent,
} from './eventStore.util.test';

mockGetEvents.mockResolvedValue({ events: counterEventsMocks });

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
    await counterEventStore.pushEvent(counterEventsMocks[0]);

    expect(mockPushEvent).toHaveBeenCalledTimes(1);
    expect(mockPushEvent).toHaveBeenCalledWith(counterEventsMocks[0]);
  });

  it('gets events correctly', async () => {
    const response = await counterEventStore.getEvents(counterIdMock);

    expect(mockGetEvents).toHaveBeenCalledTimes(1);
    expect(mockGetEvents).toHaveBeenCalledWith(counterIdMock, undefined);
    expect(response).toStrictEqual({ events: counterEventsMocks });
  });

  it('gets aggregate correctly', async () => {
    const response = await counterEventStore.getAggregate(counterIdMock);

    expect(mockGetEvents).toHaveBeenCalledTimes(1);
    expect(mockGetEvents).toHaveBeenCalledWith(counterIdMock, undefined);
    expect(response).toStrictEqual({
      aggregate: counterEventsMocks.reduce(
        countersReducer,
        undefined as unknown as CounterAggregate,
      ),
      events: counterEventsMocks,
      lastEvent: counterEventsMocks[counterEventsMocks.length - 1],
    });
  });
});
