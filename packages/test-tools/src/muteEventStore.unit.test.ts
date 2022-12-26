import MockDate from 'mockdate';

import {
  counterCreatedEventMock,
  counterIncrementedEventMock,
  counterEventStore,
  counterIdMock,
} from '@castore/demo-blueprint';

import { muteEventStore } from './muteEventStore';

describe('muteEventStore', () => {
  muteEventStore(counterEventStore, [counterCreatedEventMock]);

  it('does mutate the original event store', () => {
    expect(counterEventStore.storageAdapter).not.toBeUndefined();
  });

  it('gives the event store an in memory storage adapter and pushes the events', async () => {
    expect(await counterEventStore.listAggregateIds()).toStrictEqual({
      aggregateIds: [counterIdMock],
    });

    expect(await counterEventStore.getEvents(counterIdMock)).toStrictEqual({
      events: [counterCreatedEventMock],
    });
  });

  it('adds a a new event', async () => {
    const { timestamp, ...event } = counterIncrementedEventMock;
    MockDate.set(timestamp);
    await counterEventStore.pushEvent(event);

    expect(await counterEventStore.getEvents(counterIdMock)).toStrictEqual({
      events: [counterCreatedEventMock, counterIncrementedEventMock],
    });
  });
});
