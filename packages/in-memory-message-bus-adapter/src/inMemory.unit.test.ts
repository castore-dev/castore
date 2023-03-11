/* eslint-disable max-lines */
import { EventEmitter } from 'events';
import type { A } from 'ts-toolbelt';

import {
  MessageBusMessage,
  EventStoreNotificationMessage,
  NotificationMessageBus,
} from '@castore/core';
import { userEventStore, counterEventStore } from '@castore/demo-blueprint';

import { InMemoryMessageBusAdapter } from './inMemory';

const messageBus = new NotificationMessageBus({
  messageBusId: 'messageBusId',
  sourceEventStores: [userEventStore, counterEventStore],
});

type ExpectedMessage = MessageBusMessage<typeof messageBus>;

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

const userRemovedEvent: EventStoreNotificationMessage<typeof userEventStore> = {
  eventStoreId: 'USER',
  event: {
    aggregateId: '1',
    version: 1,
    type: 'USER_REMOVED',
    timestamp: '2021-01-01T00:00:00.000Z',
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

    const handler3 = vi.fn(
      (event: EventStoreNotificationMessage<typeof counterEventStore>) =>
        new Promise<void>(resolve => {
          event;
          resolve();
        }),
    );

    const inMemoryMessageQueueAdapter = new InMemoryMessageBusAdapter<
      EventStoreNotificationMessage<typeof userEventStore>
    >({ eventEmitter: new EventEmitter() });

    beforeEach(() => {
      handler1.mockClear();
      handler2.mockClear();
    });

    it('does nothing if no handler is set', async () => {
      await inMemoryMessageQueueAdapter.publishMessage(userCreatedEvent);

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });

    it('calls handler if it has been set', async () => {
      inMemoryMessageQueueAdapter.on(
        { eventStoreId: 'USER', eventType: 'USER_CREATED' },
        handler1,
      );

      await inMemoryMessageQueueAdapter.publishMessage(userCreatedEvent);
      await inMemoryMessageQueueAdapter.publishMessage(userRemovedEvent);

      expect(handler1).toHaveBeenCalledOnce();
      expect(handler1).toHaveBeenCalledWith(userCreatedEvent);

      inMemoryMessageQueueAdapter.on(
        { eventStoreId: 'USER', eventType: 'USER_REMOVED' },
        handler1,
      );

      await inMemoryMessageQueueAdapter.publishMessage(userRemovedEvent);
      expect(handler1).toHaveBeenCalledTimes(2);
      expect(handler1).toHaveBeenCalledWith(userRemovedEvent);
    });

    it('calls handler only once, event if matches several filter patterns', async () => {
      inMemoryMessageQueueAdapter.on({ eventStoreId: 'USER' }, handler1);
      await inMemoryMessageQueueAdapter.publishMessage(userCreatedEvent);

      expect(handler1).toHaveBeenCalledOnce();
      expect(handler1).toHaveBeenCalledWith(userCreatedEvent);
    });

    it('calls all handlers if needed', async () => {
      inMemoryMessageQueueAdapter.on({}, handler2);

      await inMemoryMessageQueueAdapter.publishMessage(userCreatedEvent);

      expect(handler1).toHaveBeenCalledWith(userCreatedEvent);
      expect(handler2).toHaveBeenCalledWith(userCreatedEvent);
    });

    it('statically rejects invalid handlers', async () => {
      inMemoryMessageQueueAdapter.on(
        { eventStoreId: 'USER', eventType: 'USER_REMOVED' },
        // @ts-expect-error handler doesn't handle USER event store
        handler3,
      );
      inMemoryMessageQueueAdapter.on(
        // @ts-expect-error COUNTERS is not a possible event store id
        { eventStoreId: 'COUNTERS' },
        handler3,
      );

      await inMemoryMessageQueueAdapter.publishMessage(userCreatedEvent);
      expect(handler3).not.toHaveBeenCalled();
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
      const inMemoryMessageQueueAdapter = InMemoryMessageBusAdapter.attachTo(
        messageBus,
        { eventEmitter: new EventEmitter() },
      );

      expect(messageBus.messageBusAdapter).toBe(inMemoryMessageQueueAdapter);

      const assertQueueType: A.Equals<
        typeof inMemoryMessageQueueAdapter,
        InMemoryMessageBusAdapter<ExpectedMessage>
      > = 1;
      assertQueueType;

      inMemoryMessageQueueAdapter.on({}, handler);

      await messageBus.publishMessage(userCreatedEvent);
      expect(handler).toHaveBeenCalledWith(userCreatedEvent);
    });
  });

  describe('retry policy', () => {
    const failingHandler = vi.fn(
      (event: ExpectedMessage) =>
        new Promise<void>(resolve => {
          event;
          resolve();
        }),
    );
    const succeedingHandler = vi.fn(
      (event: ExpectedMessage) =>
        new Promise<void>(resolve => {
          event;
          resolve();
        }),
    );

    const retryAttempts = 3;
    const retryDelayInMs = 1000;
    const retryBackoffRate = 1.5;

    const failingHandlerExecutionsDates: Date[] = [];

    let testWaitTime = 1000; // margin of 1 sec
    for (let attempt = 1; attempt <= retryAttempts; attempt++) {
      testWaitTime += retryDelayInMs * Math.pow(retryBackoffRate, attempt - 1);

      // eslint-disable-next-line @typescript-eslint/require-await
      failingHandler.mockImplementationOnce(async () => {
        failingHandlerExecutionsDates.push(new Date());
        throw new Error();
      });
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    failingHandler.mockImplementationOnce(async () => {
      failingHandlerExecutionsDates.push(new Date());
    });

    it(
      'successfully retries',
      async () => {
        const inMemoryMessageQueueAdapter = InMemoryMessageBusAdapter.attachTo(
          messageBus,
          {
            eventEmitter: new EventEmitter(),
            retryAttempts,
            retryDelayInMs,
            retryBackoffRate,
          },
        );

        inMemoryMessageQueueAdapter.on({}, failingHandler);
        inMemoryMessageQueueAdapter.on({}, succeedingHandler);

        await messageBus.publishMessage(userCreatedEvent);

        await sleep(testWaitTime);

        expect(failingHandler).toHaveBeenCalledTimes(retryAttempts + 1);
        expect(succeedingHandler).toHaveBeenCalledTimes(1);

        expect(failingHandlerExecutionsDates).toHaveLength(retryAttempts + 1);

        for (let attempt = 1; attempt <= retryAttempts; attempt++) {
          const receivedDelay =
            failingHandlerExecutionsDates[attempt].getTime() -
            failingHandlerExecutionsDates[attempt - 1].getTime();
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
