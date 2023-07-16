import {
  NotificationMessage,
  NotificationMessageQueue,
  EventStoreId,
} from '@castore/core';
import { InMemoryMessageQueueAdapter } from '@castore/in-memory-message-queue-adapter';

import {
  pokemonEventStore,
  pokemonEvtStoreId,
  pikachuId,
  pikachuEvents,
  charizardEvents,
  arcanineId,
  arcanineEvents,
} from '../fixtures.test';
import { pourEventStoreEvents } from './pourEventStoreEvents';

const messageQueue = new NotificationMessageQueue({
  messageQueueId: 'testMessageQueue',
  sourceEventStores: [pokemonEventStore],
});

let receivedMessages: {
  date: Date;
  message: NotificationMessage<EventStoreId<typeof pokemonEventStore>>;
}[] = [];

InMemoryMessageQueueAdapter.attachTo(messageQueue, {
  worker: message =>
    new Promise(resolve => {
      receivedMessages.push({ date: new Date(), message });
      resolve();
    }),
});

describe('pourEventStoreEvents', () => {
  beforeEach(() => {
    receivedMessages = [];
  });

  it('pours event store events in correct order', async () => {
    const { pouredEventCount, firstScannedAggregate, lastScannedAggregate } =
      await pourEventStoreEvents({
        eventStore: pokemonEventStore,
        messageChannel: messageQueue,
      });

    expect(pouredEventCount).toStrictEqual(6);
    expect(firstScannedAggregate).toStrictEqual({ aggregateId: pikachuId });
    expect(lastScannedAggregate).toStrictEqual({ aggregateId: arcanineId });

    expect(receivedMessages).toHaveLength(6);

    expect(receivedMessages[0]?.message).toStrictEqual({
      eventStoreId: pokemonEvtStoreId,
      event: pikachuEvents[0],
    });
    expect(receivedMessages[1]?.message).toStrictEqual({
      eventStoreId: pokemonEvtStoreId,
      event: pikachuEvents[1],
    });
    expect(receivedMessages[2]?.message).toStrictEqual({
      eventStoreId: pokemonEvtStoreId,
      event: charizardEvents[0],
    });
    expect(receivedMessages[3]?.message).toStrictEqual({
      eventStoreId: pokemonEvtStoreId,
      event: arcanineEvents[0],
    });
    expect(receivedMessages[4]?.message).toStrictEqual({
      eventStoreId: pokemonEvtStoreId,
      event: pikachuEvents[2],
    });
    expect(receivedMessages[5]?.message).toStrictEqual({
      eventStoreId: pokemonEvtStoreId,
      event: arcanineEvents[1],
    });
  });

  it('correctly filters events based on from & to', async () => {
    const { pouredEventCount, firstScannedAggregate, lastScannedAggregate } =
      await pourEventStoreEvents({
        eventStore: pokemonEventStore,
        messageChannel: messageQueue,
        filters: {
          from: '2021-07-01T00:00:00.000Z',
          to: '2023-02-01T00:00:00.000Z',
        },
      });

    expect(pouredEventCount).toStrictEqual(3);
    expect(firstScannedAggregate).toStrictEqual({ aggregateId: pikachuId });
    expect(lastScannedAggregate).toStrictEqual({ aggregateId: arcanineId });

    expect(receivedMessages).toHaveLength(3);

    expect(receivedMessages[0]?.message).toStrictEqual({
      eventStoreId: pokemonEvtStoreId,
      event: pikachuEvents[1],
    });
    expect(receivedMessages[1]?.message).toStrictEqual({
      eventStoreId: pokemonEvtStoreId,
      event: charizardEvents[0],
    });
    expect(receivedMessages[2]?.message).toStrictEqual({
      eventStoreId: pokemonEvtStoreId,
      event: arcanineEvents[0],
    });
  });

  it('correctly rate limits', async () => {
    const rateLimit = 2;

    await pourEventStoreEvents({
      eventStore: pokemonEventStore,
      messageChannel: messageQueue,
      rateLimit,
    });

    const expectedDelay = 1000 / rateLimit;

    expect(receivedMessages.length).toBe(6);
    [...new Array(receivedMessages.length - 1).keys()].forEach(index => {
      const receivedDelay =
        (receivedMessages[index + 1]?.date as Date).getTime() -
        (receivedMessages[index]?.date as Date).getTime();

      // Expect delay imprecision to be less than 5%
      expect(
        Math.abs((receivedDelay - expectedDelay) / expectedDelay),
      ).toBeLessThan(0.05);
    });
  });
});
