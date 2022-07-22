import {
  counterEventsMocks,
  counterEventStore,
  counterIdMock,
} from '@castore/demo-blueprint';

import { mockEventStore } from './mockEventStore';

describe('mockEventStore', () => {
  it('gives the event store an in memory storage adapter and pushes the events', async () => {
    mockEventStore(counterEventStore, counterEventsMocks);

    expect(await counterEventStore.listAggregateIds()).toStrictEqual({
      aggregateIds: [counterIdMock],
    });

    expect(await counterEventStore.getEvents(counterIdMock)).toStrictEqual({
      events: counterEventsMocks,
    });

    await counterEventStore.pushEvent({
      aggregateId: counterIdMock,
      version: 3,
      type: 'COUNTER_INCREMENTED',
      timestamp: '2024',
    });

    expect(await counterEventStore.getEvents(counterIdMock)).toStrictEqual({
      events: [
        ...counterEventsMocks,
        {
          aggregateId: counterIdMock,
          version: 3,
          type: 'COUNTER_INCREMENTED',
          timestamp: '2024',
        },
      ],
    });
  });
});
