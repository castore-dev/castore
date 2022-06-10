import { EVENT_TABLE_PK, EVENT_TABLE_SK } from './eventTableKeys';
import { DynamoDBKeyType } from './keyType';

const { HASH, RANGE } = DynamoDBKeyType;

export const UserEventsTable = {
  Type: 'AWS::DynamoDB::Table',
  Properties: {
    AttributeDefinitions: [
      { AttributeName: EVENT_TABLE_PK, AttributeType: 'S' },
      { AttributeName: EVENT_TABLE_SK, AttributeType: 'N' },
    ],
    KeySchema: [
      { AttributeName: EVENT_TABLE_PK, KeyType: HASH },
      { AttributeName: EVENT_TABLE_SK, KeyType: RANGE },
    ],
    BillingMode: 'PAY_PER_REQUEST',
    StreamSpecification: {
      StreamViewType: 'NEW_IMAGE',
    },
  },
};
