/* eslint-disable max-lines */
import {
  DynamoDBClient,
  PutItemCommand,
  QueryCommand,
  QueryCommandOutput,
} from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import omit from 'lodash.omit';
import MockDate from 'mockdate';

import { DynamoDbEventStorageAdapter } from './adapter';
import {
  EVENT_TABLE_PK,
  EVENT_TABLE_SK,
  EVENT_TABLE_IS_INITIAL_EVENT_KEY,
  EVENT_TABLE_INITIAL_EVENT_INDEX_NAME,
  EVENT_TABLE_TIMESTAMP_KEY,
  MARSHALL_OPTIONS,
} from './constants';

const dynamoDbClientMock = mockClient(DynamoDBClient);

const timestampA = '2022-01-01T00:00:00.000Z';
const timestampB = '2023-01-01T00:00:00.000Z';
const timestampC = '2024-01-01T00:00:00.000Z';

const dynamoDbTableName = 'my-table-name';
const eventStoreId = 'my-event-store';
const aggregateId = 'my-aggregate-id';

const initialEvent = {
  aggregateId,
  version: 1,
  type: 'event-type-1',
  timestamp: timestampA,
};

const secondEvent = {
  aggregateId,
  version: 2,
  type: 'event-type-2',
  timestamp: timestampB,
};

