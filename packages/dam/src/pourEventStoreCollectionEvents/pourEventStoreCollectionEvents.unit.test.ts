import {
  NotificationMessage,
  NotificationMessageQueue,
  EventStoreId,
} from '@castore/core';
import {
  InMemoryMessageQueueAdapter,
  TaskContext,
} from '@castore/in-memory-message-queue-adapter';

import {
  pokemonEventStore,
  trainerEventStore,
  pokemonEvtStoreId,
  trainerEvtStoreId,
  ashKetchumId,
  ashKetchumEvents,
  garyOakId,
  garyOakEvents,
  pikachuId,
  pikachuEvents,
  charizardId,
  charizardEvents,
  arcanineId,
  arcanineEvents,
} from '../fixtures.test';
import { pourEventStoreCollectionEvents } from './pourEventStoreCollectionEvents';

const messageQueue = new NotificationMessageQueue({
  messageQueueId: 'testMessageQueue',
  sourceEventStores: [pokemonEventStore, trainerEventStore],
});

let receivedMessages: {
  date: Date;
  message: NotificationMessage<
    EventStoreId<typeof pokemonEventStore | typeof trainerEventStore>
  >;
  context: TaskContext;
}[] = [];

InMemoryMessageQueueAdapter.attachTo(messageQueue, {
  worker: (message, context) =>
    new Promise(resolve => {
      receivedMessages.push({ date: new Date(), message, context });
      resolve();
    }),
});

describe('pourEventStoreEvents', () => {
  beforeEach(() => {
    receivedMessages = [];
  });

  it('pours event store events in correct order', async () => {
    const { pouredEventCount, scans } = await pourEventStoreCollectionEvents({
      eventStores: [pokemonEventStore, trainerEventStore],
      messageChannel: messageQueue,
    });

    expect(pouredEventCount).toStrictEqual(10);
    expect(scans).toStrictEqual({
      [pokemonEvtStoreId]: {
        firstScannedAggregate: { aggregateId: pikachuId },
        lastScannedAggregate: { aggregateId: arcanineId },
      },
      [trainerEvtStoreId]: {
        firstScannedAggregate: {
          aggregateId: ashKetchumId,
        },
        lastScannedAggregate: {
          aggregateId: garyOakId,
        },
      },
    });

    expect(receivedMessages).toHaveLength(10);

    expect(receivedMessages[0]?.message).toStrictEqual({
      eventStoreId: trainerEvtStoreId,
      // 2020-12-01T00:00:00.000Z
      event: ashKetchumEvents[0],
    });
    expect(receivedMessages[0]?.context).toMatchObject({
      replay: true,
    });

    expect(receivedMessages[1]?.message).toStrictEqual({
      eventStoreId: pokemonEvtStoreId,
      // 2021-01-01T00:00:00.000Z
      event: pikachuEvents[0],
    });
    expect(receivedMessages[2]?.message).toStrictEqual({
      eventStoreId: trainerEvtStoreId,
      // 2022-01-01T00:00:00.000Z
      event: ashKetchumEvents[1],
    });
    expect(receivedMessages[3]?.message).toStrictEqual({
      eventStoreId: pokemonEvtStoreId,
      // 2022-01-01T00:00:00.000Z
      event: pikachuEvents[1],
    });
    expect(receivedMessages[4]?.message).toStrictEqual({
      eventStoreId: pokemonEvtStoreId,
      // 2022-07-01T00:00:00.000Z
      event: charizardEvents[0],
    });
    expect(receivedMessages[5]?.message).toStrictEqual({
      eventStoreId: trainerEvtStoreId,
      // 2022-12-01T00:00:00.000Z
      event: garyOakEvents[0],
    });
    expect(receivedMessages[6]?.message).toStrictEqual({
      eventStoreId: pokemonEvtStoreId,
      // 2023-01-01T00:00:00.000Z
      event: arcanineEvents[0],
    });
    expect(receivedMessages[7]?.message).toStrictEqual({
      eventStoreId: pokemonEvtStoreId,
      // 2023-07-01T00:00:00.000Z
      event: pikachuEvents[2],
    });
    expect(receivedMessages[8]?.message).toStrictEqual({
      eventStoreId: trainerEvtStoreId,
      // 2024-01-01T00:00:00.000Z
      event: garyOakEvents[1],
    });
    expect(receivedMessages[9]?.message).toStrictEqual({
      eventStoreId: pokemonEvtStoreId,
      // 2024-01-01T00:00:00.000Z
      event: arcanineEvents[1],
    });
  });

  it('correctly filters events based on from & to', async () => {
    const { pouredEventCount, scans } = await pourEventStoreCollectionEvents({
      eventStores: [pokemonEventStore, trainerEventStore],
      messageChannel: messageQueue,
      filters: {
        from: '2021-07-01T00:00:00.000Z',
        to: '2022-11-01T00:00:00.000Z',
      },
    });

    expect(pouredEventCount).toStrictEqual(3);
    expect(scans).toStrictEqual({
      [pokemonEvtStoreId]: {
        firstScannedAggregate: { aggregateId: pikachuId },
        lastScannedAggregate: { aggregateId: charizardId },
      },
      [trainerEvtStoreId]: {
        firstScannedAggregate: { aggregateId: ashKetchumId },
        lastScannedAggregate: { aggregateId: ashKetchumId },
      },
    });

    expect(receivedMessages).toHaveLength(3);

    expect(receivedMessages[0]?.message).toStrictEqual({
      eventStoreId: trainerEvtStoreId,
      // 2022-01-01T00:00:00.000Z
      event: ashKetchumEvents[1],
    });
    expect(receivedMessages[1]?.message).toStrictEqual({
      eventStoreId: pokemonEvtStoreId,
      // 2022-01-01T00:00:00.000Z
      event: pikachuEvents[1],
    });
    expect(receivedMessages[2]?.message).toStrictEqual({
      eventStoreId: pokemonEvtStoreId,
      // 2022-07-01T00:00:00.000Z
      event: charizardEvents[0],
    });
  });

  it('correctly rate limits', async () => {
    const rateLimit = 2;

    await pourEventStoreCollectionEvents({
      eventStores: [pokemonEventStore, trainerEventStore],
      messageChannel: messageQueue,
      rateLimit,
    });

    const expectedDelay = 1000 / rateLimit;

    expect(receivedMessages.length).toBe(10);
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
