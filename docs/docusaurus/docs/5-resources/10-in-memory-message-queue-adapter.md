---
sidebar_position: 10
---

# In Memory Message Queue Adapter

DRY Castore [`MessageQueue`](../../advanced-usage/#messagequeue) definition using [FastQ](https://github.com/mcollina/fastq).

## 📥 Installation

```bash
# npm
npm install @castore/in-memory-message-queue-adapter

# yarn
yarn add @castore/in-memory-message-queue-adapter
```

This package has `@castore/core` as peer dependency, so you will have to install it as well:

```bash
# npm
npm install @castore/core

# yarn
yarn add @castore/core
```

## 👩‍💻 Usage

The simplest way to use this adapter is to use the `attachTo` static method:

```ts
import { InMemoryMessageQueueAdapter } from '@castore/in-memory-message-queue-adapter';

const messageQueueAdapter =
  InMemoryMessageQueueAdapter.attachTo(appMessageQueue);
```

This will make your `messageQueueAdapter` inherit from your `appMessageQueue` types while plugging them together 🙌

You can also instanciate one on its own, but notice the code duplication:

```ts
import type { MessageQueueMessage } from '@castore/core';
import { InMemoryMessageQueueAdapter } from '@castore/in-memory-message-queue-adapter';

const messageQueueAdapter = new InMemoryMessageQueueAdapter<
  MessageQueueMessage<typeof appMessageQueue>
>();

appMessageQueue.messageQueueAdapter = messageQueueAdapter;
```

## 🤖 Set worker

You can provide an async worker for the queue at construction time, or in context later:

```ts
const messageQueueAdapter = InMemoryMessageQueueAdapter.attachTo(
  appMessageQueue,
  {
    worker: async message => {
      // 🙌 Correctly typed!
      const { eventStoreId, event } = message;
    },
  },
);

// 👇 Alternatively
const messageQueueAdapter = new InMemoryMessageQueueAdapter<
  MessageQueueMessage<typeof appMessageQueue>
>({
  worker: async message => {
    // 🙌 Correctly typed!
    const { eventStoreId, event } = message;
  },
});

// 👇 Also alternatively
messageQueueAdapter.worker = async message => {
  // 🙌 Correctly typed!
  const { eventStoreId, event } = message;
};
```

> Only one worker at a time can be set up

## ♻️ Retry policy

This adapter will retry failed messages handling. You can specify a different retry policy than the default one via its constructor arguments:

- <code>retryAttempts <i>(?number = 2)</i></code>: The maximum number of retry attempts for a message in case of worker execution failure. If all the retries fail, the error is logged with `console.error`, and the message ignored.
- <code>retryDelayInMs <i>(?number = 30000)</i></code>: The minimum delay in milliseconds between the worker execution failure and its first retry.
- <code>retryBackoffRate <i>(?number = 2)</i></code>: A factor applied to the `retryDelayInMs` at each subsequent retry.

```ts
const messageQueueAdapter = InMemoryMessageQueueAdapter.attachTo(appMessageQueue, {
  retryAttempts: 3,
  retryDelayInMs: 10000,
  retryBackoffRate: 1.5,
});

// 👇 Alternatively
const messageQueueAdapter = new InMemoryMessageQueueAdapter<
  MessageQueueMessage<typeof appMessageQueue>
>({
  retryAttempts: 3,
  retryDelayInMs: 10000,
  retryBackoffRate: 1.5,
});
```

For instance, if the worker is continously failing for a specific message, the sequence of code execution (with the default retry policy) will look like this:

- Worker execution: ❌ Failure
- _30 seconds of delay_
- Worker execution: ❌ Failure
- _60 seconds of delay (30x2)_
- Worker execution: ❌ Failure
- _No more retry attempt, error is logged_
