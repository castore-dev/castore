<p align="center">
    <img src="assets/logo.svg" height="128">
    <h1 style="border-bottom:none;font-size:60px;margin-bottom:0;" align="center" >Castore 🦫</h1>
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

# 😎 Making Event Sourcing in TS look easy

Event Sourcing is a data storage paradigm in which **changes in your application state are saved** rather than the state itself. It is very powerful but also tricky to implement.

After years of using it at [Kumo](https://dev.to/kumo), we have grown to LOVE it, but also experienced first-hand the lack of consensus and tooling around it 😢

That's when Castore emerged!

Castore is a library that **makes Event Sourcing in TypeScript look easy** 😎 It ships many features like defining [event types](#eventtype), registering them in [event stores](#eventstore), defining [commands](#command) and [testing them](#test-tools), snapshoting... and much more! All that with first-class developer experience and minimal boilerplate 🤩

> Castore is still under active development. v1 is released, basic features. We have big plans, so 📣 STAY TUNED 📣

<!-- We also want to enable operations like reactions to events, projections on read models, events replay and migrations. We have big plans, so 📣 STAY TUNED 📣 -->

## 🫀 Core beliefs

🏄‍♂️ **Flexibility**

Castore is meant to be used **in as many contexts as possible**. It **DOES NOT enforce any particular implementation** (storage service, messaging system etc...). You can use Castore in React apps, containers or Lambdas, it's up to you!

For instance, Event Stores provide typed methods for most basic operations like fetching/pushing events or [listing aggregates ids, but they are **stack agnostic**: They only become effective once you add a `EventStorageAdapter` class to them. with real data.

You can code your own `EventStorageAdapter` (it needs to implement the `EventStorageAdapter` interface). But the encouraged way. Some implementations are already shipped in. Just pick yours, or contribute to the lib!

**Castore is NOT a framework**

Though some implementations rely on pre-designed infrastructure, Castore is NOT responsible for deploying it.

Though that is not something we exclude in the future, we are a small team and our first goal is to improving devX in Event Sourcing.

**Full type safety**

TypeScript improves devX and prevents bugs: We love it and know how to get the most of it. If you don't, that's fine, you can still use Castore in JS or Node.

**Best practices**

Guidance. Example patterns. Gained from years of usage. Castore is not only a library, it is also a store of best practices. Rich documentation.

Gained from years of usage. Castore is not only a library, it is also a store of best practices. Rich documentation.

## Table of content

- [📦 Packages structure](#packages-structure)
- [☁️ Installation](#installation)
- [📅 Event Type](#eventtype)
- [🍇 Aggregates](#aggregates)
- [⚙️ Reducers](#reducers)
- [📚 Event Store](#event-store)
- [💾 Event Storage Adapter](#eventstorageadapter)
- [📐 Common Patterns](#common-patterns)

## Packages structure

Castore is not a single package, but a **collection of packages** revolving around a `core` package. This is made so every line of code added to your project is _opt-in_, wether you use tree-shaking or not.

Castore packages are **versioned together**. Though different versions may be compatible, you are **guaranteed** to have working code as long as you use matching versions:

```json
{
  // ...
  "dependencies": {
    "@castore/core": "1.3.1",
    "@castore/dynamodb-event-storage-adapter": "1.3.1"
    // ...
  },
  "devDependencies": {
    "@castore/test-tools": "1.3.1"
    // ...
  }
}
```

## `EventType`

Event Sourcing architecture is all about **saving changes in your application state**. Such changes are represented by **events**, and needless to say, they are quite important 🙃

At their core, events types are defined by:

- An event `type` (string identifying the event meaning)
- _(optional)_ A `payload` (TS) type
- _(optional)_ A `metadata` (TS) type

Castore lets you declare typologies of events via the `EventType` class.

```ts
import { EventType } from '@castore/core';

export const userCreatedEventType = new EventType<
  // 👇 Event type
  'USER_CREATED',
  // 👇 Payload (optional)
  { name: string; age: number },
  // 👇 Metadata (optional)
  { invitedBy?: string }
>({ type: 'USER_CREATED' });
```

When handling `USER_CREATED` events, the data (also called **event details**) will look like this:

```ts
type UserCreatedEventDetail = {
  // 👇 User identifier
  aggregateId: string;
  // 👇 Event index in the serie of events for this user (integer)
  version: number;
  // 👇 Event timestamp in ISO 8601 format
  timestamp: string;
  type: 'USER_CREATED';
  payload: { name: string; age: number };
  metadata: { invitedBy?: string };
};
```

Note that we only used TS types for `payload` and `metadata` properties. That is because **`castore` is meant to be as agnostic as possible of technical preferences**, including the validation library you want to use: The `EventType` class is not meant to be used directly, but rather extended by other classes which will add run-time validation methods to it 👍

**Constructor:**

- <code>type <i>(string)</i></code>: The event type

```ts
import { EventType } from '@castore/core';

export const userCreatedEventType = new EventType({ type: 'USER_CREATED' });
```

**TS Generics:**

- <code>Type <i>(string)</i></code>: The event type
- <code>Payload <i>(?any = never)</i></code>: The event payload (TS) type
- <code>Metadata <i>(?any = never)</i></code>: The event metadata (TS) type

```ts
export const userCreatedEventType = new EventType<
  'USER_CREATED',
  { name: string; age: number },
  { invitedBy?: string }
>({ type: 'USER_CREATED' });
```

Note that if no `Payload` or `Metadata` types are attached to the `EventType`, you don't have to re-provide the `EventType` as a generic type. It will directly be inferred by TypeScript:

```ts
export const userCreatedEventType = new EventType({ type: 'USER_CREATED' });
```

**Properties:**

- <code>type <i>(string)</i>:</code> The event-type

```ts
const eventType = userCreatedEventType.type;
// => "USER_CREATED"
```

**Methods:**

None.

**Helpers:**

- <code>EventTypeDetail</code>: Returns the event detail type of an `EventType`

```ts
import type { EventTypeDetail } from '@castore/core';

type UserCreatedEventTypeDetail = EventTypeDetail<typeof userCreatedEventType>;
// => {
//   aggregateId: string;
//   version: number;
//   timestamp: string;
//   type: 'USER_CREATED';
//   payload: { name: string, age: number };
//   metadata: { addedBy?: string };
// };
```

- <code>EventTypesDetails</code>: Return the events details of a list of `EventType`s

```ts
import type { EventTypesDetails } from '@castore/core';

type UserEventTypesDetails = EventTypesDetails<
  [typeof userCreatedEventType, typeof userRemovedEventType]
>;
// => EventDetail<typeof userCreatedEventType>
// | EventDetail<typeof userRemovedEventType>
```

**Packages:**

- json-schema-event-type
- zod-event-type

### `Aggregate`

Events in your application that concern the same data (like a `User`) are aggregated together through a common id called `aggregateId`. And vice versa: Events thare have the same `aggregateId` represent the same entity. The index of an event in an aggregate is also called its `version`.

However, we still want to use a **interface to represent that data state at time t** rather than directly using events. In Castore, it is implemented by a TS type called `Aggregate`: Think of aggregates as _"what the entity would look like in CRUD"_.

Aggregates necessarily contain an `aggregateId` and `version` properties (the `version` of the latest `event`). But for the rest, it's up to you 🤷‍♂️

For instance, we can add a `name`, `age` and `status` properties to our `UserAggregate`:

```ts
import type { Aggregate } from '@castore/core';

// 👇 Represents a User at time t
interface UserAggregate extends Aggregate {
  name: string;
  age: number;
  status: 'CREATED' | 'REMOVED';
}
// => {
//  aggregateId: string;
//  version: number;
//  name: string;
//  age: number;
//  status: 'CREATED' | 'REMOVED';
// }
```

## `Reducers`

Aggregates are obtained from a serie of events by applying a `reduce` operation with a `reducer` function. It **defines how to update the aggregate when a new event is pushed**:

```ts
import type { Reducer } from '@castore/core';

export const usersReducer: Reducer<UserAggregate, UserEventsDetails> = (
  userAggregate,
  newEvent,
): UserAggregate => {
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

const myUserEvents: UserEventsTypesDetails[] = [
  {
    aggregateId: 'john@dow.com',
    version: 1,
    timestamp: '2022-01-01T00:00:00.000Z',
    type: 'USER_CREATED',
    payload: { name: 'John Dow', age: 30 },
    metadata: { invitedBy: 'dean@jow.com' },
  },
  // ...some other user events details
];

const userAggregate: UserAggregate = userEvents.reduce(usersReducer);
```

> Note that, as long as you don't use snapshoting, aggregates are **computed on the fly**, and NOT stored. Only events come from the data storage layer, changing the way your events are aggregated does NOT require any data migration whatsoever.

<!-- TODO: SCHEMA OF EVENTS AGGREGATE -->

\*This is true as long as you don't use snapshoting. If you do, then updating the reducer requires snapshot invalidation and recomputing if you do.

## `EventStore`

...INCOMING

<!-- The `EventStore` class lets you instantiate an object containing all the methods you will need to interact with your events. 💪

```ts
import { EventStore } from '@castore/core';

const userEventStore = new EventStore({
  eventStoreId: 'USERS',
  // 👇 See #reducer sub-section
  eventTypes: [
    userCreatedEventType,
    userRemovedEventType,
    // ...
  ],
  reducer: usersReducer,
});
```

And that's it! -->

**Constructor:**

**TS Generics:**

**Properties:**

**Methods:**

**Helpers:**

<!-- EventStoreId

```ts
import type { EventStoreId } from '@castore/core';

type UserEventStoreId = EventStoreId<typeof userEventStore>;
// => "USERS"
```

EventStoreEventsTypes

```ts
import type { EventStoreEventsTypes } from '@castore/core';

type UserEventsTypes = EventStoreEventsTypes<typeof userEventStore>;
// => [typeof userCreatedEventTypeType, typeof userRemovedEventTypeType...]
```

EventStoreEventsDetails

```ts
import type { EventStoreEventsDetails } from '@castore/core';

type UserEventsDetails = EventStoreEventsTypes<typeof userEventStore>;
// =>  TODO
```

EventStoreEventsDetails

```ts
import type { EventStoreEventsDetails } from '@castore/core';

type UserEventsDetails = EventStoreEventsTypes<typeof userEventStore>;
``` -->

## `EventStorageAdapter`

...INCOMING

<!-- You can store your events in many different ways. To specify how to store them (in memory, DynamoDB...) Castore implements Storage Adapters.

Adapters offer an interface between the Event Store class and your storage method 💾.

To be able to use your EventStore, you will need to attach a Storage Adapter 🔗.

All the Storage Adapters have the same interface, and you can create your own if you want to implement new storage methods!

So far, castore supports 2 Storage Adapters ✨:

- in-memory
- DynamoDB -->

## `Command`

...INCOMING

## `Snapshots`

...INCOMING

## Test Tools

...INCOMING

## Common Patterns

...INCOMING
