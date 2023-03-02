import type { queueAsPromised } from 'fastq';
import type { A } from 'ts-toolbelt';

import {
  NotificationMessage,
  NotificationMessageQueue,
  MessageQueueSourceEventStores,
} from '@castore/core';
import { userEventStore, counterEventStore } from '@castore/demo-blueprint';

import { InMemoryMessageQueueAdapter } from './queue';

const userCreatedEvent: NotificationMessage<typeof userEventStore> = {
  eventStoreId: 'USER',
  aggregateId: '1',
  version: 1,
  type: 'USER_CREATED',
  timestamp: '2021-01-01T00:00:00.000Z',
  payload: {
    firstName: 'gandalf',
    lastName: 'the grey',
  },
};

describe('in-memory message queue adapter', () => {
  describe('with constructor (typed)', () => {
    const callback1 = vi.fn(
      (event: NotificationMessage<typeof userEventStore>) =>
        new Promise<void>(resolve => {
          event;
          resolve();
        }),
    );

    const callback2 = vi.fn(
      (event: NotificationMessage<typeof userEventStore>) =>
        new Promise<void>(resolve => {
          event;
          resolve();
        }),
    );

    let inMemoryMessageQueueAdapter: InMemoryMessageQueueAdapter<
      NotificationMessage<typeof userEventStore>
    >;

    beforeEach(() => {
      callback1.mockClear();
      callback2.mockClear();
    });

    it('correctly instanciates a class', () => {
      inMemoryMessageQueueAdapter = new InMemoryMessageQueueAdapter({});

      expect(Object.keys(inMemoryMessageQueueAdapter)).toStrictEqual([
        'publishMessage',
      ]);
    });

    it('does nothing if no callback is set', async () => {
      expect(inMemoryMessageQueueAdapter.queue).toBeUndefined();

      await inMemoryMessageQueueAdapter.publishMessage(userCreatedEvent);

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();
    });

    it('has queue once callback has been set', async () => {
      inMemoryMessageQueueAdapter.callback = callback1;

      expect(inMemoryMessageQueueAdapter.queue).toBeDefined();

      await inMemoryMessageQueueAdapter.publishMessage(userCreatedEvent);

      expect(callback1).toHaveBeenCalledWith(userCreatedEvent);
      expect(callback2).not.toHaveBeenCalled();
    });

    it('recreates queue if new callback is set', async () => {
      inMemoryMessageQueueAdapter.callback = callback2;

      await inMemoryMessageQueueAdapter.publishMessage(userCreatedEvent);

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledWith(userCreatedEvent);
    });

    it('accepts callback in constructor', async () => {
      const inMemoryMessageQueueAdapter2 = new InMemoryMessageQueueAdapter({
        callback: callback1,
      });

      await inMemoryMessageQueueAdapter2.publishMessage(userCreatedEvent);

      expect(callback1).toHaveBeenCalled();

      const assertQueueType: A.Equals<
        NonNullable<typeof inMemoryMessageQueueAdapter2.queue>,
        queueAsPromised<NotificationMessage<typeof userEventStore>, void>
      > = 1;
      assertQueueType;
    });
  });

  describe('through static method', () => {
    const messageQueue = new NotificationMessageQueue({
      messageQueueId: 'messageQueueId',
      sourceEventStores: [userEventStore, counterEventStore],
    });

    type ExpectedMessage = NotificationMessage<
      MessageQueueSourceEventStores<typeof messageQueue>
    >;

    const callback = vi.fn(
      (event: ExpectedMessage) =>
        new Promise<void>(resolve => {
          event;
          resolve();
        }),
    );

    beforeEach(() => {
      callback.mockClear();
    });

    it('correctly instanciates a class and attach it', async () => {
      const inMemoryMessageQueueAdapter =
        InMemoryMessageQueueAdapter.attachTo(messageQueue);

      expect(Object.keys(inMemoryMessageQueueAdapter)).toStrictEqual([
        'publishMessage',
      ]);

      const assertQueueType: A.Equals<
        typeof inMemoryMessageQueueAdapter,
        InMemoryMessageQueueAdapter<ExpectedMessage>
      > = 1;
      assertQueueType;

      inMemoryMessageQueueAdapter.callback = callback;

      await messageQueue.publishMessage(userCreatedEvent);
      expect(callback).toHaveBeenCalledWith(userCreatedEvent);
    });

    it('correctly instanciates a class and attach it (with callback)', async () => {
      InMemoryMessageQueueAdapter.attachTo(
        messageQueue,
        message =>
          new Promise(resolve => {
            const assertMessage: A.Equals<typeof message, ExpectedMessage> = 1;
            assertMessage;

            resolve();
          }),
      );

      const inMemoryMessageQueueAdapter = InMemoryMessageQueueAdapter.attachTo(
        messageQueue,
        callback,
      );

      const assertQueueType: A.Equals<
        typeof inMemoryMessageQueueAdapter,
        InMemoryMessageQueueAdapter<ExpectedMessage>
      > = 1;
      assertQueueType;

      await messageQueue.publishMessage(userCreatedEvent);
      expect(callback).toHaveBeenCalledWith(userCreatedEvent);
    });
  });
});
