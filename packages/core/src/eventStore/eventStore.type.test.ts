import { A } from 'ts-toolbelt';

import { Aggregate } from '~/aggregate';
import { EventDetail } from '~/event/eventDetail';
import {
  EventStore,
  EventStoreAggregate,
  EventStoreEventsDetails,
} from '~/eventStore';
import { EventsQueryOptions } from '~/storageAdapter';

import {
  CounterAggregate,
  CounterEventsDetails,
  counterEventStore,
} from './eventStore.util.test';

// --- EXTENDS ---

const assertExtends: A.Equals<
  typeof counterEventStore extends EventStore ? true : false,
  true
> = 1;
assertExtends;

// --- EVENT STORE ID ---

const assertCounterEventStoreId: A.Equals<
  typeof counterEventStore['eventStoreId'],
  'Counters'
> = 1;
assertCounterEventStoreId;

// --- EVENTS DETAILS ---

const assertCounterEventsDetails: A.Equals<
  EventStoreEventsDetails<typeof counterEventStore>,
  CounterEventsDetails
> = 1;
assertCounterEventsDetails;

const assertAnyEventsDetails: A.Equals<
  EventStoreEventsDetails<EventStore>,
  EventDetail
> = 1;
assertAnyEventsDetails;

// --- AGGREGATE ---

const assertCounterAggregate: A.Equals<
  EventStoreAggregate<typeof counterEventStore>,
  CounterAggregate
> = 1;
assertCounterAggregate;

const assertAnyAggregate: A.Equals<
  EventStoreAggregate<EventStore>,
  Aggregate
> = 1;
assertAnyAggregate;

// --- GET EVENTS ---

const assertGetEventsInput: A.Equals<
  Parameters<typeof counterEventStore.getEvents>,
  [aggregateId: string, options?: EventsQueryOptions]
> = 1;
assertGetEventsInput;

const assertGetEventsOutput: A.Equals<
  ReturnType<typeof counterEventStore.getEvents>,
  Promise<{ events: CounterEventsDetails[] }>
> = 1;
assertGetEventsOutput;

// --- GET AGGREGATE ---

const assertGetAggregateInput: A.Equals<
  Parameters<typeof counterEventStore.getAggregate>,
  [aggregateId: string, options?: EventsQueryOptions]
> = 1;
assertGetAggregateInput;

const assertGetAggregateOutput: A.Equals<
  ReturnType<typeof counterEventStore.getAggregate>,
  Promise<{
    aggregate: CounterAggregate | undefined;
    events: CounterEventsDetails[];
    lastEvent: CounterEventsDetails | undefined;
    snapshot: CounterAggregate | undefined;
  }>
> = 1;
assertGetAggregateOutput;

// --- PUSH EVENTS ---

const assertPushEventInput: A.Equals<
  Parameters<typeof counterEventStore.pushEvent>,
  [CounterEventsDetails]
> = 1;
assertPushEventInput;

const assertPushEventOutput: A.Equals<
  ReturnType<typeof counterEventStore.pushEvent>,
  Promise<void>
> = 1;
assertPushEventOutput;
