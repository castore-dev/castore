# Test tools

Test tooling for [Castore](https://github.com/castore-dev/castore) definition.

## 📥 Installation

```bash
# npm
npm install @castore/test-tools

# yarn
yarn add @castore/test-tools
```

This package has `castore/core` as peer dependencies, so you will have to it them as well:

```bash
# npm
npm install @castore/core

# yarn
yarn add @castore/core
```

## 👩‍💻 Usage

### MockEventStore

The `mockEventStore` util returns a copy of the provided `EventStore` connected to an [`InMemoryStorageAdapter`](https://github.com/castore-dev/castore/tree/main/packages/inmemory-event-storage-adapter), empty or with a given initial state. It follows the `EventStore` interface but adds a `reset` method to reset it to the provided initial state. The original event store is not muted.

```ts
import { EventStore } from '@castore/core';
import { mockEventStore } from '@castore/test-tools';

const userEventStore = new EventStore({
  // ...
});

const createUserCommand = new Command({
  // ...
});

describe('My super test', () => {
  const mockedUserEventStore = mockEventStore(userEventStore, [
    // 👇 Provide initial state (list of event details) in a type-safe way
    {
      aggregateId: 'someUserId',
      version: 1,
      type: 'COUNTER_CREATED',
      // ...
    },
  ]);

  beforeEach(() => {
    // 👇 Reset to initial state
    mockedUserEventStore.reset();
  });

  it('adds a USER_CREATED event', async () => {
    const { userId } = await createUserCommand.handler({
      requiredEventsStores: [mockedUserEventStore],
      // ...
    });

    const userEvents = mockedUserEventStore.getEvents(userId);

    expect(userEvents).toHaveLength(1);
  });
});
```

### MuteEventStore

Unlike `mockEventStore`, the `muteEventStore` util mutes the original event store and replace its storage adapter with an `InMemoryStorageAdapter` filled with the provided initial state.

```ts
import { EventStore } from '@castore/core';
import { muteEventStore } from '@castore/test-tools';

const userEventStore = new EventStore({
  // ...
});

const functionUsingTheEventStore = async () => {
  // ...
};

describe('My super test', () => {
  muteEventStore(userEventStore, [
    // 👇 Provide initial state (list of event details) in a type-safe way
    {
      aggregateId: 'someUserId',
      version: 1,
      type: 'COUNTER_CREATED',
      // ...
    },
  ]);

  it('does something incredible', async () => {
    await functionUsingTheEventStore();

    // 👇 Use the original event store
    const userEvents = await userEventStore.getEvents('someUserId');

    expect(userEvents).toHaveLength(1);
  });
});
```
