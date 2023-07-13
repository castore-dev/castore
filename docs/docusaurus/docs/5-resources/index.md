# 📖 Resources

## Test Tools

Castore comes with a handy [Test Tool package](./test-tools/) that facilitates the writing of unit tests: It allows mocking event stores, populating them with an initial state and resetting them to it in a boilerplate-free and type-safe way.

## React Visualizer

Castore also comes with a handy [React Visualizer](./react-visualizer/) library: It exposes a React component to visualize, design and manually test Castore event stores and commands.

## Packages List

### Event Types

- [JSON Schema Event Type](./json-schema-event/): DRY `EventType` definition using [JSON Schemas](http://json-schema.org/understanding-json-schema/reference/index.html) and [`json-schema-to-ts`](https://github.com/ThomasAribart/json-schema-to-ts)
- [Zod Event Type](./zod-event/): DRY `EventType` definition using [`zod`](https://github.com/colinhacks/zod)

### Event Storage Adapters

- [DynamoDB Event Storage Adapter](./dynamodb-event-storage-adapter/): Implementation of the `EventStorageAdapter` interface based on DynamoDB.
- [Redux Event Storage Adapter](./redux-event-storage-adapter/): Implementation of the `EventStorageAdapter` interface based on a Redux store, along with tooling to configure the store and hooks to read from it efficiently.
- [In-Memory Event Storage Adapter](./inmemory-event-storage-adapter/): Implementation of the `EventStorageAdapter` interface using a local Node/JS object. To be used in manual or unit tests.

### Commands

- [JSON Schema Command](./json-schema-command/): DRY `Command` definition using [JSON Schemas](http://json-schema.org/understanding-json-schema/reference/index.html) and [`json-schema-to-ts`](https://github.com/ThomasAribart/json-schema-to-ts)

### Message Queue Adapters

- [SQS Message Queue Adapter](./sqs-message-queue-adapter/): Implementation of the `MessageQueueAdapter` interface based on AWS SQS.
- [In-Memory Message Queue Adapter](./in-memory-message-queue-adapter/): Implementation of the `MessageQueueAdapter` interface using a local Node/JS queue. To be used in manual or unit tests.

### Message Buses Adapters

- [EventBridge Message Bus Adapter](./event-bridge-message-bus-adapter/): Implementation of the `MessageBusAdapter` interface based on AWS EventBridge.
- [In-Memory Message Bus Adapter](./in-memory-message-bus-adapter/): Implementation of the `MessageBusAdapter` interface using a local Node/JS event emitter. To be used in manual or unit tests.

## Common Patterns

- Simulating a future/past aggregate state: _...coming soon_
- Snapshotting: _...coming soon_
- Projecting on read models: _...coming soon_
- Replaying events: _...coming soon_
- Migrating events: _...coming soon_