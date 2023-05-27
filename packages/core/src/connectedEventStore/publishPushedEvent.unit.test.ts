import { vi } from 'vitest';

import { pokemonsEventStore } from '~/eventStore/eventStore.fixtures.test';

import {
  notificationMessageQueue,
  stateCarryingMessageBus,
  pokemonsEventStoreWithNotificationMessageQueue,
  pokemonsEventStoreWithStateCarryingMessageBus,
} from './connectedEventStore.fixtures.test';
import { publishPushedEvent } from './publishPushedEvent';

const eventStoreId = pokemonsEventStore.eventStoreId;

describe('publishPushedEvent', () => {
  const aggregateId = 'pokemon-1';
  const type = 'POKEMON_CATCHED';
  const version = 2;
  const timestamp = '2022-01-01T00:00:00.000Z';

  const event = { aggregateId, type, version, timestamp } as const;

  describe('notificationMessage', () => {
    const publishNotificationMessage = vi
      .spyOn(notificationMessageQueue, 'publishMessage')
      .mockResolvedValue();

    it('publishes pushed event the message in the message queue', async () => {
      await publishPushedEvent(pokemonsEventStoreWithNotificationMessageQueue, {
        event,
      });

      expect(publishNotificationMessage).toHaveBeenCalledOnce();
      expect(publishNotificationMessage).toHaveBeenCalledWith({
        eventStoreId,
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
    const v2Aggregate = pokemonsEventStore.buildAggregate(events);

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
      await publishPushedEvent(pokemonsEventStoreWithStateCarryingMessageBus, {
        event,
      });

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
      await publishPushedEvent(pokemonsEventStoreWithStateCarryingMessageBus, {
        event,
        nextAggregate: v2Aggregate,
      });

      expect(getAggregate).not.toHaveBeenCalled();

      expect(publishStateCarryingMessageMock).toHaveBeenCalledOnce();
      expect(publishStateCarryingMessageMock).toHaveBeenCalledWith({
        eventStoreId: pokemonsEventStore.eventStoreId,
        event,
        aggregate: v2Aggregate,
      });
    });
  });
});
