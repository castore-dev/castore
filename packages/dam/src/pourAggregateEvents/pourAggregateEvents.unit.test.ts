import {
  NotificationMessage,
  NotificationMessageQueue,
  EventStoreId,
  EventsQueryOptions,
} from '@castore/core';
import { InMemoryMessageQueueAdapter } from '@castore/in-memory-message-queue-adapter';

import {
  mockedEventStore,
  eventStoreId,
  aggregate1Id,
  aggregate1Events,
} from '../fixtures.test';
import { pourAggregateEvents } from './pourAggregateEvents';

const messageQueue = new NotificationMessageQueue({
  messageQueueId: 'testMessageQueue',
  sourceEventStores: [mockedEventStore],
});

let receivedMessages: {
  date: Date;
  message: NotificationMessage<EventStoreId<typeof mockedEventStore>>;
}[] = [];

InMemoryMessageQueueAdapter.attachTo(messageQueue, {
  worker: message =>
    new Promise(resolve => {
      receivedMessages.push({ date: new Date(), message });
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
        eventStore: mockedEventStore,
        messageChannel: messageQueue,
        aggregateId: aggregate1Id,
      });

    expect(pouredEventCount).toStrictEqual(3);
    expect(firstPouredEvent).toStrictEqual(aggregate1Events[0]);
    expect(lastPouredEvent).toStrictEqual(
      aggregate1Events[aggregate1Events.length - 1],
    );

    expect(receivedMessages).toHaveLength(3);
    expect(receivedMessages[0]?.message).toStrictEqual({
      eventStoreId,
      event: aggregate1Events[0],
    });
    expect(receivedMessages[1]?.message).toStrictEqual({
      eventStoreId,
      event: aggregate1Events[1],
    });
    expect(receivedMessages[2]?.message).toStrictEqual({
      eventStoreId,
      event: aggregate1Events[2],
    });
  });

  it('correctly applies from & to filters', async () => {
    const { pouredEventCount, firstPouredEvent, lastPouredEvent } =
      await pourAggregateEvents({
        eventStore: mockedEventStore,
        messageChannel: messageQueue,
        aggregateId: aggregate1Id,
        filters: {
          from: '2021-02-01T00:00:00.000Z',
          to: '2023-06-01T00:00:00.000Z',
        },
      });

    expect(pouredEventCount).toStrictEqual(1);
    expect(firstPouredEvent).toStrictEqual(aggregate1Events[1]);
    expect(lastPouredEvent).toStrictEqual(aggregate1Events[1]);

    expect(receivedMessages).toHaveLength(1);
    expect(receivedMessages[0]?.message).toStrictEqual({
      eventStoreId,
      event: aggregate1Events[1],
    });
  });

  it('correctly passes options', async () => {
    const options: EventsQueryOptions = {
      reverse: true,
      limit: 1,
      minVersion: 1,
      maxVersion: 3,
    };

    const getEventsMock = vi.spyOn(mockedEventStore, 'getEvents');

    await pourAggregateEvents({
      eventStore: mockedEventStore,
      messageChannel: messageQueue,
      aggregateId: aggregate1Id,
      options,
    });

    expect(getEventsMock).toHaveBeenCalledWith(aggregate1Id, options);

    getEventsMock.mockRestore();
  });

  it('correctly rate limits', async () => {
    const rateLimit = 2;

    await pourAggregateEvents({
      eventStore: mockedEventStore,
      messageChannel: messageQueue,
      aggregateId: aggregate1Id,
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
