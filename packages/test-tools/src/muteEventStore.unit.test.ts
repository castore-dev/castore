import {
  pikachuAppearedEvent,
  pikachuCatchedEvent,
  pokemonsEventStore,
  pikachuId,
} from '@castore/demo-blueprint';

import { muteEventStore } from './muteEventStore';

describe('muteEventStore', () => {
  muteEventStore(pokemonsEventStore, [pikachuAppearedEvent]);

  it('does mutate the original event store', () => {
    expect(pokemonsEventStore.storageAdapter).not.toBeUndefined();
  });

  it('gives the event store an in memory storage adapter and pushes the events', async () => {
    expect(await pokemonsEventStore.listAggregateIds()).toStrictEqual({
      aggregateIds: [pikachuId],
    });

    expect(await pokemonsEventStore.getEvents(pikachuId)).toStrictEqual({
      events: [pikachuAppearedEvent],
    });
  });

  it('adds a a new event', async () => {
    await pokemonsEventStore.pushEvent(pikachuCatchedEvent);

    expect(await pokemonsEventStore.getEvents(pikachuId)).toStrictEqual({
      events: [pikachuAppearedEvent, pikachuCatchedEvent],
    });
  });
});
