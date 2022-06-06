import {
  CounterAggregate,
  counterCreatedEvent,
  counterDeletedEvent,
  counterEventsMocks,
  counterEventStore,
  counterIdMock,
  counterIncrementedEvent,
  countersReducer,
  getEventsMock,
  pushEventMock,
} from './eventStore.util.test';

getEventsMock.mockResolvedValue({ events: counterEventsMocks });

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

  it('gets events correctly', async () => {
    const response = await counterEventStore.getEvents(counterIdMock);

    expect(getEventsMock).toHaveBeenCalledTimes(1);
    expect(getEventsMock).toHaveBeenCalledWith(counterIdMock, undefined);
    expect(response).toStrictEqual({ events: counterEventsMocks });
  });

  it('gets aggregate correctly', async () => {
    const response = await counterEventStore.getAggregate(counterIdMock);

    expect(getEventsMock).toHaveBeenCalledTimes(1);
    expect(getEventsMock).toHaveBeenCalledWith(counterIdMock, undefined);
    expect(response).toStrictEqual({
      aggregate: counterEventsMocks.reduce(
        countersReducer,
        undefined as unknown as CounterAggregate,
      ),
      events: counterEventsMocks,
      lastEvent: counterEventsMocks[counterEventsMocks.length - 1],
    });
  });

  it('pushes new event correctly', async () => {
    await counterEventStore.pushEvent(counterEventsMocks[0]);

    expect(pushEventMock).toHaveBeenCalledTimes(1);
    expect(pushEventMock).toHaveBeenCalledWith(counterEventsMocks[0], {
      eventStoreId: counterEventStore.eventStoreId,
    });
  });
});
