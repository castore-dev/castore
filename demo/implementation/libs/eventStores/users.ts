import { userEventStore as $userEventStore } from '@castore/demo-blueprint';
import { DynamoDbEventStorageAdapter } from '@castore/dynamodb-event-storage-adapter';

import { dynamoDbClient } from './client';

export const userEventStore = $userEventStore;

userEventStore.storageAdapter = new DynamoDbEventStorageAdapter({
  tableName: process.env.USER_EVENTS_TABLE_NAME as string,
  dynamoDbClient,
});
