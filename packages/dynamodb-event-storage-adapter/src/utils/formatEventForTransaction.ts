import type {
  DynamoDBClient,
  TransactWriteItem,
} from '@aws-sdk/client-dynamodb';

import type { EventStore, EventStoreEventsDetails } from '@castore/core';

import { DynamoDbEventStorageAdapter } from '../dynamoDb';

export interface EventTransaction {
  transactItem: TransactWriteItem;
  dynamoDbClient: DynamoDBClient;
}

export const formatEventForTransaction = <E extends EventStore>(
  eventStore: E,
  eventDetail: EventStoreEventsDetails<E>,
): EventTransaction => {
  const { eventStoreId, storageAdapter } = eventStore;

  if (!(storageAdapter instanceof DynamoDbEventStorageAdapter)) {
    throw new Error(
      `The event storage adapter of event store ${eventStoreId} is not an instance of DynamoDbEventStorageAdapter and cannot use pushEventTransaction`,
    );
  }

  const { dynamoDbClient } = storageAdapter;

  return {
    transactItem: {
      Put: storageAdapter.getPushEventInput(eventDetail),
    },
    dynamoDbClient,
  };
};
