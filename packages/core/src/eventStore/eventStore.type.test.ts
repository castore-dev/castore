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
} from '~/eventStore';

import {
  pokemonsEventStore,
  pokemonsEventStoreAutoSnapshots,
  pokemonsEventStoreCustomSnapshot,
  PokemonAggregate,
  pokemonAppearedEvent,
  pokemonCaughtEvent,
  pokemonLeveledUpEvent,
  PokemonEventDetails,
  pikachuAppearedEvent,
  pikachuCaughtEvent,
  PokemonAggregate2,
} from './eventStore.fixtures.test';
import {
  EventStoreCurrentReducerVersion,
  EventStoreId,
  EventStoreReducer,
  EventStoreReducers,
} from './generics';
import { Reducer } from './types';

// --- EXTENDS EVENT STORE CLASS ---

const assertExtends1: A.Extends<typeof pokemonsEventStore, EventStore> = 1;
assertExtends1;

const assertExtends2: A.Extends<
  typeof pokemonsEventStoreAutoSnapshots,
  EventStore
> = 1;
assertExtends2;

const assertExtends3: A.Extends<
  typeof pokemonsEventStoreCustomSnapshot,
  EventStore
> = 1;
assertExtends3;

// --- EVENT STORE ID ---

const assertAnyEventStoreId: A.Equals<EventStoreId<EventStore>, string> = 1;
assertAnyEventStoreId;

const assertEventStoreId1: A.Equals<
  EventStoreId<typeof pokemonsEventStore>,
  'POKEMONS'
> = 1;
assertEventStoreId1;

const assertEventStoreId2: A.Equals<
  EventStoreId<typeof pokemonsEventStoreAutoSnapshots>,
  'POKEMONS_2'
> = 1;
assertEventStoreId2;

const assertEventStoreId3: A.Equals<
  EventStoreId<typeof pokemonsEventStoreCustomSnapshot>,
  'POKEMONS_3'
> = 1;
assertEventStoreId3;

// --- EVENTS DETAILS ---

const assertAnyEventsDetails: A.Equals<
  EventStoreEventDetails<EventStore>,
  EventDetail
> = 1;
assertAnyEventsDetails;

const assertPokemonEventDetails1: A.Equals<
  EventStoreEventDetails<typeof pokemonsEventStore>,
  PokemonEventDetails
> = 1;
assertPokemonEventDetails1;

const assertPokemonEventDetails2: A.Equals<
  EventStoreEventDetails<typeof pokemonsEventStoreAutoSnapshots>,
  PokemonEventDetails
> = 1;
assertPokemonEventDetails2;

const assertPokemonEventDetails3: A.Equals<
  EventStoreEventDetails<typeof pokemonsEventStoreCustomSnapshot>,
  PokemonEventDetails
> = 1;
assertPokemonEventDetails3;

// --- REDUCERS ---

const assertAnyReducers: A.Equals<
  EventStoreReducers<EventStore>,
  Record<string, Reducer>
> = 1;
assertAnyReducers;

const assertPokemonReducers1: A.Equals<
  EventStoreReducers<typeof pokemonsEventStore>,
  // No reducers provided => type constraint
  Record<string, Reducer<Aggregate, PokemonEventDetails>>
> = 1;
assertPokemonReducers1;

const assertPokemonReducers2: A.Equals<
  EventStoreReducers<typeof pokemonsEventStoreAutoSnapshots>,
  // No reducers provided => type constraint
  Record<string, Reducer<Aggregate, PokemonEventDetails>>
> = 1;
assertPokemonReducers2;

const assertPokemonReducers3: A.Equals<
  EventStoreReducers<typeof pokemonsEventStoreCustomSnapshot>,
  {
    v1: Reducer<PokemonAggregate, PokemonEventDetails>;
    v2: Reducer<PokemonAggregate2, PokemonEventDetails>;
  }
> = 1;
assertPokemonReducers3;

// --- CURRENT REDUCER VERSION ---

const assertAnyCurrentReducerVersion: A.Equals<
  EventStoreCurrentReducerVersion<EventStore>,
  string
> = 1;
assertAnyCurrentReducerVersion;

const assertPokemonCurrentReducerVersion1: A.Equals<
  EventStoreCurrentReducerVersion<typeof pokemonsEventStore>,
  // No current reducer version provided => type constraint
  string
> = 1;
assertPokemonCurrentReducerVersion1;

const assertPokemonCurrentReducerVersion2: A.Equals<
  EventStoreCurrentReducerVersion<typeof pokemonsEventStoreAutoSnapshots>,
  'v1'
