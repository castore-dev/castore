# In Memory Event Storage Adapter

DRY Castore [`EventStorageAdapter`](https://github.com/castore-dev/castore/#--eventstorageadapter) implementation using a JS object.

This class is mainly useful for manual and unit tests. It is obviously not recommended for production uses 🙂

## 📥 Installation

```bash
# npm
npm install @castore/inmemory-event-storage-adapter

# yarn
yarn add @castore/inmemory-event-storage-adapter
```

This package has `@castore/core` as peer dependency, so you will have to install it as well:

```bash
# npm
npm install @castore/core

# yarn
yarn add @castore/core
```

## 👩‍💻 Usage

```ts
import { InMemoryStorageAdapter } from '@castore/inmemory-event-storage-adapter';

const pokemonsEventsStorageAdapter = new InMemoryStorageAdapter({
  // 👇 You can specify an initial state for your event store
  initialEvents: [
    {
      aggregateId: '123',
      ...
    },
  ],
});

const pokemonsEventStore = new EventStore({
  ...
  storageAdapter: pokemonsEventsStorageAdapter,
});
```

## 🤔 How it works

This adapter simply persists events in a local dictionary. You can retrieve it at all time through the `eventStore` property:

```ts
const eventStore = pokemonsEventStore.eventStore;
// => { [aggregateId: string]: EventDetail[] }
```