describe('DynamoDbEventStorageAdapter', () => {
  beforeEach(() => {
    dynamoDbClientMock.reset();
    dynamoDbClientMock.on(PutItemCommand).resolves({});
    dynamoDbClientMock.on(QueryCommand).resolves({});
  });

  const adapter = new DynamoDbEventStorageAdapter({
    tableName: dynamoDbTableName,
    dynamoDbClient: dynamoDbClientMock as unknown as DynamoDBClient,
  });

  describe('push event', () => {
    it('sends a correct PutItemCommand to dynamoDbClient to push new event', async () => {
      await adapter.pushEvent(secondEvent, { eventStoreId });

      // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
      // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
      expect(dynamoDbClientMock.calls()).toHaveLength(1);
      expect(dynamoDbClientMock.call(0).args[0].input).toStrictEqual({
        ConditionExpression: 'attribute_not_exists(#version)',
        ExpressionAttributeNames: { '#version': EVENT_TABLE_SK },
        Item: marshall(secondEvent, MARSHALL_OPTIONS),
        TableName: dynamoDbTableName,
      });
    });

    it('sends a correct PutItemCommand to dynamoDbClient to push new initial event', async () => {
      await adapter.pushEvent(initialEvent, { eventStoreId });

      // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
      // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
      expect(dynamoDbClientMock.calls()).toHaveLength(1);
      expect(dynamoDbClientMock.call(0).args[0].input).toMatchObject({
        Item: marshall(
          { ...initialEvent, [EVENT_TABLE_IS_INITIAL_EVENT_KEY]: 1 },
          MARSHALL_OPTIONS,
        ),
      });
    });

    it('appends a timestamp if none has been provided', async () => {
      MockDate.set(timestampA);

      await adapter.pushEvent(omit(secondEvent, 'timestamp'), { eventStoreId });

      // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
      // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
      expect(dynamoDbClientMock.call(0).args[0].input).toMatchObject({
        Item: marshall({ timestamp: timestampA }, MARSHALL_OPTIONS),
      });

      MockDate.reset();
    });
  });

  describe('table name getter', () => {
    it('works with event bus name getters', async () => {
      const adapterWithGetter = new DynamoDbEventStorageAdapter({
        tableName: () => dynamoDbTableName,
        dynamoDbClient: dynamoDbClientMock as unknown as DynamoDBClient,
      });

      await adapterWithGetter.pushEvent(initialEvent, { eventStoreId });

      // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
      // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
      expect(dynamoDbClientMock.calls()).toHaveLength(1);
    });
  });

  describe('get events', () => {
    it('sends a correct QueryCommand to dynamoDbClient to get aggregate events', async () => {
      const queryCommandOutputMock: QueryCommandOutput = {
        Items: [
          marshall(initialEvent, MARSHALL_OPTIONS),
          marshall(secondEvent, MARSHALL_OPTIONS),
        ],
        $metadata: {},
      };

      dynamoDbClientMock.on(QueryCommand).resolves(queryCommandOutputMock);

      const { events } = await adapter.getEvents(aggregateId, { eventStoreId });

      // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
      // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
      expect(dynamoDbClientMock.calls()).toHaveLength(1);
      expect(dynamoDbClientMock.call(0).args[0].input).toStrictEqual({
        ConsistentRead: true,
        ExpressionAttributeNames: { '#aggregateId': EVENT_TABLE_PK },
        ExpressionAttributeValues: marshall(
          { ':aggregateId': aggregateId },
          MARSHALL_OPTIONS,
        ),
        KeyConditionExpression: '#aggregateId = :aggregateId',
        TableName: dynamoDbTableName,
      });

      // We have to serialize / deserialize because DynamoDB numbers are not regular numbers
      expect(JSON.parse(JSON.stringify(events))).toMatchObject([
        initialEvent,
        secondEvent,
      ]);
    });

    it('repeats queries if it is paginated', async () => {
      const lastEvaluatedKey = marshall(initialEvent, MARSHALL_OPTIONS);

      const firstQueryCommandOutputMock: QueryCommandOutput = {
        Items: [marshall(initialEvent, MARSHALL_OPTIONS)],
        $metadata: {},
        LastEvaluatedKey: lastEvaluatedKey,
      };
      const secondQueryCommandOutputMock: QueryCommandOutput = {
        Items: [marshall(secondEvent, MARSHALL_OPTIONS)],
        $metadata: {},
      };

      dynamoDbClientMock
        .on(QueryCommand)
        .resolvesOnce(firstQueryCommandOutputMock)
        .resolvesOnce(secondQueryCommandOutputMock);

      const { events } = await adapter.getEvents(aggregateId, { eventStoreId });

      // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
      // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
      expect(dynamoDbClientMock.calls()).toHaveLength(2);
      expect(dynamoDbClientMock.call(1).args[0].input).toMatchObject({
        ExclusiveStartKey: lastEvaluatedKey,
      });

      // We have to serialize / deserialize because DynamoDB numbers are not regular numbers
      expect(JSON.parse(JSON.stringify(events))).toMatchObject([
        initialEvent,
        secondEvent,
      ]);
    });

    it('fetches events in reverse', async () => {
      await adapter.getEvents(aggregateId, { eventStoreId }, { reverse: true });

      // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
      // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
      expect(dynamoDbClientMock.call(0).args[0].input).toMatchObject({
        ScanIndexForward: false,
      });
    });

    it('adds min version', async () => {
      await adapter.getEvents(aggregateId, { eventStoreId }, { minVersion: 3 });

      // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
      // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
      expect(dynamoDbClientMock.call(0).args[0].input).toMatchObject({
        ExpressionAttributeNames: {
          '#aggregateId': EVENT_TABLE_PK,
          '#version': EVENT_TABLE_SK,
        },
        ExpressionAttributeValues: marshall(
          {
            ':aggregateId': aggregateId,
            ':minVersion': 3,
          },
          MARSHALL_OPTIONS,
        ),
        KeyConditionExpression:
          '#aggregateId = :aggregateId and #version >= :minVersion',
      });
    });

    it('adds max version', async () => {
      await adapter.getEvents(aggregateId, { eventStoreId }, { maxVersion: 5 });

      // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
      // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
      expect(dynamoDbClientMock.call(0).args[0].input).toMatchObject({
        ExpressionAttributeNames: {
          '#aggregateId': EVENT_TABLE_PK,
          '#version': EVENT_TABLE_SK,
        },
        ExpressionAttributeValues: marshall(
          {
            ':aggregateId': aggregateId,
            ':maxVersion': 5,
          },
          MARSHALL_OPTIONS,
        ),
        KeyConditionExpression:
          '#aggregateId = :aggregateId and #version <= :maxVersion',
      });
    });

    it('adds min & max versions', async () => {
      await adapter.getEvents(
        aggregateId,
        { eventStoreId },
        { minVersion: 3, maxVersion: 5 },
      );

      // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
      // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
      expect(dynamoDbClientMock.call(0).args[0].input).toMatchObject({
        ExpressionAttributeNames: {
          '#aggregateId': EVENT_TABLE_PK,
          '#version': EVENT_TABLE_SK,
        },
        ExpressionAttributeValues: marshall(
          {
            ':aggregateId': aggregateId,
            ':minVersion': 3,
            ':maxVersion': 5,
          },
          MARSHALL_OPTIONS,
        ),
        KeyConditionExpression:
          '#aggregateId = :aggregateId and #version between :minVersion and :maxVersion',
      });
    });

    it('adds limit', async () => {
      await adapter.getEvents(aggregateId, { eventStoreId }, { limit: 2 });

      // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
      // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
      expect(dynamoDbClientMock.call(0).args[0].input).toMatchObject({
        Limit: 2,
      });
    });
  });

  describe('list aggregate ids', () => {
    const lastEvaluatedKey = marshall(
      {
        aggregateId,
        version: 1,
        isInitialEvent: 1,
        timestamp: timestampA,
      },
      MARSHALL_OPTIONS,
    );

    it('sends a correct QueryCommand to dynamoDbClient to list aggregate ids', async () => {
      const secondAggregateIdMock = 'my-second-aggregate-id';
      const queryCommandOutputMock: QueryCommandOutput = {
        Items: [
          marshall({ aggregateId }),
          marshall({ aggregateId: secondAggregateIdMock }),
        ],
        $metadata: {},
      };

      dynamoDbClientMock.on(QueryCommand).resolves(queryCommandOutputMock);

      const { aggregateIds } = await adapter.listAggregateIds({ eventStoreId });

      // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
      // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
      expect(dynamoDbClientMock.calls()).toHaveLength(1);
      expect(dynamoDbClientMock.call(0).args[0].input).toStrictEqual({
        ExpressionAttributeNames: {
          '#isInitialEvent': EVENT_TABLE_IS_INITIAL_EVENT_KEY,
        },
        ExpressionAttributeValues: marshall({ ':true': 1 }, MARSHALL_OPTIONS),
        IndexName: EVENT_TABLE_INITIAL_EVENT_INDEX_NAME,
        KeyConditionExpression: '#isInitialEvent = :true',
        TableName: dynamoDbTableName,
      });

      // We have to serialize / deserialize because DynamoDB numbers are not regular numbers
      expect(aggregateIds).toMatchObject([aggregateId, secondAggregateIdMock]);
    });

    it('adds limit option', async () => {
      await adapter.listAggregateIds({ eventStoreId }, { limit: 1 });

      // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
      // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
      expect(dynamoDbClientMock.call(0).args[0].input).toMatchObject({
        Limit: 1,
      });
    });

    it('filters aggregate ids with initial event date after timestamp', async () => {
      await adapter.listAggregateIds(
        { eventStoreId },
        { initialEventAfter: timestampA },
      );

      // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
      // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
      expect(dynamoDbClientMock.call(0).args[0].input).toMatchObject({
        ExpressionAttributeNames: {
          '#timestamp': EVENT_TABLE_TIMESTAMP_KEY,
        },
        ExpressionAttributeValues: marshall(
          { ':initialEventAfter': timestampA },
          MARSHALL_OPTIONS,
        ),
        IndexName: EVENT_TABLE_INITIAL_EVENT_INDEX_NAME,
        KeyConditionExpression:
          '#isInitialEvent = :true and #timestamp >= :initialEventAfter',
      });
    });

    it('filters aggregate ids with initial event date before timestamp', async () => {
      await adapter.listAggregateIds(
        { eventStoreId },
        { initialEventBefore: timestampA },
      );

      // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
      // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
      expect(dynamoDbClientMock.call(0).args[0].input).toMatchObject({
        ExpressionAttributeNames: {
          '#timestamp': EVENT_TABLE_TIMESTAMP_KEY,
        },
        ExpressionAttributeValues: marshall(
          { ':initialEventBefore': timestampA },
          MARSHALL_OPTIONS,
        ),
        IndexName: EVENT_TABLE_INITIAL_EVENT_INDEX_NAME,
        KeyConditionExpression:
          '#isInitialEvent = :true and #timestamp <= :initialEventBefore',
      });
    });

    it('filters aggregate ids with initial event date between timestamp', async () => {
      await adapter.listAggregateIds(
        { eventStoreId },
        { initialEventAfter: timestampA, initialEventBefore: timestampB },
      );

      // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
      // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
      expect(dynamoDbClientMock.call(0).args[0].input).toMatchObject({
        ExpressionAttributeNames: {
          '#timestamp': EVENT_TABLE_TIMESTAMP_KEY,
        },
        ExpressionAttributeValues: marshall(
          {
            ':initialEventAfter': timestampA,
            ':initialEventBefore': timestampB,
          },
          MARSHALL_OPTIONS,
        ),
        IndexName: EVENT_TABLE_INITIAL_EVENT_INDEX_NAME,
        KeyConditionExpression:
          '#isInitialEvent = :true and #timestamp between :initialEventAfter and :initialEventBefore',
      });
    });

    it('adds reverse option', async () => {
      await adapter.listAggregateIds({ eventStoreId }, { reverse: true });

      // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
      // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
      expect(dynamoDbClientMock.call(0).args[0].input).toMatchObject({
        ScanIndexForward: false,
      });
    });

    it('returns a nextPageToken if query has LastEvaluatedKey', async () => {
      const queryCommandOutputMock: QueryCommandOutput = {
        Items: [marshall({ aggregateId }, MARSHALL_OPTIONS)],
        LastEvaluatedKey: lastEvaluatedKey,
        $metadata: {},
      };

      dynamoDbClientMock.on(QueryCommand).resolves(queryCommandOutputMock);

      const { nextPageToken } = await adapter.listAggregateIds(
        { eventStoreId },
        {
          limit: 1,
          initialEventAfter: timestampA,
          initialEventBefore: timestampB,
          reverse: true,
        },
      );

      expect(JSON.parse(nextPageToken as string)).toStrictEqual({
        limit: 1,
        initialEventAfter: timestampA,
        initialEventBefore: timestampB,
        reverse: true,
        lastEvaluatedKey,
      });
    });

    it('applies next page token in the query', async () => {
      await adapter.listAggregateIds(
        { eventStoreId },
        {
          pageToken: JSON.stringify({
            limit: 1,
            initialEventAfter: timestampA,
            initialEventBefore: timestampB,
            reverse: true,
            lastEvaluatedKey,
          }),
        },
      );

      // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
      // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
      expect(dynamoDbClientMock.call(0).args[0].input).toMatchObject({
        Limit: 1,
        ScanIndexForward: false,
        ExclusiveStartKey: lastEvaluatedKey,
        ExpressionAttributeNames: {
          '#timestamp': EVENT_TABLE_TIMESTAMP_KEY,
        },
        ExpressionAttributeValues: marshall(
          {
            ':initialEventAfter': timestampA,
            ':initialEventBefore': timestampB,
          },
          MARSHALL_OPTIONS,
        ),
        KeyConditionExpression:
          '#isInitialEvent = :true and #timestamp between :initialEventAfter and :initialEventBefore',
      });
    });

    it('uses the input limit even if the page token has an embedded limit', async () => {
      await adapter.listAggregateIds(
        { eventStoreId },
        {
          limit: 2,
          initialEventAfter: timestampB,
          initialEventBefore: timestampC,
          reverse: false,
          pageToken: JSON.stringify({
            limit: 1,
            initialEventAfter: timestampA,
            initialEventBefore: timestampB,
            reverse: true,
            lastEvaluatedKey,
          }),
        },
      );

      // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
      // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
      expect(dynamoDbClientMock.call(0).args[0].input).toMatchObject({
        Limit: 2,
        ScanIndexForward: true,
        ExclusiveStartKey: lastEvaluatedKey,
        ExpressionAttributeNames: {
          '#timestamp': EVENT_TABLE_TIMESTAMP_KEY,
        },
        ExpressionAttributeValues: marshall(
          {
            ':initialEventAfter': timestampB,
            ':initialEventBefore': timestampC,
          },
          MARSHALL_OPTIONS,
        ),
        KeyConditionExpression:
          '#isInitialEvent = :true and #timestamp between :initialEventAfter and :initialEventBefore',
      });
    });
  });
});
