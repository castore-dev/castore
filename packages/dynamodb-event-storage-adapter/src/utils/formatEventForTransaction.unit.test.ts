import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';

import {
  pokemonsEventStore,
  pikachuAppearedEvent,
} from '@castore/demo-blueprint';

import { DynamoDbEventStorageAdapter } from '../adapter';
import { formatEventForTransaction } from './formatEventForTransaction';

describe('formatEventForTransaction', () => {
  const dynamoDbClientMock = mockClient(DynamoDBClient);

  const storageAdapter = new DynamoDbEventStorageAdapter({
    tableName: 'tableNameMock',
    dynamoDbClient: dynamoDbClientMock as unknown as DynamoDBClient,
  });

  pokemonsEventStore.storageAdapter = storageAdapter;

  it('returns expected grouped event', () => {
    expect(
      formatEventForTransaction(pokemonsEventStore, pikachuAppearedEvent),
    ).toStrictEqual({
      dynamoDbClient: dynamoDbClientMock,
      transactItem: {
        Put: storageAdapter.getPushEventInput(pikachuAppearedEvent, {
          eventStoreId: pokemonsEventStore.eventStoreId,
        }),
      },
    });
  });

  it('throws if storage adapter is not an instance of DynamoDBEventStorageAdapter', () => {
    pokemonsEventStore.storageAdapter = undefined;

    expect(() =>
      formatEventForTransaction(pokemonsEventStore, pikachuAppearedEvent),
    ).toThrow(
      `The event storage adapter of event store ${pokemonsEventStore.eventStoreId} is not an instance of DynamoDbEventStorageAdapter and cannot use pushEventTransaction`,
    );
  });
});
