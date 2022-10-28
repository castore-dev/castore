import {
  DynamoDBClient,
  TransactWriteItemsCommand,
  TransactWriteItemsCommandOutput,
} from '@aws-sdk/client-dynamodb';

import type { EventTransaction } from './formatEventForTransaction';

export const pushEventsTransaction = async (
  eventsTransaction: [EventTransaction, ...EventTransaction[]],
  options: { dynamoDbClient?: DynamoDBClient } = {},
): Promise<TransactWriteItemsCommandOutput> => {
  if (eventsTransaction.length === 0) {
    throw new Error('No event to push');
  }

  const dynamodbClient =
    options.dynamoDbClient ?? eventsTransaction[0].dynamoDbClient;

  /**
   * @debt bug "TODO: ensure that pushEventsTransaction throws an EventAlreadyExists error if transaction fails"
   */
  return dynamodbClient.send(
    new TransactWriteItemsCommand({
      TransactItems: eventsTransaction.map(({ transactItem }) => transactItem),
    }),
  );
};
