import MockDate from 'mockdate';

import {
  pikachuAppearedEvent,
  pokemonsEventStore,
  pikachuCatchedEvent,
  pikachuId,
} from '@castore/demo-blueprint';

import { mockEventStore } from './mockEventStore';

describe('mockEventStore', () => {
  const mockedCounterEventStore = mockEventStore(pokemonsEventStore, [
    pikachuAppearedEvent,
  ]);

  it('does not mutate the original event store', () => {
    expect(pokemonsEventStore.storageAdapter).toBeUndefined();
  });

  it('gives the event store an in memory storage adapter and pushes the events', async () => {
    expect(await mockedCounterEventStore.listAggregateIds()).toStrictEqual({
      aggregateIds: [pikachuId],
    });

    expect(await mockedCounterEventStore.getEvents(pikachuId)).toStrictEqual({
      events: [pikachuAppearedEvent],
    });
  });

  it('adds a a new event', async () => {
    const { timestamp, ...event } = pikachuCatchedEvent;
    MockDate.set(timestamp);
    await mockedCounterEventStore.pushEvent(event);

    expect(await mockedCounterEventStore.getEvents(pikachuId)).toStrictEqual({
      events: [pikachuAppearedEvent, pikachuCatchedEvent],
    });
  });

  it('resets the event store to the initial events', async () => {
    mockedCounterEventStore.reset();
    expect(await mockedCounterEventStore.getEvents(pikachuId)).toStrictEqual({
      events: [pikachuAppearedEvent],
    });
  });
});
