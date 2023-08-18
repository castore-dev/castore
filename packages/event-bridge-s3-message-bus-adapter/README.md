# EventBridge Message Bus Adapter

DRY Castore [`MessageBus`](https://github.com/castore-dev/castore/#--messagebus) definition using [AWS EventBridge](https://aws.amazon.com/eventbridge/) and [AWS S3](https://aws.amazon.com/s3/).

## 📥 Installation

```bash
# npm
npm install @castore/event-bridge-s3-message-bus-adapter

# yarn
yarn add @castore/event-bridge-s3-message-bus-adapter
```

This package has `@castore/core`, `@aws-sdk/client-eventbridge` (above v3) and `@aws-sdk/client-eventbridge` (above v3) as peer dependencies, so you will have to install them as well:

```bash
# npm
npm install @castore/core @aws-sdk/client-eventbridge @aws-sdk/client-s3

# yarn
yarn add @castore/core @aws-sdk/client-eventbridge @aws-sdk/client-s3
```

## 👩‍💻 Usage

```ts
import { EventBridgeClient } from '@aws-sdk/client-eventbridge';
import { S3Client } from '@aws-sdk/client-s3';

import { EventBridgeS3MessageBusAdapter } from '@castore/event-bridge-s3-message-bus-adapter';

const eventBridgeClient = new EventBridgeClient({});
const s3Client = new S3Client({});

const messageBusAdapter = new EventBridgeMessageBusAdapter({
  eventBusName: 'my-event-bus-name',
  eventBridgeClient,
  s3BucketName: 'my-bucket-name',
  s3Client,
  // 👇 Optional s3 prefix for temporary data
  s3Prefix: 'temporary-storage/',
});

// 👇 Alternatively, provide a getter
const messageBusAdapter = new EventBridgeMessageBusAdapter({
  eventBusName: () => process.env.MY_EVENT_BUS_NAME,
  eventBridgeClient,
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

_...coming soon_

## 🔑 IAM

_...coming soon_
