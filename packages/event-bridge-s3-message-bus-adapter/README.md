# EventBridge Message Bus Adapter

DRY Castore [`MessageBus`](https://github.com/castore-dev/castore/#--messagebus) definition using [AWS EventBridge](https://aws.amazon.com/eventbridge/) and [AWS S3](https://aws.amazon.com/s3/).

This adapter works like the [EventBridge Message Bus Adapter](https://www.npmjs.com/package/@castore/event-bridge-message-bus-adapter) (it actually uses it under the hood), excepts that entry sizes are checked before publishing messages to EventBridge. If they are over the [256KB limit](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-putevent-size.html), they are written on a s3 bucket instead, and a message is sent containing a pre-signed URL, as [recommended by AWS](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-putevent-size.html).

Do not forget to set a [lifecycle configuration](https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lifecycle-mgmt.html) on your s3 bucket to delete the written objects after the presigned URL has expired to avoid high s3 bills! 🤑

## 📥 Installation

```bash
# npm
npm install @castore/event-bridge-s3-message-bus-adapter

# yarn
yarn add @castore/event-bridge-s3-message-bus-adapter
```

This package has `@castore/core`, `@aws-sdk/client-eventbridge` (above v3), `@aws-sdk/client-eventbridge` (above v3) and `@aws-sdk/s3-request-presigner` (above v3) as peer dependencies, so you will have to install them as well:

```bash
# npm
npm install @castore/core @aws-sdk/client-eventbridge @aws-sdk/client-s3 @aws-sdk/s3-request-presigner

# yarn
yarn add @castore/core @aws-sdk/client-eventbridge @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

## 👩‍💻 Usage

```ts
import { EventBridgeClient } from '@aws-sdk/client-eventbridge';
import { S3Client } from '@aws-sdk/client-s3';

import { EventBridgeS3MessageBusAdapter } from '@castore/event-bridge-s3-message-bus-adapter';

const eventBridgeClient = new EventBridgeClient({});
const s3Client = new S3Client({});

const messageBusAdapter = new EventBridgeS3MessageBusAdapter({
  eventBusName: 'my-event-bus-name',
  eventBridgeClient,
  s3BucketName: 'my-bucket-name',
  s3Client,
  // 👇 Optional s3 prefix for temporary data
  s3Prefix: 'temporary-storage/',
  // 👇 Optional s3 presignature expiration in seconds (defaults to 900)
  s3PreSignatureExpirationInSec: 3600
});

// 👇 Alternatively, provide a getter
const messageBusAdapter = new EventBridgeS3MessageBusAdapter({
  eventBusName: () => process.env.MY_EVENT_BUS_NAME,
  s3BucketName: () => process.env.MY_BUCKET_NAME
  ...
});

const appMessageBus = new NotificationMessageBus({
  ...
  messageBusAdapter
})
```

This will directly plug your MessageBus to EventBridge and S3 🙌

## 🤔 How it works

You can read the [EventBridge Message Bus Adapter documentation](https://www.npmjs.com/package/@castore/event-bridge-message-bus-adapter) for regular cases.

When an entry is oversized, its `Detail` is saved as a JSON object in the provided s3 bucket. It's key is a concatenation of the constructor `s3Prefix` option, the `eventStoreId` and `aggregateId` of the event and the current timestamp:

```ts
const key = 'temporary-storage/POKEMONS/pikachu1/2020-01-01T00:00:00.000Z';
```

If the event is a notification or state-carrying event, the `version` is also added to the mix:

```ts
// 👇 Date is suffixed by the version
const key = 'temporary-storage/POKEMONS/pikachu1/2020-01-01T00:00:00.000Z#3';
```

On the listeners side, you can use the `EventBridgeS3MessageBusMessage` TS type to type your argument:

```ts
import type { EventBridgeS3MessageBusMessage } from '@castore/event-bridge-s3-message-bus-adapter';

const listener = async (
  message: EventBridgeS3MessageBusMessage<typeof appMessageBus>,
) => {
  // 🙌 Correctly typed!
  const { eventStoreId, event } = message.detail;
};
```

You can provide event store ids and event types if you listener only listens to specific event types:

```ts
import type { EventBridgeS3MessageBusMessage } from '@castore/event-bridge-s3-message-bus-adapter';

const listener = async (
  message: EventBridgeS3MessageBusMessage<
    typeof appMessageBus,
    'POKEMONS', // <= Only listen to the 'POKEMONS' event store events (optional)
    'POKEMON_APPEARED' // <= Only listen to 'POKEMON_APPEARED' events (optional)
  >,
) => {
  // 🙌 Correctly typed!
  const { eventStoreId, event } = message.detail;
};
```

## 🔑 IAM

The `publishMessage` method requires the `events:PutEvents` IAM permission on the provided event bus, as well as the `s3:putObject` and `s3:getObject` IAM permissions on the provided s3 bucket for the desired keys (e.g. `my-bucket-name/temporary-storage/*`).
