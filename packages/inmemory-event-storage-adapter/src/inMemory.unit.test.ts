import { randomUUID } from 'crypto';

import { EventAlreadyExistsError } from '@castore/core';

import { InMemoryStorageAdapter } from './inMemory';

const eventStoreIdMock = 'eventStoreIdMock';

const aggregateIdMock1 = randomUUID();
const aggregateIdMock2 = randomUUID();
const aggregateIdMock3 = randomUUID();
const aggregateIdMock4 = randomUUID();
const eventMock1 = {
  aggregateId: aggregateIdMock1,
  version: 1,
  type: 'EVENT_TYPE',
  timestamp: '2021',
};
const eventMock2 = {
  aggregateId: aggregateIdMock1,
  version: 2,
  type: 'EVENT_TYPE',
  timestamp: '2022',
};

describe('in-memory storage adapter', () => {
  describe('constructor', () => {
    const storageAdapter = new InMemoryStorageAdapter({
      initialEvents: [eventMock1, eventMock2],
    });

    it('fills the db with initial events', () => {
      expect(storageAdapter.eventStore).toStrictEqual({
        [aggregateIdMock1]: [eventMock1, eventMock2],
      });
    });
  });

  describe('methods', () => {
    const storageAdapter = new InMemoryStorageAdapter();

    it('gets an empty array if there is no event for aggregateId', async () => {
      const response = await storageAdapter.getEvents(aggregateIdMock1);
      expect(response).toStrictEqual({ events: [] });
    });

    it('throws an error if version already exists', async () => {
      await storageAdapter.pushEvent(eventMock1, {
        eventStoreId: eventStoreIdMock,
      });

      await expect(() =>
        storageAdapter.pushEvent(eventMock1, {
          eventStoreId: eventStoreIdMock,
        }),
      ).rejects.toThrow(EventAlreadyExistsError);
    });

    it('pushes and gets events correctly', async () => {
      await storageAdapter.pushEvent(eventMock2, {
        eventStoreId: eventStoreIdMock,
      });

      const allEvents = await storageAdapter.getEvents(aggregateIdMock1);
      expect(allEvents).toStrictEqual({ events: [eventMock1, eventMock2] });

      const eventsMaxVersion = await storageAdapter.getEvents(
        aggregateIdMock1,
        { maxVersion: 1 },
      );
      expect(eventsMaxVersion).toStrictEqual({ events: [eventMock1] });

      const eventsMinVersion = await storageAdapter.getEvents(
        aggregateIdMock1,
        { minVersion: 2 },
      );
      expect(eventsMinVersion).toStrictEqual({ events: [eventMock2] });

      const eventsLimit = await storageAdapter.getEvents(aggregateIdMock1, {
        limit: 1,
      });
      expect(eventsLimit).toStrictEqual({ events: [eventMock1] });

      const eventsReverse = await storageAdapter.getEvents(aggregateIdMock1, {
        reverse: true,
      });
      expect(eventsReverse).toStrictEqual({ events: [eventMock2, eventMock1] });

      const eventsReverseAndLimit = await storageAdapter.getEvents(
        aggregateIdMock1,
        { limit: 1, reverse: true },
      );
      expect(eventsReverseAndLimit).toStrictEqual({ events: [eventMock2] });
    });

    it('list aggregate Ids', async () => {
      await storageAdapter.pushEvent(
        {
          ...eventMock1,
          aggregateId: aggregateIdMock2,
          timestamp: '2022',
        },
        { eventStoreId: eventStoreIdMock },
      );

      const aggregateIds = await storageAdapter.listAggregateIds();

      expect(aggregateIds).toStrictEqual({
        aggregateIds: [aggregateIdMock1, aggregateIdMock2],
      });
    });

    it('paginates aggregate Ids', async () => {
      await storageAdapter.pushEvent(
        {
          ...eventMock1,
          aggregateId: aggregateIdMock3,
          timestamp: '2023',
        },
        { eventStoreId: eventStoreIdMock },
      );

      await storageAdapter.pushEvent(
        {
          ...eventMock1,
          aggregateId: aggregateIdMock4,
          timestamp: '2024',
        },
        { eventStoreId: eventStoreIdMock },
      );

      const { aggregateIds, nextPageToken } =
        await storageAdapter.listAggregateIds({ limit: 2 });

      expect(aggregateIds).toStrictEqual([aggregateIdMock1, aggregateIdMock2]);
      expect(nextPageToken).toBe(
        JSON.stringify({ limit: 2, exclusiveEndIndex: 2 }),
      );

      const lastAggregateIds = await storageAdapter.listAggregateIds({
        pageToken: nextPageToken,
      });

      expect(lastAggregateIds).toStrictEqual({
        aggregateIds: [aggregateIdMock3, aggregateIdMock4],
      });
    });
  });
});
