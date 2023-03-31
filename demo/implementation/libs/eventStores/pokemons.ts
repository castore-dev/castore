import { pokemonsEventStore as $pokemonsEventStore } from '@castore/demo-blueprint';
import { DynamoDbEventStorageAdapter } from '@castore/dynamodb-event-storage-adapter';

import { dynamoDbClient } from './client';

export const pokemonsEventStore = $pokemonsEventStore;

pokemonsEventStore.storageAdapter = new DynamoDbEventStorageAdapter({
  tableName: process.env.POKEMON_EVENTS_TABLE_NAME as string,
  dynamoDbClient,
});
