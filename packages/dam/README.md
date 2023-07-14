# Dam

Data maintenance & migration tooling for the [Castore](https://github.com/castore-dev/castore) library.

## 📥 Installation

```bash
# npm
npm install --save-dev @castore/dam

# yarn
yarn add --dev @castore/dam
```

This package has `@castore/core` as peer dependency, so you will have to install it as well:

```bash
# npm
npm install @castore/core

# yarn
yarn add @castore/core
```

## 👩‍💻 Usage

### `pourEventStoreAggregateIds`

Publish all the aggregate ids of an event store to a provided [`AggregateExistsMessageChannel`](https://github.com/castore-dev/castore#--event-driven-architecture). Aggregate ids are published in the order in which they are retrieved (by default, ordered by their initial timestamps).

```ts
import { pourEventStoreAggregateIds } from '@castore/dam';

// 👇 ...or AggregateExistsMessageBus
const maintenanceMessageQueue = new AggregateExistsMessageQueue({
  ...
});

await pourEventStoreAggregateIds({
  eventStore: pokemonsEventStore,
  messageChannel: maintenanceMessageQueue,
  // 👇 Optional `listAggregateIds` options (except "pageToken")
  options: {
    limit: 100,
    initialEventAfter: '2020-01-01T00:00:00.000Z',
    initialEventBefore: '2023-01-01T00:00:00.000Z',
    reverse: false,
  },
});
```

### `pourAggregateEvents`

Publish all the events of an aggregate to a provided [`NotificationMessageChannel`](https://github.com/castore-dev/castore#--event-driven-architecture). Events are published in the order in which they are retrieved (by default, ordered by their timestamps).

```ts
import { pourAggregateEvents } from '@castore/dam';

// 👇 ...or NotificationMessageBus
const maintenanceMessageQueue = new NotificationMessageQueue({
  ...
});

await pourAggregateEvents({
  eventStore: pokemonsEventStore,
  messageChannel: maintenanceMessageQueue,
  aggregateId: 'pikachu1',
  // 👇 Optional `getEvents` options
  options: {
    minVersion: 1,
    maxVersion: 10,
    limit: 5,
    reverse: false,
  },
  // 👇 Optional `timestamp` filters
  filters: {
    from: '2020-01-01T00:00:00.000Z',
    to: '2023-01-01T00:00:00.000Z',
  },
});
```

### `pourEventStoreEvents`

Publish all the events of an event store to a provided [`NotificationMessageChannel`](https://github.com/castore-dev/castore#--event-driven-architecture). Events are published in the order of their timestamps.

```ts
import { pourEventStoreEvents } from '@castore/dam';

// 👇 ...or NotificationMessageBus
const maintenanceMessageQueue = new NotificationMessageQueue({
  ...
});

await pourEventStoreEvents({
  eventStore: pokemonsEventStore,
  messageChannel: maintenanceMessageQueue,
  // 👇 Optional `timestamp` filters
  filters: {
    from: '2020-01-01T00:00:00.000Z',
    to: '2023-01-01T00:00:00.000Z',
  },
});
```
