import { A } from 'ts-toolbelt';

import { EventType, EventTypeDetail, EventTypesDetails } from './eventType';

// Payload, no metadata

type CounterCreatedEventPayload = { startCount: number };
const counterCreatedEvent = new EventType<
  'COUNTER_CREATED',
  CounterCreatedEventPayload
>({ type: 'COUNTER_CREATED' });

const assertCounterCreatedEventDetail: A.Equals<
  EventTypeDetail<typeof counterCreatedEvent>,
  {
    aggregateId: string;
    version: number;
    type: 'COUNTER_CREATED';
    timestamp: string;
    payload: CounterCreatedEventPayload;
  }
> = 1;
assertCounterCreatedEventDetail;

// No payload, no metadata

const counterIncrementedEvent = new EventType({ type: 'COUNTER_INCREMENTED' });

const assertCounterIncrementedEventDetail: A.Equals<
  EventTypeDetail<typeof counterIncrementedEvent>,
  {
    aggregateId: string;
    version: number;
    type: 'COUNTER_INCREMENTED';
    timestamp: string;
  }
> = 1;
assertCounterIncrementedEventDetail;

// No payload, metadata

type CounterRemovedEventMetadata = { removedBy: string };
const counterRemovedEvent = new EventType<
  'COUNTER_REMOVED',
  never,
  CounterRemovedEventMetadata
>({ type: 'COUNTER_REMOVED' });

const assertCounterRemovedEventDetail: A.Equals<
  EventTypeDetail<typeof counterRemovedEvent>,
  {
    aggregateId: string;
    version: number;
    type: 'COUNTER_REMOVED';
    timestamp: string;
    metadata: CounterRemovedEventMetadata;
  }
> = 1;
assertCounterRemovedEventDetail;

// Event Details

const eventTypes = [
  counterCreatedEvent,
  counterIncrementedEvent,
  counterRemovedEvent,
];

type CounterEventDetail = EventTypesDetails<typeof eventTypes>;
const assertDetails: A.Equals<
  CounterEventDetail,
  | EventTypeDetail<typeof counterCreatedEvent>
  | EventTypeDetail<typeof counterIncrementedEvent>
  | EventTypeDetail<typeof counterRemovedEvent>
> = 1;
assertDetails;
