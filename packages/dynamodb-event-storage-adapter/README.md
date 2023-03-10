# DynamoDB Event Storage Adapter

DRY Castore [`EventStorageAdapter`](https://github.com/castore-dev/castore/#--eventstorageadapter) implementation using [AWS DynamoDB](https://aws.amazon.com/dynamodb/).

## 📥 Installation

```bash
# npm
npm install @castore/dynamodb-event-storage-adapter

# yarn
yarn add @castore/dynamodb-event-storage-adapter
```

This package has `@castore/core` and `@aws-sdk/client-dynamodb` (above v3) as peer dependencies, so you will have to install them as well:

```bash
# npm
npm install @castore/core @aws-sdk/client-dynamodb

# yarn
yarn add @castore/core @aws-sdk/client-dynamodb
```

## 👩‍💻 Usage

```ts
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

import { DynamoDbEventStorageAdapter } from '@castore/dynamodb-event-storage-adapter';

const dynamoDbClient = new DynamoDBClient({});

const userEventsStorageAdapter = new DynamoDbEventStorageAdapter({
  tableName: 'my-table-name',
  dynamoDbClient,
});

// 👇 Alternatively, provide a getter
const userEventsStorageAdapter = new DynamoDbEventStorageAdapter({
  tableName: () => process.env.MY_TABLE_NAME,
  dynamoDbClient,
});

const userEventStore = new EventStore({
  ...
  storageAdapter: userEventsStorageAdapter
})
```

This will directly plug your EventStore to DynamoDB 🙌

## 🤔 How it works

This adapter persists aggregates in **separate partitions**: When persisting an event, its `aggregateId` is used as partition key (_string_ attribute) and its `version` is used as sort key (_number_ attribute).

A [Global Secondary Index](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GSI.html) is also required to efficiently retrieve the event store aggregates ids (`listAggregateIds` operation). Only initial events (`version = 1`) are projected. A `KEYS_ONLY` projection type is sufficient.

```ts
// 👇 Initial event
{
  "aggregateId": "123", // <= Partition key
  "version": 1, // <= Sort key
  "isInitialEvent": 1, // <= initialEvents index partition key
  "timestamp": "2022-01-01T00:00:00.000Z", // <= initialEvents index sort key
  "type": "USER_CREATED",
  "payload": { "name": "John", "age": 42 },
  "metadata": { "invitedBy": "Jane" }
}

// 👇 Non-initial event
{
  "aggregateId": "123",
  "version": 2,
  // Event is not projected on initialEvents index (to limit costs)
  "timestamp": "2023-01-01T00:00:00.000Z",
  "type": "USER_REMOVED"
}
```

The `getEvents` method (which is used by the `getAggregate` and `getExistingAggregate` methods of the `EventStore` class) uses consistent reads, so is **always consistent**.

The `pushEvent` method is a write operation and so is **always consistent**. It is conditioned to avoid race conditions, as required by the [Castore specifications](https://github.com/castore-dev/castore/blob/main/docs/building-your-own-event-storage-adapter.md).

By design, the `listAggregateIds` operation can only be **eventually consistent** (GSIs reads cannot be consistent).

## 📝 Examples

Note that if you define your infrastructure as code in TypeScript, you can directly use this package instead of hard-coding the below values:

```ts
import {
  EVENT_TABLE_PK, // => aggregateId
  EVENT_TABLE_SK, // => version
  EVENT_TABLE_INITIAL_EVENT_INDEX_NAME, // => initialEvents
  EVENT_TABLE_IS_INITIAL_EVENT_KEY, // => isInitialEvent
  EVENT_TABLE_TIMESTAMP_KEY, // => timestamp
} from '@castore/dynamodb-event-storage-adapter';
```

### CloudFormation

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

### CDK

```ts
import { Table, AttributeType, ProjectionType } from 'aws-cdk-lib/aws-dynamodb';

const { STRING, NUMBER } = AttributeType;
const { KEYS_ONLY } = ProjectionType;

const userEventsTable = new Table(scope, 'UserEvents', {
  partitionKey: {
    name: 'aggregateId',
    type: STRING,
  },
  sortKey: {
    name: 'version',
    type: NUMBER,
  },
});

userEventsTable.addGlobalSecondaryIndex({
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

### Terraform

```h
resource "aws_dynamodb_table" "user-events-table" {
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

## 🤝 Transactions

As stated in the [main documentation](https://github.com/castore-dev/castore/#--command):

> When writing on several event stores at once, it is important to make sure that **all events are written or none**, i.e. use transactions: This ensures that the application is not in a corrupt state.

This package exposes a `pushEventsTransaction` util to do just that, using the [DynamoDb Transactions API](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/transaction-apis.html):

```ts
import {
  formatEventForTransaction,
  pushEventsTransaction,
} from '@castore/dynamodb-event-storage-adapter';

// 👇 Does N pushEvent operations simultaneously
await pushEventsTransaction([
  // events are correctly typed 🙌
  formatEventForTransaction(eventStoreA, eventA1),
  formatEventForTransaction(eventStoreA, eventA2),
  formatEventForTransaction(eventStoreB, eventB),
  ...
]);
```

Note that:

- All the event stores involved in the transaction need to use the `DynamoDbEventStorageAdapter`
- This util inherits of the [`TransactWriteItem` API](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/transaction-apis.html#transaction-apis-txwriteitems) limitations: It can target up to 100 distinct events in one or more DynamoDB tables within the same AWS account and in the same Region.

## 🔑 IAM

Required IAM permissions for each operations:

- `getEvents` (+ `getAggregate`, `getExistingAggregate`): `dynamodb:Query`
- `pushEvent`: `dynamodb:PutItem`
- `listAggregateIds`: `dynamodb:Query` on the `initialEvents` index
