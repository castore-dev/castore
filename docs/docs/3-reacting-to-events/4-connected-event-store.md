---
sidebar_position: 4
---

# 🔌 Connected Event Store

If your storage solution exposes data streaming capabilities (such as [DynamoDB streams](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Streams.html)), you can leverage them to push your freshly written events to a message bus or queue.

You can also use the `ConnectedEventStore` class. Its interface matches the `EventStore` one, but successfully pushing a new event will automatically forward it to a message queue/bus, and pushing an event group will also automatically forward the events to their respective message queues/buses:

```ts
import { ConnectedEventStore } from '@castore/core';

const connectedPokemonsEventStore = new ConnectedEventStore(
  // 👇 Original event store
  pokemonsEventStore,
  // 👇 Type-safe (appMessageBus MUST be able to carry pokemon events)
  appMessageBus,
);

// Will push the event in the event store
// ...AND publish it to the message bus if it succeeds 🙌
await connectedPokemonsEventStore.pushEvent({
  aggregateId: pokemonId,
  version: 2,
  type: 'POKEMON_LEVELED_UP',
  ...
});
```

:::info

Note that setting a connected event store `eventStorageAdapter` and `onEventPushed` properties will override those of the original event store instead.

:::

If the message bus or queue is a state-carrying one, the `pushEvent` method will re-fetch the aggregate to append it to the message before publishing it. You can reduce this overhead by providing the previous aggregate as an option:

```ts
await connectedPokemonsEventStore.pushEvent(
  {
    aggregateId: pokemonId,
    version: 2,
    ...
  },
  // 👇 Aggregate at version 1
  { prevAggregate: pokemonAggregate },
  // Removes the need to re-fetch 🙌
);
```

Compared to data streams, connected event stores have the advantage of simplicity, performances and costs. However, they **strongly decouple your storage and messaging solutions**: Make sure to anticipate any issue that might arise (consistency, non-caught errors etc.).

![Connected Event Store](../../assets/docSchemas/connectedEventStore.png)

<details>
<summary>
  <b>🔧 Reference</b>
</summary>

**Constructor:**

- <code>eventStore <i>(EventStore)</i></code>: The event store to connect
- <code>messageChannel <i>(MessageBus | MessageQueue)</i></code>: A message bus or queue to forward events to

**Properties:**

A `ConnectedEventStore` will implement the interface of its original `EventStore`, and extend it with two additional properties:

- <code>eventStore <i>(EventStore)</i></code>: The original event store

```ts
const eventStore = connectedPokemonsEventStore.eventStore;
// => pokemonsEventStore
```

- <code>messageChannel <i>(MessageBus | MessageQueue)</i></code>: The provided message bus or queue

```ts
const messageChannel = connectedPokemonsEventStore.messageChannel;
// => appMessageBus
```

> ☝️ Note that the `eventStorageAdapter` property will act as a pointer toward the original event store `eventStorageAdapter`:
>
> ```ts
> originalEventStore.eventStorageAdapter = myEventStorageAdapter;
> connectedEventStore.eventStorageAdapter; // => myEventStorageAdapter
>
> connectedEventStore.eventStorageAdapter = anotherEventStorageAdapter;
> originalEventStore.eventStorageAdapter; // => anotherEventStorageAdapter
> ```

</details>
