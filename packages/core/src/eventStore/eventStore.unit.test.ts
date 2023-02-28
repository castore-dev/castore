import { AggregateNotFoundError } from './errors/aggregateNotFound';
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
  listAggregateIdsMock,
  getLastSnapshotMock,
  putSnapshotMock,
  counterCreatedEventMock,
} from './eventStore.util.test';

describe('event store', () => {
  beforeEach(() => {
    getEventsMock.mockClear();
    getEventsMock.mockResolvedValue({ events: counterEventsMocks });
    pushEventMock.mockClear();
    listAggregateIdsMock.mockClear();
    listAggregateIdsMock.mockReturnValue({ aggregateIds: [counterIdMock] });
    putSnapshotMock.mockClear();
    getLastSnapshotMock.mockClear();
    getLastSnapshotMock.mockResolvedValue({ snapshot: undefined });
  });

  it('has correct properties', () => {
    expect(new Set(Object.keys(counterEventStore))).toStrictEqual(
      new Set([
        'eventStoreId',
        'eventStoreEvents',
        'reduce',
        'simulateSideEffect',
        'storageAdapter',
        'getStorageAdapter',
        'pushEvent',
        'buildAggregate',
        'getEvents',
        'listAggregateIds',
        'getAggregate',
        'getExistingAggregate',
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

  describe('getEvents', () => {
    it('gets events correctly', async () => {
      const response = await counterEventStore.getEvents(counterIdMock);

      expect(getEventsMock).toHaveBeenCalledTimes(1);
      expect(getEventsMock).toHaveBeenCalledWith(counterIdMock, undefined);
      expect(response).toStrictEqual({ events: counterEventsMocks });
    });
  });

  describe('getAggregate', () => {
    it('gets aggregate correctly', async () => {
      const response = await counterEventStore.getAggregate(counterIdMock);

      expect(getEventsMock).toHaveBeenCalledTimes(1);
      expect(getEventsMock).toHaveBeenCalledWith(counterIdMock, {});
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

  describe('getExistingAggregate', () => {
    it('gets aggregate correctly if it exists', async () => {
      const response = await counterEventStore.getExistingAggregate(
        counterIdMock,
      );

      expect(getEventsMock).toHaveBeenCalledTimes(1);
      expect(getEventsMock).toHaveBeenCalledWith(counterIdMock, {});

      expect(response).toStrictEqual({
        aggregate: counterEventsMocks.reduce(
          countersReducer,
          undefined as unknown as CounterAggregate,
        ),
        events: counterEventsMocks,
        lastEvent: counterEventsMocks[counterEventsMocks.length - 1],
      });
    });

    it('throws an AggregateNotFound error if it does not', async () => {
      getEventsMock.mockResolvedValue({ events: [] });

      await expect(() =>
        counterEventStore.getExistingAggregate(counterIdMock),
      ).rejects.toThrow(
        new AggregateNotFoundError({
          eventStoreId: counterEventStore.eventStoreId,
          aggregateId: counterIdMock,
        }),
      );
    });
  });

  describe('pushEvent', () => {
    it('pushes new event correctly', async () => {
      await counterEventStore.pushEvent(counterCreatedEventMock);

      expect(pushEventMock).toHaveBeenCalledTimes(1);
      expect(pushEventMock).toHaveBeenCalledWith(counterCreatedEventMock, {
        eventStoreId: counterEventStore.eventStoreId,
      });
    });
  });

  describe('listAggregateIds', () => {
    it('lists aggregateIds correctly', async () => {
      const limitMock = 10;
      const pageTokenMock = 'pageTokenMock';

      const response = await counterEventStore.listAggregateIds({
        limit: limitMock,
        pageToken: pageTokenMock,
      });

      expect(listAggregateIdsMock).toHaveBeenCalledTimes(1);
      expect(listAggregateIdsMock).toHaveBeenCalledWith({
        limit: limitMock,
        pageToken: pageTokenMock,
      });

      expect(response).toStrictEqual({ aggregateIds: [counterIdMock] });
    });
  });
});
