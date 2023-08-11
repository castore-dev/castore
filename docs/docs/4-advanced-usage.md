---
sidebar_position: 4
---

# 💪 Advanced usage

## Event-driven architecture

Event Sourcing integrates very well with [event-driven architectures](https://en.wikipedia.org/wiki/Event-driven_architecture). In a traditional architecture, you would need to design your system events (or **messages** for clarity) separately from your data. With Event Sourcing, they can simply **broadcast the business events you already designed**.

In Castore, we distinguish three types of message:

- **AggregateExists messages** which only carry aggregate ids (mainly for maintenance purposes)
- **Notification messages** which also carry event details
- **State-carrying messages** which also carry their corresponding aggregates

![Messages Types](../assets/docSchemas/messageTypes.png)

In Castore, they are implemented by the `AggregateExistsMessage`, `NotificationMessage` and `StateCarryingMessage` TS types:

```ts
// AggregateExistsMessage
import type {
  AggregateExistsMessage,
  EventStoreAggregateExistsMessage,
} from '@castore/core';

type PokemonAggregateExistsMessage = AggregateExistsMessage<'POKEMONS'>;

// 👇 Equivalent to:
type PokemonAggregateExistsMessage = {
  eventStoreId: 'POKEMONS';
  aggregateId: string;
};

// // 👇 Also equivalent to:
type PokemonAggregateExistsMessage = EventStoreAggregateExistsMessage<
  typeof pokemonsEventStore
>;
```

```ts
// NotificationMessage
import type {
  NotificationMessage,
  EventStoreNotificationMessage,
} from '@castore/core';

type PokemonEventNotificationMessage = NotificationMessage<
  'POKEMONS',
  PokemonEventDetails
>;

// 👇 Equivalent to:
type PokemonEventNotificationMessage = {
  eventStoreId: 'POKEMONS';
  event: PokemonEventDetails;
};

// 👇 Also equivalent to:
type PokemonEventNotificationMessage = EventStoreNotificationMessage<
  typeof pokemonsEventStore
>;
```

```ts
// StateCarryingMessage
import type {
  StateCarryingMessage,
  EventStoreStateCarryingMessage,
} from '@castore/core';

type PokemonEventStateCarryingMessage = StateCarryingMessage<
  'POKEMONS',
  PokemonEventDetails,
  PokemonAggregate
>;

// 👇 Equivalent to:
type PokemonEventStateCarryingMessage = {
  eventStoreId: 'POKEMONS';
  event: PokemonEventDetails;
  aggregate: PokemonAggregate
};

// 👇 Also equivalent to:
type PokemonEventStateCarryingMessage = EventStoreStateCarryingMessage<
  typeof pokemonsEventStore
>;
```

All types of message can be published through message channels, i.e. [Message Queues](#messagequeue) or [Message Buses](#messagebus).

## `MessageQueue`

[Message Queues](https://en.wikipedia.org/wiki/Message_queue) store the published messages until they are handled by a **worker**. The worker is unique and predictible. It consumes all messages indifferently of their content.

![Message Queue](../assets/docSchemas/messageQueue.png)

You can use the `AggregateExistsMessageQueue`, `NotificationMessageQueue` or `StateCarryingMessageQueue` classes to implement message queues:

```ts
import { NotificationMessageQueue } from '@castore/core';

const appMessageQueue = new NotificationMessageQueue({
  messageQueueId: 'APP_MESSAGE_QUEUE',
  sourceEventStores: [pokemonsEventStore, trainersEventStore],
});

await appMessageQueue.publishMessage({
  // 👇 Typed as NotificationMessage of one of the source event stores
  eventStoreId: 'POKEMONS',
  event: {
    type: 'POKEMON_LEVELED_UP',
    ...
  },
});

// Similar for AggregateExistsMessageQueue and StateCarryingMessageQueue
```

> <details>
> <summary><b>🔧 Technical description</b></summary>
> <p></p>
>
> **Constructor:**
>
> - <code>messageQueueId <i>(string)</i></code>: A string identifying the message queue
> - <code>sourceEventStores <i>(EventStore[])</i></code>: List of event stores that the message queue will broadcast events from
> - <code>messageQueueAdapter <i>(?MessageChannelAdapter)</i></code>: See section on [`MessageQueueAdapters`](#messagequeueadapter)
>
> **Properties:**
>
> - <code>messageChannelId <i>(string)</i></code>
>
> ```ts
> const appMessageQueueId = appMessageQueue.messageChannelId;
> // => 'APP_MESSAGE_QUEUE'
> ```
>
> - <code>sourceEventStores <i>(EventStore[])</i></code>
>
> ```ts
> const appMessageQueueSourceEventStores = appMessageQueue.sourceEventStores;
> // => [pokemonsEventStore, trainersEventStore...]
> ```
>
> - <code>messageChannelAdapter <i>?MessageChannelAdapter</i></code>: See section on [`MessageQueueAdapters`](#messagequeueadapter)
>
> ```ts
> const appMessageQueueAdapter = appMessageQueue.messageChannelAdapter;
> // => undefined (we did not provide one in this example)
> ```
>
> ☝️ The `messageChannelAdapter` is not read-only so you do not have to provide it right away.
>
> **Async Methods:**
>
> The following methods interact with the messaging solution of your application through a `MessageQueueAdapter`. They will throw an `UndefinedMessageChannelAdapterError` if you did not provide one.
>
> - <code>publishMessage <i>(message: Message, opt?: OptionsObj = {}) => Promise\<void\>)</i></code>: Publish a `Message` (of the appropriate type) to the message queue.
>
>   `OptionsObj` contains the following properties:
>
>   - <code>replay <i>(?boolean = false)</i></code>: Signals that the event is not happening in real-time, e.g. in maintenance or migration operations. This information can be used downstream to react appropriately. Check the implementation of you adapter for more details.
>
> - <code>publishMessages <i>(messages: Message[], opt?: OptionsObj) => Promise\<void\>)</i></code>: Publish several `Messages` (of the appropriate type) to the message queue. Options are similar to the `publishMessage` options.
>
> - <code>getAggregateAndPublishMessage <i>((message: NotificationMessage) => Promise\<void\>)</i></code>: _(StateCarryingMessageQueues only)_ Append the matching aggregate (with correct version) to a `NotificationMessage` and turn it into a `StateCarryingMessage` before publishing it to the message queue. Uses the message queue event stores: Make sure that they have correct adapters set up.
>
> **Type Helpers:**
>
> - <code>MessageChannelMessage</code>: Given a `MessageQueue`, returns the TS type of its messages
>
> ```ts
> import type { MessageChannelMessage } from '@castore/core';
>
> type AppMessage = MessageChannelMessage<typeof appMessageQueue>;
>
> // 👇 Equivalent to:
> type AppMessage = EventStoreNotificationMessage<
>   typeof pokemonsEventStore | typeof trainersEventStore...
> >;
> ```
>
> </details>

## `MessageQueueAdapter`

Similarly to event stores, `MessageQueue` classes provide a boilerplate-free and type-safe interface to publish messages, but are NOT responsible for actually doing so. This is the responsibility of the `MessageQueueAdapter`, that will connect it to your actual messaging solution:

```ts
import { EventStore } from '@castore/core';

const messageQueue = new NotificationMessageQueue({
  ...
  // 👇 Provide it in the constructor
  messageQueueAdapter: mySuperMessageQueueAdapter,
});

// 👇 ...or set/switch it in context later
messageQueue.messageChannelAdapter = mySuperMessageQueueAdapter;
// Named `messageChannelAdapter` as queues inherit from the `MessageChannel` class
```

You can code your own `MessageQueueAdapter` (simply implement the `MessageChannelAdapter` interface), but we highly recommend using an off-the-shelf adapter:

- [SQS Message Queue Adapter](https://www.npmjs.com/package/@castore/sqs-message-queue-adapter)
- [In-Memory Message Queue Adapter](https://www.npmjs.com/package/@castore/in-memory-message-queue-adapter)

If the messaging solution that you use is missing, feel free to create/upvote an issue, or contribute 🤗

The adapter packages will also expose useful generics to type the arguments of your queue worker. For instance:

```ts
import type {
  SQSMessageQueueMessage,
  SQSMessageQueueMessageBody,
} from '@castore/sqs-message-queue-adapter';

const appMessagesWorker = async ({ Records }: SQSMessageQueueMessage) => {
  Records.forEach(({ body }) => {
    // 👇 Correctly typed!
    const recordBody: SQSMessageQueueMessageBody<typeof appMessageQueue> =
      JSON.parse(body);
  });
};
```

## `MessageBus`

[Message Buses](https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern) are used to spread messages to multiple **listeners**. Contrary to message queues, they do not store the message or wait for the listeners to respond. Often, **filter patterns** can also be used to trigger listeners or not based on the message content.

![Message Bus](../assets/docSchemas/messageBus.png)

You can use the `AggregateExistsMessageBus`, `NotificationMessageBus` or `StateCarryingMessageBus` classes to implement message buses:

```ts
import { NotificationMessageBus } from '@castore/core';

const appMessageBus = new NotificationMessageBus({
  messageBusId: 'APP_MESSAGE_BUSES',
  sourceEventStores: [pokemonsEventStore, trainersEventStore...],
});

await appMessageBus.publishMessage({
  // 👇 Typed as NotificationMessage of one of the source event stores
  eventStoreId: 'POKEMONS',
  event: {
    type: 'POKEMON_LEVELED_UP',
    ...
  }
})

// Similar for AggregateExistsMessageBus and StateCarryingMessageBus
```

> <details>
> <summary><b>🔧 Technical description</b></summary>
> <p></p>
>
> **Constructor:**
>
> - <code>messageBusId <i>(string)</i></code>: A string identifying the message bus
> - <code>sourceEventStores <i>(EventStore[])</i></code>: List of event stores that the message bus will broadcast events from
> - <code>messageBusAdapter <i>(?MessageChannelAdapter)</i></code>: See section on [`MessageBusAdapters`](#messagebusadapter)
>
> **Properties:**
>
> - <code>messageBusId <i>(string)</i></code>
>
> ```ts
> const appMessageBusId = appMessageBus.messageBusId;
> // => 'APP_MESSAGE_BUS'
> ```
>
> - <code>sourceEventStores <i>(EventStore[])</i></code>
>
> ```ts
> const appMessageBusSourceEventStores = appMessageBus.sourceEventStores;
> // => [pokemonsEventStore, trainersEventStore...]
> ```
>
> - <code>messageChannelAdapter <i>?MessageChannelAdapter</i></code>: See section on [`MessageBusAdapters`](#messagebusadapter)
>
> ```ts
> const appMessageBusAdapter = appMessageBus.messageChannelAdapter;
> // => undefined (we did not provide one in this example)
> ```
>
> ☝️ The `messageChannelAdapter` is not read-only so you do not have to provide it right away.
>
> **Async Methods:**
>
> The following methods interact with the messaging solution of your application through a `MessageBusAdapter`. They will throw an `UndefinedMessageChannelAdapterError` if you did not provide one.
>
> - <code>publishMessage <i>(message: Message, opt?: OptionsObj = {}) => Promise\<void\>)</i></code>: Publish a `Message` (of the appropriate type) to the message bus.
>
>   `OptionsObj` contains the following properties:
>
>   - <code>replay <i>(?boolean = false)</i></code>: Signals that the event is not happening in real-time, e.g. in maintenance or migration operations. This information can be used downstream to react appropriately. Check the implementation of you adapter for more details.
>
> - <code>publishMessages <i>(messages: Message[], opt?: OptionsObj) => Promise\<void\>)</i></code>: Publish several `Messages` (of the appropriate type) to the message bus. Options are similar to the `publishMessage` options.
>
> - <code>getAggregateAndPublishMessage <i>((message: NotificationMessage) => Promise\<void\>)</i></code>: _(StateCarryingMessageBuses only)_ Append the matching aggregate (with correct version) to a `NotificationMessage` and turn it into a `StateCarryingMessage` before publishing it to the message bus. Uses the message bus event stores: Make sure that they have correct adapters set up.
>
> **Type Helpers:**
>
> - <code>MessageChannelMessage</code>: Given a `MessageBus`, returns the TS type of its messages
>
> ```ts
> import type { MessageChannelMessage } from '@castore/core';
>
> type AppMessage = MessageChannelMessage<typeof appMessageBus>;
>
> // 👇 Equivalent to:
> type AppMessage = EventStoreNotificationMessage<
>   typeof pokemonsEventStore | typeof trainersEventStore...
> >;
> ```
>
> </details>

## `MessageBusAdapter`

Similarly to event stores, `MessageBus` classes provide a boilerplate-free and type-safe interface to publish messages, but are NOT responsible for actually doing so. This is the responsibility of the `MessageBusAdapter`, that will connect it to your actual messaging solution:

```ts
import { EventStore } from '@castore/core';

const messageBus = new NotificationMessageBus({
  ...
  // 👇 Provide it in the constructor
  messageBusAdapter: mySuperMessageBusAdapter,
});

// 👇 ...or set/switch it in context later
messageBus.messageChannelAdapter = mySuperMessageBusAdapter;
// Named `messageChannelAdapter` as buses inherit from the `MessageChannel` class
```

You can code your own `MessageBusAdapter` (simply implement the `MessageChannelAdapter` interface), but we highly recommend using an off-the-shelf adapter:

- [EventBridge Message Bus Adapter](https://www.npmjs.com/package/@castore/event-bridge-message-bus-adapter)
- [In-Memory Message Bus Adapter](https://www.npmjs.com/package/@castore/in-memory-message-bus-adapter)

If the messaging solution that you use is missing, feel free to create/upvote an issue, or contribute 🤗

The adapter packages will also expose useful generics to type the arguments of your bus listeners. For instance:

```ts
import type { EventBridgeMessageBusMessage } from '@castore/event-bridge-message-bus-adapter';

const pokemonMessagesListener = async (
  // 👇 Specify that you only listen to the pokemonsEventStore messages
  eventBridgeMessage: EventBridgeMessageBusMessage<
    typeof appMessageQueue,
    'POKEMONS'
  >,
) => {
  // 👇 Correctly typed!
  const message = eventBridgeMessage.detail;
};
```

## `ConnectedEventStore`

If your storage solution exposes data streaming capabilities (such as [DynamoDB streams](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Streams.html)), you can leverage them to push your freshly written events to a message bus or queue.

You can also use the `ConnectedEventStore` class. Its interface matches the `EventStore` one, but successfully pushing a new event will automatically forward it to a message queue/bus, and pushing a event group will also automatically forward the events to their respective message queues/buses:

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

> Note that setting a connected event store `storageAdapter` and `onEventPushed` properties will override those of the original event store instead.

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

![Connected Event Store](../assets/docSchemas/connectedEventStore.png)

Compared to data streams, connected event stores have the advantage of simplicity, performances and costs. However, they **strongly decouple your storage and messaging solutions**: Make sure to anticipate any issue that might arise (consistency, non-caught errors etc.).

> <details>
> <summary><b>🔧 Technical description</b></summary>
> <p></p>
>
> **Constructor:**
>
> - <code>eventStore <i>(EventStore)</i></code>: The event store to connect
> - <code>messageChannel <i>(MessageBus | MessageQueue)</i></code>: A message bus or queue to forward events to
>
> **Properties:**
>
> A `ConnectedEventStore` will implement the interface of its original `EventStore`, and extend it with two additional properties:
>
> - <code>eventStore <i>(EventStore)</i></code>: The original event store
>
> ```ts
> const eventStore = connectedPokemonsEventStore.eventStore;
> // => pokemonsEventStore
> ```
>
> - <code>messageChannel <i>(MessageBus | MessageQueue)</i></code>: The provided message bus or queue
>
> ```ts
> const messageChannel = connectedPokemonsEventStore.messageChannel;
> // => appMessageBus
> ```
>
> Note that the `storageAdapter` property will act as a pointer toward the original event store `storageAdapter`:
>
> ```ts
> originalEventStore.storageAdapter = myStorageAdapter;
> connectedEventStore.storageAdapter; // => myStorageAdapter
>
> connectedEventStore.storageAdapter = anotherStorageAdapter;
> originalEventStore.storageAdapter; // => anotherStorageAdapter
> ```
>
> </details>

## Snapshotting

As events pile up in your event stores, the performances and costs of your commands can become an issue.

One solution is to periodially persist **snapshots** of your aggregates (e.g. through a message bus listener), and only fetch them plus the subsequent events instead of all the events.

Snapshots are not implemented in Castore yet, but we have big plans for them, so stay tuned 🙂

## Read Models

Even with snapshots, using the event store for querying needs (like displaying data in a web page) would be slow and inefficient, if not impossible depending on the access pattern.

In Event Sourcing, it is common to use a special type of message bus listener called **projections**, responsible for maintaining data specifically designed for querying needs, called **read models**.

Read models allow for faster read operations, as well as re-indexing. Keep in mind that they are [eventually consistent](https://en.wikipedia.org/wiki/Eventual_consistency) by design, which can be annoying in some use cases (like opening a resource page directly after its creation).

Read models are not implemented in Castore yet, but we have big plans for them, so stay tuned 🙂
