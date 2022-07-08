import {
  counterEventsMocks,
  counterEventStore,
  counterIdMock,
  EventAlreadyExistsError,
} from '@castore/event-store';

import { InMemoryStorageAdapter } from './inMemory';

counterEventStore.storageAdapter = new InMemoryStorageAdapter();

describe('in-memory storage adapter', () => {
  it('gets an empty array if there is no event for aggregateId', async () => {
    const response = await counterEventStore.getEvents(counterIdMock);
    expect(response).toStrictEqual({ events: [] });
  });

  it('throws an error if version already exists', async () => {
    await counterEventStore.pushEvent(counterEventsMocks[0]);
    await expect(
      counterEventStore.pushEvent(counterEventsMocks[0]),
    ).rejects.toThrow(EventAlreadyExistsError);
  });

  it('pushes and gets events correctly', async () => {
    await counterEventStore.pushEvent(counterEventsMocks[1]);

    const response = await counterEventStore.getEvents(counterIdMock);
    expect(response).toStrictEqual({ events: counterEventsMocks });
  });

  it('list aggregate Ids', async () => {
    await counterEventStore.pushEvent({
      aggregateId: 'counterIdMock2',
      version: 1,
      type: 'COUNTER_CREATED',
      timestamp: '2021',
    });
    expect(await counterEventStore.listAggregateIds()).toStrictEqual({
      aggregateIds: ['counterIdMock2', counterIdMock],
    });
  });
});
