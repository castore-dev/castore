# DynamoDB Event Storage Adapter

DRY Castore [`EventStorageAdapter`](https://github.com/castore-dev/castore/#--eventstorageadapter) implementation using [AWS DynamoDB](https://aws.amazon.com/dynamodb/).

## 📥 Installation

```bash
# npm
npm install @castore/event-storage-adapter-dynamodb

# yarn
yarn add @castore/event-storage-adapter-dynamodb
```

This package has `@castore/core` and `@aws-sdk/client-dynamodb` (above v3) as peer dependencies, so you will have to install them as well:

```bash
# npm
npm install @castore/core @aws-sdk/client-dynamodb

# yarn
yarn add @castore/core @aws-sdk/client-dynamodb
```

## Table of content

This library exposes two adapters:

- `DynamoDBSingleTableEventStorageAdapter` which can plug several event stores to a single DynamoDB table.
- (_deprecated_) `DynamoDBEventStorageAdapter` which needs a DynamoDB table per event store.

The legacy `DynamoDBEventStorageAdapter` is still exposed for backward compatibility. It will be deprecated and renamed `LegacyDynamoDBEventStorageAdapter` in the v2, to be finally removed in the v3.

Documentation:

- [DynamoDB Event Storage Adapter](#dynamodb-event-storage-adapter)
  - [📥 Installation](#-installation)
  - [Table of content](#table-of-content)
  - [`DynamoDBSingleTableEventStorageAdapter`](#dynamodbsingletableeventstorageadapter)
    - [👩‍💻 Usage](#-usage)
    - [🤔 How it works](#-how-it-works)
    - [📝 Examples](#-examples)
    - [🤝 EventGroups](#-eventgroups)
    - [🔑 IAM](#-iam)
    - [📸 `ImageParser`](#-imageparser)
  - [Legacy `DynamoDBEventStorageAdapter`](#legacy-dynamodbeventstorageadapter)
    - [👩‍💻 Usage](#-usage-1)
    - [🤔 How it works](#-how-it-works-1)
    - [📝 Examples](#-examples-1)
    - [🤝 EventGroups](#-eventgroups-1)
    - [🔑 IAM](#-iam-1)

## `DynamoDBSingleTableEventStorageAdapter`

### 👩‍💻 Usage

```ts
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

import { DynamoDBSingleTableEventStorageAdapter } from '@castore/event-storage-adapter-dynamodb';

const dynamoDBClient = new DynamoDBClient({});

const pokemonsEventStorageAdapter = new DynamoDBSingleTableEventStorageAdapter(
  {
    tableName: 'my-table-name',
    dynamoDBClient,
  },
);

// 👇 Alternatively, provide a getter
const pokemonsEventStorageAdapter =
  new DynamoDBSingleTableEventStorageAdapter({
    tableName: () => process.env.MY_TABLE_NAME,
    dynamoDBClient,
  });

const pokemonsEventStore = new EventStore({
  ...
  eventStorageAdapter: pokemonsEventStorageAdapter,
});
```

This will directly plug your EventStore to DynamoDB 🙌

### 🤔 How it works

This adapter persists aggregates in **separate partitions**: When persisting an event, its `aggregateId`, prefixed by the `eventStoreId`, is used as partition key (_string_ attribute) and its `version` is used as sort key (_number_ attribute).

A [Global Secondary Index](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GSI.html) is also required to efficiently retrieve the event store aggregates ids (`listAggregateIds` operation). Only initial events (`version = 1`) are projected. A `KEYS_ONLY` projection type is sufficient.

```ts
// 👇 Initial event
{
  "aggregateId": "POKEMONS#123", // <= Partition key
  "version": 1, // <= Sort key
  "eventStoreId": "POKEMONS", // <= initialEvents index partition key
  "timestamp": "2022-01-01T00:00:00.000Z", // <= initialEvents index sort key
  "type": "POKEMON_APPEARED",
  "payload": { "name": "Pikachu", "level": 42 },
  "metadata": { "trigger": "random" }
}

// 👇 Non-initial event
{
  "aggregateId": "POKEMONS#123",
  "version": 2,
  // Event is not projected on initialEvents index (to limit costs)
  "timestamp": "2023-01-01T00:00:00.000Z",
  "type": "POKEMON_LEVELED_UP"
}
```

The `getEvents` method (which is used by the `getAggregate` and `getExistingAggregate` methods of the `EventStore` class) uses consistent reads, so is **always consistent**.

The `pushEvent` method is a write operation and so is **always consistent**. It is conditioned to avoid race conditions, as required by the [Castore specifications](https://github.com/castore-dev/castore/blob/main/docs/building-your-own-event-storage-adapter.md).

By design, the `listAggregateIds` operation can only be **eventually consistent** (GSIs reads cannot be consistent).

### 📝 Examples

Note that if you define your infrastructure as code in TypeScript, you can directly use this package instead of hard-coding the below values:

```ts
import {
  EVENT_TABLE_PK, // => aggregateId
  EVENT_TABLE_SK, // => version
  EVENT_TABLE_INITIAL_EVENT_INDEX_NAME, // => initialEvents
  EVENT_TABLE_EVENT_STORE_ID_KEY, // => eventStoreId
  EVENT_TABLE_TIMESTAMP_KEY, // => timestamp
} from '@castore/event-storage-adapter-dynamodb';
```

Alternatively, you can declare your own keys and index name. This is useful if you want to use the Dynamo table for other purposes than Castore:

```ts
import {
  EVENT_TABLE_PK, // => aggregateId
  EVENT_TABLE_SK, // => version
  EVENT_TABLE_INITIAL_EVENT_INDEX_NAME, // => initialEvents
  EVENT_TABLE_EVENT_STORE_ID_KEY, // => eventStoreId
  EVENT_TABLE_TIMESTAMP_KEY, // => timestamp
} from '@castore/event-storage-adapter-dynamodb';
```

#### CloudFormation

```json
{
  "Type": "AWS::DynamoDB::Table",
  "Properties": {
    "AttributeDefinitions": [
      { "AttributeName": "aggregateId", "AttributeType": "S" },
      { "AttributeName": "version", "AttributeType": "N" }
      { "AttributeName": "eventStoreId", "AttributeType": "S" },
      { "AttributeName": "timestamp", "AttributeType": "S" }
    ],
    "KeySchema": [
      { "AttributeName": "aggregateId", "KeyType": "HASH" },
      { "AttributeName": "version", "KeyType": "RANGE" }
    ],
    "GlobalSecondaryIndexes": [
      {
        "IndexName": "initialEvents",
        "KeySchema": [
          { "AttributeName": "eventStoreId", "KeyType": "HASH" },
          { "AttributeName": "timestamp", "KeyType": "RANGE" }
        ],
        "Projection": "KEYS_ONLY"
      }
    ]
  }
}
```

#### CDK

```ts
import { Table, AttributeType, ProjectionType } from 'aws-cdk-lib/aws-dynamodb';

const { STRING, NUMBER } = AttributeType;
const { KEYS_ONLY } = ProjectionType;

const pokemonsEventsTable = new Table(scope, 'PokemonEvents', {
  partitionKey: {
    name: 'aggregateId',
    type: STRING,
  },
  sortKey: {
    name: 'version',
    type: NUMBER,
  },
});

pokemonsEventsTable.addGlobalSecondaryIndex({
  indexName: 'initialEvents',
  partitionKey: {
    name: 'eventStoreId',
    type: STRING,
  },
  sortKey: {
    name: 'timestamp',
    type: STRING,
  },
  projectionType: KEYS_ONLY,
});
```

#### Terraform

```h
resource "aws_dynamodb_table" "pokemons-events-table" {
  hash_key       = "aggregateId"
  range_key      = "version"

  attribute {
    name = "aggregateId"
    type = "S"
  }

  attribute {
    name = "version"
    type = "N"
  }

  attribute {
    name = "eventStoreId"
    type = "S"
  }

  attribute {
    name = "timestamp"
    type = "S"
  }

  global_secondary_index {
    name               = "initialEvents"
    hash_key           = "eventStoreId"
    range_key          = "timestamp"
    projection_type    = "KEYS_ONLY"
  }
}
```

### 🤝 EventGroups

This adapter implements the [EventGroups](https://github.com/castore-dev/castore/#event-groups) API using the [DynamoDB Transactions API](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/transaction-apis.html):

```ts
import { EventStore } from '@castore/core';

// 👇 TransactWriteItems N events simultaneously
await EventStore.pushEventGroup(
  // events are correctly typed 🙌
  eventStoreA.groupEvent(eventA1),
  eventStoreA.groupEvent(eventA2),
  eventStoreB.groupEvent(eventB),
  ...
);
```

Note that:

- All the event stores involved in the transaction need to use the `DynamoDBSingleTableEventStorageAdapter`
- This util inherits of the [`TransactWriteItem` API](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/transaction-apis.html#transaction-apis-txwriteitems) limitations: It can target up to 100 distinct events in one or more DynamoDB tables within the same AWS account and in the same Region.

### 🔑 IAM

Required IAM permissions for each operations:

- `getEvents` (+ `getAggregate`, `getExistingAggregate`): `dynamodb:Query`
- `pushEvent`: `dynamodb:PutItem`
- `listAggregateIds`: `dynamodb:Query` on the `initialEvents` index

### 📸 `ImageParser`

This library also exposes a useful `ImageParser` class to parse [DynamoDB stream](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Streams.html) images from a `DynamoDBSingleTableEventStorageAdapter`. It will build a correctly typed `NotificationMessage` ouf of a stream image, unmarshalling it, removing the prefix of the `aggregateId` in the process and validating the `eventStoreId`:

```ts
import { ImageParser } from '@castore/event-storage-adapter-dynamodb';

const imageParser = new ImageParser({
  sourceEventStores: [pokemonsEventStore, trainersEventStore],
});

// 🙌 Typed as EventStoreNotificationMessage<
//  typeof pokemonsEventStore
//  | typeof trainersEventStore...
// >
const notificationMessage = imageParser.parseImage(
  streamImage,
  // 👇 Optional options
  unmarshallOptions,
);
```

## Legacy `DynamoDBEventStorageAdapter`

<details>
<summary><b>🔧 Documentation</b></summary>

### 👩‍💻 Usage

```ts
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

import { DynamoDBEventStorageAdapter } from '@castore/event-storage-adapter-dynamodb';

const dynamoDBClient = new DynamoDBClient({});

const pokemonsEventStorageAdapter = new DynamoDBEventStorageAdapter({
  tableName: 'my-table-name',
  dynamoDBClient,
});

// 👇 Alternatively, provide a getter
const pokemonsEventStorageAdapter = new DynamoDBEventStorageAdapter({
  tableName: () => process.env.MY_TABLE_NAME,
  dynamoDBClient,
});

// 👇 Alternatively, provide keys and index names
const pokemonsEventStorageAdapter = new DynamoDBEventStorageAdapter({
  tableName: 'my-table-name',
  dynamoDBClient,
  eventTableInitialEventIndexName: "_GSI1";
  eventTablePk: "_PK";
  eventTableSk: "_SK";
  eventTableTimestampKey: "_GSI1_SK";
});

const pokemonsEventStore = new EventStore({
  ...
  eventStorageAdapter: pokemonsEventStorageAdapter
})
```

This will directly plug your EventStore to DynamoDB 🙌

### 🤔 How it works

This adapter persists aggregates in **separate partitions**: When persisting an event, its `aggregateId` is used as partition key (_string_ attribute) and its `version` is used as sort key (_number_ attribute).

A [Global Secondary Index](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GSI.html) is also required to efficiently retrieve the event store aggregates ids (`listAggregateIds` operation). Only initial events (`version = 1`) are projected. A `KEYS_ONLY` projection type is sufficient.

```ts
// 👇 Initial event
{
  "aggregateId": "123", // <= Partition key
  "version": 1, // <= Sort key
  "isInitialEvent": 1, // <= initialEvents index partition key
  "timestamp": "2022-01-01T00:00:00.000Z", // <= initialEvents index sort key
  "type": "POKEMON_APPEARED",
  "payload": { "name": "Pikachu", "level": 42 },
  "metadata": { "trigger": "random" }
}

// 👇 Non-initial event
{
  "aggregateId": "123",
  "version": 2,
  // Event is not projected on initialEvents index (to limit costs)
  "timestamp": "2023-01-01T00:00:00.000Z",
  "type": "POKEMON_LEVELED_UP"
}
```

The `getEvents` method (which is used by the `getAggregate` and `getExistingAggregate` methods of the `EventStore` class) uses consistent reads, so is **always consistent**.

The `pushEvent` method is a write operation and so is **always consistent**. It is conditioned to avoid race conditions, as required by the [Castore specifications](https://github.com/castore-dev/castore/blob/main/docs/building-your-own-event-storage-adapter.md).

By design, the `listAggregateIds` operation can only be **eventually consistent** (GSIs reads cannot be consistent).

### 📝 Examples

Note that if you define your infrastructure as code in TypeScript, you can directly use this package instead of hard-coding the below values:

```ts
import {
  EVENT_TABLE_PK, // => aggregateId
  EVENT_TABLE_SK, // => version
  EVENT_TABLE_INITIAL_EVENT_INDEX_NAME, // => initialEvents
  EVENT_TABLE_IS_INITIAL_EVENT_KEY, // => isInitialEvent
  EVENT_TABLE_TIMESTAMP_KEY, // => timestamp
} from '@castore/event-storage-adapter-dynamodb';
```

#### CloudFormation

```json
{
  "Type": "AWS::DynamoDB::Table",
  "Properties": {
    "AttributeDefinitions": [
      { "AttributeName": "aggregateId", "AttributeType": "S" },
      { "AttributeName": "version", "AttributeType": "N" }
      { "AttributeName": "isInitialEvent", "AttributeType": "N" },
      { "AttributeName": "timestamp", "AttributeType": "S" }
    ],
    "KeySchema": [
      { "AttributeName": "aggregateId", "KeyType": "HASH" },
      { "AttributeName": "version", "KeyType": "RANGE" }
    ],
    "GlobalSecondaryIndexes": [
      {
        "IndexName": "initialEvents",
        "KeySchema": [
          { "AttributeName": "isInitialEvent", "KeyType": "HASH" },
          { "AttributeName": "timestamp", "KeyType": "RANGE" }
        ],
        "Projection": "KEYS_ONLY"
      }
    ]
  }
}
```

#### CDK

```ts
import { Table, AttributeType, ProjectionType } from 'aws-cdk-lib/aws-dynamodb';

const { STRING, NUMBER } = AttributeType;
const { KEYS_ONLY } = ProjectionType;

const pokemonsEventsTable = new Table(scope, 'PokemonEvents', {
  partitionKey: {
    name: 'aggregateId',
    type: STRING,
  },
  sortKey: {
    name: 'version',
    type: NUMBER,
  },
});

pokemonsEventsTable.addGlobalSecondaryIndex({
  indexName: 'initialEvents',
  partitionKey: {
    name: 'isInitialEvent',
    type: NUMBER,
  },
  sortKey: {
    name: 'timestamp',
    type: STRING,
  },
  projectionType: KEYS_ONLY,
});
```

#### Terraform

```h
resource "aws_dynamodb_table" "pokemons-events-table" {
  hash_key       = "aggregateId"
  range_key      = "version"

  attribute {
    name = "aggregateId"
    type = "S"
  }

  attribute {
    name = "version"
    type = "N"
  }

  attribute {
    name = "isInitialEvent"
    type = "N"
  }

  attribute {
    name = "timestamp"
    type = "S"
  }

  global_secondary_index {
    name               = "initialEvents"
    hash_key           = "isInitialEvent"
    range_key          = "timestamp"
    projection_type    = "KEYS_ONLY"
  }
}
```

### 🤝 EventGroups

This adapter implements the [EventGroups](https://github.com/castore-dev/castore/#event-groups) API using the [DynamoDB Transactions API](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/transaction-apis.html):

```ts
import { EventStore } from '@castore/core';

// 👇 TransactWriteItems N events simultaneously
await EventStore.pushEventGroup(
  // events are correctly typed 🙌
  eventStoreA.groupEvent(eventA1),
  eventStoreA.groupEvent(eventA2),
  eventStoreB.groupEvent(eventB),
  ...
);
```

Note that:

- All the event stores involved in the transaction need to use the `DynamoDBEventStorageAdapter`
- This util inherits of the [`TransactWriteItem` API](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/transaction-apis.html#transaction-apis-txwriteitems) limitations: It can target up to 100 distinct events in one or more DynamoDB tables within the same AWS account and in the same Region.

### 🔑 IAM

Required IAM permissions for each operations:

- `getEvents` (+ `getAggregate`, `getExistingAggregate`): `dynamodb:Query`
- `pushEvent`: `dynamodb:PutItem`
- `listAggregateIds`: `dynamodb:Query` on the `initialEvents` index

</details>
