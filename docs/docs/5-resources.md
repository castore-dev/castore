---
sidebar_position: 5
---

# 📖 Resources

## Test Tools

Castore comes with a handy [Test Tool package](./packages/test-tools/README.md) that facilitates the writing of unit tests: It allows mocking event stores, populating them with an initial state and resetting them to it in a boilerplate-free and type-safe way.

## Dam

[Dam](./packages/dam/README.md) is a suite of utils that facilitates data migration and maintenance operations with Castore (for instance, dispatching all the events of an event store - ordered by their timestamps - to a message queue).

## React Visualizer

Castore also comes with a handy [React Visualizer](./packages/react-visualizer/README.md) library: It exposes a React component to visualize, design and manually test Castore event stores and commands.

## Packages List

### Event Types

- [JSON Schema Event Type](./packages/json-schema-event/README.md): DRY `EventType` definition using [JSON Schemas](http://json-schema.org/understanding-json-schema/reference/index.html) and [`json-schema-to-ts`](https://github.com/ThomasAribart/json-schema-to-ts)
- [Zod Event Type](./packages/zod-event/README.md): DRY `EventType` definition using [`zod`](https://github.com/colinhacks/zod)

### Event Storage Adapters

- [DynamoDB Event Storage Adapter](./packages/dynamodb-event-storage-adapter/README.md): Implementation of the `EventStorageAdapter` interface based on DynamoDB.
- [Redux Event Storage Adapter](./packages/redux-event-storage-adapter/README.md): Implementation of the `EventStorageAdapter` interface based on a Redux store, along with tooling to configure the store and hooks to read from it efficiently.
- [In-Memory Event Storage Adapter](./packages/inmemory-event-storage-adapter/README.md): Implementation of the `EventStorageAdapter` interface using a local Node/JS object. To be used in manual or unit tests.

### Commands

- [JSON Schema Command](./packages/json-schema-command/README.md): DRY `Command` definition using [JSON Schemas](http://json-schema.org/understanding-json-schema/reference/index.html) and [`json-schema-to-ts`](https://github.com/ThomasAribart/json-schema-to-ts)

### Message Queue Adapters

- [SQS Message Queue Adapter](./packages/sqs-message-queue-adapter/README.md): Implementation of the `MessageQueueAdapter` interface based on AWS SQS.
- [In-Memory Message Queue Adapter](./packages/in-memory-message-queue-adapter/README.md): Implementation of the `MessageQueueAdapter` interface using a local Node/JS queue. To be used in manual or unit tests.

### Message Buses Adapters

- [EventBridge Message Bus Adapter](./packages/event-bridge-message-bus-adapter/README.md): Implementation of the `MessageBusAdapter` interface based on AWS EventBridge.
- [In-Memory Message Bus Adapter](./packages/in-memory-message-bus-adapter/README.md): Implementation of the `MessageBusAdapter` interface using a local Node/JS event emitter. To be used in manual or unit tests.
