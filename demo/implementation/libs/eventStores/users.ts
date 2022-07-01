import { userEventStore as $userEventStore } from '@castore/demo-blueprint';
import { DynamoDbEventStorageAdapter } from '@castore/dynamodb-event-storage-adapter';

export const userEventStore = $userEventStore;

userEventStore.storageAdapter = new DynamoDbEventStorageAdapter({
  entityName: 'user_event',
  tableName: process.env.USER_EVENTS_TABLE_NAME as string,
});
