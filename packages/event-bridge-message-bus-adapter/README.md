# EventBridge Message Bus Adapter

DRY Castore [`MessageBus`](https://github.com/castore-dev/castore/#--messagebus) definition using [AWS EventBridge](https://aws.amazon.com/eventbridge/).

## 📥 Installation

```bash
# npm
npm install @castore/event-bridge-message-bus-adapter

# yarn
yarn add @castore/event-bridge-message-bus-adapter
```

This package has `@castore/core` and `@aws-sdk/client-eventbridge` (above v3) as peer dependencies, so you will have to install them as well:

```bash
# npm
npm install @castore/core @aws-sdk/client-eventbridge

# yarn
yarn add @castore/core @aws-sdk/client-eventbridge
```

## 👩‍💻 Usage

```ts
import { EventBridgeClient } from '@aws-sdk/client-eventbridge';

import { EventBridgeMessageBusAdapter } from '@castore/event-bridge-message-bus-adapter';

const eventBridgeClient = new EventBridgeClient({});

const messageBusAdapter = new EventBridgeMessageBusAdapter({
  eventBusName: 'my-event-bus-name',
  eventBridgeClient,
});

// 👇 Alternatively, provide a getter
const messageBusAdapter = new EventBridgeMessageBusAdapter({
  eventBusName: () => process.env.MY_EVENT_BUS_NAME,
  eventBridgeClient,
});

const appMessageBus = new NotificationMessageBus({
  ...
  messageBusAdapter
})
```

This will directly plug your MessageBus to EventBridge 🙌

## 🤔 How it works

When publishing a message, its `eventStoreId` is used as the message `source` and its event `type` is used as `detail-type`. The whole message is passed to the `detail` property.

```ts
// 👇 Entry example
{
  "source": "USERS", // <= eventStoreId
  "detail-type": "USER_CREATED", // <= event type
  "detail": {
    "eventStoreId": "USERS",
    "event": {
      "aggregateId": "123",
      "version": 1,
      "type": "USER_CREATED",
      "timestamp": ...
      ...
    },
    "aggregate": ... // <= for state-carrying message buses
  },
  ... // <= Other technical EventBridge properties
}
```

On the listeners side, you can use the `EventBridgeMessageBusMessage` TS type to type your argument:

```ts
import type { EventBridgeMessageBusMessage } from '@castore/event-bridge-message-bus-adapter';

const listener = async (
  message: EventBridgeMessageBusMessage<typeof appMessageBus>,
) => {
  // 🙌 Correctly typed!
  const { eventStoreId, event } = message.detail;
};
```

You can provide event store ids and event types if you listener only listens to specific event types:

```ts
import type { EventBridgeMessageBusMessage } from '@castore/event-bridge-message-bus-adapter';

const listener = async (
  message: EventBridgeMessageBusMessage<
    typeof appMessageBus,
    'USERS', // <= Only listen to the 'USER' event store events (optional)
    'USER_CREATED' // <= Only listen to 'USER_CREATED' events (optional)
  >,
) => {
  // 🙌 Correctly typed!
  const { eventStoreId, event } = message.detail;
};
```

## 🔑 IAM

The `publishMessage` method requires the `events:PutEvents` IAM permission on the provided event bus.
