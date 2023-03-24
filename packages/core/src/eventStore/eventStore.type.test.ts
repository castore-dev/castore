import { A } from 'ts-toolbelt';

import { Aggregate } from '~/aggregate';
import { EventDetail } from '~/event/eventDetail';
import { EventTypeDetail } from '~/event/eventType';
import {
  EventStore,
  EventStoreAggregate,
  EventStoreEventsDetails,
} from '~/eventStore';
import { EventsQueryOptions } from '~/storageAdapter';

import {
  pokemonsEventStore,
  PokemonAggregate,
  pokemonAppearedEvent,
  pokemonCatchedEvent,
  pokemonLeveledUpEvent,
  PokemonEventDetails,
} from './eventStore.fixtures.test';
import { GetAggregateOptions } from './types';

// --- EXTENDS ---

const assertExtends: A.Extends<typeof pokemonsEventStore, EventStore> = 1;
assertExtends;

// --- EVENT STORE ID ---

const assertEventStoreId: A.Equals<
  typeof pokemonsEventStore['eventStoreId'],
  'POKEMONS'
> = 1;
assertEventStoreId;

// --- EVENTS DETAILS ---

const assertPokemonEventDetails: A.Equals<
  EventStoreEventsDetails<typeof pokemonsEventStore>,
  PokemonEventDetails
> = 1;
assertPokemonEventDetails;

const assertAnyEventsDetails: A.Equals<
  EventStoreEventsDetails<EventStore>,
  EventDetail
> = 1;
assertAnyEventsDetails;

// --- AGGREGATE ---

const assertCounterAggregate: A.Equals<
  EventStoreAggregate<typeof pokemonsEventStore>,
  PokemonAggregate
> = 1;
assertCounterAggregate;

const assertAnyAggregate: A.Equals<
  EventStoreAggregate<EventStore>,
  Aggregate
> = 1;
assertAnyAggregate;

// --- GET EVENTS ---

const assertGetEventsInput: A.Equals<
  Parameters<typeof pokemonsEventStore.getEvents>,
  [aggregateId: string, options?: EventsQueryOptions]
> = 1;
assertGetEventsInput;

const assertGetEventsOutput: A.Equals<
  ReturnType<typeof pokemonsEventStore.getEvents>,
  Promise<{ events: PokemonEventDetails[] }>
> = 1;
assertGetEventsOutput;

// --- GET AGGREGATE ---

const assertGetAggregateInput: A.Equals<
  Parameters<typeof pokemonsEventStore.getAggregate>,
  [aggregateId: string, options?: GetAggregateOptions]
> = 1;
assertGetAggregateInput;

const assertGetAggregateOutput: A.Equals<
  ReturnType<typeof pokemonsEventStore.getAggregate>,
  Promise<{
    aggregate: PokemonAggregate | undefined;
    events: PokemonEventDetails[];
    lastEvent: PokemonEventDetails | undefined;
  }>
> = 1;
assertGetAggregateOutput;

// --- PUSH EVENTS ---

const assertPushEventInput1: A.Equals<
  Parameters<typeof pokemonsEventStore.pushEvent>[0],
  | Omit<EventTypeDetail<typeof pokemonAppearedEvent>, 'timestamp'>
  | Omit<EventTypeDetail<typeof pokemonCatchedEvent>, 'timestamp'>
  | Omit<EventTypeDetail<typeof pokemonLeveledUpEvent>, 'timestamp'>
> = 1;
assertPushEventInput1;

const assertPushEventInput2: A.Equals<
  Parameters<typeof pokemonsEventStore.pushEvent>[1],
  { prevAggregate?: PokemonAggregate | undefined } | undefined
> = 1;
assertPushEventInput2;

const assertPushEventOutput: A.Equals<
  ReturnType<typeof pokemonsEventStore.pushEvent>,
  Promise<{
    event: PokemonEventDetails;
    nextAggregate?: PokemonAggregate | undefined;
  }>
> = 1;
assertPushEventOutput;
