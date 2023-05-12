import {
  DynamoDBClient,
  TransactWriteItemsCommand,
} from '@aws-sdk/client-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';

import {
  ashPokemonCatchedEvent,
  pikachuCatchedEvent,
  pokemonsEventStore,
  trainersEventStore,
} from '@castore/demo-blueprint';

import { DynamoDbEventStorageAdapter } from '../adapter';
import { formatEventForTransaction } from './formatEventForTransaction';
import { pushEventsTransaction } from './pushEventsTransaction';

describe('pushEventsTransaction', () => {
  const dynamoDbClientMockSeemless = mockClient(DynamoDBClient);
  const dynamoDbClientMockOption = mockClient(DynamoDBClient);

  const pokemonsStorageAdapter = new DynamoDbEventStorageAdapter({
    tableName: 'pokemonsTableNameMock',
    dynamoDbClient: dynamoDbClientMockSeemless as unknown as DynamoDBClient,
  });

  const trainersStorageAdapter = new DynamoDbEventStorageAdapter({
    tableName: 'trainersTableNameMock',
    dynamoDbClient: dynamoDbClientMockSeemless as unknown as DynamoDBClient,
  });

  pokemonsEventStore.storageAdapter = pokemonsStorageAdapter;
  trainersEventStore.storageAdapter = trainersStorageAdapter;

  beforeEach(() => {
    dynamoDbClientMockSeemless.reset();
    dynamoDbClientMockOption.reset();
  });

  it('throws if no transaction has been inputted', async () => {
    // @ts-expect-error pushEventsTransaction expects at least 1 item
    await expect(pushEventsTransaction([])).rejects.toThrow('No event to push');
  });

  it('sends correct command', async () => {
    await pushEventsTransaction([
      formatEventForTransaction(pokemonsEventStore, pikachuCatchedEvent),
      formatEventForTransaction(trainersEventStore, ashPokemonCatchedEvent),
    ]);

    expect(dynamoDbClientMockSeemless.calls()).toHaveLength(1);
    expect(dynamoDbClientMockSeemless.calls()[0]?.args[0]).toBeInstanceOf(
      TransactWriteItemsCommand,
    );
    expect(dynamoDbClientMockSeemless.calls()[0]?.args[0].input).toStrictEqual({
      TransactItems: [
        formatEventForTransaction(pokemonsEventStore, pikachuCatchedEvent)
          .transactItem,
        formatEventForTransaction(trainersEventStore, ashPokemonCatchedEvent)
          .transactItem,
      ],
    });

    expect(dynamoDbClientMockOption.calls()).toHaveLength(0);
  });

  it('uses options dynamoDbClient if one has been provided', async () => {
    await pushEventsTransaction(
      [
        formatEventForTransaction(pokemonsEventStore, pikachuCatchedEvent),
        formatEventForTransaction(trainersEventStore, ashPokemonCatchedEvent),
      ],
      { dynamoDbClient: dynamoDbClientMockOption as unknown as DynamoDBClient },
    );

    expect(dynamoDbClientMockSeemless.calls()).toHaveLength(0);

    expect(dynamoDbClientMockOption.calls()).toHaveLength(1);
    expect(dynamoDbClientMockOption.calls()[0]?.args[0]).toBeInstanceOf(
      TransactWriteItemsCommand,
    );
    expect(dynamoDbClientMockOption.calls()[0]?.args[0].input).toStrictEqual({
      TransactItems: [
        formatEventForTransaction(pokemonsEventStore, pikachuCatchedEvent)
          .transactItem,
        formatEventForTransaction(trainersEventStore, ashPokemonCatchedEvent)
          .transactItem,
      ],
    });
  });
});
