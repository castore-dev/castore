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
  MARSHALL_OPTIONS,
} from './constants';
import { DynamoDBSingleTableEventStorageAdapter } from './singleTableAdapter';

const dynamoDBClientMock = mockClient(DynamoDBClient);

const timestampA = '2022-01-01T00:00:00.000Z';
const timestampB = '2023-01-01T00:00:00.000Z';
const timestampC = '2024-01-01T00:00:00.000Z';

const dynamoDBTableName = 'my-table-name';
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

describe('DynamoDBEventStorageAdapter', () => {
  beforeEach(() => {
    dynamoDBClientMock.reset();
    dynamoDBClientMock.on(PutItemCommand).resolves({});
    dynamoDBClientMock.on(QueryCommand).resolves({});
  });

  const adapter = new DynamoDBSingleTableEventStorageAdapter({
    tableName: dynamoDBTableName,
    dynamoDBClient: dynamoDBClientMock as unknown as DynamoDBClient,
  });

  describe('push event', () => {
    it('sends a correct PutItemCommand to dynamoDBClient to push new event', async () => {
      await adapter.pushEvent(secondEvent, { eventStoreId });

      // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
      // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
      expect(dynamoDBClientMock.calls()).toHaveLength(1);
      expect(dynamoDBClientMock.call(0).args[0].input).toStrictEqual({
        ConditionExpression: 'attribute_not_exists(#version)',
        ExpressionAttributeNames: { '#version': EVENT_TABLE_SK },
        Item: marshall(savedSecondEvent, MARSHALL_OPTIONS),
        TableName: dynamoDBTableName,
      });
    });

    it('sends a correct PutItemCommand to dynamoDBClient to push new initial event', async () => {
      await adapter.pushEvent(initialEvent, { eventStoreId });

      // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
      // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
      expect(dynamoDBClientMock.calls()).toHaveLength(1);
      expect(dynamoDBClientMock.call(0).args[0].input).toMatchObject({
        Item: marshall(savedInitialEvent, MARSHALL_OPTIONS),
      });
    });

    it('appends a timestamp if none has been provided', async () => {
      MockDate.set(timestampA);

      await adapter.pushEvent(omit(secondEvent, 'timestamp'), { eventStoreId });

      // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
      // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
      expect(dynamoDBClientMock.call(0).args[0].input).toMatchObject({
        Item: marshall({ timestamp: timestampA }, MARSHALL_OPTIONS),
      });

      MockDate.reset();
    });

    it('does not add condition if force option is set to true', async () => {
      await adapter.pushEvent(secondEvent, { eventStoreId, force: true });

      // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
      // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
      expect(dynamoDBClientMock.calls()).toHaveLength(1);
      const input = dynamoDBClientMock.call(0).args[0].input;
      expect(input).not.toHaveProperty('ConditionExpression');
      expect(input).not.toHaveProperty('ExpressionAttributeNames');
    });
  });

  describe('table name getter', () => {
    it('works with event bus name getters', async () => {
      const adapterWithGetter = new DynamoDBSingleTableEventStorageAdapter({
        tableName: () => dynamoDBTableName,
        dynamoDBClient: dynamoDBClientMock as unknown as DynamoDBClient,
      });

      await adapterWithGetter.pushEvent(initialEvent, { eventStoreId });

      // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
      // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
      expect(dynamoDBClientMock.calls()).toHaveLength(1);
    });
  });

  describe('get events', () => {
    it('sends a correct QueryCommand to dynamoDBClient to get aggregate events', async () => {
      const queryCommandOutputMock: QueryCommandOutput = {
        Items: [
          marshall(savedInitialEvent, MARSHALL_OPTIONS),
          marshall(savedSecondEvent, MARSHALL_OPTIONS),
        ],
        $metadata: {},
      };

      dynamoDBClientMock.on(QueryCommand).resolves(queryCommandOutputMock);

      const { events } = await adapter.getEvents(aggregateId, { eventStoreId });

      // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
      // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
      expect(dynamoDBClientMock.calls()).toHaveLength(1);
      expect(dynamoDBClientMock.call(0).args[0].input).toStrictEqual({
        ConsistentRead: true,
        ExpressionAttributeNames: { '#aggregateId': EVENT_TABLE_PK },
        ExpressionAttributeValues: marshall(
          { ':aggregateId': prefixedAggregateId },
          MARSHALL_OPTIONS,
        ),
        KeyConditionExpression: '#aggregateId = :aggregateId',
        TableName: dynamoDBTableName,
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
        Items: [marshall(savedInitialEvent, MARSHALL_OPTIONS)],
        $metadata: {},
        LastEvaluatedKey: lastEvaluatedKey,
      };
      const secondQueryCommandOutputMock: QueryCommandOutput = {
        Items: [marshall(savedSecondEvent, MARSHALL_OPTIONS)],
        $metadata: {},
      };

      dynamoDBClientMock
        .on(QueryCommand)
        .resolvesOnce(firstQueryCommandOutputMock)
        .resolvesOnce(secondQueryCommandOutputMock);

      const { events } = await adapter.getEvents(aggregateId, { eventStoreId });

      // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
      // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
      expect(dynamoDBClientMock.calls()).toHaveLength(2);
      expect(dynamoDBClientMock.call(1).args[0].input).toMatchObject({
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
      expect(dynamoDBClientMock.call(0).args[0].input).toMatchObject({
        ScanIndexForward: false,
      });
    });

    it('adds min version', async () => {
      await adapter.getEvents(aggregateId, { eventStoreId }, { minVersion: 3 });

      // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
      // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
      expect(dynamoDBClientMock.call(0).args[0].input).toMatchObject({
        ExpressionAttributeNames: { '#version': EVENT_TABLE_SK },
        ExpressionAttributeValues: marshall(
          { ':minVersion': 3 },
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
      expect(dynamoDBClientMock.call(0).args[0].input).toMatchObject({
        ExpressionAttributeNames: { '#version': EVENT_TABLE_SK },
        ExpressionAttributeValues: marshall(
          { ':maxVersion': 5 },
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
      expect(dynamoDBClientMock.call(0).args[0].input).toMatchObject({
        ExpressionAttributeNames: { '#version': EVENT_TABLE_SK },
        ExpressionAttributeValues: marshall(
          { ':minVersion': 3, ':maxVersion': 5 },
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
      expect(dynamoDBClientMock.call(0).args[0].input).toMatchObject({
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
      MARSHALL_OPTIONS,
    );

    it('sends a correct QueryCommand to dynamoDBClient to list aggregate ids', async () => {
      const secondAggregateIdMock = 'my-second-aggregate-id';
      const queryCommandOutputMock: QueryCommandOutput = {
        Items: [
          marshall({ aggregateId: prefixedAggregateId, timestamp: timestampA }),
          marshall({
            aggregateId: prefixAggregateId(eventStoreId, secondAggregateIdMock),
            timestamp: timestampB,
          }),
        ],
        $metadata: {},
      };

      dynamoDBClientMock.on(QueryCommand).resolves(queryCommandOutputMock);

      const { aggregateIds } = await adapter.listAggregateIds({ eventStoreId });

      // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
      // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
      expect(dynamoDBClientMock.calls()).toHaveLength(1);
      expect(dynamoDBClientMock.call(0).args[0].input).toStrictEqual({
        ExpressionAttributeNames: {
          '#eventStoreId': EVENT_TABLE_EVENT_STORE_ID_KEY,
        },
        ExpressionAttributeValues: marshall(
          { ':eventStoreId': eventStoreId },
          MARSHALL_OPTIONS,
        ),
        IndexName: EVENT_TABLE_INITIAL_EVENT_INDEX_NAME,
        KeyConditionExpression: '#eventStoreId = :eventStoreId',
        TableName: dynamoDBTableName,
      });

      // We have to serialize / deserialize because DynamoDB numbers are not regular numbers
      expect(aggregateIds).toMatchObject([
        { aggregateId, initialEventTimestamp: timestampA },
        {
          aggregateId: secondAggregateIdMock,
          initialEventTimestamp: timestampB,
        },
      ]);
    });

    it('adds limit option', async () => {
      await adapter.listAggregateIds({ eventStoreId }, { limit: 1 });

      // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
      // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
      expect(dynamoDBClientMock.call(0).args[0].input).toMatchObject({
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
      expect(dynamoDBClientMock.call(0).args[0].input).toMatchObject({
        ExpressionAttributeNames: {
          '#timestamp': EVENT_TABLE_TIMESTAMP_KEY,
        },
        ExpressionAttributeValues: marshall(
          { ':initialEventAfter': timestampA },
          MARSHALL_OPTIONS,
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
      expect(dynamoDBClientMock.call(0).args[0].input).toMatchObject({
        ExpressionAttributeNames: {
          '#timestamp': EVENT_TABLE_TIMESTAMP_KEY,
        },
        ExpressionAttributeValues: marshall(
          { ':initialEventBefore': timestampA },
          MARSHALL_OPTIONS,
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
      expect(dynamoDBClientMock.call(0).args[0].input).toMatchObject({
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
          '#eventStoreId = :eventStoreId and #timestamp between :initialEventAfter and :initialEventBefore',
      });
    });

    it('adds reverse option', async () => {
      await adapter.listAggregateIds({ eventStoreId }, { reverse: true });

      // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
      // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
      expect(dynamoDBClientMock.call(0).args[0].input).toMatchObject({
        ScanIndexForward: false,
      });
    });

    it('returns a nextPageToken if query has LastEvaluatedKey', async () => {
      const queryCommandOutputMock: QueryCommandOutput = {
        Items: [
          marshall({ aggregateId: prefixedAggregateId }, MARSHALL_OPTIONS),
        ],
        LastEvaluatedKey: lastEvaluatedKey,
        $metadata: {},
      };

      dynamoDBClientMock.on(QueryCommand).resolves(queryCommandOutputMock);

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
      expect(dynamoDBClientMock.call(0).args[0].input).toMatchObject({
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
      expect(dynamoDBClientMock.call(0).args[0].input).toMatchObject({
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
          '#eventStoreId = :eventStoreId and #timestamp between :initialEventAfter and :initialEventBefore',
      });
    });
  });
});

describe('DynamoDBEventStorageAdapter with key and index overrides', () => {
  beforeEach(() => {
    dynamoDBClientMock.reset();
    dynamoDBClientMock.on(PutItemCommand).resolves({});
    dynamoDBClientMock.on(QueryCommand).resolves({});
  });

  const eventTablePk = '_PK';
  const eventTableSk = '_SK';
  const eventTableInitialEventIndexName = '_GSI1';
  const eventTableEventStoreIdKey = '_GSI1_PK';
  const eventTableTimestampKey = '_GSI1_SK';

  const savedSecondEventWithCustomKeys = {
    ...savedSecondEvent,
    [eventTablePk]: savedSecondEvent.aggregateId,
    [eventTableSk]: savedSecondEvent.version,
    [eventTableTimestampKey]: secondEvent.timestamp,
  };

  const adapter = new DynamoDBSingleTableEventStorageAdapter({
    tableName: dynamoDBTableName,
    dynamoDBClient: dynamoDBClientMock as unknown as DynamoDBClient,
    eventTablePk,
    eventTableSk,
    eventTableInitialEventIndexName,
    eventTableEventStoreIdKey,
    eventTableTimestampKey,
  });

  describe('push event', () => {
    it('sends a correct PutItemCommand to dynamoDBClient to push new event', async () => {
      await adapter.pushEvent(secondEvent, { eventStoreId });

      // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
      // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
      expect(dynamoDBClientMock.calls()).toHaveLength(1);
      expect(dynamoDBClientMock.call(0).args[0].input).toStrictEqual({
        ConditionExpression: 'attribute_not_exists(#version)',
        ExpressionAttributeNames: { '#version': eventTableSk },
        Item: marshall(savedSecondEventWithCustomKeys, MARSHALL_OPTIONS),
        TableName: dynamoDBTableName,
      });
    });

    it('sends a correct PutItemCommand to dynamoDBClient to push new initial event', async () => {
      await adapter.pushEvent(initialEvent, { eventStoreId });

      // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
      // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
      expect(dynamoDBClientMock.calls()).toHaveLength(1);
      expect(dynamoDBClientMock.call(0).args[0].input).toMatchObject({
        Item: marshall(savedInitialEvent, MARSHALL_OPTIONS),
      });
    });

    it('appends a timestamp if none has been provided', async () => {
      MockDate.set(timestampA);

      await adapter.pushEvent(omit(secondEvent, 'timestamp'), { eventStoreId });

      // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
      // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
      expect(dynamoDBClientMock.call(0).args[0].input).toMatchObject({
        Item: marshall({ timestamp: timestampA }, MARSHALL_OPTIONS),
      });

      MockDate.reset();
    });

    it('does not add condition if force option is set to true', async () => {
      await adapter.pushEvent(secondEvent, { eventStoreId, force: true });

      // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
      // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
      expect(dynamoDBClientMock.calls()).toHaveLength(1);
      const input = dynamoDBClientMock.call(0).args[0].input;
      expect(input).not.toHaveProperty('ConditionExpression');
      expect(input).not.toHaveProperty('ExpressionAttributeNames');
    });
  });

  describe('table name getter', () => {
    it('works with event bus name getters', async () => {
      const adapterWithGetter = new DynamoDBSingleTableEventStorageAdapter({
        tableName: () => dynamoDBTableName,
        dynamoDBClient: dynamoDBClientMock as unknown as DynamoDBClient,
      });

      await adapterWithGetter.pushEvent(initialEvent, { eventStoreId });

      // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
      // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
      expect(dynamoDBClientMock.calls()).toHaveLength(1);
    });
  });

  describe('get events', () => {
    it('sends a correct QueryCommand to dynamoDBClient to get aggregate events', async () => {
      const queryCommandOutputMock: QueryCommandOutput = {
        Items: [
          marshall(savedInitialEvent, MARSHALL_OPTIONS),
          marshall(savedSecondEvent, MARSHALL_OPTIONS),
        ],
        $metadata: {},
      };

      dynamoDBClientMock.on(QueryCommand).resolves(queryCommandOutputMock);

      const { events } = await adapter.getEvents(aggregateId, { eventStoreId });

      // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
      // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
      expect(dynamoDBClientMock.calls()).toHaveLength(1);
      expect(dynamoDBClientMock.call(0).args[0].input).toStrictEqual({
        ConsistentRead: true,
        ExpressionAttributeNames: { '#aggregateId': eventTablePk },
        ExpressionAttributeValues: marshall(
          { ':aggregateId': prefixedAggregateId },
          MARSHALL_OPTIONS,
        ),
        KeyConditionExpression: '#aggregateId = :aggregateId',
        TableName: dynamoDBTableName,
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
        Items: [marshall(savedInitialEvent, MARSHALL_OPTIONS)],
        $metadata: {},
        LastEvaluatedKey: lastEvaluatedKey,
      };
      const secondQueryCommandOutputMock: QueryCommandOutput = {
        Items: [marshall(savedSecondEvent, MARSHALL_OPTIONS)],
        $metadata: {},
      };

      dynamoDBClientMock
        .on(QueryCommand)
        .resolvesOnce(firstQueryCommandOutputMock)
        .resolvesOnce(secondQueryCommandOutputMock);

      const { events } = await adapter.getEvents(aggregateId, { eventStoreId });

      // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
      // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
      expect(dynamoDBClientMock.calls()).toHaveLength(2);
      expect(dynamoDBClientMock.call(1).args[0].input).toMatchObject({
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
      expect(dynamoDBClientMock.call(0).args[0].input).toMatchObject({
        ScanIndexForward: false,
      });
    });

    it('adds min version', async () => {
      await adapter.getEvents(aggregateId, { eventStoreId }, { minVersion: 3 });

      // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
      // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
      expect(dynamoDBClientMock.call(0).args[0].input).toMatchObject({
        ExpressionAttributeNames: { '#version': eventTableSk },
        ExpressionAttributeValues: marshall(
          { ':minVersion': 3 },
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
      expect(dynamoDBClientMock.call(0).args[0].input).toMatchObject({
        ExpressionAttributeNames: { '#version': eventTableSk },
        ExpressionAttributeValues: marshall(
          { ':maxVersion': 5 },
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
      expect(dynamoDBClientMock.call(0).args[0].input).toMatchObject({
        ExpressionAttributeNames: { '#version': eventTableSk },
        ExpressionAttributeValues: marshall(
          { ':minVersion': 3, ':maxVersion': 5 },
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
      expect(dynamoDBClientMock.call(0).args[0].input).toMatchObject({
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
      MARSHALL_OPTIONS,
    );

    it('sends a correct QueryCommand to dynamoDBClient to list aggregate ids', async () => {
      const secondAggregateIdMock = 'my-second-aggregate-id';
      const queryCommandOutputMock: QueryCommandOutput = {
        Items: [
          marshall({ aggregateId: prefixedAggregateId, timestamp: timestampA }),
          marshall({
            aggregateId: prefixAggregateId(eventStoreId, secondAggregateIdMock),
            timestamp: timestampB,
          }),
        ],
        $metadata: {},
      };

      dynamoDBClientMock.on(QueryCommand).resolves(queryCommandOutputMock);

      const { aggregateIds } = await adapter.listAggregateIds({ eventStoreId });

      // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
      // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
      expect(dynamoDBClientMock.calls()).toHaveLength(1);
      expect(dynamoDBClientMock.call(0).args[0].input).toStrictEqual({
        ExpressionAttributeNames: {
          '#eventStoreId': eventTableEventStoreIdKey,
        },
        ExpressionAttributeValues: marshall(
          { ':eventStoreId': eventStoreId },
          MARSHALL_OPTIONS,
        ),
        IndexName: eventTableInitialEventIndexName,
        KeyConditionExpression: '#eventStoreId = :eventStoreId',
        TableName: dynamoDBTableName,
      });

      // We have to serialize / deserialize because DynamoDB numbers are not regular numbers
      expect(aggregateIds).toMatchObject([
        { aggregateId, initialEventTimestamp: timestampA },
        {
          aggregateId: secondAggregateIdMock,
          initialEventTimestamp: timestampB,
        },
      ]);
    });

    it('adds limit option', async () => {
      await adapter.listAggregateIds({ eventStoreId }, { limit: 1 });

      // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
      // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
      expect(dynamoDBClientMock.call(0).args[0].input).toMatchObject({
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
      expect(dynamoDBClientMock.call(0).args[0].input).toMatchObject({
        ExpressionAttributeNames: {
          '#timestamp': eventTableTimestampKey,
        },
        ExpressionAttributeValues: marshall(
          { ':initialEventAfter': timestampA },
          MARSHALL_OPTIONS,
        ),
        IndexName: eventTableInitialEventIndexName,
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
      expect(dynamoDBClientMock.call(0).args[0].input).toMatchObject({
        ExpressionAttributeNames: {
          '#timestamp': eventTableTimestampKey,
        },
        ExpressionAttributeValues: marshall(
          { ':initialEventBefore': timestampA },
          MARSHALL_OPTIONS,
        ),
        IndexName: eventTableInitialEventIndexName,
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
      expect(dynamoDBClientMock.call(0).args[0].input).toMatchObject({
        ExpressionAttributeNames: {
          '#timestamp': eventTableTimestampKey,
        },
        ExpressionAttributeValues: marshall(
          {
            ':initialEventAfter': timestampA,
            ':initialEventBefore': timestampB,
          },
          MARSHALL_OPTIONS,
        ),
        IndexName: eventTableInitialEventIndexName,
        KeyConditionExpression:
          '#eventStoreId = :eventStoreId and #timestamp between :initialEventAfter and :initialEventBefore',
      });
    });

    it('adds reverse option', async () => {
      await adapter.listAggregateIds({ eventStoreId }, { reverse: true });

      // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
      // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
      expect(dynamoDBClientMock.call(0).args[0].input).toMatchObject({
        ScanIndexForward: false,
      });
    });

    it('returns a nextPageToken if query has LastEvaluatedKey', async () => {
      const queryCommandOutputMock: QueryCommandOutput = {
        Items: [
          marshall({ aggregateId: prefixedAggregateId }, MARSHALL_OPTIONS),
        ],
        LastEvaluatedKey: lastEvaluatedKey,
        $metadata: {},
      };

      dynamoDBClientMock.on(QueryCommand).resolves(queryCommandOutputMock);

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
      expect(dynamoDBClientMock.call(0).args[0].input).toMatchObject({
        Limit: 1,
        ScanIndexForward: false,
        ExclusiveStartKey: lastEvaluatedKey,
        ExpressionAttributeNames: {
          '#timestamp': eventTableTimestampKey,
        },
        ExpressionAttributeValues: marshall(
          {
            ':initialEventAfter': timestampA,
            ':initialEventBefore': timestampB,
          },
          MARSHALL_OPTIONS,
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
      expect(dynamoDBClientMock.call(0).args[0].input).toMatchObject({
        Limit: 2,
        ScanIndexForward: true,
        ExclusiveStartKey: lastEvaluatedKey,
        ExpressionAttributeNames: {
          '#timestamp': eventTableTimestampKey,
        },
        ExpressionAttributeValues: marshall(
          {
            ':initialEventAfter': timestampB,
            ':initialEventBefore': timestampC,
          },
          MARSHALL_OPTIONS,
        ),
        KeyConditionExpression:
          '#eventStoreId = :eventStoreId and #timestamp between :initialEventAfter and :initialEventBefore',
      });
    });
  });
});
