/* eslint-disable max-lines */
import type { queueAsPromised } from 'fastq';
import type { A } from 'ts-toolbelt';

import {
  EventStoreNotificationMessage,
  NotificationMessageQueue,
  MessageQueueSourceEventStores,
} from '@castore/core';
import { userEventStore, counterEventStore } from '@castore/demo-blueprint';

import { Task, InMemoryMessageQueueAdapter } from './queue';

const messageQueue = new NotificationMessageQueue({
  messageQueueId: 'messageQueueId',
  sourceEventStores: [userEventStore, counterEventStore],
});

type ExpectedMessage = EventStoreNotificationMessage<
  MessageQueueSourceEventStores<typeof messageQueue>
>;

const userCreatedEvent: EventStoreNotificationMessage<typeof userEventStore> = {
  eventStoreId: 'USER',
  event: {
    aggregateId: '1',
    version: 1,
    type: 'USER_CREATED',
    timestamp: '2021-01-01T00:00:00.000Z',
    payload: {
      firstName: 'gandalf',
      lastName: 'the grey',
    },
  },
};

const sleep = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

describe('in-memory message queue adapter', () => {
  describe('with constructor (typed)', () => {
    const handler1 = vi.fn(
      (event: EventStoreNotificationMessage<typeof userEventStore>) =>
        new Promise<void>(resolve => {
          event;
          resolve();
        }),
    );

    const handler2 = vi.fn(
      (event: EventStoreNotificationMessage<typeof userEventStore>) =>
        new Promise<void>(resolve => {
          event;
          resolve();
        }),
    );

    let inMemoryMessageQueueAdapter: InMemoryMessageQueueAdapter<
      EventStoreNotificationMessage<typeof userEventStore>
    >;

    beforeEach(() => {
      handler1.mockClear();
      handler2.mockClear();
    });

    it('does nothing if no handler is set', async () => {
      inMemoryMessageQueueAdapter = new InMemoryMessageQueueAdapter({});

      expect(inMemoryMessageQueueAdapter.queue).toBeUndefined();

      await inMemoryMessageQueueAdapter.publishMessage(userCreatedEvent);

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });

    it('has queue once handler has been set', async () => {
      inMemoryMessageQueueAdapter.handler = handler1;

      expect(inMemoryMessageQueueAdapter.queue).toBeDefined();

      await inMemoryMessageQueueAdapter.publishMessage(userCreatedEvent);

      expect(handler1).toHaveBeenCalledWith(userCreatedEvent);
      expect(handler2).not.toHaveBeenCalled();
    });

    it('recreates queue if new handler is set', async () => {
      inMemoryMessageQueueAdapter.handler = handler2;

      await inMemoryMessageQueueAdapter.publishMessage(userCreatedEvent);

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalledWith(userCreatedEvent);
    });

    it('actually connects to a messageQueue', async () => {
      messageQueue.messageQueueAdapter = inMemoryMessageQueueAdapter;

      await messageQueue.publishMessage(userCreatedEvent);

      expect(handler2).toHaveBeenCalledWith(userCreatedEvent);
    });

    it('accepts handler in constructor', async () => {
      const inMemoryMessageQueueAdapter2 = new InMemoryMessageQueueAdapter({
        handler: handler1,
      });

      await inMemoryMessageQueueAdapter2.publishMessage(userCreatedEvent);

      expect(handler1).toHaveBeenCalled();

      const assertQueueType: A.Equals<
        NonNullable<typeof inMemoryMessageQueueAdapter2.queue>,
        queueAsPromised<
          Task<EventStoreNotificationMessage<typeof userEventStore>>,
          void
        >
      > = 1;
      assertQueueType;
    });
  });

  describe('through static method', () => {
    const handler = vi.fn(
      (event: ExpectedMessage) =>
        new Promise<void>(resolve => {
          event;
          resolve();
        }),
    );

    beforeEach(() => {
      handler.mockClear();
    });

    it('correctly instanciates a class and attach it', async () => {
      const inMemoryMessageQueueAdapter =
        InMemoryMessageQueueAdapter.attachTo(messageQueue);

      const assertQueueType: A.Equals<
        typeof inMemoryMessageQueueAdapter,
        InMemoryMessageQueueAdapter<ExpectedMessage>
      > = 1;
      assertQueueType;

      inMemoryMessageQueueAdapter.handler = handler;

      await messageQueue.publishMessage(userCreatedEvent);
      expect(handler).toHaveBeenCalledWith(userCreatedEvent);
    });

    it('correctly instanciates a class and attach it (with handler)', async () => {
      InMemoryMessageQueueAdapter.attachTo(messageQueue, {
        handler: message =>
          new Promise(resolve => {
            const assertMessage: A.Equals<typeof message, ExpectedMessage> = 1;
            assertMessage;

            resolve();
          }),
      });

      const inMemoryMessageQueueAdapter = InMemoryMessageQueueAdapter.attachTo(
        messageQueue,
        { handler },
      );

      const assertQueueType: A.Equals<
        typeof inMemoryMessageQueueAdapter,
        InMemoryMessageQueueAdapter<ExpectedMessage>
      > = 1;
      assertQueueType;

      await messageQueue.publishMessage(userCreatedEvent);
      expect(handler).toHaveBeenCalledWith(userCreatedEvent);
    });
  });

  describe('retry policy', () => {
    const handler = vi.fn(
      (event: ExpectedMessage) =>
        new Promise<void>(resolve => {
          event;
          resolve();
        }),
    );

    const retryAttempts = 3;
    const retryDelayInMs = 1000;
    const retryBackoffRate = 1.5;

    const handlerExecutionsDates: Date[] = [];

    let testWaitTime = 1000; // margin of 1 sec
    for (let attempt = 1; attempt <= retryAttempts; attempt++) {
      testWaitTime += retryDelayInMs * Math.pow(retryBackoffRate, attempt - 1);

      // eslint-disable-next-line @typescript-eslint/require-await
      handler.mockImplementationOnce(async () => {
        handlerExecutionsDates.push(new Date());
        throw new Error();
      });
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    handler.mockImplementationOnce(async () => {
      handlerExecutionsDates.push(new Date());
    });

    it(
      'successfully retries',
      async () => {
        InMemoryMessageQueueAdapter.attachTo(messageQueue, {
          retryAttempts,
          retryDelayInMs,
          retryBackoffRate,
          handler,
        });

        await messageQueue.publishMessage(userCreatedEvent);

        await sleep(testWaitTime);

        expect(handler).toHaveBeenCalledTimes(retryAttempts + 1);

        expect(handlerExecutionsDates).toHaveLength(retryAttempts + 1);

        for (let attempt = 1; attempt <= retryAttempts; attempt++) {
          const receivedDelay =
            handlerExecutionsDates[attempt].getTime() -
            handlerExecutionsDates[attempt - 1].getTime();
          const expectedDelay =
            retryDelayInMs * Math.pow(retryBackoffRate, attempt - 1);

          // Expect delay imprecision to be less than 1%
          expect(
            Math.abs((receivedDelay - expectedDelay) / expectedDelay),
          ).toBeLessThan(0.01);
        }
      },
      { timeout: testWaitTime + 1000 },
    );
  });
});
