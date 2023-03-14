<p align="center">
    <img src="assets/logo.svg" height="128">
    <h1 style="border-bottom:none;font-size:60px;margin-bottom:0;" align="center" >Castore</h1>
</p>
<p align="center">
  <a aria-label="NPM version" href="https://www.npmjs.com/package/@castore/core">
    <img alt="" src="https://img.shields.io/npm/v/@castore/core?color=935e0e&style=for-the-badge">
  </a>
  <a aria-label="License" href="https://github.com/castore-dev/castore/blob/main/LICENSE">
    <img alt="" src="https://img.shields.io/github/license/castore-dev/castore?color=%23F8A11C&style=for-the-badge">
  </a>
    <img alt="" src=https://img.shields.io/npm/dt/@castore/core?color=%23B7612E&style=for-the-badge>
    <br/>
    <br/>
</p>

# Making Event Sourcing easy 😎

[Event Sourcing](https://learn.microsoft.com/en-us/azure/architecture/patterns/event-sourcing) is a data storage paradigm that saves **changes in your application state** rather than the state itself.

It is powerful as it enables **rewinding to a previous state** and **exploring audit trails** for debugging or business/legal purposes. It also integrates very well with [event-driven architectures](https://en.wikipedia.org/wiki/Event-driven_architecture).

However, it is **tricky to implement** 😅

<!-- TODO: SCHEMA OF EVENT SOURCING -->

After years of using it at [Kumo](https://dev.to/kumo), we have grown to love it, but also experienced first-hand the lack of consensus and tooling around it. That's where Castore comes from!

---

<p align="center">
  Castore is a TypeScript library that <b>makes Event Sourcing easy</b> 😎
</p>

---

With Castore, you'll be able to:

- Define your [event stores](#--eventstore)
- Fetch and push new [events](#--events) seamlessly
- Implement and test your [commands](#--command)
- ...and much more!

All that with first-class developer experience and minimal boilerplate ✨

## 🫀 Core Design

Some important decisions that we've made early on:

### 💭 **Abstractions first**

Castore has been designed with **flexibility** in mind. It gives you abstractions that are meant to be used **anywhere**: React apps, containers, Lambdas... you name it!

For instance, `EventStore` classes are **stack agnostic**: They need an `EventStorageAdapter` class to interact with actual data. You can code your own `EventStorageAdapter` (simply implement the interface), but it's much simpler to use an off-the-shelf adapter like [`DynamoDBEventStorageAdapter`](./packages/dynamodb-event-storage-adapter/README.md).

### 🙅‍♂️ **We do NOT deploy resources**

While some packages like `DynamoDBEventStorageAdapter` require compatible infrastructure, Castore is not responsible for deploying it.

Though that is not something we exclude in the future, we are a small team and decided to focus on DevX first.

### ⛑ **Full type safety**

Speaking of DevX, we absolutely love TypeScript! If you do too, you're in the right place: We push type-safety to the limit in everything we do!

If you don't, that's fine 👍 Castore is still available in Node/JS. And you can still profit from some nice JSDocs!

### 📖 **Best practices**

The Event Sourcing journey has many hidden pitfalls. We ran into them for you!

Castore is opiniated. It comes with a collection of best practices and documented anti-patterns that we hope will help you out!

## Table of content

- [🎬 Getting Started](#-getting-started)
  - [Installation](#--installation)
  - [Packages structure](#--packages-structure)
- [🚀 The Basics](#-the-basics)
  - [Events](#--events)
  - [Event Types](#--eventtype)
  - [Aggregates](#--aggregate)
  - [Reducers](#--reducer)
  - [Event Store](#--eventstore)
  - [Event Storage Adapter](#---eventstorageadapter)
  - [Command](#--command)
- [💪 Advanced Usage](#-advanced-usage)
  - [Event-driven architecture](#--event-driven-architecture)
  - [Message queues](#--messagequeue)
  - [Message queue adapters](#--messagequeueadapter)
  - [Message buses](#--messagebus)
  - [Message bus adapters](#--messagebusadapter)
  - [Snapshotting](#--snapshotting)
  - [Read Models](#--read-models)
- [📖 Resources](#-resources)
  - [Test Tools](#--test-tools)
  - [React Visualizer](#--react-visualizer)
  - [Packages List](#--packages-list)
  - [Common Patterns](#--common-patterns)

## 🎬 Getting Started

### - Installation

```bash
# npm
npm install @castore/core

# yarn
yarn add @castore/core
```

### - Packages structure

Castore is not a single package, but a **collection of packages** revolving around a `core` package. This is made so every line of code added to your project is _opt-in_, wether you use tree-shaking or not.

Castore packages are **released together**. Though different versions may be compatible, you are **guaranteed** to have working code as long as you use matching versions.

Here is an example of working `package.json`:

```js
{
  ...
  "dependencies": {
    "@castore/core": "1.3.1",
    "@castore/dynamodb-event-storage-adapter": "1.3.1"
    ...
  },
  "devDependencies": {
    "@castore/test-tools": "1.3.1"
    ...
  }
}
```

## 🚀 The Basics

### - `Events`

Event Sourcing is all about **saving changes in your application state**. Such changes are represented by **events**, and needless to say, they are quite important 🙃

Events that concern the same business entity (like a `User`) are aggregated through a common id called `aggregateId` (and vice versa, events that have the same `aggregateId` represent changes of the same business entity). The index of an event in such a serie of events is called its `version`.

In Castore, stored events (also called **event details**) always have exactly the following properties:

- <code>aggregateId <i>(string)</i></code>
- <code>version <i>(integer ≥ 1)</i></code>
- <code>timestamp <i>(string)</i></code>: A date in ISO 8601 format
- <code>type <i>(string)</i></code>: A string identifying the business meaning of the event
- <code>payload <i>(?any = never)</i></code>: A payload of any type
- <code>metadata <i>(?any = never)</i></code>: Some metadata of any type

```ts
import type { EventDetail } from '@castore/core';

type UserCreatedEventDetail = EventDetail<
  'USER_CREATED',
  { name: string; age: number },
  { invitedBy?: string }
>;

// 👇 Equivalent to:
type UserCreatedEventDetail = {
  aggregateId: string;
  version: number;
  timestamp: string;
  type: 'USER_CREATED';
  payload: { name: string; age: number };
  metadata: { invitedBy?: string };
};
```

### - `EventType`

Events are generally classified in **events types** (not to confuse with TS types). Castore lets you declare them via the `EventType` class:

```ts
import { EventType } from '@castore/core';

const userCreatedEventType = new EventType<
  'USER_CREATED',
  { name: string; age: number },
  { invitedBy?: string }
>({ type: 'USER_CREATED' });
```

Note that we only provided TS types for `payload` and `metadata` properties. That is because, as stated in the [core design](#-core-design), **Castore is meant to be as flexible as possible**, and that includes the validation library you want to use: The `EventType` class is not meant to be used directly, but rather implemented by other classes which will add run-time validation methods to it 👍

See the following packages for examples:

- [JSON Schema Event Type](./packages/json-schema-event/README.md)
- [Zod Event Type](./packages/zod-event/README.md)

> <details>
> <summary><b>🔧 Technical description</b></summary>
> <p></p>
>
> **Constructor:**
>
> - <code>type <i>(string)</i></code>: The event type
>
> ```ts
> import { EventType } from '@castore/core';
>
> const userCreatedEventType = new EventType({ type: 'USER_CREATED' });
> ```
>
> **Properties:**
>
> - <code>type <i>(string)</i></code>: The event type
>
> ```ts
> const eventType = userCreatedEventType.type;
> // => 'USER_CREATED'
> ```
>
> **Type Helpers:**
>
> - <code>EventTypeDetail</code>: Returns the event detail TS type of an `EventType`
>
> ```ts
> import type { EventTypeDetail } from '@castore/core';
>
> type UserCreatedEventTypeDetail = EventTypeDetail<typeof userCreatedEventType>;
>
> // 👇 Equivalent to:
> type UserCreatedEventTypeDetail = {
>   aggregateId: string;
>   version: number;
>   timestamp: string;
>   type: 'USER_CREATED';
>   payload: { name: string; age: number };
>   metadata: { invitedBy?: string };
> };
> ```
>
> - <code>EventTypesDetails</code>: Return the events details of a list of `EventType`
>
> ```ts
> import type { EventTypesDetails } from '@castore/core';
>
> type UserEventTypesDetails = EventTypesDetails<
>   [typeof userCreatedEventType, typeof userRemovedEventType]
> >;
> // => EventTypeDetail<typeof userCreatedEventType>
> // | EventTypeDetail<typeof userRemovedEventType>
> ```
>
> </details>

### - `Aggregate`

Eventhough entities are stored as series of events, we still want to use a **stable interface to represent their states at a point in time** rather than directly using events. In Castore, it is implemented by a TS type called `Aggregate`.

> ☝️ Think of aggregates as _"what the data would look like in CRUD"_

In Castore, aggregates necessarily contain an `aggregateId` and `version` properties (the `version` of the latest `event`). But for the rest, it's up to you 🤷‍♂️

For instance, we can include a `name`, `age` and `status` properties to our `UserAggregate`:

```ts
import type { Aggregate } from '@castore/core';

// Represents a User at a point in time
interface UserAggregate extends Aggregate {
  name: string;
  age: number;
  status: 'CREATED' | 'REMOVED';
}

// 👇 Equivalent to:
interface UserAggregate {
  aggregateId: string;
  version: number;
  name: string;
  age: number;
  status: 'CREATED' | 'REMOVED';
}
```

### - `Reducer`

Aggregates are derived from their events by [reducing them](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce) through a `reducer` function. It defines **how to update the aggregate when a new event is pushed**:

<!-- TODO: SCHEMA OF EVENTS AGGREGATE -->

```ts
import type { Reducer } from '@castore/core';

const usersReducer: Reducer<UserAggregate, UserEventDetails> = (
  userAggregate,
  newEvent,
) => {
  const { version, aggregateId } = newEvent;

  switch (newEvent.type) {
    case 'USER_CREATED': {
      const { name, age } = newEvent.payload;

      // 👇 Return the next version of the aggregate
      return {
        aggregateId,
        version,
        name,
        age,
        status: 'CREATED',
      };
    }
    case 'USER_REMOVED':
      return { ...userAggregate, version, status: 'REMOVED' };
  }
};

const johnDowAggregate: UserAggregate = johnDowEvents.reduce(usersReducer);
```

> ☝️ Aggregates are always **computed on the fly**, and NOT stored. Changing them does not require any data migration whatsoever.

### - `EventStore`

Once you've defined your [event types](#--eventtype) and how to [aggregate](#--reducer) them, you can bundle them together in an `EventStore` class.

Each event store in your application represents a business entity. Think of event stores as _"what tables would be in CRUD"_, except that instead of directly updating data, you just append new events to it!

In Castore, `EventStore` classes are NOT responsible for actually storing data (this will come with [event storage adapters](#--eventstorageadapter)). But rather to provide a boilerplate-free and type-safe interface to perform many actions such as:

- Listing aggregate ids
- Accessing events of an aggregate
- Building an aggregate with the reducer
- Pushing new events etc...

```ts
import { EventStore } from '@castore/core';

const userEventStore = new EventStore({
  eventStoreId: 'USERS',
  eventStoreEvents: [
    userCreatedEventType,
    userRemovedEventType,
    ...
  ],
  reduce: usersReducer,
});
// ...and that's it 🥳
```

> ☝️ The `EventStore` class is the heart of Castore, it even gave it its name!

> <details>
> <summary><b>🔧 Technical description</b></summary>
> <p></p>
>
> **Constructor:**
>
> - <code>eventStoreId <i>(string)</i></code>: A string identifying the event store
> - <code>eventStoreEvents <i>(EventType[])</i></code>: The list of event types in the event store
> - <code>reduce <i>(EventType[])</i></code>: A [reducer function](#--reducer) that can be applied to the store event types
> - <code>storageAdapter <i>(?EventStorageAdapter)</i></code>: See [`EventStorageAdapter`](#--eventstorageadapter)
>
> ☝️ The return type of the `reducer` is used to infer the `Aggregate` type of the `EventStore`, so it is important to type it explicitely.
>
> **Properties:**
>
> - <code>eventStoreId <i>(string)</i></code>
>
> ```ts
> const userEventStoreId = userEventStore.eventStoreId;
> // => 'USERS'
> ```
>
> - <code>eventStoreEvents <i>(EventType[])</i></code>
>
> ```ts
> const userEventStoreEvents = userEventStore.eventStoreEvents;
> // => [userCreatedEventType, userRemovedEventType...]
> ```
>
> - <code>reduce <i>((Aggregate, EventType) => Aggregate)</i></code>
>
> ```ts
> const reducer = userEventStore.reduce;
> // => usersReducer
> ```
>
> - <code>storageAdapter <i>?EventStorageAdapter</i></code>: See [`EventStorageAdapter`](#--eventstorageadapter)
>
> ```ts
> const storageAdapter = userEventStore.storageAdapter;
> // => undefined (we did not provide one in this example)
> ```
>
> ☝️ The `storageAdapter` is not read-only so you do not have to provide it right away.
>
> **Sync Methods:**
>
> - <code>getStorageAdapter <i>(() => EventStorageAdapter)</i></code>: Returns the event store event storage adapter if it exists. Throws an `UndefinedStorageAdapterError` if it doesn't.
>
> ```ts
> import { UndefinedStorageAdapterError } from '@castore/core';
>
> expect(() => userEventStore.getStorageAdapter()).toThrow(
>   new UndefinedStorageAdapterError({ eventStoreId: 'USERS' }),
> );
> // => true
> ```
>
> - <code>buildAggregate <i>((eventDetails: EventDetail[], initialAggregate?: Aggregate) => Aggregate | undefined)</i></code>: Applies the event store reducer to a serie of events.
>
> ```ts
> const johnDowAggregate = userEventStore.buildAggregate(johnDowEvents);
> ```
>
> **Async Methods:**
>
> The following methods interact with the data layer of your event store through its [`EventStorageAdapter`](#--eventstorageadapter). They will throw an `UndefinedStorageAdapterError` if you did not provide one.
>
> - <code>getEvents <i>((aggregateId: string, opt?: OptionsObj = {}) => Promise\<ResponseObj\>)</i></code>: Retrieves the events of an aggregate, ordered by `version`. Returns an empty array if no event is found for this `aggregateId`.
>
>   `OptionsObj` contains the following properties:
>
>   - <code>minVersion <i>(?number)</i></code>: To retrieve events above a certain version
>   - <code>maxVersion <i>(?number)</i></code>: To retrieve events below a certain version
>   - <code>limit <i>(?number)</i></code>: Maximum number of events to retrieve
>   - <code>reverse <i>(?boolean = false)</i></code>: To retrieve events in reverse order (does not require to swap `minVersion` and `maxVersion`)
>
>   `ResponseObj` contains the following properties:
>
>   - <code>events <i>(EventDetail[])</i></code>: The aggregate events (possibly empty)
>
> ```ts
> const { events: allEvents } = await userEventStore.getEvents(aggregateId);
> // => typed as UserEventDetail[] 🙌
>
> // 👇 Retrieve a range of events
> const { events: rangedEvents } = await userEventStore.getEvents(aggregateId, {
>   minVersion: 2,
>   maxVersion: 5,
> });
>
> // 👇 Retrieve the last event of the aggregate
> const { events: onlyLastEvent } = await userEventStore.getEvents(
>   aggregateId,
>   {
>     reverse: true,
>     limit: 1,
>   },
> );
> ```
>
> - <code>getAggregate <i>((aggregateId: string, opt?: OptionsObj = {}) => Promise\<ResponseObj\>)</i></code>: Retrieves the events of an aggregate and build it.
>
>   `OptionsObj` contains the following properties:
>
>   - <code>maxVersion <i>(?number)</i></code>: To retrieve aggregate below a certain version
>
>   `ResponseObj` contains the following properties:
>
>   - <code>aggregate <i>(?Aggregate)</i></code>: The aggregate (possibly `undefined`)
>   - <code>events <i>(EventDetail[])</i></code>: The aggregate events (possibly empty)
>   - <code>lastEvent <i>(?EventDetail)</i></code>: The last event (possibly `undefined`)
>
> ```ts
> const { aggregate: johnDow } = await userEventStore.getAggregate(aggregateId);
> // => typed as UserAggregate | undefined 🙌
>
> // 👇 Retrieve an aggregate below a certain version
> const { aggregate: aggregateBelowVersion } =
>   await userEventStore.getAggregate(aggregateId, { maxVersion: 5 });
>
> // 👇 Returns the events if you need them
> const { aggregate, events } = await userEventStore.getAggregate(aggregateId);
> ```
>
> - <code>getExistingAggregate <i>((aggregateId: string, opt?: OptionsObj = {}) => Promise\<ResponseObj\>)</i></code>: Same as `getAggregate` method, but ensures that the aggregate exists. Throws an `AggregateNotFoundError` if no event is found for this `aggregateId`.
>
> ```ts
> import { AggregateNotFoundError } from '@castore/core';
>
> expect(async () =>
>   userEventStore.getExistingAggregate(unexistingId),
> ).resolves.toThrow(
>   new AggregateNotFoundError({
>     eventStoreId: 'USERS',
>     aggregateId: unexistingId,
>   }),
> );
> // true
>
> const { aggregate } = await userEventStore.getAggregate(aggregateId);
> // => 'aggregate' and 'lastEvent' are always defined 🙌
> ```
>
> - <code>pushEvent <i>((eventDetail: EventDetail) => Promise\<ResponseObj\>)</i></code>: Pushes a new event to the event store, with the timestamp automatically set as `new Date().toISOString()`. Throws an `EventAlreadyExistsError` if an event already exists for the corresponding `aggregateId` and `version`.
>
>   `ResponseObj` contains the following properties:
>
>   - <code>event <i>(EventDetail)</i></code>: The complete event (including the `timestamp`)
>
> ```ts
> await userEventStore.pushEvent({
>   aggregateId,
>   version: lastVersion + 1,
>   type: 'USER_CREATED', // <= event type is correctly typed 🙌
>   payload, // <= payload is typed according to the provided event type 🙌
>   metadata, // <= same goes for metadata 🙌
>   // timestamp is automatically set
> });
> ```
>
> - <code>listAggregateIds <i>((opt?: OptionsObj = {}) => Promise\<ResponseObj\>)</i></code>: Retrieves the list of `aggregateId` of an event store, ordered by the `timestamp` of their initial event. Returns an empty array if no aggregate is found.
>
>   `OptionsObj` contains the following properties:
>
>   - <code>limit <i>(?number)</i></code>: Maximum number of aggregate ids to retrieve
>   - <code>initialEventAfter <i>(?string)</i></code>: To retrieve aggregate ids that appeared after a certain timestamp
>   - <code>initialEventBefore <i>(?string)</i></code>: To retrieve aggregate ids that appeared before a certain timestamp
>   - <code>reverse <i>(?boolean)</i></code>: To retrieve the aggregate ids in reverse order
>   - <code>pageToken <i>(?string)</i></code>: To retrieve a paginated result of aggregate ids
>
>   `ResponseObj` contains the following properties:
>
>   - <code>aggregateIds <i>(string[])</i></code>: The list of aggregate ids
>   - <code>nextPageToken <i>(?string)</i></code>: A token for the next page of aggregate ids if one exists. The nextPageToken carries the previously used options, so you do not have to provide them again (though you can still do it to override them).
>
> ```ts
> const accAggregateIds: string = [];
> const { aggregateIds: firstPage, nextPageToken } =
>   await userEventStore.listAggregateIds({ limit: 20 });
>
> accAggregateIds.push(...firstPage);
>
> if (nextPageToken) {
>   const { aggregateIds: secondPage } = await userEventStore.listAggregateIds({
>     // 👇 Previous limit of 20 is passed through the page token
>     pageToken: nextPageToken,
>   });
>   accAggregateIds.push(...secondPage);
> }
> ```
>
> **Type Helpers:**
>
> - <code>EventStoreId</code>: Returns the `EventStore` id
>
> ```ts
> import type { EventStoreId } from '@castore/core';
>
> type UserEventStoreId = EventStoreId<typeof userEventStore>;
> // => 'USERS'
> ```
>
> - <code>EventStoreEventsTypes</code>: Returns the `EventStore` list of events types
>
> ```ts
> import type { EventStoreEventsTypes } from '@castore/core';
>
> type UserEventsTypes = EventStoreEventsTypes<typeof userEventStore>;
> // => [typeof userCreatedEventType, typeof userRemovedEventType...]
> ```
>
> - <code>EventStoreEventsDetails</code>: Returns the union of all the `EventStore` possible events details
>
> ```ts
> import type { EventStoreEventsDetails } from '@castore/core';
>
> type UserEventDetails = EventStoreEventsDetails<typeof userEventStore>;
> // => EventTypeDetail<typeof userCreatedEventType>
> // | EventTypeDetail<typeof userRemovedEventType>
> // | ...
> ```
>
> - <code>EventStoreReducer</code>: Returns the `EventStore` reducer
>
> ```ts
> import type { EventStoreReducer } from '@castore/core';
>
> type UserReducer = EventStoreReducer<typeof userEventStore>;
> // => Reducer<UserAggregate, UserEventDetails>
> ```
>
> - <code>EventStoreAggregate</code>: Returns the `EventStore` aggregate
>
> ```ts
> import type { EventStoreAggregate } from '@castore/core';
>
> type UserReducer = EventStoreAggregate<typeof userEventStore>;
> // => UserAggregate
> ```
>
> </details>

### - `EventStorageAdapter`

For the moment, we didn't provide any actual way to store our events data. This is the responsibility of the `EventStorageAdapter` class.

```ts
import { EventStore } from '@castore/core';

const userEventStore = new EventStore({
  eventStoreId: 'USERS',
  eventTypes: userEventTypes,
  reducer: usersReducer,
  // 👇 Provide it in the constructor
  storageAdapter: mySuperStorageAdapter,
});

// 👇 ...or set/switch it in context later
userEventStore.storageAdapter = mySuperStorageAdapter;
```

You can choose to [build an event storage adapter](./docs/building-your-own-event-storage-adapter.md) that suits your usage. However, we highly recommend using an off-the-shelf adapter:

- [DynamoDB Event Storage Adapter](./packages/dynamodb-event-storage-adapter/README.md)
- [Redux Event Storage Adapter](./packages/redux-event-storage-adapter/README.md)
- [In-Memory Event Storage Adapter](./packages/inmemory-event-storage-adapter/README.md)

If the storage solution that you use is missing, feel free to create/upvote an issue, or contribute 🤗

### - `Command`

Modifying the state of your application (i.e. pushing new events to your event stores) is done by executing **commands**. They typically consist in:

- Fetching the required aggregates (if not the initial event of a new aggregate)
- Validating that the modification is acceptable
- Pushing new events with incremented versions

<!-- TODO, add schema -->

```ts
import { Command, tuple } from '@castore/core';

type Input = { name: string; age: number };
type Output = { userId: string };
type Context = { generateUuid: () => string };

const createUserCommand = new Command({
  commandId: 'CREATE_USER',
  // 👇 "tuple" is needed to keep ordering in inferred type
  requiredEventStores: tuple(userEventStore, otherEventStore),
  // 👇 Code to execute
  handler: async (
    commandInput: Input,
    [userEventStore, otherEventStore],
    // 👇 Additional context arguments can be provided
    { generateUuid }: Context,
  ): Promise<Output> => {
    const { name, age } = commandInput;
    const userId = generateUuid();

    await userEventStore.pushEvent({
      aggregateId: userId,
      version: 1,
      type: 'USER_CREATED',
      payload: { name, age },
    });

    return { userId };
  },
});
```

Note that we only provided TS types for `Input` and `Output` properties. That is because, as stated in the [core design](#-core-design), **Castore is meant to be as flexible as possible**, and that includes the validation library you want to use: The `Command` class is not meant to be used directly, but rather extended by other classes which will add run-time validation methods to it 👍

See the following packages for examples:

- [JSON Schema Event Type](./packages/json-schema-command/README.md)

> <details>
> <summary><b>🔧 Technical description</b></summary>
> <p></p>
>
> **Constructor:**
>
> - <code>commandId <i>(string)</i></code>: A string identifying the command
> - <code>handler <i>((input: Input, requiredEventsStores: EventStore[]) => Promise\<Output\>)</i></code>: The code to execute
> - <code>requiredEventStores <i>(EventStore[])</i></code>: A tuple of `EventStores` that are required by the command for read/write purposes. In TS, you should use the `tuple` util to preserve tuple ordering in the handler (`tuple` doesn't mute its input, it simply returns them)
> - <code>eventAlreadyExistsRetries <i>(?number = 2)</i></code>: Number of handler execution retries before breaking out of the retry loop (See section below on race conditions)
> - <code>onEventAlreadyExists <i>(?(error: EventAlreadyExistsError, context: ContextObj) => Promise\<void\>)</i></code>: Optional callback to execute when an `EventAlreadyExistsError` is raised.
>
>   The `EventAlreadyExistsError` class contains the following properties:
>
>   - <code>eventStoreId <i>(?string)</i></code>: The `eventStoreId` of the aggregate on which the `pushEvent` attempt failed
>   - <code>aggregateId <i>(string)</i></code>: The `aggregateId` of the aggregate
>   - <code>version <i>(number)</i></code>: The `version` of the aggregate
>
>   The `ContextObj` contains the following properties:
>
>   - <code>attemptNumber <i>(?number)</i></code>: The number of handler execution attempts in the retry loop
>   - <code>retriesLeft <i>(?number)</i></code>: The number of retries left before breaking out of the retry loop
>
> ```ts
> import { Command, tuple } from '@castore/core';
>
> const doSomethingCommand = new Command({
>   commandId: 'DO_SOMETHING',
>   requiredEventStores: tuple(eventStore1, eventStore2),
>   handler: async (commandInput, [eventStore1, eventStore2]) => {
>     // ...do something here
>   },
> });
> ```
>
> **Properties:**
>
> - <code>commandId <i>(string)</i></code>: The command id
>
> ```ts
> const commandId = doSomethingCommand.commandId;
> // => 'DO_SOMETHING'
> ```
>
> - <code>requiredEventStores <i>(EventStore[])</i></code>: The required event stores
>
> ```ts
> const requiredEventStores = doSomethingCommand.requiredEventStores;
> // => [eventStore1, eventStore2]
> ```
>
> - <code>handler <i>((input: Input, requiredEventsStores: EventStore[]) => Promise\<Output\>)</i></code>: Function to invoke the command
>
> ```ts
> const output = await doSomethingCommand.handler(input, [
>   eventStore1,
>   eventStore2,
> ]);
> ```
>
> </details>

A few notes on commands handlers:

- `Commands` handlers should NOT use [read models](#--read-models) when validating that a modification is acceptable. Read models are like cache: They are not the source of truth, and may not represent the freshest state.

- Fetching and pushing events non-simultaneously exposes your application to [race conditions](https://en.wikipedia.org/wiki/Race_condition). To counter that, commands are designed to be retried when an `EventAlreadyExistsError` is triggered (which is part of the `EventStorageAdapter` interface).

<!-- TODO, add schema -->

- Command handlers should be, as much as possible, [pure functions](https://en.wikipedia.org/wiki/Pure_function). If it depends on impure functions like functions with unpredictable outputs (like id generation), mutating effects, side effects or state dependency (like external data fetching), you should pass them through the additional context arguments rather than directly importing and using them. This will make them easier to test and to re-use in different contexts, such as in the [React Visualizer](./packages/react-visualizer/README.md).

- Finally, when writing on several event stores at once, it is important to make sure that **all events are written or none**, i.e. use transactions: This ensures that the application is not in a corrupt state. Transactions accross event stores cannot be easily abstracted, so check you adapter library on how to achieve this. For instance, the [`DynamoDBEventStorageAdapter`](./packages/dynamodb-event-storage-adapter/README.md) exposes a [`pushEventsTransaction`](./packages/dynamodb-event-storage-adapter/src/utils/pushEventsTransaction.ts) util.

## 💪 Advanced usage

### - Event-driven architecture

Event Sourcing integrates very well with [event-driven architectures](https://en.wikipedia.org/wiki/Event-driven_architecture). In a traditional architecture, you would need design your system events (or **messages** for clarity) separately from your data. With Event Sourcing, they can simply **broadcast the business events you already designed**.

There are two kinds of messages:

- **Notification messages** which only carry events details
- **State-carrying messages** which also carry their corresponding aggregates

In Castore, they are implemented by the `NotificationMessage` and `StateCarryingMessage` TS types:

```ts
// NotificationMessage
import type {
  NotificationMessage,
  EventStoreNotificationMessage,
} from '@castore/core';

type UserEventNotificationMessage = NotificationMessage<
  'USER',
  UserEventDetails
>;

// 👇 Equivalent to:
type UserEventNotificationMessage = {
  eventStoreId: 'USER';
  event: UserEventDetails;
};

// 👇 Also equivalent to:
type UserEventNotificationMessage = EventStoreNotificationMessage<
  typeof userEventStore
>;

// StateCarryingMessage
import type {
  StateCarryingMessage,
  EventStoreStateCarryingMessage,
} from '@castore/core';

type UserEventStateCarryingMessage = StateCarryingMessage<
  'USER',
  UserEventDetails,
  UserAggregate
>;

// 👇 Equivalent to:
type UserEventStateCarryingMessage = {
  eventStoreId: 'USER';
  event: UserEventDetails;
  aggregate: UserAggregate
};

// 👇 Also equivalent to:
type UserEventStateCarryingMessage = EventStoreStateCarryingMessage<
  typeof userEventStore
>;
```

Both kinds of messages can be published to [Message Queues](#--messagequeue) or [Message Buses](#--messagebus).

### - `MessageQueue`

[Message Queues](https://en.wikipedia.org/wiki/Message_queue) store the published messages until they are handled by a **worker**. The worker is unique and predictible. It consumes all messages indifferently of their content.

<!-- TODO: SCHEMA OF MESSAGE QUEUES -->

You can use the `NotificationMessageQueue` or the `StateCarryingMessageQueue` classes to implement message queues:

```ts
import { NotificationMessageQueue } from '@castore/core';

const appMessageQueue = new NotificationMessageQueue({
  messageQueueId: 'APP_MESSAGE_QUEUE',
  sourceEventStores: [userEventStore, counterEventStore...],
});

await appMessageQueue.publishMessage({
  // 👇 Typed as NotificationMessage of one of the source event stores
  eventStoreId: 'USERS',
  event: {
    type: 'USER_CREATED',
    ...
  }
})

// Same usage for StateCarryingMessageQueues
```

> <details>
> <summary><b>🔧 Technical description</b></summary>
> <p></p>
>
> **Constructor:**
>
> - <code>messageQueueId <i>(string)</i></code>: A string identifying the message queue
> - <code>sourceEventStores <i>(EventStore[])</i></code>: List of event stores that the message queue will broadcast events from
> - <code>messageQueueAdapter <i>(?MessageQueueAdapter)</i></code>: See section on [`MessageQueueAdapters`](#--messagequeueadapter)
>
> **Properties:**
>
> - <code>messageQueueId <i>(string)</i></code>
>
> ```ts
> const appMessageQueueId = appMessageQueue.messageQueueId;
> // => 'APP_MESSAGE_QUEUE'
> ```
>
> - <code>sourceEventStores <i>(EventStore[])</i></code>
>
> ```ts
> const appMessageQueueSourceEventStores = appMessageQueue.sourceEventStores;
> // => [userEventStore, counterEventStore...]
> ```
>
> - <code>messageQueueAdapter <i>?MessageQueueAdapter</i></code>: See section on [`MessageQueueAdapters`](#--messagequeueadapter)
>
> ```ts
> const appMessageQueueAdapter = appMessageQueue.messageQueueAdapter;
> // => undefined (we did not provide one in this example)
> ```
>
> ☝️ The `messageQueueAdapter` is not read-only so you do not have to provide it right away.
>
> **Async Methods:**
>
> The following methods interact with the messaging solution of your application through a `MessageQueueAdapter`. They will throw an `UndefinedMessageQueueAdapterError` if you did not provide one.
>
> - <code>publishMessage <i>((message: NotificationMessage | StateCarryingMessage) => Promise\<void\>)</i></code>: Publish a `NotificationMessage` (for `NotificationMessageQueues`) or a `StateCarryingMessage` (for `StateCarryingMessageQueues`) to the message queue.
>
> - <code>getAggregateAndPublishMessage <i>((message: NotificationMessage) => Promise\<void\>)</i></code>: _(StateCarryingMessageQueues only)_ Append the matching aggregate (with correct version) to a `NotificationMessage` and turn it into a `StateCarryingMessage` before publishing it to the message queue. Uses the message queue event stores: Make sure that they have correct adapters set up.
>
> **Type Helpers:**
>
> - <code>MessageQueueMessage</code>: Given a `MessageQueue`, returns the TS type of its messages
>
> ```ts
> import type { MessageQueueMessage } from '@castore/core';
>
> type AppMessage = MessageQueueMessage<typeof appMessageQueue>;
>
> // 👇 Equivalent to:
> type AppMessage = EventStoreNotificationMessage<
>   typeof userEventStore | typeof counterEventStore...
> >;
> ```
>
> </details>

### - `MessageQueueAdapter`

Similarly to event stores, `MessageQueue` classes provide a boilerplate-free and type-safe interface to publish messages, but are NOT responsible for actually doing so. This is the responsibility of the `MessageQueueAdapter`, that will connect it to your actual messaging solution:

```ts
import { EventStore } from '@castore/core';

const messageQueue = new NotificationMessageQueue({
  ...
  // 👇 Provide it in the constructor
  messageQueueAdapter: mySuperMessageQueueAdapter,
});

// 👇 ...or set/switch it in context later
messageQueue.messageQueueAdapter = mySuperMessageQueueAdapter;
```

You can code your own `MessageQueueAdapter` (simply implement the interface), but we highly recommend using an off-the-shelf adapter:

- [SQS Message Queue Adapter](./packages/sqs-message-queue-adapter/README.md)
- [In-Memory Message Queue Adapter](./packages/in-memory-message-queue-adapter/README.md)

If the messaging solution that you use is missing, feel free to create/upvote an issue, or contribute 🤗

The adapter packages will also expose useful generics to type the arguments of your queue worker. For instance:

```ts
import type {
  SQSMessageQueueMessage,
  SQSMessageQueueMessageBody,
} from '@castore/sqs-message-queue-adapter';

const appMessagesWorker = async ({ Records }: SQSMessageQueueMessage) => {
  Records.forEach(({ body }) => {
    // 👇 Correctly typed!
    const recordBody: SQSMessageQueueMessageBody<typeof appMessageQueue> =
      JSON.parse(body);
  });
};
```

### - `MessageBus`

[Message Buses](https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern) are used to spread messages to multiple **listeners**. Contrary to message queues, they do not store the message or wait for the listeners to respond. Often, **filter patterns** can also be used to trigger listeners or not based on the message content.

<!-- TODO: SCHEMA OF MESSAGE BUSES -->

You can use the `NotificationMessageBus` or the `StateCarryingMessageBus` classes to implement message buses:

```ts
import { NotificationMessageBus } from '@castore/core';

const appMessageBus = new NotificationMessageBus({
  messageBusId: 'APP_MESSAGE_BUSES',
  sourceEventStores: [userEventStore, counterEventStore...],
});

await appMessageBus.publishMessage({
  // 👇 Typed as NotificationMessage of one of the source event stores
  eventStoreId: 'USERS',
  event: {
    type: 'USER_CREATED',
    ...
  }
})

// Same usage for StateCarryingMessageBus
```

> <details>
> <summary><b>🔧 Technical description</b></summary>
> <p></p>
>
> **Constructor:**
>
> - <code>messageBusId <i>(string)</i></code>: A string identifying the message bus
> - <code>sourceEventStores <i>(EventStore[])</i></code>: List of event stores that the message bus will broadcast events from
> - <code>messageBusAdapter <i>(?MessageBusAdapter)</i></code>: See section on [`MessageBusAdapters`](#--messagebusadapter)
>
> **Properties:**
>
> - <code>messageBusId <i>(string)</i></code>
>
> ```ts
> const appMessageBusId = appMessageBus.messageBusId;
> // => 'APP_MESSAGE_BUS'
> ```
>
> - <code>sourceEventStores <i>(EventStore[])</i></code>
>
> ```ts
> const appMessageBusSourceEventStores = appMessageBus.sourceEventStores;
> // => [userEventStore, counterEventStore...]
> ```
>
> - <code>messageBusAdapter <i>?MessageBusAdapter</i></code>: See section on [`MessageBusAdapters`](#--messagebusadapter)
>
> ```ts
> const appMessageBusAdapter = appMessageBus.messageBusAdapter;
> // => undefined (we did not provide one in this example)
> ```
>
> ☝️ The `messageBusAdapter` is not read-only so you do not have to provide it right away.
>
> **Async Methods:**
>
> The following methods interact with the messaging solution of your application through a `MessageBusAdapter`. They will throw an `UndefinedMessageBusAdapterError` if you did not provide one.
>
> - <code>publishMessage <i>((message: NotificationMessage | StateCarryingMessage) => Promise\<void\>)</i></code>: Publish a `NotificationMessage` (for `NotificationMessageBuses`) or a `StateCarryingMessage` (for `StateCarryingMessageBuses`) to the message bus.
>
> - <code>getAggregateAndPublishMessage <i>((message: NotificationMessage) => Promise\<void\>)</i></code>: _(StateCarryingMessageBuses only)_ Append the matching aggregate (with correct version) to a `NotificationMessage` and turn it into a `StateCarryingMessage` before publishing it to the message bus. Uses the message bus event stores: Make sure that they have correct adapters set up.
>
> **Type Helpers:**
>
> - <code>MessageBusMessage</code>: Given a `MessageBus`, returns the TS type of its messages
>
> ```ts
> import type { MessageBusMessage } from '@castore/core';
>
> type AppMessage = MessageBusMessage<typeof appMessageBus>;
>
> // 👇 Equivalent to:
> type AppMessage = EventStoreNotificationMessage<
>   typeof userEventStore | typeof counterEventStore...
> >;
> ```
>
> </details>

### - `MessageBusAdapter`

Similarly to event stores, `MessageBus` classes provide a boilerplate-free and type-safe interface to publish messages, but are NOT responsible for actually doing so. This is the responsibility of the `MessageBusAdapter`, that will connect it to your actual messaging solution:

```ts
import { EventStore } from '@castore/core';

const messageBus = new NotificationMessageBus({
  ...
  // 👇 Provide it in the constructor
  messageBusAdapter: mySuperMessageBusAdapter,
});

// 👇 ...or set/switch it in context later
messageBus.messageBusAdapter = mySuperMessageBusAdapter;
```

You can code your own `MessageBusAdapter` (simply implement the interface), but we highly recommend using an off-the-shelf adapter:

- [EventBridge Message Bus Adapter](./packages/event-bridge-message-bus-adapter/README.md)
- [In-Memory Message Bus Adapter](./packages/in-memory-message-bus-adapter/README.md)

If the messaging solution that you use is missing, feel free to create/upvote an issue, or contribute 🤗

The adapter packages will also expose useful generics to type the arguments of your bus listeners. For instance:

```ts
import type { EventBridgeMessageBusMessage } from '@castore/event-bridge-message-bus-adapter';

const userMessagesListener = async (
  // 👇 Specify that you only listen to the userEventStore messages
  eventBridgeMessage: EventBridgeMessageBusMessage<
    typeof appMessageQueue,
    'USERS'
  >,
) => {
  // 👇 Correctly typed!
  const message = eventBridgeMessage.detail;
};
```

### - Snapshotting

As events pile up in your event stores, the performances and costs of your commands can become an issue.

One solution is to periodially persist **snapshots** of your aggregates (e.g. through a message bus listener), and only fetch them plus the subsequent events instead of all the events.

Snapshots are not implemented in Castore yet, but we have big plans for them, so stay tuned 🙂

### - Read Models

Even with snapshots, using the event store for querying needs (like displaying data in a web page) would be slow and inefficient, if not impossible depending on the access pattern.

In Event Sourcing, it is common to use a special type of message bus listener called **projections**, responsible for maintaining data specifically designed for querying needs, called **read models**.

Read models allow for faster read operations, as well as re-indexing. Keep in mind that they are [eventually consistent](https://en.wikipedia.org/wiki/Eventual_consistency) by design, which can be annoying in some use cases (like opening a resource page directly after its creation).

Read models are not implemented in Castore yet, but we have big plans for them, so stay tuned 🙂

## 📖 Resources

### - Test Tools

Castore comes with a handy [Test Tool package](./packages/test-tools/README.md) that facilitates the writing of unit tests: It allows mocking event stores, populating them with an initial state and resetting them to it in a boilerplate-free and type-safe way.

### - React Visualizer

Castore also comes with a handy [React Visualizer](./packages/react-visualizer/README.md) library: It exposes a React component to visualize, design and manually test Castore event stores and commands.

### - Packages List

#### Event Types

- [JSON Schema Event Type](./packages/json-schema-event/README.md): DRY `EventType` definition using [JSON Schemas](http://json-schema.org/understanding-json-schema/reference/index.html) and [`json-schema-to-ts`](https://github.com/ThomasAribart/json-schema-to-ts)
- [Zod Event Type](./packages/zod-event/README.md): DRY `EventType` definition using [`zod`](https://github.com/colinhacks/zod)

#### Event Storage Adapters

- [DynamoDB Event Storage Adapter](./packages/dynamodb-event-storage-adapter/README.md): Implementation of the `EventStorageAdapter` interface based on DynamoDB.
- [Redux Event Storage Adapter](./packages/redux-event-storage-adapter/README.md): Implementation of the `EventStorageAdapter` interface based on a Redux store, along with tooling to configure the store and hooks to read from it efficiently.
- [In-Memory Event Storage Adapter](./packages/inmemory-event-storage-adapter/README.md): Implementation of the `EventStorageAdapter` interface using a local Node/JS object. To be used in manual or unit tests.

#### Commands

- [JSON Schema Command](./packages/json-schema-command/README.md): DRY `Command` definition using [JSON Schemas](http://json-schema.org/understanding-json-schema/reference/index.html) and [`json-schema-to-ts`](https://github.com/ThomasAribart/json-schema-to-ts)

#### Message Queue Adapters

- [SQS Message Queue Adapter](./packages/sqs-message-queue-adapter/README.md): Implementation of the `MessageQueueAdapter` interface based on AWS SQS.
- [In-Memory Message Queue Adapter](./packages/in-memory-message-queue-adapter/README.md): Implementation of the `MessageQueueAdapter` interface using a local Node/JS queue. To be used in manual or unit tests.

#### Message Buses Adapters

- [EventBridge Message Bus Adapter](./packages/event-bridge-message-bus-adapter/README.md): Implementation of the `MessageBusAdapter` interface based on AWS EventBridge.
- [In-Memory Message Bus Adapter](./packages/in-memory-message-bus-adapter/README.md): Implementation of the `MessageBusAdapter` interface using a local Node/JS event emitter. To be used in manual or unit tests.

### - Common Patterns

- Simulating a future/past aggregate state: _...coming soon_
- Snapshotting: _...coming soon_
- Projecting on read models: _...coming soon_
- Replaying events: _...coming soon_
- Migrating events: _...coming soon_
