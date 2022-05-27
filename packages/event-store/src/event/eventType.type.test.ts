import { A } from 'ts-toolbelt';

import { EventTypeDetail, EventTypesDetails } from './eventType';
import { JSONSchemaEventType } from './implementations/jsonSchema';

const counterCreatedEvent = new JSONSchemaEventType({
  type: 'COUNTER_CREATED',
  payloadSchema: {
    type: 'object',
    properties: {
      startCount: { type: 'integer' },
    },
  } as const,
});

const counterIncrementedEvent = new JSONSchemaEventType({
  type: 'COUNTER_INCREMENTED',
});

const counterRemovedEvent = new JSONSchemaEventType({
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
