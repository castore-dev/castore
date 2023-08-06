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

When publishing a message, its `eventStoreId` is used as the message `source` and its event `type` is used as `detail-type` (except for `AggregateExistsMessageBus` for which a constant is used). The whole message is passed to the `detail` property.

```ts
// 👇 Aggregate exists
{
  "source": "POKEMONS", // <= eventStoreId
  "detail-type": "__AGGREGATE_EXISTS__", // <= constant
  "detail": {
    "eventStoreId": "POKEMONS",
    "aggregateId": "123",
  },
  ... // <= Other technical EventBridge properties
}
```

```ts
// 👇 Notification
{
  "source": "POKEMONS",
  "detail-type": "POKEMON_APPEARED", // <= event type
  "detail": {
    "eventStoreId": "POKEMONS",
    "event": {
      "aggregateId": "123",
      "version": 1,
      "type": "POKEMON_APPEARED",
      "timestamp": ...
      ...
    },
  },
  ...
}
```

```ts
// 👇 State-carrying
{
  "source": "POKEMONS",
  "detail-type": "POKEMON_APPEARED",
  "detail": {
    "eventStoreId": "POKEMONS",
    "event": {
      "aggregateId": "123",
      ...
    },
    "aggregate": { ... } // <= aggregate
  },
  ...
}
```

If the `replay` option is set to `true` when publishing a notification or state-carrying message, the `"detail-type"` will be set to `"__REPLAYED__"`. This makes sure that any subscription to replayed events is **opt-in**:

```ts
// 👇 Replayed notification message
{
  "source": "POKEMONS",
  "detail-type": "__REPLAYED__",
  "detail": {
    "eventStoreId": "POKEMONS",
    "event": {
      "aggregateId": "123",
      "type": "POKEMON_APPEARED", // <= event type still available
      ...
    },
  },
  ...
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
    'POKEMONS', // <= Only listen to the 'POKEMONS' event store events (optional)
    'POKEMON_APPEARED' // <= Only listen to 'POKEMON_APPEARED' events (optional)
  >,
) => {
  // 🙌 Correctly typed!
  const { eventStoreId, event } = message.detail;
};
```

## 🔑 IAM

The `publishMessage` method requires the `events:PutEvents` IAM permission on the provided event bus.
