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

import {
  EVENT_TABLE_PK,
  EVENT_TABLE_SK,
  EVENT_TABLE_INITIAL_EVENT_INDEX_NAME,
  EVENT_TABLE_TIMESTAMP_KEY,
  EVENT_TABLE_EVENT_STORE_ID_KEY,
  marshallOptions,
} from './constants';
import { DynamoDbSingleTableEventStorageAdapter } from './singleTableAdapter';

const dynamoDbClientMock = mockClient(DynamoDBClient);

const timestampA = '2022-01-01T00:00:00.000Z';
const timestampB = '2023-01-01T00:00:00.000Z';
const timestampC = '2024-01-01T00:00:00.000Z';

const dynamoDbTableName = 'my-table-name';
const eventStoreId = 'my-event-store';
const aggregateId = 'my-aggregate-id';

const prefixAggregateId = (evtStoreId: string, aggrId: string) =>
  `${evtStoreId}#${aggrId}`;

const prefixedAggregateId = prefixAggregateId(eventStoreId, aggregateId);

const initialEvent = {
  aggregateId,
  version: 1,
  type: 'event-type-1',
  timestamp: timestampA,
};
const savedInitialEvent = {
  ...initialEvent,
  aggregateId: prefixedAggregateId,
  [EVENT_TABLE_EVENT_STORE_ID_KEY]: eventStoreId,
};

const secondEvent = {
  aggregateId,
  version: 2,
  type: 'event-type-2',
  timestamp: timestampB,
};
const savedSecondEvent = {
  ...secondEvent,
  aggregateId: prefixedAggregateId,
};

describe('DynamoDbEventStorageAdapter', () => {
  beforeEach(() => {
    dynamoDbClientMock.reset();
    dynamoDbClientMock.on(PutItemCommand).resolves({});
    dynamoDbClientMock.on(QueryCommand).resolves({});
  });

  const adapter = new DynamoDbSingleTableEventStorageAdapter({
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
        Item: marshall(savedSecondEvent, marshallOptions),
        TableName: dynamoDbTableName,
      });
    });

    it('sends a correct PutItemCommand to dynamoDbClient to push new initial event', async () => {
      await adapter.pushEvent(initialEvent, { eventStoreId });

      // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
      // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
      expect(dynamoDbClientMock.calls()).toHaveLength(1);
      expect(dynamoDbClientMock.call(0).args[0].input).toMatchObject({
        Item: marshall(savedInitialEvent, marshallOptions),
      });
    });

    it('appends a timestamp if none has been provided', async () => {
      MockDate.set(timestampA);

      await adapter.pushEvent(omit(secondEvent, 'timestamp'), { eventStoreId });

      // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
      // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
      expect(dynamoDbClientMock.call(0).args[0].input).toMatchObject({
        Item: marshall({ timestamp: timestampA }, marshallOptions),
      });

      MockDate.reset();
    });
  });

  describe('table name getter', () => {
    it('works with event bus name getters', async () => {
      const adapterWithGetter = new DynamoDbSingleTableEventStorageAdapter({
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
          marshall(savedInitialEvent, marshallOptions),
          marshall(savedSecondEvent, marshallOptions),
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
          { ':aggregateId': prefixedAggregateId },
          marshallOptions,
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
      const lastEvaluatedKey = marshall(initialEvent, marshallOptions);

      const firstQueryCommandOutputMock: QueryCommandOutput = {
        Items: [marshall(savedInitialEvent, marshallOptions)],
        $metadata: {},
        LastEvaluatedKey: lastEvaluatedKey,
      };
      const secondQueryCommandOutputMock: QueryCommandOutput = {
        Items: [marshall(savedSecondEvent, marshallOptions)],
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
        ExpressionAttributeNames: { '#version': EVENT_TABLE_SK },
        ExpressionAttributeValues: marshall(
          { ':minVersion': 3 },
          marshallOptions,
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
        ExpressionAttributeNames: { '#version': EVENT_TABLE_SK },
        ExpressionAttributeValues: marshall(
          { ':maxVersion': 5 },
          marshallOptions,
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
        ExpressionAttributeNames: { '#version': EVENT_TABLE_SK },
        ExpressionAttributeValues: marshall(
          { ':minVersion': 3, ':maxVersion': 5 },
          marshallOptions,
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
        aggregateId: prefixedAggregateId,
        version: 1,
        eventStoreId,
        timestamp: timestampA,
      },
      marshallOptions,
    );

    it('sends a correct QueryCommand to dynamoDbClient to list aggregate ids', async () => {
      const secondAggregateIdMock = 'my-second-aggregate-id';
      const queryCommandOutputMock: QueryCommandOutput = {
        Items: [
          marshall({ aggregateId: prefixedAggregateId }),
          marshall({
            aggregateId: prefixAggregateId(eventStoreId, secondAggregateIdMock),
          }),
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
          '#eventStoreId': EVENT_TABLE_EVENT_STORE_ID_KEY,
        },
        ExpressionAttributeValues: marshall(
          { ':eventStoreId': eventStoreId },
          marshallOptions,
        ),
        IndexName: EVENT_TABLE_INITIAL_EVENT_INDEX_NAME,
        KeyConditionExpression: '#eventStoreId = :eventStoreId',
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
          marshallOptions,
        ),
        IndexName: EVENT_TABLE_INITIAL_EVENT_INDEX_NAME,
        KeyConditionExpression:
          '#eventStoreId = :eventStoreId and #timestamp >= :initialEventAfter',
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
          marshallOptions,
        ),
        IndexName: EVENT_TABLE_INITIAL_EVENT_INDEX_NAME,
        KeyConditionExpression:
          '#eventStoreId = :eventStoreId and #timestamp <= :initialEventBefore',
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
          marshallOptions,
        ),
        IndexName: EVENT_TABLE_INITIAL_EVENT_INDEX_NAME,
        KeyConditionExpression:
          '#eventStoreId = :eventStoreId and #timestamp between :initialEventAfter and :initialEventBefore',
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
        Items: [
          marshall({ aggregateId: prefixedAggregateId }, marshallOptions),
        ],
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
          marshallOptions,
        ),
        KeyConditionExpression:
          '#eventStoreId = :eventStoreId and #timestamp between :initialEventAfter and :initialEventBefore',
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
          marshallOptions,
        ),
        KeyConditionExpression:
          '#eventStoreId = :eventStoreId and #timestamp between :initialEventAfter and :initialEventBefore',
      });
    });
  });
});
