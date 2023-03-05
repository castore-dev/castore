import { EventEmitter } from 'events';
import type { A } from 'ts-toolbelt';

import {
  NotificationMessage,
  NotificationMessageBus,
  MessageBusSourceEventStores,
} from '@castore/core';
import { userEventStore, counterEventStore } from '@castore/demo-blueprint';

import { InMemoryMessageBusAdapter } from './inMemory';

const eventEmitter = new EventEmitter();

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

const userRemovedEvent: NotificationMessage<typeof userEventStore> = {
  eventStoreId: 'USER',
  aggregateId: '1',
  version: 1,
  type: 'USER_REMOVED',
  timestamp: '2021-01-01T00:00:00.000Z',
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

    const callback3 = vi.fn(
      (event: NotificationMessage<typeof counterEventStore>) =>
        new Promise<void>(resolve => {
          event;
          resolve();
        }),
    );

    let inMemoryMessageQueueAdapter: InMemoryMessageBusAdapter<
      NotificationMessage<typeof userEventStore>
    >;

    beforeEach(() => {
      callback1.mockClear();
      callback2.mockClear();
    });

    it('correctly instanciates a class', () => {
      inMemoryMessageQueueAdapter = new InMemoryMessageBusAdapter({
        eventEmitter,
      });

      expect(Object.keys(inMemoryMessageQueueAdapter)).toStrictEqual([
        'eventEmitter',
        'publishMessage',
        'callbacks',
        'filterPatterns',
        'on',
      ]);
    });

    it('does nothing if no callback is set', async () => {
      await inMemoryMessageQueueAdapter.publishMessage(userCreatedEvent);

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();
    });

    it('calls callback if it has been set', async () => {
      inMemoryMessageQueueAdapter.on(
        { eventStoreId: 'USER', type: 'USER_CREATED' },
        callback1,
      );

      await inMemoryMessageQueueAdapter.publishMessage(userCreatedEvent);
      await inMemoryMessageQueueAdapter.publishMessage(userRemovedEvent);

      expect(callback1).toHaveBeenCalledOnce();
      expect(callback1).toHaveBeenCalledWith(userCreatedEvent);

      inMemoryMessageQueueAdapter.on(
        { eventStoreId: 'USER', type: 'USER_REMOVED' },
        callback1,
      );

      await inMemoryMessageQueueAdapter.publishMessage(userRemovedEvent);
      expect(callback1).toHaveBeenCalledTimes(2);
      expect(callback1).toHaveBeenCalledWith(userRemovedEvent);
    });

    it('calls callback only once, event if matches several filter patterns', async () => {
      inMemoryMessageQueueAdapter.on({ eventStoreId: 'USER' }, callback1);
      await inMemoryMessageQueueAdapter.publishMessage(userCreatedEvent);

      expect(callback1).toHaveBeenCalledOnce();
      expect(callback1).toHaveBeenCalledWith(userCreatedEvent);
    });

    it('calls all callbacks if needed', async () => {
      inMemoryMessageQueueAdapter.on({}, callback2);

      await inMemoryMessageQueueAdapter.publishMessage(userCreatedEvent);

      expect(callback1).toHaveBeenCalledWith(userCreatedEvent);
      expect(callback2).toHaveBeenCalledWith(userCreatedEvent);
    });

    it('statically rejects invalid callbacks', async () => {
      inMemoryMessageQueueAdapter.on(
        { eventStoreId: 'USER', type: 'USER_REMOVED' },
        // @ts-expect-error callback doesn't handle USER event store
        callback3,
      );
      inMemoryMessageQueueAdapter.on(
        // @ts-expect-error COUNTERS is not a possible event store id
        { eventStoreId: 'COUNTERS' },
        callback3,
      );

      await inMemoryMessageQueueAdapter.publishMessage(userCreatedEvent);
      expect(callback3).not.toHaveBeenCalled();
    });
  });

  describe('through static method', () => {
    const messageBus = new NotificationMessageBus({
      messageBusId: 'messageBusId',
      sourceEventStores: [userEventStore, counterEventStore],
    });

    type ExpectedMessage = NotificationMessage<
      MessageBusSourceEventStores<typeof messageBus>
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
      const inMemoryMessageQueueAdapter = InMemoryMessageBusAdapter.attachTo(
        messageBus,
        eventEmitter,
      );

      expect(Object.keys(inMemoryMessageQueueAdapter)).toStrictEqual([
        'eventEmitter',
        'publishMessage',
        'callbacks',
        'filterPatterns',
        'on',
      ]);

      const assertQueueType: A.Equals<
        typeof inMemoryMessageQueueAdapter,
        InMemoryMessageBusAdapter<ExpectedMessage>
      > = 1;
      assertQueueType;

      inMemoryMessageQueueAdapter.on({}, callback);

      await messageBus.publishMessage(userCreatedEvent);
      expect(callback).toHaveBeenCalledWith(userCreatedEvent);
    });
  });
});
