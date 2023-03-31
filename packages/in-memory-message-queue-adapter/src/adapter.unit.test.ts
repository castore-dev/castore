/* eslint-disable max-lines */
import type { queueAsPromised } from 'fastq';
import type { A } from 'ts-toolbelt';

import {
  MessageQueueMessage,
  EventStoreNotificationMessage,
  NotificationMessageQueue,
} from '@castore/core';
import { userEventStore, counterEventStore } from '@castore/demo-blueprint';

import { Task, InMemoryMessageQueueAdapter } from './adapter';

const messageQueue = new NotificationMessageQueue({
  messageQueueId: 'messageQueueId',
  sourceEventStores: [userEventStore, counterEventStore],
});

type ExpectedMessage = MessageQueueMessage<typeof messageQueue>;

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
    const worker1 = vi.fn(
      (event: EventStoreNotificationMessage<typeof userEventStore>) =>
        new Promise<void>(resolve => {
          event;
          resolve();
        }),
    );

    const worker2 = vi.fn(
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
      worker1.mockClear();
      worker2.mockClear();
    });

    it('does nothing if no worker is set', async () => {
      inMemoryMessageQueueAdapter = new InMemoryMessageQueueAdapter({});

      expect(inMemoryMessageQueueAdapter.queue).toBeUndefined();

      await inMemoryMessageQueueAdapter.publishMessage(userCreatedEvent);

      expect(worker1).not.toHaveBeenCalled();
      expect(worker2).not.toHaveBeenCalled();
    });

    it('has queue once worker has been set', async () => {
      inMemoryMessageQueueAdapter.worker = worker1;

      expect(inMemoryMessageQueueAdapter.queue).toBeDefined();

      await inMemoryMessageQueueAdapter.publishMessage(userCreatedEvent);

      expect(worker1).toHaveBeenCalledWith(userCreatedEvent);
      expect(worker2).not.toHaveBeenCalled();
    });

    it('recreates queue if new worker is set', async () => {
      inMemoryMessageQueueAdapter.worker = worker2;

      await inMemoryMessageQueueAdapter.publishMessage(userCreatedEvent);

      expect(worker1).not.toHaveBeenCalled();
      expect(worker2).toHaveBeenCalledWith(userCreatedEvent);
    });

    it('actually connects to a messageQueue', async () => {
      messageQueue.messageQueueAdapter = inMemoryMessageQueueAdapter;

      await messageQueue.publishMessage(userCreatedEvent);

      expect(worker2).toHaveBeenCalledWith(userCreatedEvent);
    });

    it('accepts worker in constructor', async () => {
      const inMemoryMessageQueueAdapter2 = new InMemoryMessageQueueAdapter({
        worker: worker1,
      });

      await inMemoryMessageQueueAdapter2.publishMessage(userCreatedEvent);

      expect(worker1).toHaveBeenCalled();

      const assertQueueType: A.Equals<
        NonNullable<typeof inMemoryMessageQueueAdapter2.queue>,
        queueAsPromised<
          Task<EventStoreNotificationMessage<typeof userEventStore>>,
          void
        >
      > = 1;
      assertQueueType;
    });

    it('calls the worker as many times as the number of messages to publish', async () => {
      messageQueue.messageQueueAdapter = inMemoryMessageQueueAdapter;
      const mockNumberOfEventToPublish = 3;
      await messageQueue.publishMessages(
        Array.from(
          { length: mockNumberOfEventToPublish },
          () => userCreatedEvent,
        ),
      );

      expect(worker2).toHaveBeenCalledTimes(mockNumberOfEventToPublish);
    });
  });

  describe('through static method', () => {
    const worker = vi.fn(
      (event: ExpectedMessage) =>
        new Promise<void>(resolve => {
          event;
          resolve();
        }),
    );

    beforeEach(() => {
      worker.mockClear();
    });

    it('correctly instanciates a class and attach it', async () => {
      const inMemoryMessageQueueAdapter =
        InMemoryMessageQueueAdapter.attachTo(messageQueue);

      const assertQueueType: A.Equals<
        typeof inMemoryMessageQueueAdapter,
        InMemoryMessageQueueAdapter<ExpectedMessage>
      > = 1;
      assertQueueType;

      inMemoryMessageQueueAdapter.worker = worker;

      await messageQueue.publishMessage(userCreatedEvent);
      expect(worker).toHaveBeenCalledWith(userCreatedEvent);
    });

    it('correctly instanciates a class and attach it (with worker)', async () => {
      InMemoryMessageQueueAdapter.attachTo(messageQueue, {
        worker: message =>
          new Promise(resolve => {
            const assertMessage: A.Equals<typeof message, ExpectedMessage> = 1;
            assertMessage;

            resolve();
          }),
      });

      const inMemoryMessageQueueAdapter = InMemoryMessageQueueAdapter.attachTo(
        messageQueue,
        { worker },
      );

      const assertQueueType: A.Equals<
        typeof inMemoryMessageQueueAdapter,
        InMemoryMessageQueueAdapter<ExpectedMessage>
      > = 1;
      assertQueueType;

      await messageQueue.publishMessage(userCreatedEvent);
      expect(worker).toHaveBeenCalledWith(userCreatedEvent);
    });
  });

  describe('retry policy', () => {
    const worker = vi.fn(
      (event: ExpectedMessage) =>
        new Promise<void>(resolve => {
          event;
          resolve();
        }),
    );

    const retryAttempts = 3;
    const retryDelayInMs = 1000;
    const retryBackoffRate = 1.5;

    const workerExecutionsDates: Date[] = [];

    let testWaitTime = 1000; // margin of 1 sec
    for (let attempt = 1; attempt <= retryAttempts; attempt++) {
      testWaitTime += retryDelayInMs * Math.pow(retryBackoffRate, attempt - 1);

      // eslint-disable-next-line @typescript-eslint/require-await
      worker.mockImplementationOnce(async () => {
        workerExecutionsDates.push(new Date());
        throw new Error();
      });
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    worker.mockImplementationOnce(async () => {
      workerExecutionsDates.push(new Date());
    });

    it(
      'successfully retries',
      async () => {
        InMemoryMessageQueueAdapter.attachTo(messageQueue, {
          retryAttempts,
          retryDelayInMs,
          retryBackoffRate,
          worker,
        });

        await messageQueue.publishMessage(userCreatedEvent);

        await sleep(testWaitTime);

        expect(worker).toHaveBeenCalledTimes(retryAttempts + 1);

        expect(workerExecutionsDates).toHaveLength(retryAttempts + 1);

        for (let attempt = 1; attempt <= retryAttempts; attempt++) {
          const receivedDelay =
            workerExecutionsDates[attempt].getTime() -
            workerExecutionsDates[attempt - 1].getTime();
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
