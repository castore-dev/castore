import { vi } from 'vitest';

import type { EventStorageAdapter } from '~/eventStorageAdapter';
import { EventStore } from '~/eventStore/eventStore';
import {
  eventStorageAdapterMock,
  pikachuAppearedEvent,
  pikachuCaughtEvent,
  pikachuLeveledUpEvent,
  PokemonEventDetails,
  pokemonsEventStore,
  pushEventGroupMock,
} from '~/eventStore/eventStore.fixtures.test';

import {
  pokemonsEventStoreWithNotificationMessageQueue,
  pokemonsEventStoreWithStateCarryingMessageBus,
} from './connectedEventStore.fixtures.test';
import * as publishPushedEventModule from './publishPushedEvent';

const publishPushedEventMock = vi
  .spyOn(publishPushedEventModule, 'publishPushedEvent')
  .mockResolvedValue();

const pushEvent = vi.spyOn(pokemonsEventStore, 'pushEvent');

export const anotherEventStorageAdapterMock: EventStorageAdapter = {
  pushEvent: vi.fn(),
  pushEventGroup: vi.fn(),
  groupEvent: vi.fn(),
  getEvents: vi.fn(),
  listAggregateIds: vi.fn(),
};

describe('ConnectedEventStore', () => {
  beforeEach(() => {
    pushEvent.mockClear();
    publishPushedEventMock.mockClear();
  });

  describe('pushEvent', () => {
    const aggregateId = 'pokemon-1';
    const type = 'POKEMON_CAUGHT';
    const version = 2;
    const timestamp = '2022-01-01T00:00:00.000Z';

    const event = { aggregateId, type, version, timestamp } as const;
    const eventInput = { aggregateId, type, version } as const;

    it('pushes the event and publishes the message in the message queue', async () => {
      pushEvent.mockResolvedValue({ event });

      await pokemonsEventStoreWithNotificationMessageQueue.pushEvent(
        eventInput,
      );

      expect(pushEvent).toHaveBeenCalledOnce();
      expect(pushEvent).toHaveBeenCalledWith(eventInput, {});

      expect(publishPushedEventMock).toHaveBeenCalledOnce();
      expect(publishPushedEventMock).toHaveBeenCalledWith(
        pokemonsEventStoreWithNotificationMessageQueue,
        { event },
      );
    });

    it('appends the aggregate to publishPushedEventMock if it is provided by original event store', async () => {
      const previousEvent = {
        aggregateId,
        type: 'POKEMON_APPEARED',
        version: 1,
        timestamp: '2021-01-01T00:00:00.000Z',
        payload: { name: 'Pikachu', level: 30 },
      } as const;

      const v1Aggregate = pokemonsEventStore.buildAggregate([previousEvent]);
      const v2Events = [previousEvent, event];
      const v2Aggregate = pokemonsEventStore.buildAggregate(v2Events);

      pushEvent.mockResolvedValue({ event, nextAggregate: v2Aggregate });

      await pokemonsEventStoreWithNotificationMessageQueue.pushEvent(
        eventInput,
        { prevAggregate: v1Aggregate },
      );

      expect(pushEvent).toHaveBeenCalledOnce();
      expect(pushEvent).toHaveBeenCalledWith(eventInput, {
        prevAggregate: v1Aggregate,
      });

      expect(publishPushedEventMock).toHaveBeenCalledOnce();
      expect(publishPushedEventMock).toHaveBeenCalledWith(
        pokemonsEventStoreWithNotificationMessageQueue,
        { event, nextAggregate: v2Aggregate },
      );
    });
  });

  describe('pushEventGroup', () => {
    const charizardLeveledUpEvent: PokemonEventDetails = {
      aggregateId: 'charizard1',
      version: 3,
      type: 'POKEMON_LEVELED_UP',
      timestamp: pikachuLeveledUpEvent.timestamp,
    };

    it('pushes new event group correctly to their respective bus/queues', async () => {
      const prevPikachuAggregate = pokemonsEventStore.buildAggregate([
        pikachuAppearedEvent,
      ]);
      const nextPikachuAggregate = pokemonsEventStore.buildAggregate([
        pikachuAppearedEvent,
        pikachuCaughtEvent,
      ]);

      const eventGroup = [
        pokemonsEventStoreWithStateCarryingMessageBus.groupEvent(
          pikachuCaughtEvent,
          { prevAggregate: prevPikachuAggregate },
        ),
        pokemonsEventStoreWithNotificationMessageQueue.groupEvent(
          charizardLeveledUpEvent,
        ),
      ] as const;

      pushEventGroupMock.mockResolvedValue({
        eventGroup: [
          { event: pikachuCaughtEvent },
          { event: charizardLeveledUpEvent },
        ],
      });

      await EventStore.pushEventGroup(...eventGroup);

      expect(publishPushedEventMock).toHaveBeenCalledTimes(2);
      expect(publishPushedEventMock).toHaveBeenCalledWith(
        pokemonsEventStoreWithStateCarryingMessageBus,
        { event: pikachuCaughtEvent, nextAggregate: nextPikachuAggregate },
      );
      expect(publishPushedEventMock).toHaveBeenCalledWith(
        pokemonsEventStoreWithNotificationMessageQueue,
        { event: charizardLeveledUpEvent },
      );
    });
  });

  describe('eventStorageAdapterMock', () => {
    it('sets & gets the original event storage adapter', () => {
      pokemonsEventStoreWithNotificationMessageQueue.eventStorageAdapter =
        anotherEventStorageAdapterMock;
      expect(
        pokemonsEventStoreWithNotificationMessageQueue.eventStorageAdapter,
      ).toBe(anotherEventStorageAdapterMock);
      expect(pokemonsEventStore.eventStorageAdapter).toBe(
        anotherEventStorageAdapterMock,
      );

      pokemonsEventStore.eventStorageAdapter = eventStorageAdapterMock;
      expect(
        pokemonsEventStoreWithNotificationMessageQueue.eventStorageAdapter,
      ).toBe(eventStorageAdapterMock);
      expect(pokemonsEventStore.eventStorageAdapter).toBe(
        eventStorageAdapterMock,
      );
    });
  });
});
