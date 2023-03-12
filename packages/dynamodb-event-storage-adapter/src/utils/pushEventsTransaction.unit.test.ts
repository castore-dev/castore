import {
  DynamoDBClient,
  TransactWriteItemsCommand,
} from '@aws-sdk/client-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';

import type { EventStoreEventsDetails } from '@castore/core';
import { counterEventStore, userEventStore } from '@castore/demo-blueprint';

import { DynamoDbEventStorageAdapter } from '../adapter';
import { formatEventForTransaction } from './formatEventForTransaction';
import { pushEventsTransaction } from './pushEventsTransaction';

const counterEventMock: EventStoreEventsDetails<typeof counterEventStore> = {
  aggregateId: '123',
  version: 1,
  timestamp: '2022',
  type: 'COUNTER_CREATED',
  payload: {
    userId: 'someUserId',
  },
};

const userEventMock: EventStoreEventsDetails<typeof userEventStore> = {
  aggregateId: '123',
  version: 1,
  timestamp: '2022',
  type: 'USER_CREATED',
  payload: {
    firstName: 'John',
    lastName: 'Dow',
  },
};

describe('pushEventsTransaction', () => {
  const dynamoDbClientMockSeemless = mockClient(DynamoDBClient);
  const dynamoDbClientMockOption = mockClient(DynamoDBClient);

  const counterStorageAdapter = new DynamoDbEventStorageAdapter({
    tableName: 'counterTableNameMock',
    dynamoDbClient: dynamoDbClientMockSeemless as unknown as DynamoDBClient,
  });

  const userStorageAdapter = new DynamoDbEventStorageAdapter({
    tableName: 'userTableNameMock',
    dynamoDbClient: dynamoDbClientMockSeemless as unknown as DynamoDBClient,
  });

  counterEventStore.storageAdapter = counterStorageAdapter;
  userEventStore.storageAdapter = userStorageAdapter;

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
      formatEventForTransaction(counterEventStore, counterEventMock),
      formatEventForTransaction(userEventStore, userEventMock),
    ]);

    expect(dynamoDbClientMockSeemless.calls()).toHaveLength(1);
    expect(dynamoDbClientMockSeemless.calls()[0].args[0]).toBeInstanceOf(
      TransactWriteItemsCommand,
    );
    expect(dynamoDbClientMockSeemless.calls()[0].args[0].input).toStrictEqual({
      TransactItems: [
        formatEventForTransaction(counterEventStore, counterEventMock)
          .transactItem,
        formatEventForTransaction(userEventStore, userEventMock).transactItem,
      ],
    });

    expect(dynamoDbClientMockOption.calls()).toHaveLength(0);
  });

  it('uses options dynamoDbClient if one has been provided', async () => {
    await pushEventsTransaction(
      [
        formatEventForTransaction(counterEventStore, counterEventMock),
        formatEventForTransaction(userEventStore, userEventMock),
      ],
      { dynamoDbClient: dynamoDbClientMockOption as unknown as DynamoDBClient },
    );

    expect(dynamoDbClientMockSeemless.calls()).toHaveLength(0);

    expect(dynamoDbClientMockOption.calls()).toHaveLength(1);
    expect(dynamoDbClientMockOption.calls()[0].args[0]).toBeInstanceOf(
      TransactWriteItemsCommand,
    );
    expect(dynamoDbClientMockOption.calls()[0].args[0].input).toStrictEqual({
      TransactItems: [
        formatEventForTransaction(counterEventStore, counterEventMock)
          .transactItem,
        formatEventForTransaction(userEventStore, userEventMock).transactItem,
      ],
    });
  });
});