> = 1;
assertPokemonCurrentReducerVersion2;

const assertPokemonCurrentReducerVersion3: A.Equals<
  EventStoreCurrentReducerVersion<typeof pokemonsEventStoreCustomSnapshot>,
  'v2'
> = 1;
assertPokemonCurrentReducerVersion3;

// --- REDUCER ---

const assertAnyReducer: A.Equals<EventStoreReducer<EventStore>, Reducer> = 1;
assertAnyReducer;

const assertPokemonReducer1: A.Equals<
  EventStoreReducer<typeof pokemonsEventStore>,
  Reducer<PokemonAggregate, PokemonEventDetails>
> = 1;
assertPokemonReducer1;

const assertPokemonReducer2: A.Equals<
  EventStoreReducer<typeof pokemonsEventStoreAutoSnapshots>,
  Reducer<PokemonAggregate, PokemonEventDetails>
> = 1;
assertPokemonReducer2;

const assertPokemonReducer3: A.Equals<
  EventStoreReducer<typeof pokemonsEventStoreCustomSnapshot>,
  Reducer<PokemonAggregate2, PokemonEventDetails>
> = 1;
assertPokemonReducer3;

// --- AGGREGATE ---

const assertAnyAggregate: A.Equals<
  EventStoreAggregate<EventStore>,
  Aggregate
> = 1;
assertAnyAggregate;

const assertPokemonAggregate1: A.Equals<
  EventStoreAggregate<typeof pokemonsEventStore>,
  PokemonAggregate
> = 1;
assertPokemonAggregate1;

const assertPokemonAggregate2: A.Equals<
  EventStoreAggregate<typeof pokemonsEventStoreAutoSnapshots>,
  PokemonAggregate
> = 1;
assertPokemonAggregate2;

const assertPokemonAggregate3: A.Equals<
  EventStoreAggregate<typeof pokemonsEventStoreCustomSnapshot>,
  PokemonAggregate2
> = 1;
assertPokemonAggregate3;

// --- GET EVENTS ---

const assertAnyGetEventsInput: A.Equals<
  Parameters<EventStore['getEvents']>,
  [aggregateId: string, options?: EventsQueryOptions]
> = 1;
assertAnyGetEventsInput;

const assertAnyGetEventsOutput: A.Equals<
  ReturnType<EventStore['getEvents']>,
  Promise<{ events: EventDetail[] }>
> = 1;
assertAnyGetEventsOutput;

const assertGetEventsInput1: A.Equals<
  Parameters<typeof pokemonsEventStore.getEvents>,
  [aggregateId: string, options?: EventsQueryOptions]
> = 1;
assertGetEventsInput1;

const assertGetEventsOutput1: A.Equals<
  ReturnType<typeof pokemonsEventStore.getEvents>,
  Promise<{ events: PokemonEventDetails[] }>
> = 1;
assertGetEventsOutput1;

const assertGetEventsInput2: A.Equals<
  Parameters<typeof pokemonsEventStoreAutoSnapshots.getEvents>,
  [aggregateId: string, options?: EventsQueryOptions]
> = 1;
assertGetEventsInput2;

const assertGetEventsOutput2: A.Equals<
  ReturnType<typeof pokemonsEventStoreAutoSnapshots.getEvents>,
  Promise<{ events: PokemonEventDetails[] }>
> = 1;
assertGetEventsOutput2;

const assertGetEventsInput3: A.Equals<
  Parameters<typeof pokemonsEventStoreCustomSnapshot.getEvents>,
  [aggregateId: string, options?: EventsQueryOptions]
> = 1;
assertGetEventsInput3;

const assertGetEventsOutput3: A.Equals<
  ReturnType<typeof pokemonsEventStoreCustomSnapshot.getEvents>,
  Promise<{ events: PokemonEventDetails[] }>
> = 1;
assertGetEventsOutput3;

// --- GET AGGREGATE ---

const assertAnyGetAggregateInput: A.Equals<
  Parameters<EventStore['getAggregate']>,
  [aggregateId: string, options?: GetAggregateOptions]
> = 1;
assertAnyGetAggregateInput;

const assertAnyGetAggregateOutput: A.Equals<
  ReturnType<EventStore['getAggregate']>,
  Promise<{
    aggregate: Aggregate | undefined;
    events: EventDetail[];
    lastEvent: EventDetail | undefined;
  }>
> = 1;
assertAnyGetAggregateOutput;

