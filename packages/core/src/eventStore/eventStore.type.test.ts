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
  CounterAggregate,
  CounterEventsDetails,
  counterEventStore,
  counterCreatedEvent,
  counterIncrementedEvent,
  counterDeletedEvent,
} from './eventStore.util.test';
import { GetAggregateOptions } from './types';

// --- EXTENDS ---

const assertExtends: A.Extends<typeof counterEventStore, EventStore> = 1;
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
  [aggregateId: string, options?: GetAggregateOptions]
> = 1;
assertGetAggregateInput;

const assertGetAggregateOutput: A.Equals<
  ReturnType<typeof counterEventStore.getAggregate>,
  Promise<{
    aggregate: CounterAggregate | undefined;
    events: CounterEventsDetails[];
    lastEvent: CounterEventsDetails | undefined;
  }>
> = 1;
assertGetAggregateOutput;

// --- PUSH EVENTS ---

const assertPushEventInput1: A.Equals<
  Parameters<typeof counterEventStore.pushEvent>[0],
  | Omit<EventTypeDetail<typeof counterCreatedEvent>, 'timestamp'>
  | Omit<EventTypeDetail<typeof counterIncrementedEvent>, 'timestamp'>
  | Omit<EventTypeDetail<typeof counterDeletedEvent>, 'timestamp'>
> = 1;
assertPushEventInput1;

const assertPushEventInput2: A.Equals<
  Parameters<typeof counterEventStore.pushEvent>[1],
  { prevAggregate?: CounterAggregate | undefined } | undefined
> = 1;
assertPushEventInput2;

const assertPushEventOutput: A.Equals<
  ReturnType<typeof counterEventStore.pushEvent>,
  Promise<{
    event: CounterEventsDetails;
    nextAggregate?: CounterAggregate | undefined;
  }>
> = 1;
assertPushEventOutput;
