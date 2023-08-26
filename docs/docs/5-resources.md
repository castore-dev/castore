---
sidebar_position: 5
---

# 📖 Resources

## Test Tools

Castore comes with a handy [Test Tool package](https://www.npmjs.com/package/@castore/test-tools) that facilitates the writing of unit tests: It allows mocking event stores, populating them with an initial state and resetting them to it in a boilerplate-free and type-safe way.

## Dam

[Dam](https://www.npmjs.com/package/@castore/dam) is a suite of utils that facilitates data migration and maintenance operations with Castore (for instance, dispatching all the events of an event store - ordered by their timestamps - to a message queue).

## React Visualizer

Castore also comes with a handy [React Visualizer](https://www.npmjs.com/package/@castore/react-visualizer) library: It exposes a React component to visualize, design and manually test Castore event stores and commands.

## Packages List

### Event Types

- [JSON Schema Event Type](https://www.npmjs.com/package/@castore/json-schema-event): DRY `EventType` definition using [JSON Schemas](http://json-schema.org/understanding-json-schema/reference/index.html) and [`json-schema-to-ts`](https://github.com/ThomasAribart/json-schema-to-ts)
- [Zod Event Type](https://www.npmjs.com/package/@castore/zod-event): DRY `EventType` definition using [`zod`](https://github.com/colinhacks/zod)

### Event Storage Adapters

- [DynamoDB Event Storage Adapter](https://www.npmjs.com/package/@castore/dynamodb-event-storage-adapter): Implementation of the `EventStorageAdapter` interface based on DynamoDB.
- [Redux Event Storage Adapter](https://www.npmjs.com/package/@castore/redux-event-storage-adapter): Implementation of the `EventStorageAdapter` interface based on a Redux store, along with tooling to configure the store and hooks to read from it efficiently.
- [In-Memory Event Storage Adapter](https://www.npmjs.com/package/@castore/inmemory-event-storage-adapter): Implementation of the `EventStorageAdapter` interface using a local Node/JS object. To be used in manual or unit tests.

### Commands

- [JSON Schema Command](https://www.npmjs.com/package/@castore/json-schema-command): DRY `Command` definition using [JSON Schemas](http://json-schema.org/understanding-json-schema/reference/index.html) and [`json-schema-to-ts`](https://github.com/ThomasAribart/json-schema-to-ts)

### Message Queue Adapters

- [SQS Message Queue Adapter](https://www.npmjs.com/package/@castore/sqs-message-queue-adapter): Implementation of the `MessageQueueAdapter` interface based on AWS SQS.
- [In-Memory Message Queue Adapter](https://www.npmjs.com/package/@castore/in-memory-message-queue-adapter): Implementation of the `MessageQueueAdapter` interface using a local Node/JS queue. To be used in manual or unit tests.

### Message Buses Adapters

- [EventBridge Message Bus Adapter](https://www.npmjs.com/package/@castore/event-bridge-message-bus-adapter): Implementation of the `MessageBusAdapter` interface based on AWS EventBridge.
- [EventBridge + S3 Message Bus Adapter](https://www.npmjs.com/package/@castore/event-bridge-s3-message-bus-adapter/README.md): Implementation of the `MessageBusAdapter` interface based on AWS EventBridge and S3.
- [In-Memory Message Bus Adapter](https://www.npmjs.com/package/@castore/in-memory-message-bus-adapter): Implementation of the `MessageBusAdapter` interface using a local Node/JS event emitter. To be used in manual or unit tests.
