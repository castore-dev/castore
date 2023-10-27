---
sidebar_position: 1
---

# From v1 to v2

This pages summarizes the breaking changes from the **v1** to the **v2**:

## `@castore/core`

### Renamings

The `EventStore` class `eventStoreEvents`, `reduce` and `storageAdapter` properties have respectively been renamed `eventTypes`, `reducer` and `eventStorageAdapter` for more consistency and clarity (including in the constructor). The `getStorageAdapter` method has also been renamed `getEventStorageAdapter`.

```ts
const pokemonsEventStore = new EventStore({
  eventStoreId: 'POKEMONS',
  eventTypes: [
    pokemonAppearedEventType,
    pokemonCaughtEventType,
    pokemonLeveledUpEventType,
    ...
  ],
  reducer: pokemonsReducer,
  eventStorageAdapter: mySuperEventStorageAdapter,
});
```

Similarly, the `StorageAdapter` interface has been renamed to `EventStorageAdapter`, and the `UndefinedStorageAdapterError` class has been renamed to `UndefinedEventStorageAdapterError`.

Finally, the `EventStoreEventsDetails`, `EventTypesDetails` and `EventStoreEventsTypes` utility types have respectively been corrected to `EventStoreEventDetails`, `EventTypeDetails` and `EventStoreEventTypes`

### `listAggregateIds`

The `listAggregateIds` method now returns an array of objects (instead of an array of strings) containing both the `aggregateId` and its `initialEventTimestamp`. This is useful to return more metadata about first/last processed aggregates when "pouring" data with `dam`:

```ts
const { aggregateIds } = await pokemonsEventStore.listAggregateIds();

for (const { aggregateId, initialEventTimestamp } of aggregateIds) {
  // ...do something with aggregateId/initialEventTimestamp
}
```

The `AggregateExistsMessage` now also contains the `initialEventTimestamp` property:

```ts
await myAggregateExistsMessageQueue.publishMessage({
  eventStoreId: 'POKEMONS',
  aggregateId: 'pikachu1',
  initialEventTimestamp: '2020-01-01T00:00:00.000Z',
});
```

### `pushEventGroup`

The ` EventStore` static `pushEventGroup` method now accepts options as a first argument:

```ts
await EventStore.pushEventGroup(
  // You can now pass options as a first argument
  { force: true },
  pokemonsEventStore.groupEvent({
    ...
  }),
  ...
);

await EventStore.pushEventGroup(
  // ...but direclty using events still work
  pokemonsEventStore.groupEvent({
    ...
  }),
  trainersEventStore.groupEvent({
    ...
  }),
);
```

This is not a breaking change on the `EventStore` interface. However, any implementation of the `EventStorageAdapter` interface **MUST** now accept an option object as a first argument.

The `EventStorageAdapter` interface has also been stripped of its legacy (or rather previous work-in-progress) `putSnapshot`, `getLastSnapshot` and `listSnapshots` methods.

## Packages

All packages have been renamed to allow for a clearer folder structure inside the repository, as well as simpler enforcing of import rules (e.g. preventing imports from `@castore/core` to `@castore/lib-foobar`).

The new package name rules are the following:

- `@castore/core` stays the same 😅
- **Event type extensions**: `event-type-<VALIDATOR>` _(e.g. `event-type-zod`)_
- **Command extensions**: `command-<VALIDATOR>` _(e.g. `command-zod`)_
- **Event storage adapters**: `event-storage-adapter-<SOLUTION>` _(e.g. `event-storage-adapter-dynamodb`)_
- **Message bus adapters**: `message-bus-adapter-<SOLUTION>` _(e.g. `message-bus-adapter-event-bridge`)_
- **Message queue adapters**: `message-queue-adapter-<SOLUTION>` _(e.g. `message-queue-adapter-sqs`)_
- **Utility libraries**: `lib-<LIBRARY_NAME>` _(e.g. `lib-dam`)_

Check out the [packages page](../4-packages.md) to find your new adapter package name.

### DynamoDBEventStorageAdapter

The `DynamoDbEventStorageAdapter` of the `event-storage-adapter-dynamodb`package has been deprecated and renamed `LegacyDynamoDBEventStorageAdapter`, in favor of the `DynamoDBSingleTableEventStorageAdapter`. It will be removed in the `v3`.

You can migrate your current data by:

- [Reacting to your current db events](../3-reacting-to-events/1-messages.md) to forward them to the new db
- "Pouring" your previous events with `lib-dam` from one event store to another with the new adapter:

```ts
import { EventStore } from '@castore/core';
import {
  LegacyDynamoDBEventStorageAdapter,
  DynamoDBSingleTableEventStorageAdapter,
} from '@castore/event-storage-adapter-dynamodb';
import { pourEventStoreEvents } from '@castore/lib-dam';
import { InMemoryMessageQueueAdapter } from '@castore/message-queue-adapter-in-memory';

const eventStoreA = new EventStore({
  ...
  eventStorageAdpater: new LegacyDynamoDBEventStorageAdapter(...),
});

// 👇 Same definition
const eventStoreB = new EventStore({
  ...
  eventStorageAdater: new DynamoDBSingleTableEventStorageAdapter(...),
});
// You can also use the same one and override the adapter
// ...but ONLY IF read & write execution contexts are different

// 👇 Example with an InMemoryMessageQueueAdapter:
const migrationMessageQueue = new NotificationMessageQueue({
  sourceEventStores: [eventStoreA],
});

InMemoryMessageQueueAdapter.attachTo(migrationMessageQueue, {
  worker: async (message, context) => {
    const { event } = message;
    const { replay } = context
    // 👇 Forward event in eventStoreB
    await eventStoreB.pushEvent(event, { force: true, replay });
  },
});

// 👇 Pour eventStoreA events
await pourEventStoreEvents({
  eventStore: eventStoreA,
  messageChannel: migrationMessageQueue,
  rateLimit: 100,
});
```
