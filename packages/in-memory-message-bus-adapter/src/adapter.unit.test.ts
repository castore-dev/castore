/* eslint-disable max-lines */
import { EventEmitter } from 'events';
import type { A } from 'ts-toolbelt';

import {
  MessageBusMessage,
  EventStoreNotificationMessage,
  NotificationMessageBus,
} from '@castore/core';
import {
  pokemonsEventStore,
  trainersEventStore,
  pikachuAppearedEvent,
  pikachuCatchedEvent,
} from '@castore/demo-blueprint';

import { InMemoryMessageBusAdapter } from './adapter';

const messageBus = new NotificationMessageBus({
  messageBusId: 'messageBusId',
  sourceEventStores: [pokemonsEventStore, trainersEventStore],
});

type ExpectedMessage = MessageBusMessage<typeof messageBus>;

const pikachuAppearedMessage: EventStoreNotificationMessage<
  typeof pokemonsEventStore
> = {
  eventStoreId: 'POKEMONS',
  event: pikachuAppearedEvent,
};

const pikachuCatchedMessage: EventStoreNotificationMessage<
  typeof pokemonsEventStore
> = {
  eventStoreId: 'POKEMONS',
  event: pikachuCatchedEvent,
};

const sleep = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

describe('in-memory message queue adapter', () => {
  describe('with constructor (typed)', () => {
    const handler1 = vi.fn(
      (event: EventStoreNotificationMessage<typeof pokemonsEventStore>) =>
        new Promise<void>(resolve => {
          event;
          resolve();
        }),
    );

    const handler2 = vi.fn(
      (event: EventStoreNotificationMessage<typeof pokemonsEventStore>) =>
        new Promise<void>(resolve => {
          event;
          resolve();
        }),
    );

    const handler3 = vi.fn(
      (event: EventStoreNotificationMessage<typeof trainersEventStore>) =>
        new Promise<void>(resolve => {
          event;
          resolve();
        }),
    );

    const inMemoryMessageBusAdapter = new InMemoryMessageBusAdapter<
      EventStoreNotificationMessage<typeof pokemonsEventStore>
    >({ eventEmitter: new EventEmitter() });

    beforeEach(() => {
      handler1.mockClear();
      handler2.mockClear();
    });

    it('does nothing if no handler is set', async () => {
      await inMemoryMessageBusAdapter.publishMessage(pikachuAppearedMessage);

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });

    it('calls handler if it has been set', async () => {
      inMemoryMessageBusAdapter.on(
        { eventStoreId: 'POKEMONS', eventType: 'APPEARED' },
        handler1,
      );

      await inMemoryMessageBusAdapter.publishMessage(pikachuAppearedMessage);
      await inMemoryMessageBusAdapter.publishMessage(pikachuCatchedMessage);

      expect(handler1).toHaveBeenCalledOnce();
      expect(handler1).toHaveBeenCalledWith(pikachuAppearedMessage);

      inMemoryMessageBusAdapter.on(
        { eventStoreId: 'POKEMONS', eventType: 'CATCHED_BY_TRAINER' },
        handler1,
      );

      await inMemoryMessageBusAdapter.publishMessage(pikachuCatchedMessage);
      expect(handler1).toHaveBeenCalledTimes(2);
      expect(handler1).toHaveBeenCalledWith(pikachuCatchedMessage);
    });

    it('calls handler only once, event if matches several filter patterns', async () => {
      inMemoryMessageBusAdapter.on({ eventStoreId: 'POKEMONS' }, handler1);
      await inMemoryMessageBusAdapter.publishMessage(pikachuAppearedMessage);

      expect(handler1).toHaveBeenCalledOnce();
      expect(handler1).toHaveBeenCalledWith(pikachuAppearedMessage);
    });

    it('calls all handlers if needed', async () => {
      inMemoryMessageBusAdapter.on({}, handler2);

      await inMemoryMessageBusAdapter.publishMessage(pikachuAppearedMessage);

      expect(handler1).toHaveBeenCalledWith(pikachuAppearedMessage);
      expect(handler2).toHaveBeenCalledWith(pikachuAppearedMessage);
    });

    it('statically rejects invalid handlers', async () => {
      inMemoryMessageBusAdapter.on(
        { eventStoreId: 'POKEMONS', eventType: 'CATCHED_BY_TRAINER' },
        // @ts-expect-error handler doesn't handle POKEMONS event store
        handler3,
      );
      inMemoryMessageBusAdapter.on(
        // @ts-expect-error BATTLES is not a possible event store id
        { eventStoreId: 'BATTLES' },
        handler3,
      );

      await inMemoryMessageBusAdapter.publishMessage(pikachuAppearedMessage);
      expect(handler3).not.toHaveBeenCalled();
    });

    it('calls the handlers as many times as the number of messages to publish', async () => {
      const mockNumberOfEventToPublish = 3;
      await inMemoryMessageBusAdapter.publishMessages(
        Array.from(
          { length: mockNumberOfEventToPublish },
          () => pikachuAppearedMessage,
        ),
      );

      expect(handler1).toHaveBeenCalledTimes(mockNumberOfEventToPublish);
      expect(handler2).toHaveBeenCalledTimes(mockNumberOfEventToPublish);
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
      const inMemoryMessageBusAdapter = InMemoryMessageBusAdapter.attachTo(
        messageBus,
        { eventEmitter: new EventEmitter() },
      );

      expect(messageBus.messageBusAdapter).toBe(inMemoryMessageBusAdapter);

      const assertQueueType: A.Equals<
        typeof inMemoryMessageBusAdapter,
        InMemoryMessageBusAdapter<ExpectedMessage>
      > = 1;
      assertQueueType;

      inMemoryMessageBusAdapter.on({}, handler);

      await messageBus.publishMessage(pikachuAppearedMessage);
      expect(handler).toHaveBeenCalledWith(pikachuAppearedMessage);
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
        const inMemoryMessageBusAdapter = InMemoryMessageBusAdapter.attachTo(
          messageBus,
          {
            eventEmitter: new EventEmitter(),
            retryAttempts,
            retryDelayInMs,
            retryBackoffRate,
          },
        );

        inMemoryMessageBusAdapter.on({}, failingHandler);
        inMemoryMessageBusAdapter.on({}, succeedingHandler);

        await messageBus.publishMessage(pikachuAppearedMessage);

        await sleep(testWaitTime);

        expect(failingHandler).toHaveBeenCalledTimes(retryAttempts + 1);
        expect(succeedingHandler).toHaveBeenCalledTimes(1);

        expect(failingHandlerExecutionsDates).toHaveLength(retryAttempts + 1);

        for (let attempt = 1; attempt <= retryAttempts; attempt++) {
          const receivedDelay =
            (failingHandlerExecutionsDates[attempt] as Date).getTime() -
            (failingHandlerExecutionsDates[attempt - 1] as Date).getTime();
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
