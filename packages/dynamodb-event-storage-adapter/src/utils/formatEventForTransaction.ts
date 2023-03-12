import type {
  DynamoDBClient,
  TransactWriteItem,
} from '@aws-sdk/client-dynamodb';

import type { EventStore, EventStoreEventsDetails } from '@castore/core';

import { DynamoDbEventStorageAdapter } from '../adapter';

export interface EventTransaction {
  transactItem: TransactWriteItem;
  dynamoDbClient: DynamoDBClient;
}

export const formatEventForTransaction = <EVENT_STORE extends EventStore>(
  eventStore: EVENT_STORE,
  eventDetail: EventStoreEventsDetails<EVENT_STORE>,
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
