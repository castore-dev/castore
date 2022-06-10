import { counterEventStore as $counterEventStore } from '@castore/demo-blueprint';
import { DynamoDbStorageAdapter } from '@castore/event-store';

export const counterEventStore = $counterEventStore;

counterEventStore.storageAdapter = new DynamoDbStorageAdapter({
  entityName: 'counter_event',
  tableName: process.env.COUNTER_EVENTS_TABLE_NAME as string,
});
