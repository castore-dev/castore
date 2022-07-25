<img src="assets/logo.svg" width="300px"/>

# ✨ Better DevX for Event Sourcing in TypeScript

Castore provides a unified interface for implementing Event Sourcing in TypeScript.

Define your events types:

```typescript
import { EventTypesDetails } from 'castore';
import { JSONSchemaEventType } from 'castore/json-schema-event-type';

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

// Will infer correct union type 🙌
type CounterEventDetail = EventTypesDetails<typeof eventTypes>;
```

Define your aggregate type and reducer:

```typescript
type CounterAggregate = {
  aggregateId: string;
  version: number;
  count: number;
  status: string;
};

const reducer = (
  aggregate: CounterAggregate,
  event: CounterEventDetail,
): CounterAggregate => {
  const { aggregateId, version } = event;

  switch (event.type) {
    case 'COUNTER_CREATED': {
      const { startCount = 0 } = event.payload;

      return {
        aggregateId,
        version,
        count: startCount,
        status: 'CREATED',
      };
    }
    case 'COUNTER_INCREMENTED':
      return {
        ...aggregate,
        version,
        count: aggregate.count + 1,
      };
    case 'COUNTER_REMOVED':
      return {
        ...aggregate,
        version,
        status: 'REMOVED',
      };
  }
};
```

Finally, initialize an EventStore class and start interacting with your event store:

```typescript
const counterEventStore = new EventStore({
  eventStoreId: 'Counters',
  eventTypes,
  reducer,
  // 👇 See storage adapters section
  storageAdapter,
});

const {
  events, // <= Typed events
  aggregate, // <= Reducer result
} = await counterEventStore.getAggregate(aggregateId);

// 👇 Method input is correctly typed
await counterEventStore.pushEvent({
  aggregateId: '123',
  version: 1,
  type: 'COUNTER_CREATED',
  timestamp: new Date().toISOString(),
  payload: {
    startCount: 18,
  },
});
```

# 🤔 Why use Castore ?

- 💬 **Verbosity**: Castore classes are designed to increase dryness and provide the optimal developer experience. Event Sourcing is hard, don't make it harder!
- 📝 **Strong typings**: We love type inference, we know you will to!
- 🏄‍♂️ **Interfaces before implementations**: Castore provides a standard interface to modelize common event sourcing patterns in TypeScript. But it **DOES NOT enforce any particular implementation** (storage service, messaging system etc...). You can use Castore in React apps, containers or lambdas, it's up to you! Some common implementations are provided, but you are free to use **any implementation you want** via custom classes, as long as they follow the required interfaces.
- 👍 **Enforces best practices**: Gained from years of usage like using int versions instead of timestamps, transactions for multi-store events and state-carrying transfer events for projections.
- 🛠 **Rich suite of helpers**: Like mock events builder to help you write tests.

# Table of content

- [Event](#event)
- [Event Store](#event-store)
- [Storage Adapter](#storage-adapter)
- [Mock Events Builder](#mock-events-builder)

# Event

TODO

# Event Store

TODO

# Storage Adapter

TODO

# Mock Events Builder

TODO
