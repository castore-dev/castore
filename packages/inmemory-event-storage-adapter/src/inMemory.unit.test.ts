import { randomUUID } from 'crypto';

import { EventAlreadyExistsError } from '@castore/core';

import { InMemoryStorageAdapter } from './inMemory';

const storageAdapter = new InMemoryStorageAdapter();
const eventStoreIdMock = 'eventStoreIdMock';

const aggregateIdMock1 = randomUUID();
const aggregateIdMock2 = randomUUID();
const aggregateIdMock3 = randomUUID();
const aggregateIdMock4 = randomUUID();
const eventMock = {
  aggregateId: aggregateIdMock1,
  version: 1,
  type: 'EVENT_TYPE',
  timestamp: '2021',
};

describe('in-memory storage adapter', () => {
  it('gets an empty array if there is no event for aggregateId', async () => {
    const response = await storageAdapter.getEvents(aggregateIdMock1);
    expect(response).toStrictEqual({ events: [] });
  });

  it('throws an error if version already exists', async () => {
    await storageAdapter.pushEvent(eventMock, {
      eventStoreId: eventStoreIdMock,
    });

    await expect(() =>
      storageAdapter.pushEvent(eventMock, { eventStoreId: eventStoreIdMock }),
    ).rejects.toThrow(EventAlreadyExistsError);
  });

  it('pushes and gets events correctly', async () => {
    const response = await storageAdapter.getEvents(aggregateIdMock1);
    expect(response).toStrictEqual({ events: [eventMock] });
  });

  it('list aggregate Ids', async () => {
    await storageAdapter.pushEvent(
      {
        ...eventMock,
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
        ...eventMock,
        aggregateId: aggregateIdMock3,
        timestamp: '2023',
      },
      { eventStoreId: eventStoreIdMock },
    );

    await storageAdapter.pushEvent(
      {
        ...eventMock,
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
