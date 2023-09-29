import {
  NotificationMessage,
  NotificationMessageQueue,
  EventStoreId,
  EventsQueryOptions,
} from '@castore/core';
import {
  InMemoryMessageQueueAdapter,
  TaskContext,
} from '@castore/message-queue-adapter-in-memory';

import {
  pokemonEventStore,
  pokemonEvtStoreId,
  pikachuId,
  pikachuEvents,
} from '../fixtures.test';
import { pourAggregateEvents } from './pourAggregateEvents';

const messageQueue = new NotificationMessageQueue({
  messageQueueId: 'testMessageQueue',
  sourceEventStores: [pokemonEventStore],
});

let receivedMessages: {
  date: Date;
  message: NotificationMessage<EventStoreId<typeof pokemonEventStore>>;
  context: TaskContext;
}[] = [];

InMemoryMessageQueueAdapter.attachTo(messageQueue, {
  worker: (message, context) =>
    new Promise(resolve => {
      receivedMessages.push({ date: new Date(), message, context });
      resolve();
    }),
});

describe('pourAggregateEvents', () => {
  beforeEach(() => {
    receivedMessages = [];
  });

  it('pours event store aggregate ids in correct order', async () => {
    const { pouredEventCount, firstPouredEvent, lastPouredEvent } =
      await pourAggregateEvents({
        eventStore: pokemonEventStore,
        messageChannel: messageQueue,
        aggregateId: pikachuId,
      });

    expect(pouredEventCount).toStrictEqual(3);
    expect(firstPouredEvent).toStrictEqual(pikachuEvents[0]);
    expect(lastPouredEvent).toStrictEqual(
      pikachuEvents[pikachuEvents.length - 1],
    );

    expect(receivedMessages).toHaveLength(3);
    expect(receivedMessages[0]?.message).toStrictEqual({
      eventStoreId: pokemonEvtStoreId,
      event: pikachuEvents[0],
    });
    expect(receivedMessages[0]?.context).toMatchObject({ replay: true });
    expect(receivedMessages[1]?.message).toStrictEqual({
      eventStoreId: pokemonEvtStoreId,
      event: pikachuEvents[1],
    });
    expect(receivedMessages[2]?.message).toStrictEqual({
      eventStoreId: pokemonEvtStoreId,
      event: pikachuEvents[2],
    });
  });

  it('correctly applies from & to filters', async () => {
    const { pouredEventCount, firstPouredEvent, lastPouredEvent } =
      await pourAggregateEvents({
        eventStore: pokemonEventStore,
        messageChannel: messageQueue,
        aggregateId: pikachuId,
        filters: {
          from: '2021-02-01T00:00:00.000Z',
          to: '2023-06-01T00:00:00.000Z',
        },
      });

    expect(pouredEventCount).toStrictEqual(1);
    expect(firstPouredEvent).toStrictEqual(pikachuEvents[1]);
    expect(lastPouredEvent).toStrictEqual(pikachuEvents[1]);

    expect(receivedMessages).toHaveLength(1);
    expect(receivedMessages[0]?.message).toStrictEqual({
      eventStoreId: pokemonEvtStoreId,
      event: pikachuEvents[1],
    });
  });

  it('correctly passes options', async () => {
    const options: EventsQueryOptions = {
      reverse: true,
      limit: 1,
      minVersion: 1,
      maxVersion: 3,
    };

    const getEventsMock = vi.spyOn(pokemonEventStore, 'getEvents');

    await pourAggregateEvents({
      eventStore: pokemonEventStore,
      messageChannel: messageQueue,
      aggregateId: pikachuId,
      options,
    });

    expect(getEventsMock).toHaveBeenCalledWith(pikachuId, options);

    getEventsMock.mockRestore();
  });

  it('correctly rate limits', async () => {
    const rateLimit = 2;

    await pourAggregateEvents({
      eventStore: pokemonEventStore,
      messageChannel: messageQueue,
      aggregateId: pikachuId,
      rateLimit,
    });

    const expectedDelay = 1000 / rateLimit;

    expect(receivedMessages.length).toBe(3);
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
