import { pokemonsEventStore as $pokemonsEventStore } from '@castore/demo-blueprint';
import { LegacyDynamoDBEventStorageAdapter } from '@castore/event-storage-adapter-dynamodb';

import { dynamoDBClient } from './client';

export const pokemonsEventStore = $pokemonsEventStore;

pokemonsEventStore.eventStorageAdapter = new LegacyDynamoDBEventStorageAdapter({
  tableName: process.env.POKEMON_EVENTS_TABLE_NAME as string,

  dynamoDBClient,
});
