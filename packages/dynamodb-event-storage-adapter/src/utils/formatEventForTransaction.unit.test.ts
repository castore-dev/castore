import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';

import { counterEventStore } from '@castore/demo-blueprint';

import { EventStoreEventsDetails } from '~/../../core/dist/types';

import { DynamoDbEventStorageAdapter } from '../dynamoDb';
import { formatEventForTransaction } from './formatEventForTransaction';

const eventMock: EventStoreEventsDetails<typeof counterEventStore> = {
  aggregateId: '123',
  version: 1,
  timestamp: '2022',
  type: 'COUNTER_CREATED',
  payload: {
    userId: 'someUserId',
  },
};

describe('formatEventForTransaction', () => {
  const dynamoDbClientMock = mockClient(DynamoDBClient);

  const storageAdapter = new DynamoDbEventStorageAdapter({
    tableName: 'tableNameMock',
    dynamoDbClient: dynamoDbClientMock as unknown as DynamoDBClient,
  });

  counterEventStore.storageAdapter = storageAdapter;

  it('returns expected grouped event', () => {
    expect(
      formatEventForTransaction(counterEventStore, eventMock),
    ).toStrictEqual({
      dynamoDbClient: dynamoDbClientMock,
      transactItem: {
        Put: storageAdapter.getPushEventInput(eventMock),
      },
    });
  });

  it('throws if storage adapter is not an instance of DynamoDBEventStorageAdapter', () => {
    counterEventStore.storageAdapter = undefined;

    expect(() =>
      formatEventForTransaction(counterEventStore, eventMock),
    ).toThrow(
      `The event storage adapter of event store ${counterEventStore.eventStoreId} is not an instance of DynamoDbEventStorageAdapter and cannot use pushEventTransaction`,
    );
  });
});
