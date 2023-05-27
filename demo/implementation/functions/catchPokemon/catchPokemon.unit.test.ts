import MockDate from 'mockdate';

import { EventStoreEventsDetails } from '@castore/core';
import { catchPokemonCommand } from '@castore/demo-blueprint';
import { mockEventStore } from '@castore/test-tools';

import { pokemonsEventStore } from '~/libs/eventStores/pokemons';
import { trainersEventStore } from '~/libs/eventStores/trainers';

const pikachuId = 'pikachu1';
const pikachuAppearedEvent: EventStoreEventsDetails<typeof pokemonsEventStore> =
  {
    aggregateId: pikachuId,
    version: 1,
    type: 'APPEARED',
    timestamp: '2021-01-01T00:00:00.000Z',
    payload: { name: 'Pikachu', level: 42 },
    metadata: { trigger: 'random' },
  };

const ashId = 'ash';
const ashGameStartedEvent: EventStoreEventsDetails<typeof trainersEventStore> =
  {
    aggregateId: ashId,
    version: 1,
    type: 'GAME_STARTED',
    timestamp: '2021-01-01T00:00:00.000Z',
    payload: { trainerName: 'Ash Ketchum' },
  };

describe('Commands - catchPokemon', () => {
  const pokemonsEventStoreMock = mockEventStore(pokemonsEventStore, [
    pikachuAppearedEvent,
  ]);
  const trainersEventStoreMock = mockEventStore(trainersEventStore, [
    ashGameStartedEvent,
  ]);

  it('should catch a pokemon', async () => {
    const timestamp = '2022-01-01T00:00:00.000Z';
    MockDate.set(timestamp);

    await catchPokemonCommand.handler(
      {
        pokemonId: pikachuId,
        trainerId: ashId,
      },
      [pokemonsEventStoreMock, trainersEventStoreMock],
    );

    const { events: pikachuEvents } = await pokemonsEventStoreMock.getEvents(
      pikachuId,
    );
    expect(pikachuEvents).toStrictEqual([
      pikachuAppearedEvent,
      {
        aggregateId: pikachuId,
        version: 2,
        type: 'CAUGHT_BY_TRAINER',
        timestamp,
        payload: { trainerId: ashId },
      },
    ]);

    const { events: ashEvents } = await trainersEventStoreMock.getEvents(ashId);
    expect(ashEvents).toStrictEqual([
      ashGameStartedEvent,
      {
        aggregateId: ashId,
        version: 2,
        type: 'POKEMON_CAUGHT',
        timestamp,
        payload: { pokemonId: pikachuId },
      },
    ]);
  });
});
