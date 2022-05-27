# ✨ Better DevX for Event Sourcing in TypeScript

Castore provides a unified interface for implementing Event Sourcing in TypeScript.

Define your events shapes and register them in your event store:

```typescript
import { EventStore } from 'castore';
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

const counterIncrementedEvent = new EventType({
  type: 'COUNTER_INCREMENTED',
});

const counterRemovedEvent = new EventType({
  type: 'COUNTER_REMOVED',
});

type CounterAggregate = {
  aggregateId: string;
  version: number;
  count: number;
  status: string;
};

const counterEventStore = new EventStore({
  eventStoreId: 'Counters',
  eventTypes: [
    counterCreatedEvent,
    counterIncrementedEvent,
    counterRemovedEvent,
  ],
  // The return type of the reducer defines the EventStore aggregate type
  reduce: (aggregate: CounterAggregate, event): CounterAggregate => {
    const { aggregateId, version } = event;

    switch (event.type) {
      case 'COUNTER_CREATED': {
        // event details are correctly inferred 🙌
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
  },
  // 👇 See storage adapters section
  storageAdapter,
});
```

Your event store will then expose fully typed methods to interact with your event store:

```typescript
const {
  events, // <= Return typed events from your storage layer
  aggregate, // <= Reducer result
} = await counterEventStore.getAggregate(aggregateId);

await counterEventStore.push({
  // 👇 Method input is correctly typed
  aggregateId: crypto.randomUUID(),
  version: 1,
  type: 'COUNTER_CREATED',
  timestamp: new Date().toISOString(),
  // Payload is correctly typed as well
  payload: {
    startCount: 18,
  },
});
```

# 🤔 Why use Castore ?

- 💬 **Verbosity**: Castore classes are designed to increase dryness and provide the optimal developer experience. Event Sourcing is hard, don't make it harder!
- 📝 **Strong typings**: We love type inference, we know you will to!
- 🏄‍♂️ **Interfaces before implementations**: The aim of Castore is to provide a standard interface to modelize common event sourcing patterns in TypeScript. But it **DOES NOT enforce any particular implementation** (like storage service, messaging system etc...). You can use Castore in React apps, containers or lambdas, it's up to you! Some common implementations are provided, but you are free to use **any implementation you want** via custom classes, as long as they follow the required interfaces.
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
