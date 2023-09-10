---
sidebar_position: 2
---

# 📨 Message Queues

[Message Queues](https://en.wikipedia.org/wiki/Message_queue) store the published messages until they are handled by a **worker**. The worker is unique and predictible. It consumes all messages indifferently of their content.

![Message Queue](../../assets/docSchemas/messageQueue.png)

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

Similarly to event stores, `MessageQueue` classes provide a boilerplate-free and type-safe interface to publish messages, but are NOT responsible for actually doing so. This is the responsibility of the `MessageQueueAdapter`, that will connect it to your actual messaging solution:

```ts
import { EventStore } from '@castore/core';

await messageQueue.publishMessage(...);
// ❌ Will throw an `UndefinedMessageChannelAdapterError`

const messageQueue = new NotificationMessageQueue({
  ...
  // 👇 Provide it in the constructor
  messageQueueAdapter: mySuperMessageQueueAdapter,
});

// 👇 ...or set/switch it in context later
messageQueue.messageChannelAdapter = mySuperMessageQueueAdapter;

await messageQueue.publishMessage(...);
// 🙌 Will work!
```

:::info

You can code your own `MessageQueueAdapter` (simply implement the `MessageChannelAdapter` interface), but we highly recommend using an [off-the-shelf adapter](../5-packages.md#-message-queue-adapters) (if the messaging solution that you use does not have an adapter yet, feel free to create/upvote an issue, or contribute 🤗).

:::

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

<details>
<summary>
  <b>🔧 Reference</b>
</summary>

**Constructor:**

- <code>messageQueueId <i>(string)</i></code>: A string identifying the message queue
- <code>sourceEventStores <i>(EventStore[])</i></code>: List of event stores that the message queue will broadcast events from
- <code>messageQueueAdapter <i>(?MessageChannelAdapter)</i></code>: Message queue adapter

**Properties:**

- <code>messageChannelId <i>(string)</i></code>

```ts
const appMessageQueueId = appMessageQueue.messageChannelId;
// => 'APP_MESSAGE_QUEUE'
```

- <code>sourceEventStores <i>(EventStore[])</i></code>

```ts
const appMessageQueueSourceEventStores = appMessageQueue.sourceEventStores;
// => [pokemonsEventStore, trainersEventStore...]
```

- <code>messageChannelAdapter <i>?MessageChannelAdapter</i></code>: Returns the associated message queue adapter (potentially undefined)

```ts
const appMessageQueueAdapter = appMessageQueue.messageChannelAdapter;
// => undefined (we did not provide one in this example)
```

> ☝️ The `messageChannelAdapter` is not read-only so you do not have to provide it right away.

---

**Async Methods:**

The following methods interact with the messaging solution of your application through a `MessageQueueAdapter`. They will throw an `UndefinedMessageChannelAdapterError` if you did not provide one.

- <code>publishMessage <i>((message: Message, opt?: OptionsObj) => Promise&lt;void&gt;)</i></code>: Publish a <code>Message</code> (of the appropriate type) to the message queue.

  `OptionsObj` contains the following properties:

  - <code>replay <i>(?boolean = false)</i></code>: Signals that the event is not happening in real-time, e.g. in maintenance or migration operations. This information can be used downstream to react appropriately. Check the implementation of you adapter for more details.

- <code>publishMessages <i>((messages: Message[], opt?: OptionsObj) => Promise&lt;void&gt;)</i></code>: Publish several <code>Messages</code> (of the appropriate type) to the message queue. Options are similar to the <code>publishMessage</code> options.
- <code>getAggregateAndPublishMessage <i>((message: NotificationMessage) => Promise&lt;void&gt;)</i></code>: <i>(StateCarryingMessageQueues only)</i> Append the matching aggregate (with correct version) to a <code>NotificationMessage</code> and turn it into a <code>StateCarryingMessage</code> before publishing it to the message queue. Uses the message queue event stores: Make sure that they have correct adapters set up.

---

**Type Helpers:**

- <code>MessageChannelMessage</code>: Given a <code>MessageQueue</code>, returns the TS type of its messages

```ts
import type { MessageChannelMessage } from '@castore/core';

type AppMessage = MessageChannelMessage<typeof appMessageQueue>;

// 👇 Equivalent to:
type AppMessage = EventStoreNotificationMessage<
  typeof pokemonsEventStore | typeof trainersEventStore...
>;
```

</details>
