import {
  NotificationMessage,
  NotificationMessageQueue,
  EventStoreId,
} from '@castore/core';
import { InMemoryMessageQueueAdapter } from '@castore/in-memory-message-queue-adapter';

import {
  mockedEventStore,
  eventStoreId,
  aggregate1Id,
  aggregate1Events,
  aggregate2Events,
  aggregate3Id,
  aggregate3Events,
} from '../fixtures.test';
import { pourEventStoreEvents } from './pourEventStoreEvents';

const messageQueue = new NotificationMessageQueue({
  messageQueueId: 'testMessageQueue',
  sourceEventStores: [mockedEventStore],
});

let receivedMessages: NotificationMessage<
  EventStoreId<typeof mockedEventStore>
>[] = [];

InMemoryMessageQueueAdapter.attachTo(messageQueue, {
  worker: message =>
    new Promise(resolve => {
      receivedMessages.push(message);
      resolve();
    }),
});

describe('pourEventStoreEvents', () => {
  beforeEach(() => {
    receivedMessages = [];
  });

  it('pours event store events in correct order', async () => {
    const { pouredEventCount, firstScannedAggregate, lastScannedAggregate } =
      await pourEventStoreEvents(mockedEventStore, messageQueue);

    expect(pouredEventCount).toStrictEqual(5);
    expect(firstScannedAggregate).toStrictEqual({ aggregateId: aggregate1Id });
    expect(lastScannedAggregate).toStrictEqual({ aggregateId: aggregate3Id });

    expect(receivedMessages).toHaveLength(5);

    expect(receivedMessages[0]).toStrictEqual({
      eventStoreId,
      event: aggregate1Events[0],
    });
    expect(receivedMessages[1]).toStrictEqual({
      eventStoreId,
      event: aggregate1Events[1],
    });
    expect(receivedMessages[2]).toStrictEqual({
      eventStoreId,
      event: aggregate2Events[0],
    });
    expect(receivedMessages[3]).toStrictEqual({
      eventStoreId,
      event: aggregate3Events[0],
    });
    expect(receivedMessages[4]).toStrictEqual({
      eventStoreId,
      event: aggregate1Events[2],
    });
  });

  it('correctly filters events based on from & to', async () => {
    const { pouredEventCount, firstScannedAggregate, lastScannedAggregate } =
      await pourEventStoreEvents(mockedEventStore, messageQueue, {
        from: '2021-07-01T00:00:00.000Z',
        to: '2023-02-01T00:00:00.000Z',
      });

    expect(pouredEventCount).toStrictEqual(3);
    expect(firstScannedAggregate).toStrictEqual({ aggregateId: aggregate1Id });
    expect(lastScannedAggregate).toStrictEqual({ aggregateId: aggregate3Id });

    expect(receivedMessages).toHaveLength(3);

    expect(receivedMessages[0]).toStrictEqual({
      eventStoreId,
      event: aggregate1Events[1],
    });
    expect(receivedMessages[1]).toStrictEqual({
      eventStoreId,
      event: aggregate2Events[0],
    });
    expect(receivedMessages[2]).toStrictEqual({
      eventStoreId,
      event: aggregate3Events[0],
    });
  });
});
