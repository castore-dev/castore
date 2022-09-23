/* eslint-disable max-lines */
import { AggregateNotFoundError } from '~/errors/aggregateNotFound';

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
  counterIncrementedEventMock,
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
        'snapshotInterval',
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

      expect(getLastSnapshotMock).toHaveBeenCalledTimes(1);
      expect(getLastSnapshotMock).toHaveBeenCalledWith(counterIdMock, {
        maxVersion: undefined,
      });

      expect(getEventsMock).toHaveBeenCalledTimes(1);
      expect(getEventsMock).toHaveBeenCalledWith(counterIdMock, {});
      expect(response).toStrictEqual({
        aggregate: counterEventsMocks.reduce(
          countersReducer,
          undefined as unknown as CounterAggregate,
        ),
        events: counterEventsMocks,
        lastEvent: counterEventsMocks[counterEventsMocks.length - 1],
        snapshot: undefined,
      });
    });

    it('gets and use last snapshot if possible', async () => {
      const eventsAfterSnapshot = [counterIncrementedEventMock];
      const snapshot = [counterCreatedEventMock].reduce(
        countersReducer,
        undefined as unknown as CounterAggregate,
      );
      getLastSnapshotMock.mockResolvedValue({ snapshot });
      getEventsMock.mockResolvedValue({ events: eventsAfterSnapshot });

      const response = await counterEventStore.getAggregate(counterIdMock);

      expect(getLastSnapshotMock).toHaveBeenCalledTimes(1);
      expect(getLastSnapshotMock).toHaveBeenCalledWith(counterIdMock, {
        maxVersion: undefined,
      });

      expect(getEventsMock).toHaveBeenCalledTimes(1);
      expect(getEventsMock).toHaveBeenCalledWith(counterIdMock, {
        minVersion: 2,
      });
      expect(response).toStrictEqual({
        aggregate: eventsAfterSnapshot.reduce(countersReducer, snapshot),
        events: eventsAfterSnapshot,
        lastEvent: eventsAfterSnapshot[eventsAfterSnapshot.length - 1],
        snapshot,
      });
    });

    it('skips fetching last snapshot if maxVersion is below snapshotInterval', async () => {
      const events = [counterCreatedEventMock];
      getEventsMock.mockResolvedValue({ events });

      const response = await counterEventStore.getAggregate(counterIdMock, {
        maxVersion: 1,
      });

      expect(getLastSnapshotMock).not.toHaveBeenCalled();

      expect(getEventsMock).toHaveBeenCalledTimes(1);
      expect(getEventsMock).toHaveBeenCalledWith(counterIdMock, {
        maxVersion: 1,
      });
      expect(response).toStrictEqual({
        aggregate: events.reduce(
          countersReducer,
          undefined as unknown as CounterAggregate,
        ),
        events,
        lastEvent: events[events.length - 1],
        snapshot: undefined,
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
        snapshot: undefined,
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

    it('puts snapshot on second event pushed (because snapshot interval is 2)', async () => {
      await counterEventStore.pushEvent(counterIncrementedEventMock);

      expect(pushEventMock).toHaveBeenCalledTimes(1);
      expect(pushEventMock).toHaveBeenCalledWith(counterIncrementedEventMock, {
        eventStoreId: counterEventStore.eventStoreId,
      });
      expect(putSnapshotMock).toHaveBeenCalledTimes(1);
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
