import { vi } from 'vitest';

import {
  pokemonsEventStore,
  storageAdapterMock,
} from '~/eventStore/eventStore.fixtures.test';
import { StorageAdapter } from '~/storageAdapter';

import {
  notificationMessageQueue,
  stateCarryingMessageBus,
  pokemonsEventStoreWithNotificationMessageQueue,
  pokemonsEventStoreWithStateCarryingMessageBus,
} from './connectedEventStore.fixtures.test';

export const anotherStorageAdapterMock: StorageAdapter = {
  pushEvent: vi.fn(),
  groupEvent: vi.fn(),
  getEvents: vi.fn(),
  listAggregateIds: vi.fn(),
  putSnapshot: vi.fn(),
  getLastSnapshot: vi.fn(),
  listSnapshots: vi.fn(),
};

describe('ConnectedEventStore', () => {
  const aggregateId = 'pokemon-1';
  const type = 'POKEMON_CATCHED';
  const version = 2;
  const timestamp = '2022-01-01T00:00:00.000Z';

  const event = { aggregateId, type, version, timestamp } as const;
  const eventInput = { aggregateId, type, version } as const;

  const pushEvent = vi
    .spyOn(pokemonsEventStore, 'pushEvent')
    .mockResolvedValue({ event });

  beforeEach(() => {
    pushEvent.mockClear();
  });

  describe('notificationMessage', () => {
    const publishNotificationMessage = vi
      .spyOn(notificationMessageQueue, 'publishMessage')
      .mockResolvedValue();

    it('pushes the event and publishes the message in the message queue', async () => {
      await pokemonsEventStoreWithNotificationMessageQueue.pushEvent(
        eventInput,
      );

      expect(pushEvent).toHaveBeenCalledOnce();
      expect(pushEvent).toHaveBeenCalledWith(eventInput, {});

      expect(publishNotificationMessage).toHaveBeenCalledOnce();
      expect(publishNotificationMessage).toHaveBeenCalledWith({
        eventStoreId: pokemonsEventStore.eventStoreId,
        event,
      });
    });
  });

  describe('stateCarryingMessage', () => {
    const previousEvent = {
      aggregateId,
      type: 'POKEMON_APPEARED',
      version: 1,
      timestamp: '2021-01-01T00:00:00.000Z',
      payload: { name: 'Pikachu', level: 30 },
    } as const;

    const events = [previousEvent, event];
    const v1Aggregate = pokemonsEventStore.buildAggregate([previousEvent]);
    const v2Aggregate = pokemonsEventStore.buildAggregate([
      previousEvent,
      event,
    ]);

    const getAggregate = vi
      .spyOn(pokemonsEventStoreWithStateCarryingMessageBus, 'getAggregate')
      .mockResolvedValue({ aggregate: v2Aggregate, events, lastEvent: event });

    const publishStateCarryingMessageMock = vi
      .spyOn(stateCarryingMessageBus, 'publishMessage')
      .mockResolvedValue();

    beforeEach(() => {
      getAggregate.mockClear();
      publishStateCarryingMessageMock.mockClear();
    });

    it('pushes the event, fetches aggregate & publishes the message in the message queue', async () => {
      await pokemonsEventStoreWithStateCarryingMessageBus.pushEvent(eventInput);

      expect(pushEvent).toHaveBeenCalledOnce();
      expect(pushEvent).toHaveBeenCalledWith(eventInput, {});

      expect(getAggregate).toHaveBeenCalledOnce();
      expect(getAggregate).toHaveBeenCalledWith(aggregateId, {
        maxVersion: event.version,
      });

      expect(publishStateCarryingMessageMock).toHaveBeenCalledOnce();
      expect(publishStateCarryingMessageMock).toHaveBeenCalledWith({
        eventStoreId: pokemonsEventStore.eventStoreId,
        event,
        aggregate: v2Aggregate,
      });
    });

    it('does not fetch the aggregate if it is provided', async () => {
      pushEvent.mockResolvedValue({ event, nextAggregate: v2Aggregate });

      await pokemonsEventStoreWithStateCarryingMessageBus.pushEvent(
        eventInput,
        { prevAggregate: v1Aggregate },
      );

      expect(pushEvent).toHaveBeenCalledOnce();
      expect(pushEvent).toHaveBeenCalledWith(eventInput, {
        prevAggregate: v1Aggregate,
      });

      expect(getAggregate).not.toHaveBeenCalled();

      expect(publishStateCarryingMessageMock).toHaveBeenCalledOnce();
      expect(publishStateCarryingMessageMock).toHaveBeenCalledWith({
        eventStoreId: pokemonsEventStore.eventStoreId,
        event,
        aggregate: v2Aggregate,
      });
    });

    it('does not fetch the aggregate if event version is 1', async () => {
      pushEvent.mockResolvedValue({ event, nextAggregate: v1Aggregate });

      await pokemonsEventStoreWithStateCarryingMessageBus.pushEvent(eventInput);

      expect(pushEvent).toHaveBeenCalledOnce();
      expect(pushEvent).toHaveBeenCalledWith(eventInput, {});

      expect(getAggregate).not.toHaveBeenCalled();

      expect(publishStateCarryingMessageMock).toHaveBeenCalledOnce();
      expect(publishStateCarryingMessageMock).toHaveBeenCalledWith({
        eventStoreId: pokemonsEventStore.eventStoreId,
        event,
        aggregate: v1Aggregate,
      });
    });
  });

  describe('storageAdapter', () => {
    it('sets & gets the original event storage adapter', () => {
      pokemonsEventStoreWithNotificationMessageQueue.storageAdapter =
        anotherStorageAdapterMock;
      expect(
        pokemonsEventStoreWithNotificationMessageQueue.storageAdapter,
      ).toBe(anotherStorageAdapterMock);
      expect(pokemonsEventStore.storageAdapter).toBe(anotherStorageAdapterMock);

      pokemonsEventStore.storageAdapter = storageAdapterMock;
      expect(
        pokemonsEventStoreWithNotificationMessageQueue.storageAdapter,
      ).toBe(storageAdapterMock);
      expect(pokemonsEventStore.storageAdapter).toBe(storageAdapterMock);
    });
  });
});
