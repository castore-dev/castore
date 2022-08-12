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

# Better DevX for Event Sourcing in TypeScript

Castore provides a unified interface for implementing Event Sourcing in TypeScript 🦸‍♂️.

## 🤔 Why use Castore ?

- 💬 **Verbosity**: Castore classes are designed to increase dryness and provide the optimal developer experience. Event Sourcing is hard, don't make it harder!

- 📝 **Strong typings**: We love type inference, we know you will to!

- 🏄‍♂️ **Interfaces before implementations**: Castore provides a standard interface to modelize common event sourcing patterns in TypeScript. But it **DOES NOT enforce any particular implementation** (storage service, messaging system etc...). You can use Castore in React apps, containers or lambdas, it's up to you! Some common implementations are provided, but you are free to use **any implementation you want** via custom classes, as long as they follow the required interfaces.

- 👍 **Enforces best practices**: Gained from years of usage like using integer versions instead of timestamps, transactions for multi-store events and state-carrying transfer events for projections.

- 🛠 **Rich suite of helpers**: Like mock events builder to help you write tests.

## Table of content

- [Events](#events)
- [Event Store](#event-store)
  - [Reducer](#reducer)
  - [Storage Adapter](#storage-adapter)
  - [Event Store Interface](#event-store-interface)
- [Going Further](#going-further-🏃‍♂️)

## Events

The first step in your ✨ Castore journey ✨ is to define your business events! 🦫

Castore lets you easily create the Event Types which will constitute your Event Store.
Simply use the EventType class and start defining, once and for all, your events! 🎉

```ts
import { EventType } from "@castore/core"

export const userCreatedEvent = new EventType<
  // Typescript EventType
  'USER_CREATED',
  // Typescript EventDetails
  {
    aggregateId: string;
    version: number;
    type: 'USER_CREATED';
    timestamp: string;
    payload: { name: string; age: number };
  }
>({
  // EventType
  type: 'USER_CREATED',
});

const userRemovedEvent = ...

const eventTypes = [
  userCreatedEvent,
  userRemovedEvent,
];

```

> You can also define your events with JSON Schemas or Zod Events, see `@castore/json-schema-event` and `@castore/zod-event` documentations for implementation 🦫

Once you're happy with your set of EventTypes you can move on to step 2: attaching the EventTypes to an actual EventStore! 🏪.

## Event Store

Welcome in the heart of Castore: the EventStore ❤️<br/>
The `EventStore` class lets you instantiate an object containing all the methods you will need to interact with your event sourcing store. 💪

```typescript
const userEventStore = new EventStore({
  eventStoreId: 'user-event-store-id',
  eventTypes,
  // 👇 See #reducer sub-section
  reducer,
  // 👇 See #storage_adapters section
  storageAdapter,
});
```

### Reducer

The reducer needed in the EventStore initialization is the function that will be applied to the sorted array of events in order to build the aggregates ⚙️. It works like your usual Redux reducer!

Basically, it consists in a function implementing switch cases for all event types and returning the aggregate updated with your business logic. 🧠

Here is an example reducer for our User Event Store.

```ts
export const usersReducer = (
  userAggregate: UserAggregate,
  event: UserEventsDetails,
): UserAggregate => {
  const { version, aggregateId } = event;

  switch (event.type) {
    case 'USER_CREATED': {
      const { name, age } = event.payload;

      return {
        aggregateId,
        version: event.version,
        name,
        age,
        status: 'CREATED',
      };
    }
    case 'USER_REMOVED':
      return {
        ...userAggregate,
        version,
        status: 'REMOVED',
      };
  }
};
```

### Storage Adapter

!['Storage Adapter'](/assets/storage_adapter_schema.png)

You can store your events in many different ways. To specify how to store them (in memory, DynamoDB...) Castore implements Storage Adapters.

Adapters offer an interface between the Event Store class and your storage method 💾.

To be able to use your EventStore, you will need to attach a Storage Adapter 🔗.

All the Storage Adapters have the same interface, and you can create your own if you want to implement new storage methods!

So far, castore supports 2 Storage Adapters ✨:

- in-memory
- DynamoDB

### Event Store Interface

Now that our Event Store has been instantiated with a reducer and a Storage Adapter, we can start using it to actually populate our database with events and retrieve business data from it 🌈.

To do that, the Event Store class exposes several methods, including the following two:

- `pushEvent`: Takes an object containing event details and puts it in the database. It will throw if the event's version already exists!

- `getAggregate`: Returns the output of the reducer applied to the array of all events.

Here is a quick example showing how an application would use these two methods:

```ts
const removeUser = async (userId: string) => {
  // get the aggregate for that userId,
  // which is a representation of our user's state
  const { aggregate } = await userEventStore.getAggregate(userId);

  // use the aggregate to check the user status
  if (aggregate.status === 'REMOVED') {
    throw new Error('User already removed');
  }

  // put the USER_REMOVED event in the event store 🦫
  await userEventStore.pushEvent({
    aggregateId: userId,
    version: aggregate.version + 1,
    type: 'USER_REMOVED',
    timestamp: new Date(),
  });
};
```

## Going Further 🏃‍♂️

We've only covered the basic functionalities of the Event Store!

The Event Store class actually implements other very useful methods 💪

Here is a small recap of these methods:

- `getEvents`: Returns the list of all events for a given aggregateId.

- `listAggregateIds`: Returns the list of all aggregateIds present in the Event Store.

- `simulateAggregate`: Simulates the aggregate you would have obtained with getAggregate at a given date.
