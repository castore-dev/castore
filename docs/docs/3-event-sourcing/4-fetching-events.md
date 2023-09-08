---
sidebar_position: 4
---

# 🛒 Fetching events

For the moment, we didn't provide any actual way to store our events data. This is the responsibility of the `EventStorageAdapter` class.

```ts
import { EventStore } from '@castore/core';

await pokemonsEventStore.getEvents('pikachu1');
// ❌ Will throw an `UndefinedStorageAdapterError`

const pokemonsEventStore = new EventStore({
  eventStoreId: 'POKEMONS',
  eventTypes: pokemonEventTypes,
  reduce: pokemonsReducer,
  // 👇 Provide it in the constructor
  storageAdapter: mySuperStorageAdapter,
});

// 👇 ...or set/switch it in context later
pokemonsEventStore.storageAdapter = mySuperStorageAdapter;

const { events } = await pokemonsEventStore.getEvents('pikachu1');
// 🙌 Will work!
```

:::info

You can choose to build an event storage adapter that suits your usage. However, we highly recommend using an [off-the-shelf adapter](../5-resources.md) (if the storage solution that you use does not have an adapter yet, feel free to create/upvote an issue, or contribute 🤗).

:::
