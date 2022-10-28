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

# Making Event Sourcing easy 😎

Event Sourcing is a data storage paradigm that saves **changes in your application state** rather than the state itself. It is powerful but tricky to implement.

<!-- TODO: SCHEMA OF EVENT SOURCING -->

After years of using it at [Kumo](https://dev.to/kumo), we have grown to love it, but also experienced first-hand the lack of consensus and tooling around it. That's where Castore comes from!


<p align="center">
Castore is a TypeScript library that <b>makes Event Sourcing easy</b> 😎
</p>


With Castore, you'll be able to:

- Define your [event stores](#eventstore)
- Fetch and push new [events](#events) seamlessly
- Implement and test your [commands](#command)
- ...and much more!

All that with first-class developer experience and minimal boilerplate ✨

<!-- > Castore is still under active development. A v1 has been released with a first set of features, but we have big plans for the future (read models, events replay, migrations...)! So 📣 STAY TUNED 📣 -->

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

- [Getting Started](#getting-started)
  - [📥 Installation](#-installation)
  - [📦 Packages structure](#-packages-structure)
- [The Basics](#the-basics)
  - [📚 Events](#-events)
  - [🏷 Event Type](#-eventtype)
  - [🏗 Aggregates](#-aggregate)
  - [⚙️ Reducers](#%EF%B8%8F-reducers)
  - [🎁 Event Store](#%EF%B8%8F-reducers)
  - [💾 Event Storage Adapter](#-eventstorageadapter)
  - [📨 Command](#-command)
  - [📸 Snapshots](#-snapshots)
- [Resources](#resources)
  - [🎯 Test Tools](#-test-tools)
  - [🔗 Packages List](#-packages-list)
  - [📖 Common Patterns](#-common-patterns)

## Getting Started

### 📥 Installation

```bash
# npm
npm install @castore/core

# yarn
yarn add @castore/core
```

### 📦 Packages structure

Castore is not a single package, but a **collection of packages** revolving around a `core` package. This is made so every line of code added to your project is _opt-in_, wether you use tree-shaking or not.

Castore packages are **released together**. Though different versions may be compatible, you are **guaranteed** to have working code as long as you use matching versions.

Here is an example of working `package.json`:

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

## The Basics

### 📚 `Events`

Event Sourcing is all about **saving changes in your application state**. Such changes are represented by **events**, and needless to say, they are quite important 🙃

Events that concern the same "data" (like a `User`) are aggregated through a common id called `aggregateId` (and vice versa, events that have the same `aggregateId` represent changes of the same underlying data). The index of an event in such a serie of events is called its `version`.

In Castore, stored events (also called **event details**) always have exactly the following attributes:

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

### 🏷 `EventType`

Events are generally classified in **events types** (not to confuse with TS types). Castore lets you declare them via the `EventType` class:

```ts
import { EventType } from '@castore/core';

export const userCreatedEventType = new EventType<
  'USER_CREATED',
  { name: string; age: number },
  { invitedBy?: string }
>({ type: 'USER_CREATED' });
```

Note that we only provide TS types for `payload` and `metadata` properties. That is because, as stated in the [core design](#🫀-core-design), **Castore is meant to be as agnostic as possible of technical preferences**, including the validation library you want to use: The `EventType` class is not meant to be used directly, but rather extended by other classes which will add run-time validation methods to it 👍

See the following packages for examples:

- [JSON-Schema Event Type](./packages/json-schema-event/README.md)
- [Zod Event Type](./packages/zod-event/README.md)

**Constructor:**

- <code>type <i>(string)</i></code>: The event type

```ts
import { EventType } from '@castore/core';

export const userCreatedEventType = new EventType({ type: 'USER_CREATED' });
```

**Properties:**

- <code>type <i>(string)</i>:</code> The event type

```ts
const eventType = userCreatedEventType.type;
// => "USER_CREATED"
```

**Type Helpers:**

- <code>EventTypeDetail</code>: Returns the event detail TS type of an `EventType`

```ts
import type { EventTypeDetail } from '@castore/core';

type UserCreatedEventTypeDetail = EventTypeDetail<typeof userCreatedEventType>;

// 👇 Equivalent to:
type UserCreatedEventTypeDetail = {
  aggregateId: string;
  version: number;
  timestamp: string;
  type: 'USER_CREATED';
  payload: { name: string; age: number };
  metadata: { invitedBy?: string };
};
```

- <code>EventTypesDetails</code>: Return the events details of a list of `EventType`

```ts
import type { EventTypesDetails } from '@castore/core';

type UserEventTypesDetails = EventTypesDetails<
  [typeof userCreatedEventType, typeof userRemovedEventType]
>;
// => EventTypeDetail<typeof userCreatedEventType>
// | EventTypeDetail<typeof userRemovedEventType>
```

### 🏗 `Aggregate`

Eventhough data is stored as a serie of events, we still want to use a **stable interface to represent its state at time t** rather than directly using events. In Castore, it is implemented by a TS type called `Aggregate`.

> ☝️ Think of aggregates as _"what the data would look like in CRUD"_

In Castore, aggregates necessarily contain an `aggregateId` and `version` attributes (the `version` of the latest `event`). But for the rest, it's up to you 🤷‍♂️

For instance, we can include a `name`, `age` and `status` properties to our `UserAggregate`:

```ts
import type { Aggregate } from '@castore/core';

// Represents a User at time t
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

### ⚙️ `Reducers`

Aggregates are derived from their events by [reducing them](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce) through a `reducer` function. It defines **how to update the aggregate when a new event is pushed**:

```ts
import type { Reducer } from '@castore/core';

export const usersReducer: Reducer<UserAggregate, UserEventsDetails> = (
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

> ☝️ Note that aggregates are always **computed on the fly**, and NOT stored. Changing them does not require any data migration whatsoever (except if you use snapshots, an invalidation is needed first).

<!-- TODO: SCHEMA OF EVENTS AGGREGATE -->

### 🎁 `EventStore`

_...coming soon_

<!-- Here we are! The `store` in Castore :)

```ts
import { EventStore } from '@castore/core';

const userEventStore = new EventStore({
  eventStoreId: 'USERS',
  eventTypes: [
    userCreatedEventType,
    userRemovedEventType,
    ...
  ],
  reducer: usersReducer,
});
```

**Constructor:**

**TS Generics:**

**Properties:**

**Methods:**

**Helpers:** -->

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

### 💾 `EventStorageAdapter`

_...coming soon_

<!-- You can store your events in many different ways. To specify how to store them (in memory, DynamoDB...) Castore implements Storage Adapters.

Adapters offer an interface between the Event Store class and your storage method 💾.

To be able to use your EventStore, you will need to attach a Storage Adapter 🔗.

All the Storage Adapters have the same interface, and you can create your own if you want to implement new storage methods!

So far, castore supports 2 Storage Adapters ✨:

- in-memory
- DynamoDB -->

### 📨 `Command`

_...coming soon_

### 📸 `Snapshots`

_...coming soon_

## Resources

### 🎯 Test Tools

_...coming soon_


### 🔗 Packages List

_...coming soon_

### 📖 Common Patterns

_...coming soon_