const assertGetAggregateInput1: A.Equals<
  Parameters<typeof pokemonsEventStore.getAggregate>,
  [aggregateId: string, options?: GetAggregateOptions]
> = 1;
assertGetAggregateInput1;

const assertGetAggregateOutput1: A.Equals<
  ReturnType<typeof pokemonsEventStore.getAggregate>,
  Promise<{
    aggregate: PokemonAggregate | undefined;
    events: PokemonEventDetails[];
    lastEvent: PokemonEventDetails | undefined;
  }>
> = 1;
assertGetAggregateOutput1;

const assertGetAggregateInput2: A.Equals<
  Parameters<typeof pokemonsEventStoreAutoSnapshots.getAggregate>,
  [aggregateId: string, options?: GetAggregateOptions]
> = 1;
assertGetAggregateInput2;

const assertGetAggregateOutput2: A.Equals<
  ReturnType<typeof pokemonsEventStoreAutoSnapshots.getAggregate>,
  Promise<{
    aggregate: PokemonAggregate | undefined;
    events: PokemonEventDetails[];
    lastEvent: PokemonEventDetails | undefined;
  }>
> = 1;
assertGetAggregateOutput2;

const assertGetAggregateInput3: A.Equals<
  Parameters<typeof pokemonsEventStoreCustomSnapshot.getAggregate>,
  [aggregateId: string, options?: GetAggregateOptions]
> = 1;
assertGetAggregateInput3;

const assertGetAggregateOutput3: A.Equals<
  ReturnType<typeof pokemonsEventStoreCustomSnapshot.getAggregate>,
  Promise<{
    aggregate: PokemonAggregate2 | undefined;
    events: PokemonEventDetails[];
    lastEvent: PokemonEventDetails | undefined;
  }>
> = 1;
assertGetAggregateOutput3;

// --- PUSH EVENTS ---

const assertAnyPushEventInput_1: A.Equals<
  Parameters<EventStore['pushEvent']>[0],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any
> = 1;
assertAnyPushEventInput_1;

const assertAnyPushEventInput_2: A.Equals<
  Parameters<EventStore['pushEvent']>[1],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  { prevAggregate?: any; force?: boolean } | undefined
> = 1;
assertAnyPushEventInput_2;

const assertAnyPushEventOutput: A.Equals<
  ReturnType<EventStore['pushEvent']>,
  Promise<{ event: EventDetail; nextAggregate?: Aggregate }>
> = 1;
assertAnyPushEventOutput;

const assertPushEventInput1_1: A.Equals<
  Parameters<typeof pokemonsEventStore.pushEvent>[0],
  | OptionalTimestamp<EventTypeDetail<typeof pokemonAppearedEvent>>
  | OptionalTimestamp<EventTypeDetail<typeof pokemonCaughtEvent>>
  | OptionalTimestamp<EventTypeDetail<typeof pokemonLeveledUpEvent>>
> = 1;
assertPushEventInput1_1;

const assertPushEventInput1_2: A.Equals<
  Parameters<typeof pokemonsEventStore.pushEvent>[1],
  { prevAggregate?: PokemonAggregate; force?: boolean } | undefined
> = 1;
assertPushEventInput1_2;

const assertPushEventOutput1: A.Equals<
  ReturnType<typeof pokemonsEventStore.pushEvent>,
  Promise<{ event: PokemonEventDetails; nextAggregate?: PokemonAggregate }>
> = 1;
assertPushEventOutput1;

const assertPushEventInput2_1: A.Equals<
  Parameters<typeof pokemonsEventStoreAutoSnapshots.pushEvent>[0],
  | OptionalTimestamp<EventTypeDetail<typeof pokemonAppearedEvent>>
  | OptionalTimestamp<EventTypeDetail<typeof pokemonCaughtEvent>>
  | OptionalTimestamp<EventTypeDetail<typeof pokemonLeveledUpEvent>>
> = 1;
assertPushEventInput2_1;

const assertPushEventInput2_2: A.Equals<
  Parameters<typeof pokemonsEventStoreAutoSnapshots.pushEvent>[1],
  { prevAggregate?: PokemonAggregate; force?: boolean } | undefined
> = 1;
assertPushEventInput2_2;

const assertPushEventOutput2: A.Equals<
  ReturnType<typeof pokemonsEventStoreAutoSnapshots.pushEvent>,
  Promise<{ event: PokemonEventDetails; nextAggregate?: PokemonAggregate }>
> = 1;
assertPushEventOutput2;

