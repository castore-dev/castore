---
sidebar_position: 9
---

# SQS Message Queue Adapter

DRY Castore [`MessageQueue`](../../advanced-usage/#messagequeue) definition using [AWS SQS](https://aws.amazon.com/sqs/).

## 📥 Installation

```bash
# npm
npm install @castore/sqs-message-queue-adapter

# yarn
yarn add @castore/sqs-message-queue-adapter
```

This package has `@castore/core` and `@aws-sdk/client-sqs` (above v3) as peer dependencies, so you will have to install them as well:

```bash
# npm
npm install @castore/core @aws-sdk/client-sqs

# yarn
yarn add @castore/core @aws-sdk/client-sqs
```

## 👩‍💻 Usage

```ts
import { SQSClient } from '@aws-sdk/client-sqs';

import { SQSMessageQueueAdapter } from '@castore/sqs-message-queue-adapter';

const sqsClient = new SQSClient({});

const messageQueueAdapter = new SQSMessageQueueAdapter({
  queueUrl: 'https://sqs.us-east-1.amazonaws.com/111122223333/my-super-queue',
  sqsClient,
});

// 👇 Alternatively, provide a getter
const messageQueueAdapter = new SQSMessageQueueAdapter({
  queueUrl: () => process.env.MY_SQS_QUEUE_URL,
  sqsClient,
});

const appMessageQueue = new NotificationMessageQueue({
  ...
  messageQueueAdapter
})
```

This will directly plug your MessageQueue to SQS 🙌

If your queue is of type FIFO, don't forget to specify it in the constructor:

```ts
const messageQueueAdapter = new SQSMessageQueueAdapter({
  queueUrl: 'https://sqs.us-east-1.amazonaws.com/111122223333/my-super-queue',
  sqsClient,
  fifo: true,
});
```

## 🤔 How it works

When publishing a message, it is JSON stringified and passed as the record body.

```ts
// 👇 Aggregate exists
{
  "body": "{
    \"eventStoreId\": \"POKEMONS\",
    \"aggregateId\": \"123\",
  }",
  ... // <= Other technical SQS properties
}
```

```ts
// 👇 Notification
{
  "body": "{
    \"eventStoreId\": \"POKEMONS\",
    \"event\": {
      \"aggregateId\": \"123\",
      \"version\": 1,
      \"type\": \"POKEMON_APPEARED\",
      \"timestamp\": ...
      ...
    },
  }",
  ...
}
```

```ts
// 👇 State-carrying
{
  "body": "{
    \"eventStoreId\": \"POKEMONS\",
    \"event\": {
      \"aggregateId\": \"123\",
      ...
    },
    \"aggregate\": ...
  }",
  ...
}
```

If your queue is of type FIFO, the `MessageGroupId` and `MessageDeduplicationId` will be derived from a combination of the `eventStoreId`, `aggregateId` and `version`:

```ts
// 👇 Entry example
const Entry = {
  MessageBody: JSON.stringify({ ... }),
  MessageGroupId: "POKEMONS#123",
  MessageDeduplicationId: "POKEMONS#123#1", // <= Or "POKEMONS#123" for AggregateExistsMessageQueues
  ... // <= Other technical SQS properties
};
```

On the worker side, you can use the `SQSMessageQueueMessage` and `SQSMessageQueueMessageBody` TS types to type your argument:

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

## 🔑 IAM

The `publishMessage` method requires the `sqs:SendMessage` IAM permission on the provided SQS queue.
