import { trainersEventStore as $trainersEventStore } from '@castore/demo-blueprint';
import { DynamoDbEventStorageAdapter } from '@castore/dynamodb-event-storage-adapter';

import { dynamoDbClient } from './client';

export const trainersEventStore = $trainersEventStore;

trainersEventStore.storageAdapter = new DynamoDbEventStorageAdapter({
  tableName: process.env.TRAINER_EVENTS_TABLE_NAME as string,
  dynamoDbClient,
});
