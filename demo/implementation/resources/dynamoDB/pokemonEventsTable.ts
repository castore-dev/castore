import {
  EVENT_TABLE_INITIAL_EVENT_INDEX_NAME,
  EVENT_TABLE_IS_INITIAL_EVENT_KEY,
  EVENT_TABLE_PK,
  EVENT_TABLE_SK,
  EVENT_TABLE_TIMESTAMP_KEY,
} from '@castore/event-storage-adapter-dynamodb';

import { DynamoDBKeyType } from './keyType';

const { HASH, RANGE } = DynamoDBKeyType;

export const PokemonEventsTable = {
  Type: 'AWS::DynamoDB::Table',
  Properties: {
    AttributeDefinitions: [
      { AttributeName: EVENT_TABLE_PK, AttributeType: 'S' },
      { AttributeName: EVENT_TABLE_SK, AttributeType: 'N' },
      { AttributeName: EVENT_TABLE_TIMESTAMP_KEY, AttributeType: 'S' },
      { AttributeName: EVENT_TABLE_IS_INITIAL_EVENT_KEY, AttributeType: 'N' },
    ],
    KeySchema: [
      { AttributeName: EVENT_TABLE_PK, KeyType: HASH },
      { AttributeName: EVENT_TABLE_SK, KeyType: RANGE },
    ],
    BillingMode: 'PAY_PER_REQUEST',
    StreamSpecification: {
      StreamViewType: 'NEW_IMAGE',
    },
    GlobalSecondaryIndexes: [
      {
        IndexName: EVENT_TABLE_INITIAL_EVENT_INDEX_NAME,
        KeySchema: [
          { AttributeName: EVENT_TABLE_IS_INITIAL_EVENT_KEY, KeyType: HASH },
          { AttributeName: EVENT_TABLE_TIMESTAMP_KEY, KeyType: RANGE },
        ],
        Projection: {
          ProjectionType: 'KEYS_ONLY',
        },
      },
    ],
  },
};
