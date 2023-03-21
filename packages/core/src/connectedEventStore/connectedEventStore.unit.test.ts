import { vi } from 'vitest';

import {
  userEventStore,
  storageAdapterMock,
} from '~/eventStore/eventStore.util.test';
import { StorageAdapter } from '~/storageAdapter';

import {
  notificationMessageQueue,
  stateCarryingMessageBus,
  userEventStoreWithNotificationMessageQueue,
  userEventStoreWithStateCarryingMessageBus,
} from './connectedEventStore.util.test';

export const anotherStorageAdapterMock: StorageAdapter = {
  pushEvent: vi.fn(),
  getEvents: vi.fn(),
  listAggregateIds: vi.fn(),
  putSnapshot: vi.fn(),
  getLastSnapshot: vi.fn(),
  listSnapshots: vi.fn(),
};

describe('ConnectedEventStore', () => {
  const aggregateId = 'user-1';
  const type = 'USER_REMOVED';
  const version = 2;
  const timestamp = '2022-01-01T00:00:00.000Z';

  const event = { aggregateId, type, version, timestamp } as const;
  const eventInput = { aggregateId, type, version } as const;

  const pushEvent = vi
    .spyOn(userEventStore, 'pushEvent')
    .mockResolvedValue({ event });

  beforeEach(() => {
    pushEvent.mockClear();
  });

  describe('notificationMessage', () => {
    const publishNotificationMessage = vi
      .spyOn(notificationMessageQueue, 'publishMessage')
      .mockResolvedValue();

    it('pushes the event and publishes the message in the message queue', async () => {
      await userEventStoreWithNotificationMessageQueue.pushEvent(eventInput);

      expect(pushEvent).toHaveBeenCalledOnce();
      expect(pushEvent).toHaveBeenCalledWith(eventInput, {});

      expect(publishNotificationMessage).toHaveBeenCalledOnce();
      expect(publishNotificationMessage).toHaveBeenCalledWith({
        eventStoreId: userEventStore.eventStoreId,
        event,
      });
    });
  });

  describe('stateCarryingMessage', () => {
    const previousEvent = {
      aggregateId,
      type: 'USER_CREATED',
      version: 1,
      timestamp: '2021-01-01T00:00:00.000Z',
      payload: { name: 'John', age: 30 },
    } as const;

    const events = [previousEvent, event];
    const v1Aggregate = userEventStore.buildAggregate([previousEvent]);
    const v2Aggregate = userEventStore.buildAggregate([previousEvent, event]);

    const getAggregate = vi
      .spyOn(userEventStoreWithStateCarryingMessageBus, 'getAggregate')
      .mockResolvedValue({ aggregate: v2Aggregate, events, lastEvent: event });

    const publishStateCarryingMessageMock = vi
      .spyOn(stateCarryingMessageBus, 'publishMessage')
      .mockResolvedValue();

    beforeEach(() => {
      getAggregate.mockClear();
      publishStateCarryingMessageMock.mockClear();
    });

    it('pushes the event, fetches aggregate & publishes the message in the message queue', async () => {
      await userEventStoreWithStateCarryingMessageBus.pushEvent(eventInput);

      expect(pushEvent).toHaveBeenCalledOnce();
      expect(pushEvent).toHaveBeenCalledWith(eventInput, {});

      expect(getAggregate).toHaveBeenCalledOnce();
      expect(getAggregate).toHaveBeenCalledWith(aggregateId, {
        maxVersion: event.version,
      });

      expect(publishStateCarryingMessageMock).toHaveBeenCalledOnce();
      expect(publishStateCarryingMessageMock).toHaveBeenCalledWith({
        eventStoreId: userEventStore.eventStoreId,
        event,
        aggregate: v2Aggregate,
      });
    });

    it('does not fetch the aggregate if it is provided', async () => {
      pushEvent.mockResolvedValue({ event, nextAggregate: v2Aggregate });

      await userEventStoreWithStateCarryingMessageBus.pushEvent(eventInput, {
        prevAggregate: v1Aggregate,
      });

      expect(pushEvent).toHaveBeenCalledOnce();
      expect(pushEvent).toHaveBeenCalledWith(eventInput, {
        prevAggregate: v1Aggregate,
      });

      expect(getAggregate).not.toHaveBeenCalled();

      expect(publishStateCarryingMessageMock).toHaveBeenCalledOnce();
      expect(publishStateCarryingMessageMock).toHaveBeenCalledWith({
        eventStoreId: userEventStore.eventStoreId,
        event,
        aggregate: v2Aggregate,
      });
    });

    it('does not fetch the aggregate if event version is 1', async () => {
      pushEvent.mockResolvedValue({ event, nextAggregate: v1Aggregate });

      await userEventStoreWithStateCarryingMessageBus.pushEvent(eventInput);

      expect(pushEvent).toHaveBeenCalledOnce();
      expect(pushEvent).toHaveBeenCalledWith(eventInput, {});

      expect(getAggregate).not.toHaveBeenCalled();

      expect(publishStateCarryingMessageMock).toHaveBeenCalledOnce();
      expect(publishStateCarryingMessageMock).toHaveBeenCalledWith({
        eventStoreId: userEventStore.eventStoreId,
        event,
        aggregate: v1Aggregate,
      });
    });
  });

  describe('storageAdapter', () => {
    it('sets & gets the original event storage adapter', () => {
      userEventStoreWithNotificationMessageQueue.storageAdapter =
        anotherStorageAdapterMock;
      expect(userEventStoreWithNotificationMessageQueue.storageAdapter).toBe(
        anotherStorageAdapterMock,
      );
      expect(userEventStore.storageAdapter).toBe(anotherStorageAdapterMock);

      userEventStore.storageAdapter = storageAdapterMock;
      expect(userEventStoreWithNotificationMessageQueue.storageAdapter).toBe(
        storageAdapterMock,
      );
      expect(userEventStore.storageAdapter).toBe(storageAdapterMock);
    });
  });
});
