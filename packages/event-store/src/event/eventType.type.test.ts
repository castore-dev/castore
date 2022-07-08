import { A } from 'ts-toolbelt';

import { EventType, EventTypeDetail, EventTypesDetails } from './eventType';

const counterCreatedEvent = new EventType<
  'COUNTER_CREATED',
  {
    aggregateId: string;
    version: number;
    type: string;
    timestamp: string;
    payload: { startCount?: number };
  }
>({
  type: 'COUNTER_CREATED',
});

const counterIncrementedEvent = new EventType({
  type: 'COUNTER_INCREMENTED',
});

const counterRemovedEvent = new EventType({
  type: 'COUNTER_REMOVED',
});

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
