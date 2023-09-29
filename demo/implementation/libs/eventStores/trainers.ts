import { trainersEventStore as $trainersEventStore } from '@castore/demo-blueprint';
import { LegacyDynamoDBEventStorageAdapter } from '@castore/event-storage-adapter-dynamodb';

import { dynamoDBClient } from './client';

export const trainersEventStore = $trainersEventStore;

trainersEventStore.eventStorageAdapter = new LegacyDynamoDBEventStorageAdapter({
  tableName: process.env.TRAINER_EVENTS_TABLE_NAME as string,
  dynamoDBClient,
});
