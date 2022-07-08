import { randomUUID } from 'crypto';

import { EventAlreadyExistsError } from '@castore/core';

import { InMemoryStorageAdapter } from './inMemory';

const storageAdapter = new InMemoryStorageAdapter();
const eventStoreIdMock = 'eventStoreIdMock';

const aggregateIdMock = randomUUID();
const laterAggregateIdMock = randomUUID();
const eventMock = {
  aggregateId: aggregateIdMock,
  version: 1,
  type: 'EVENT_TYPE',
  timestamp: '2021',
};

describe('in-memory storage adapter', () => {
  it('gets an empty array if there is no event for aggregateId', async () => {
    const response = await storageAdapter.getEvents(aggregateIdMock);
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
    const response = await storageAdapter.getEvents(aggregateIdMock);
    expect(response).toStrictEqual({ events: [eventMock] });
  });

  it('list aggregate Ids', async () => {
    await storageAdapter.pushEvent(
      {
        ...eventMock,
        aggregateId: laterAggregateIdMock,
        timestamp: '2022',
      },
      { eventStoreId: eventStoreIdMock },
    );

    const aggregateIds = await storageAdapter.listAggregateIds();

    expect(aggregateIds).toStrictEqual({
      aggregateIds: [aggregateIdMock, laterAggregateIdMock],
    });
  });
});
