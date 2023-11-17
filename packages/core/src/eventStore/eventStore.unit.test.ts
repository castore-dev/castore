/* eslint-disable max-lines */
import { GroupedEvent } from '~/event/groupedEvent';

import { AggregateNotFoundError } from './errors/aggregateNotFound';
import { EventStore } from './eventStore';
import {
  PokemonAggregate,
  pokemonsEventStore,
  pokemonsEventStoreAutoSnapshots,
  pokemonsEventStoreCustomSnapshot,
  pokemonAppearedEvent,
  pokemonCaughtEvent,
  pokemonLeveledUpEvent,
  pokemonsReducer,
  pikachuId,
  pikachuAppearedEvent,
  pikachuLeveledUpEvent,
  pikachuCaughtEvent,
  pikachuEventsMocks,
  getEventsMock,
  pushEventMock,
  pushEventGroupMock,
  listAggregateIdsMock,
  groupEventMock,
  eventStorageAdapterMock,
  PokemonEventDetails,
} from './eventStore.fixtures.test';

describe('event store', () => {
  beforeEach(() => {
    getEventsMock.mockClear();
    getEventsMock.mockResolvedValue({ events: pikachuEventsMocks });
    pushEventMock.mockClear();
    listAggregateIdsMock.mockClear();
    listAggregateIdsMock.mockReturnValue({ aggregateIds: [pikachuId] });
  });

  it('has correct properties', () => {
    expect(new Set(Object.keys(pokemonsEventStore))).toStrictEqual(
      new Set([
        'eventStoreId',
        'eventTypes',
        'snapshotMode',
        'reducers',
        'currentReducerVersion',
        'reducer',
        'simulateSideEffect',
        'eventStorageAdapter',
        'getEventStorageAdapter',
        'pushEvent',
        'groupEvent',
        'buildAggregate',
        'getEvents',
        'listAggregateIds',
        'getAggregate',
        'getExistingAggregate',
        'simulateAggregate',
      ]),
    );

    expect(pokemonsEventStore.eventStoreId).toBe('POKEMONS');
    expect(pokemonsEventStore.eventTypes).toStrictEqual([
      pokemonAppearedEvent,
      pokemonCaughtEvent,
      pokemonLeveledUpEvent,
    ]);
    expect(pokemonsEventStore.snapshotMode).toBe('none');
    expect(pokemonsEventStore.reducers).toBeUndefined();
    expect(pokemonsEventStore.currentReducerVersion).toBeUndefined();

    expect(pokemonsEventStoreAutoSnapshots.eventStoreId).toBe('POKEMONS_2');
    expect(pokemonsEventStoreAutoSnapshots.eventTypes).toStrictEqual([
      pokemonAppearedEvent,
      pokemonCaughtEvent,
      pokemonLeveledUpEvent,
    ]);
    expect(pokemonsEventStoreAutoSnapshots.snapshotMode).toBe('auto');
    expect(pokemonsEventStoreAutoSnapshots.reducers).toBeUndefined();
    expect(pokemonsEventStoreAutoSnapshots.currentReducerVersion).toBe('v1');

    expect(pokemonsEventStoreCustomSnapshot.eventStoreId).toBe('POKEMONS_3');
    expect(pokemonsEventStoreCustomSnapshot.eventTypes).toStrictEqual([
      pokemonAppearedEvent,
      pokemonCaughtEvent,
      pokemonLeveledUpEvent,
    ]);

    expect(pokemonsEventStoreCustomSnapshot.snapshotMode).toBe('custom');
    expect(pokemonsEventStoreCustomSnapshot.reducers).not.toBeUndefined();
    expect(pokemonsEventStoreCustomSnapshot.currentReducerVersion).toBe('v2');
    expect(pokemonsEventStoreCustomSnapshot.reducer).toBe(
      pokemonsEventStoreCustomSnapshot.reducers[
        pokemonsEventStoreCustomSnapshot.currentReducerVersion
      ],
    );
  });

  describe('getEvents', () => {
    it('gets events correctly', async () => {
      const response = await pokemonsEventStore.getEvents(pikachuId);

      expect(getEventsMock).toHaveBeenCalledTimes(1);
      expect(getEventsMock).toHaveBeenCalledWith(
        pikachuId,
        { eventStoreId: pokemonsEventStore.eventStoreId },
        undefined,
      );
      expect(response).toStrictEqual({ events: pikachuEventsMocks });
    });
  });

  describe('getAggregate', () => {
    it('gets aggregate correctly', async () => {
      const response = await pokemonsEventStore.getAggregate(pikachuId);

      expect(getEventsMock).toHaveBeenCalledTimes(1);
      expect(getEventsMock).toHaveBeenCalledWith(
        pikachuId,
        { eventStoreId: pokemonsEventStore.eventStoreId },
        {},
      );
      expect(response).toStrictEqual({
        aggregate: pikachuEventsMocks.reduce(
          pokemonsReducer,
          undefined as unknown as PokemonAggregate,
        ),
        events: pikachuEventsMocks,
        lastEvent: pikachuEventsMocks[pikachuEventsMocks.length - 1],
      });
    });
  });

  describe('getExistingAggregate', () => {
    it('gets aggregate correctly if it exists', async () => {
      const response = await pokemonsEventStore.getExistingAggregate(pikachuId);

      expect(getEventsMock).toHaveBeenCalledTimes(1);
      expect(getEventsMock).toHaveBeenCalledWith(
        pikachuId,
        { eventStoreId: pokemonsEventStore.eventStoreId },
        {},
      );

      expect(response).toStrictEqual({
        aggregate: pikachuEventsMocks.reduce(
          pokemonsReducer,
          undefined as unknown as PokemonAggregate,
        ),
        events: pikachuEventsMocks,
        lastEvent: pikachuEventsMocks[pikachuEventsMocks.length - 1],
      });
    });

    it('throws an AggregateNotFound error if it does not', async () => {
      getEventsMock.mockResolvedValue({ events: [] });

      await expect(() =>
        pokemonsEventStore.getExistingAggregate(pikachuId),
      ).rejects.toThrow(
        new AggregateNotFoundError({
          eventStoreId: pokemonsEventStore.eventStoreId,
          aggregateId: pikachuId,
        }),
      );
    });
  });

  describe('pushEvent', () => {
    it('pushes new event correctly', async () => {
      pushEventMock.mockResolvedValue({ event: pikachuLeveledUpEvent });

      const response = await pokemonsEventStore.pushEvent(
        pikachuLeveledUpEvent,
      );

      expect(pushEventMock).toHaveBeenCalledTimes(1);
      expect(pushEventMock).toHaveBeenCalledWith(pikachuLeveledUpEvent, {
        eventStoreId: pokemonsEventStore.eventStoreId,
        force: false,
      });
      expect(response).toStrictEqual({ event: pikachuLeveledUpEvent });
    });

    it('returns the next aggregate if event is initial event', async () => {
      pushEventMock.mockResolvedValue({ event: pikachuAppearedEvent });

      const response = await pokemonsEventStore.pushEvent(pikachuAppearedEvent);

      expect(response).toStrictEqual({
        event: pikachuAppearedEvent,
        nextAggregate: pokemonsEventStore.buildAggregate([
          pikachuAppearedEvent,
        ]),
      });
    });

    it('returns the next aggregate if prev aggregate has been provided', async () => {
      pushEventMock.mockResolvedValue({ event: pikachuLeveledUpEvent });

      const response = await pokemonsEventStore.pushEvent(
        pikachuLeveledUpEvent,
        {
          prevAggregate: pokemonsEventStore.buildAggregate([
            pikachuAppearedEvent,
            pikachuCaughtEvent,
          ]),
        },
      );

      expect(response).toStrictEqual({
        event: pikachuLeveledUpEvent,
        nextAggregate: pokemonsEventStore.buildAggregate([
          pikachuAppearedEvent,
          pikachuCaughtEvent,
          pikachuLeveledUpEvent,
        ]),
      });
    });
  });

  describe('groupEvent', () => {
    groupEventMock.mockReturnValue(
      new GroupedEvent({
        event: pikachuLeveledUpEvent,
        eventStorageAdapter: eventStorageAdapterMock,
      }),
    );

    it('calls the storage adapter groupEvent method', () => {
      const groupedEvent = pokemonsEventStore.groupEvent(pikachuLeveledUpEvent);

      expect(groupEventMock).toHaveBeenCalledTimes(1);
      expect(groupEventMock).toHaveBeenCalledWith(pikachuLeveledUpEvent);

      expect(groupedEvent).toBeInstanceOf(GroupedEvent);
      expect(groupedEvent.eventStore).toBe(pokemonsEventStore);
      expect(groupedEvent.context).toStrictEqual({
        eventStoreId: pokemonsEventStore.eventStoreId,
      });
      expect(groupedEvent.prevAggregate).toBeUndefined();
    });

    it('appends the prevAggregate if one has been provided', () => {
      const prevAggregate = pokemonsEventStore.buildAggregate([
        pikachuAppearedEvent,
        pikachuCaughtEvent,
      ]);

      const groupedEvent = pokemonsEventStore.groupEvent(
        pikachuLeveledUpEvent,
        { prevAggregate },
      );
      expect(groupedEvent.prevAggregate).toStrictEqual(prevAggregate);
    });
  });

  describe('pushEventGroup', () => {
    const charizardLeveledUpEvent: PokemonEventDetails = {
      aggregateId: 'charizard1',
      version: 3,
      type: 'POKEMON_LEVELED_UP',
      timestamp: pikachuLeveledUpEvent.timestamp,
    };

    beforeEach(() => {
      pushEventGroupMock.mockReset();
    });

    it('pushes new event group correctly', async () => {
      pushEventGroupMock.mockResolvedValue({
        eventGroup: [
          { event: pikachuLeveledUpEvent },
          { event: charizardLeveledUpEvent },
        ],
      });

      const eventGroup = [
        new GroupedEvent({
          event: pikachuLeveledUpEvent,
          eventStorageAdapter: eventStorageAdapterMock,
        }),
        new GroupedEvent({
          event: charizardLeveledUpEvent,
          eventStorageAdapter: eventStorageAdapterMock,
        }),
      ] as const;

      const response = await EventStore.pushEventGroup(...eventGroup);

      expect(pushEventGroupMock).toHaveBeenCalledTimes(1);
      expect(pushEventGroupMock).toHaveBeenCalledWith({}, ...eventGroup);

      expect(response).toStrictEqual({
        eventGroup: [
          { event: pikachuLeveledUpEvent },
          { event: charizardLeveledUpEvent },
        ],
      });
    });

    it('passes options through', async () => {
      const options = { force: true };

      pushEventGroupMock.mockResolvedValue({
        eventGroup: [
          { event: pikachuLeveledUpEvent },
          { event: charizardLeveledUpEvent },
        ],
      });

      const eventGroup = [
        new GroupedEvent({
          event: pikachuLeveledUpEvent,
          eventStorageAdapter: eventStorageAdapterMock,
        }),
        new GroupedEvent({
          event: charizardLeveledUpEvent,
          eventStorageAdapter: eventStorageAdapterMock,
        }),
      ] as const;

      const response = await EventStore.pushEventGroup(options, ...eventGroup);

      expect(pushEventGroupMock).toHaveBeenCalledTimes(1);
      expect(pushEventGroupMock).toHaveBeenCalledWith(options, ...eventGroup);

      expect(response).toStrictEqual({
        eventGroup: [
          { event: pikachuLeveledUpEvent },
          { event: charizardLeveledUpEvent },
        ],
      });
    });

    it('returns the next aggregate if event is initial event', async () => {
      pushEventGroupMock.mockResolvedValue({
        eventGroup: [
          { event: pikachuAppearedEvent },
          { event: charizardLeveledUpEvent },
        ],
      });

      const eventGroup = [
        new GroupedEvent({
          event: pikachuLeveledUpEvent,
          eventStore: pokemonsEventStore,
          eventStorageAdapter: eventStorageAdapterMock,
        }),
        new GroupedEvent({
          event: charizardLeveledUpEvent,
          eventStorageAdapter: eventStorageAdapterMock,
        }),
      ] as const;

      const response = await EventStore.pushEventGroup(...eventGroup);

      expect(response.eventGroup[0].nextAggregate).toStrictEqual(
        pokemonsEventStore.buildAggregate([pikachuAppearedEvent]),
      );
    });

    it('returns the next aggregate if prev aggregate has been provided', async () => {
      pushEventGroupMock.mockResolvedValue({
        eventGroup: [
          { event: pikachuCaughtEvent },
          { event: charizardLeveledUpEvent },
        ],
      });

      const eventGroup = [
        new GroupedEvent({
          event: pikachuCaughtEvent,
          prevAggregate: pokemonsEventStore.buildAggregate([
            pikachuAppearedEvent,
          ]),
          eventStore: pokemonsEventStore,
          eventStorageAdapter: eventStorageAdapterMock,
        }),
        new GroupedEvent({
          event: charizardLeveledUpEvent,
          eventStorageAdapter: eventStorageAdapterMock,
        }),
      ] as const;

      const response = await EventStore.pushEventGroup(...eventGroup);

      expect(response.eventGroup[0].nextAggregate).toStrictEqual(
        pokemonsEventStore.buildAggregate([
          pikachuAppearedEvent,
          pikachuCaughtEvent,
        ]),
      );
    });
  });

  describe('listAggregateIds', () => {
    it('lists aggregateIds correctly', async () => {
      const limitMock = 10;
      const pageTokenMock = 'pageTokenMock';
      const initialEventAfterMock = '2021-01-01T00:00:00.000Z';
      const initialEventBeforeMock = '2022-01-01T00:00:00.000Z';
      const reverseMock = true;

      const response = await pokemonsEventStore.listAggregateIds({
        limit: limitMock,
        pageToken: pageTokenMock,
        initialEventAfter: initialEventAfterMock,
        initialEventBefore: initialEventBeforeMock,
        reverse: reverseMock,
      });

      expect(listAggregateIdsMock).toHaveBeenCalledTimes(1);
      expect(listAggregateIdsMock).toHaveBeenCalledWith(
        { eventStoreId: pokemonsEventStore.eventStoreId },
        {
          limit: limitMock,
          pageToken: pageTokenMock,
          initialEventAfter: initialEventAfterMock,
          initialEventBefore: initialEventBeforeMock,
          reverse: reverseMock,
        },
      );

      expect(response).toStrictEqual({ aggregateIds: [pikachuId] });
    });
  });
});
