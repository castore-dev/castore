import {
  counterCreatedEventMock,
  counterIncrementedEventMock,
  counterEventStore,
  counterIdMock,
} from '@castore/demo-blueprint';

import { mockEventStore } from './mockEventStore';

describe('mockEventStore', () => {
  const mockedCounterEventStore = mockEventStore(counterEventStore, [
    counterCreatedEventMock,
  ]);

  it('does not mutate the original event store', () => {
    expect(counterEventStore.storageAdapter).toBeUndefined();
  });

  it('gives the event store an in memory storage adapter and pushes the events', async () => {
    expect(await mockedCounterEventStore.listAggregateIds()).toStrictEqual({
      aggregateIds: [counterIdMock],
    });

    expect(
      await mockedCounterEventStore.getEvents(counterIdMock),
    ).toStrictEqual({
      events: [counterCreatedEventMock],
    });
  });

  it('adds a a new event', async () => {
    await mockedCounterEventStore.pushEvent(counterIncrementedEventMock);

    expect(
      await mockedCounterEventStore.getEvents(counterIdMock),
    ).toStrictEqual({
      events: [counterCreatedEventMock, counterIncrementedEventMock],
    });
  });

  it('resets the event store to the initial events', async () => {
    mockedCounterEventStore.reset();
    expect(
      await mockedCounterEventStore.getEvents(counterIdMock),
    ).toStrictEqual({
      events: [counterCreatedEventMock],
    });
  });
});
