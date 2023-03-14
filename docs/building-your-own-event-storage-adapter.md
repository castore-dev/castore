# Building your own EventStorageAdapter

You can build your own `EventStorageAdapter` class by following the [`EventStorageAdapter` interface](../packages/core/src/storageAdapter.ts):

```ts
import type { StorageAdapter } from '@castore/core';

export class CustomStorageAdapter implements StorageAdapter {
  getEvents: StorageAdapter['getEvents'];
  pushEvent: StorageAdapter['pushEvent'];
  listAggregateIds: StorageAdapter['listAggregateIds'];
  // 👇 Not used for the moment
  putSnapshot: StorageAdapter['putSnapshot'];
  getLastSnapshot: StorageAdapter['getLastSnapshot'];
  listSnapshots: StorageAdapter['listSnapshots'];

  constructor(
    ... // Add required inputs
  ) {
    // Build your adapter
  }
}
```

> You can also take a look at the [`InMemoryStorageAdapter` implementation](../packages/inmemory-event-storage-adapter/src/inMemory.ts) which is quite simple.

The required methods are the following:

- <code>getEvents <i>((aggregateId: string, opt?: OptionsObj = {}) => Promise\<ResponseObj\>)</i></code>: Retrieves the events of an aggregate, ordered by `version`. Returns an empty array if no event is found for this `aggregateId`.

  `OptionsObj` contains the following attributes:

  - <code>minVersion <i>(?number)</i></code>: To retrieve events above a certain version
  - <code>maxVersion <i>(?number)</i></code>: To retrieve events below a certain version
  - <code>limit <i>(?number)</i></code>: Maximum number of events to retrieve
  - <code>reverse <i>(?boolean = false)</i></code>: To retrieve events in reverse order (does not require to swap `minVersion` and `maxVersion`)

  `ResponseObj` contains the following attributes:

  - <code>events <i>(EventDetail[])</i></code>: The aggregate events (possibly empty)

```ts
const { events: allEvents } = await customStorageAdapter.getEvents(aggregateId);

// 👇 Retrieve a range of events
const { events: rangedEvents } = await customStorageAdapter.getEvents(
  aggregateId,
  { minVersion: 2, maxVersion: 5 },
);

// 👇 Retrieve the last event of the aggregate
const { events: onlyLastEvent } = await customStorageAdapter.getEvents(
  aggregateId,
  { reverse: true, limit: 1 },
);
```

- <code>pushEvent <i>((eventDetail: EventDetail) => Promise\<void\>)</i></code>: Pushes a new event to the event store.

```ts
await customStorageAdapter.pushEvent({
  aggregateId,
  version: lastVersion + 1,
  timestamp: new Date().toISOString(),
  type: 'USER_CREATED',
  payload,
  metadata,
});
```

The `pushEvent` method should check at write time that an event doesn't already exist for the given `aggregateId` and `version`. If one exists, it should throw a custom error implementing the `EventAlreadyExistsError` interface for the corresponding `aggregateId` and `version`.

```ts
import {
  eventAlreadyExistsErrorCode,
  EventAlreadyExistsError,
} from '@castore/core';

class CustomEventAlreadyExistsError
  extends Error
  implements EventAlreadyExistsError
{
  code: typeof eventAlreadyExistsErrorCode;
  aggregateId: string;
  version: number;

  constructor({
    eventStoreId = '',
    aggregateId,
    version,
  }: {
    eventStoreId?: string;
    aggregateId: string;
    version: number;
  }) {
    // 👇 Custom error message
    super(
      `Event already exists for ${eventStoreId} aggregate ${aggregateId} and version ${version}`,
    );

    // 👇 Ensures Error is correctly handled
    this.code = eventAlreadyExistsErrorCode;
    this.aggregateId = aggregateId;
    this.version = version;
  }
}
```

> This ensures that executed [`Commands`](../README.md#%EF%B8%8F-command) are not subject to [race conditions](https://en.wikipedia.org/wiki/Race_condition) and are accordingly retried.

- <code>listAggregateIds <i>((opt?: OptionsObj = {}) => Promise\<ResponseObj\>)</i></code>: Retrieves the list of `aggregateId` of an event store, ordered by `timestamp` of their initial event. Returns an empty array if no aggregate is found.

  `OptionsObj` contains the following attributes:

  - <code>limit <i>(?number)</i></code>: Maximum number of aggregate ids to retrieve
  - <code>pageToken <i>(?string)</i></code>: To retrieve a paginated result of aggregate ids
  - <code>initialEventAfter <i>(?string)</i></code>: To retrieve aggregate ids that appeared after a certain timestamp
  - <code>initialEventBefore <i>(?string)</i></code>: To retrieve aggregate ids that appeared before a certain timestamp
  - <code>reverse <i>(?boolean)</i></code>: To retrieve the aggregate ids in reverse order

  `ResponseObj` contains the following attributes:

  - <code>aggregateIds <i>(string[])</i></code>: The list of aggregate ids
  - <code>nextPageToken <i>(?string)</i></code>: A token for the next page of aggregate ids if one exists. The nextPageToken carries the previously used options, so you do not have to provide them again (though you can still do it to override them).

```ts
const accAggregateIds: string = [];
const { aggregateIds: firstPage, nextPageToken } =
  await customStorageAdapter.listAggregateIds({ limit: 20 });

accAggregateIds.push(...firstPage);

if (nextPageToken) {
  const { aggregateIds: secondPage } =
    await customStorageAdapter.listAggregateIds({
      pageToken: nextPageToken,
    });
  accAggregateIds.push(...secondPage);
}
```

- <code>putSnapshot <i>((aggregate: Aggregate) => Promise\<void\>)</i></code>: Saves a snapshot of an aggregate.

> ⚠️ Snapshot methods are a work in progress. Don't use them in production yet!

- <code>getLastSnapshot <i>((aggregateId: string, opt?: OptionsObj = {}) => Promise\<ResponseObj\>)</i></code>: Fetches the last snapshot of an aggregate.

  `OptionsObj` contains the following attributes:

  - <code>maxVersion <i>(?number)</i></code>: To retrieve snapshot below a certain version

  `ResponseObj` contains the following attributes:

  - <code>snapshot <i>(?Aggregate)</i></code>: The snapshot (possibly undefined)

> ⚠️ Snapshot methods are a work in progress. Don't use them in production yet!

- <code>listSnapshots <i>((aggregateId: string, opt?: OptionsObj = {}) => Promise\<ResponseObj\>)</i></code>: Fetches all snapshots of an aggregate.

  `OptionsObj` contains the following attributes:

  - <code>minVersion <i>(?number)</i></code>: To retrieve snapshots above a certain version
  - <code>maxVersion <i>(?number)</i></code>: To retrieve snapshots below a certain version
  - <code>limit <i>(?number)</i></code>: Maximum number of snapshots to retrieve
  - <code>reverse <i>(?boolean = false)</i></code>: To retrieve snapshots in reverse order (does not require to swap `minVersion` and `maxVersion`)

  `ResponseObj` contains the following attributes:

  - <code>snapshots <i>(Aggregate[])</i></code>: The list of snapshots (possibly empty)

> ⚠️ Snapshot methods are a work in progress. Don't use them in production yet!
