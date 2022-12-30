# Test tools

Test tooling for the [Castore](https://github.com/castore-dev/castore) library.

## 📥 Installation

```bash
# npm
npm install --save-dev @castore/test-tools

# yarn
yarn add --dev @castore/test-tools
```

This package has `@castore/core` as peer dependencies, so you will have to install it as well:

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

describe('My awesome test', () => {
  const mockedUserEventStore = mockEventStore(userEventStore, [
    // 👇 Provide initial state (list of event details) in a type-safe way
    {
      aggregateId: '123',
      version: 1,
      type: 'COUNTER_CREATED',
      // ...
    },
  ]);

  beforeEach(() => {
    // 👇 Reset to initial state
    mockedUserEventStore.reset();
  });

  it('pushes a USER_CREATED event', async () => {
    const { userId } = await createUserCommand.handler({
      requiredEventsStores: [mockedUserEventStore],
      // ...
    });

    const { events } = mockedUserEventStore.getEvents(userId);

    expect(events).toHaveLength(1);
  });
});
```

### MuteEventStore

Unlike `mockEventStore`, the `muteEventStore` util mutes the original event store and replace its storage adapter with an `InMemoryStorageAdapter` matching the provided initial state.

```ts
import { EventStore } from '@castore/core';
import { muteEventStore } from '@castore/test-tools';

const userEventStore = new EventStore({
  // ...
});

const functionUsingTheEventStore = async () => {
  // ...
};

describe('My awesome test', () => {
  muteEventStore(userEventStore, [
    // 👇 Provide initial state (list of event details) in a type-safe way
    {
      aggregateId: '123',
      version: 1,
      type: 'COUNTER_CREATED',
      // ...
    },
  ]);

  it('does something incredible', async () => {
    await functionUsingTheEventStore();

    // 👇 Use the original event store
    const { events } = await userEventStore.getEvents('123');

    expect(events).toHaveLength(1);
  });
});
```