const assertPushEventInput3_1: A.Equals<
  Parameters<typeof pokemonsEventStoreCustomSnapshot.pushEvent>[0],
  | OptionalTimestamp<EventTypeDetail<typeof pokemonAppearedEvent>>
  | OptionalTimestamp<EventTypeDetail<typeof pokemonCaughtEvent>>
  | OptionalTimestamp<EventTypeDetail<typeof pokemonLeveledUpEvent>>
> = 1;
assertPushEventInput3_1;

const assertPushEventInput3_2: A.Equals<
  Parameters<typeof pokemonsEventStoreCustomSnapshot.pushEvent>[1],
  { prevAggregate?: PokemonAggregate2; force?: boolean } | undefined
> = 1;
assertPushEventInput3_2;

const assertPushEventOutput3: A.Equals<
  ReturnType<typeof pokemonsEventStoreCustomSnapshot.pushEvent>,
  Promise<{ event: PokemonEventDetails; nextAggregate?: PokemonAggregate2 }>
> = 1;
assertPushEventOutput3;

// --- GROUP EVENT ---

const assertAnyGroupEventInput_1: A.Equals<
  Parameters<EventStore['groupEvent']>[0],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any
> = 1;
assertAnyGroupEventInput_1;

const assertAnyGroupEventInput_2: A.Equals<
  Parameters<EventStore['groupEvent']>[1],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  { prevAggregate?: any } | undefined
> = 1;
assertAnyGroupEventInput_2;

const assertGroupEventOutput: A.Equals<
  ReturnType<EventStore['groupEvent']>,
  GroupedEvent
> = 1;
assertGroupEventOutput;

const assertGroupEventInput1_1: A.Equals<
  Parameters<typeof pokemonsEventStore.groupEvent>[0],
  | OptionalTimestamp<EventTypeDetail<typeof pokemonAppearedEvent>>
  | OptionalTimestamp<EventTypeDetail<typeof pokemonCaughtEvent>>
  | OptionalTimestamp<EventTypeDetail<typeof pokemonLeveledUpEvent>>
> = 1;
assertGroupEventInput1_1;

const assertGroupEventInput1_2: A.Equals<
  Parameters<typeof pokemonsEventStore.groupEvent>[1],
  { prevAggregate?: PokemonAggregate | undefined } | undefined
> = 1;
assertGroupEventInput1_2;

const assertGroupEventOutput1: A.Equals<
  ReturnType<typeof pokemonsEventStore.groupEvent>,
  GroupedEvent<PokemonEventDetails, PokemonAggregate>
> = 1;
assertGroupEventOutput1;

const assertGroupEventInput2_1: A.Equals<
  Parameters<typeof pokemonsEventStoreAutoSnapshots.groupEvent>[0],
  | OptionalTimestamp<EventTypeDetail<typeof pokemonAppearedEvent>>
  | OptionalTimestamp<EventTypeDetail<typeof pokemonCaughtEvent>>
  | OptionalTimestamp<EventTypeDetail<typeof pokemonLeveledUpEvent>>
> = 1;
assertGroupEventInput2_1;

const assertGroupEventInput2_2: A.Equals<
  Parameters<typeof pokemonsEventStoreAutoSnapshots.groupEvent>[1],
  { prevAggregate?: PokemonAggregate | undefined } | undefined
> = 1;
assertGroupEventInput2_2;

const assertGroupEventOutput2: A.Equals<
  ReturnType<typeof pokemonsEventStoreAutoSnapshots.groupEvent>,
  GroupedEvent<PokemonEventDetails, PokemonAggregate>
> = 1;
assertGroupEventOutput2;

const assertGroupEventInput3_1: A.Equals<
  Parameters<typeof pokemonsEventStoreCustomSnapshot.groupEvent>[0],
  | OptionalTimestamp<EventTypeDetail<typeof pokemonAppearedEvent>>
  | OptionalTimestamp<EventTypeDetail<typeof pokemonCaughtEvent>>
  | OptionalTimestamp<EventTypeDetail<typeof pokemonLeveledUpEvent>>
> = 1;
assertGroupEventInput3_1;

const assertGroupEventInput3_2: A.Equals<
  Parameters<typeof pokemonsEventStoreCustomSnapshot.groupEvent>[1],
  { prevAggregate?: PokemonAggregate2 | undefined } | undefined
> = 1;
assertGroupEventInput3_2;

const assertGroupEventOutput3: A.Equals<
  ReturnType<typeof pokemonsEventStoreCustomSnapshot.groupEvent>,
  GroupedEvent<PokemonEventDetails, PokemonAggregate2>
> = 1;
assertGroupEventOutput3;

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
