import { AggregateNotFoundError } from './errors/aggregateNotFound';
import {
  PokemonAggregate,
  pokemonsEventStore,
  pokemonAppearedEvent,
  pokemonCatchedEvent,
  pokemonLeveledUpEvent,
  pokemonsReducer,
  pikachuId,
  pikachuAppearedEvent,
  pikachuLeveledUpEvent,
  pikachuCatchedEvent,
  pikachuEventsMocks,
  getEventsMock,
  pushEventMock,
  listAggregateIdsMock,
  getLastSnapshotMock,
  putSnapshotMock,
} from './eventStore.fixtures.test';

describe('event store', () => {
  beforeEach(() => {
    getEventsMock.mockClear();
    getEventsMock.mockResolvedValue({ events: pikachuEventsMocks });
    pushEventMock.mockClear();
    listAggregateIdsMock.mockClear();
    listAggregateIdsMock.mockReturnValue({ aggregateIds: [pikachuId] });
    putSnapshotMock.mockClear();
    getLastSnapshotMock.mockClear();
    getLastSnapshotMock.mockResolvedValue({ snapshot: undefined });
  });

  it('has correct properties', () => {
    expect(new Set(Object.keys(pokemonsEventStore))).toStrictEqual(
      new Set([
        'eventStoreId',
        'eventStoreEvents',
        'reduce',
        'simulateSideEffect',
        'storageAdapter',
        'getStorageAdapter',
        'pushEvent',
        'buildAggregate',
        'getEvents',
        'listAggregateIds',
        'getAggregate',
        'getExistingAggregate',
        'simulateAggregate',
      ]),
    );

    expect(pokemonsEventStore.eventStoreId).toBe('POKEMONS');

    expect(pokemonsEventStore.eventStoreEvents).toStrictEqual([
      pokemonAppearedEvent,
      pokemonCatchedEvent,
      pokemonLeveledUpEvent,
    ]);
  });

  describe('getEvents', () => {
    it('gets events correctly', async () => {
      const response = await pokemonsEventStore.getEvents(pikachuId);

      expect(getEventsMock).toHaveBeenCalledTimes(1);
      expect(getEventsMock).toHaveBeenCalledWith(pikachuId, undefined);
      expect(response).toStrictEqual({ events: pikachuEventsMocks });
    });
  });

  describe('getAggregate', () => {
    it('gets aggregate correctly', async () => {
      const response = await pokemonsEventStore.getAggregate(pikachuId);

      expect(getEventsMock).toHaveBeenCalledTimes(1);
      expect(getEventsMock).toHaveBeenCalledWith(pikachuId, {});
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
      expect(getEventsMock).toHaveBeenCalledWith(pikachuId, {});

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
            pikachuCatchedEvent,
          ]),
        },
      );

      expect(response).toStrictEqual({
        event: pikachuLeveledUpEvent,
        nextAggregate: pokemonsEventStore.buildAggregate([
          pikachuAppearedEvent,
          pikachuCatchedEvent,
          pikachuLeveledUpEvent,
        ]),
      });
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
      expect(listAggregateIdsMock).toHaveBeenCalledWith({
        limit: limitMock,
        pageToken: pageTokenMock,
        initialEventAfter: initialEventAfterMock,
        initialEventBefore: initialEventBeforeMock,
        reverse: reverseMock,
      });

      expect(response).toStrictEqual({ aggregateIds: [pikachuId] });
    });
  });
});
