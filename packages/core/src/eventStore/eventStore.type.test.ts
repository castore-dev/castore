/* eslint-disable max-lines */
import type { A } from 'ts-toolbelt';

import type { Aggregate } from '~/aggregate';
import type { EventDetail, OptionalTimestamp } from '~/event/eventDetail';
import type { EventTypeDetail } from '~/event/eventType';
import type { GroupedEvent } from '~/event/groupedEvent';
import type { EventsQueryOptions } from '~/eventStorageAdapter';
import {
  EventStore,
  EventStoreAggregate,
  EventStoreEventDetails,
  GetAggregateOptions,
  ValidateEventDetail,
} from '~/eventStore';

import {
  pokemonsEventStore,
  PokemonAggregate,
  pokemonAppearedEvent,
  pokemonCaughtEvent,
  pokemonLeveledUpEvent,
  PokemonEventDetails,
  pikachuAppearedEvent,
  pikachuCaughtEvent,
} from './eventStore.fixtures.test';

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
  EventStoreEventDetails<typeof pokemonsEventStore>,
  PokemonEventDetails
> = 1;
assertPokemonEventDetails;

const assertAnyEventsDetails: A.Equals<
  EventStoreEventDetails<EventStore>,
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
  | OptionalTimestamp<EventTypeDetail<typeof pokemonAppearedEvent>>
  | OptionalTimestamp<EventTypeDetail<typeof pokemonCaughtEvent>>
  | OptionalTimestamp<EventTypeDetail<typeof pokemonLeveledUpEvent>>
> = 1;
assertPushEventInput1;

const assertPushEventInput2: A.Equals<
  Parameters<typeof pokemonsEventStore.pushEvent>[1],
  | {
      prevAggregate?: PokemonAggregate | undefined;
      force?: boolean;
      validate?: ValidateEventDetail;
    }
  | undefined
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

// --- GROUP EVENT ---

const assertGroupEventInput1: A.Equals<
  Parameters<typeof pokemonsEventStore.groupEvent>[0],
  | OptionalTimestamp<EventTypeDetail<typeof pokemonAppearedEvent>>
  | OptionalTimestamp<EventTypeDetail<typeof pokemonCaughtEvent>>
  | OptionalTimestamp<EventTypeDetail<typeof pokemonLeveledUpEvent>>
> = 1;
assertGroupEventInput1;

const assertGroupEventInput2: A.Equals<
  Parameters<typeof pokemonsEventStore.groupEvent>[1],
  { prevAggregate?: PokemonAggregate | undefined } | undefined
> = 1;
assertGroupEventInput2;

const assertGroupEventOutput: A.Equals<
  ReturnType<typeof pokemonsEventStore.groupEvent>,
  GroupedEvent<PokemonEventDetails, PokemonAggregate>
> = 1;
assertGroupEventOutput;

// --- PUSH EVENT GROUP ---

const assertGenericPushEventGroupInput: A.Equals<
  Parameters<typeof EventStore.pushEventGroup>,
  [
    GroupedEvent | { force?: boolean | undefined },
    GroupedEvent,
    ...GroupedEvent[],
  ]
> = 1;
assertGenericPushEventGroupInput;

const assertGenericPushEventGroupOutput: A.Equals<
  ReturnType<typeof EventStore.pushEventGroup>,
  Promise<{
    eventGroup:
      | {
          event: EventDetail;
          nextAggregate?: Aggregate | undefined;
        }[]
      // Weird TS bug
      | {
          event: EventDetail;
          nextAggregate?: Aggregate | undefined;
        }[];
  }>
> = 1;
assertGenericPushEventGroupOutput;

const pushTwoPokemonsEventGroup = () =>
  EventStore.pushEventGroup(
    pokemonsEventStore.groupEvent(pikachuAppearedEvent),
    pokemonsEventStore.groupEvent(pikachuCaughtEvent),
  );

const assertPushEventGroupOutput: A.Equals<
  Awaited<ReturnType<typeof pushTwoPokemonsEventGroup>>,
  {
    eventGroup: [
      { event: PokemonEventDetails; nextAggregate?: PokemonAggregate },
      { event: PokemonEventDetails; nextAggregate?: PokemonAggregate },
    ];
  }
> = 1;
assertPushEventGroupOutput;

const pushTwoPokemonsEventGroupWithOptions = () =>
  EventStore.pushEventGroup(
    { force: true },
    pokemonsEventStore.groupEvent(pikachuAppearedEvent),
    pokemonsEventStore.groupEvent(pikachuCaughtEvent),
  );

const assertPushTwoPokemonsEventGroupWithOptions: A.Equals<
  Awaited<ReturnType<typeof pushTwoPokemonsEventGroupWithOptions>>,
  {
    eventGroup: [
      { event: PokemonEventDetails; nextAggregate?: PokemonAggregate },
      { event: PokemonEventDetails; nextAggregate?: PokemonAggregate },
    ];
  }
> = 1;
assertPushTwoPokemonsEventGroupWithOptions;
