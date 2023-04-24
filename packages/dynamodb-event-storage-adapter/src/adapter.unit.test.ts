/* eslint-disable max-lines */
import {
  DynamoDBClient,
  PutItemCommand,
  QueryCommand,
  QueryCommandOutput,
  AttributeValue,
} from '@aws-sdk/client-dynamodb';
import { Marshaller } from '@aws/dynamodb-auto-marshaller';
import { mockClient } from 'aws-sdk-client-mock';
import omit from 'lodash.omit';
import MockDate from 'mockdate';

import {
  DynamoDbEventStorageAdapter,
  EVENT_TABLE_PK,
  EVENT_TABLE_SK,
  EVENT_TABLE_IS_INITIAL_EVENT_KEY,
  EVENT_TABLE_INITIAL_EVENT_INDEX_NAME,
  EVENT_TABLE_TIMESTAMP_KEY,
} from './adapter';

const dynamoDbClientMock = mockClient(DynamoDBClient);

const marshaller = new Marshaller() as {
  marshallItem: (
    item: Record<string, unknown>,
  ) => Record<string, AttributeValue>;
  unmarshallItem: (
    item: Record<string, AttributeValue>,
  ) => Record<string, unknown>;
};

const timestampA = '2022-01-01T00:00:00.000Z';
const timestampB = '2023-01-01T00:00:00.000Z';
const timestampC = '2024-01-01T00:00:00.000Z';

const dynamoDbTableNameMock = 'my-table-name';
const eventStoreIdMock = 'my-event-store';
const aggregateIdMock = 'my-aggregate-id';

const initialEventMock = {
  aggregateId: aggregateIdMock,
  version: 1,
  type: 'event-type-1',
  timestamp: timestampA,
};

const secondEventMock = {
  aggregateId: aggregateIdMock,
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
    tableName: dynamoDbTableNameMock,
    dynamoDbClient: dynamoDbClientMock as unknown as DynamoDBClient,
  });

  describe('push event', () => {
    it('sends a correct PutItemCommand to dynamoDbClient to push new event', async () => {
      await adapter.pushEvent(secondEventMock, {
        eventStoreId: eventStoreIdMock,
      });

      // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
      // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
      expect(dynamoDbClientMock.calls()).toHaveLength(1);
      expect(dynamoDbClientMock.call(0).args[0].input).toStrictEqual({
        ConditionExpression: 'attribute_not_exists(#version)',
        ExpressionAttributeNames: { '#version': EVENT_TABLE_SK },
        Item: marshaller.marshallItem(secondEventMock),
        TableName: dynamoDbTableNameMock,
      });
    });

    it('appends a timestamp if none has been provided', async () => {
      MockDate.set(timestampA);

      await adapter.pushEvent(omit(secondEventMock, 'timestamp'), {
        eventStoreId: eventStoreIdMock,
      });

      // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
      // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
      expect(dynamoDbClientMock.call(0).args[0].input).toMatchObject({
        Item: marshaller.marshallItem({ timestamp: timestampA }),
      });

      MockDate.reset();
    });

    it('sends a correct PutItemCommand to dynamoDbClient to push new initial event', async () => {
      await adapter.pushEvent(initialEventMock, {
        eventStoreId: eventStoreIdMock,
      });

      // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
      // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
      expect(dynamoDbClientMock.calls()).toHaveLength(1);
      expect(dynamoDbClientMock.call(0).args[0].input).toMatchObject({
        Item: marshaller.marshallItem(initialEventMock),
      });
    });
  });

  describe('table name getter', () => {
    it('works with event bus name getters', async () => {
      const adapterWithGetter = new DynamoDbEventStorageAdapter({
        tableName: () => dynamoDbTableNameMock,
        dynamoDbClient: dynamoDbClientMock as unknown as DynamoDBClient,
      });

      await adapterWithGetter.pushEvent(initialEventMock, {
        eventStoreId: eventStoreIdMock,
      });

      // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
      // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
      expect(dynamoDbClientMock.calls()).toHaveLength(1);
    });
  });

  describe('get events', () => {
    it('sends a correct QueryCommand to dynamoDbClient to get aggregate events', async () => {
      const queryCommandOutputMock: QueryCommandOutput = {
        Items: [
          marshaller.marshallItem(initialEventMock),
          marshaller.marshallItem(secondEventMock),
        ],
        $metadata: {},
      };

      dynamoDbClientMock.on(QueryCommand).resolves(queryCommandOutputMock);

      const { events } = await adapter.getEvents(aggregateIdMock, {
        eventStoreId: eventStoreIdMock,
      });

      // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
      // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
      expect(dynamoDbClientMock.calls()).toHaveLength(1);
      expect(dynamoDbClientMock.call(0).args[0].input).toStrictEqual({
        ConsistentRead: true,
        ExpressionAttributeNames: { '#aggregateId': EVENT_TABLE_PK },
        ExpressionAttributeValues: marshaller.marshallItem({
          ':aggregateId': aggregateIdMock,
        }),
        KeyConditionExpression: '#aggregateId = :aggregateId',
        TableName: dynamoDbTableNameMock,
      });

      // We have to serialize / deserialize because DynamoDB numbers are not regular numbers
      expect(JSON.parse(JSON.stringify(events))).toMatchObject([
        initialEventMock,
        secondEventMock,
      ]);
    });

    it('repeats queries if it is paginated', async () => {
      const lastEvaluatedKey = marshaller.marshallItem(initialEventMock);

      const firstQueryCommandOutputMock: QueryCommandOutput = {
        Items: [marshaller.marshallItem(initialEventMock)],
        $metadata: {},
        LastEvaluatedKey: lastEvaluatedKey,
      };
      const secondQueryCommandOutputMock: QueryCommandOutput = {
        Items: [marshaller.marshallItem(secondEventMock)],
        $metadata: {},
      };

      dynamoDbClientMock
        .on(QueryCommand)
        .resolvesOnce(firstQueryCommandOutputMock)
        .resolvesOnce(secondQueryCommandOutputMock);

      const { events } = await adapter.getEvents(aggregateIdMock, {
        eventStoreId: eventStoreIdMock,
      });

      // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
      // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
      expect(dynamoDbClientMock.calls()).toHaveLength(2);
      expect(dynamoDbClientMock.call(1).args[0].input).toMatchObject({
        ExclusiveStartKey: lastEvaluatedKey,
      });

      // We have to serialize / deserialize because DynamoDB numbers are not regular numbers
      expect(JSON.parse(JSON.stringify(events))).toMatchObject([
        initialEventMock,
        secondEventMock,
      ]);
    });

    it('fetches events in reverse', async () => {
      await adapter.getEvents(
        aggregateIdMock,
        { eventStoreId: eventStoreIdMock },
        { reverse: true },
      );

      // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
      // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
      expect(dynamoDbClientMock.call(0).args[0].input).toMatchObject({
        ScanIndexForward: false,
      });
    });

    it('adds min version', async () => {
      await adapter.getEvents(
        aggregateIdMock,
        { eventStoreId: eventStoreIdMock },
        { minVersion: 3 },
      );

      // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
      // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
      expect(dynamoDbClientMock.call(0).args[0].input).toMatchObject({
        ExpressionAttributeNames: {
          '#aggregateId': EVENT_TABLE_PK,
          '#version': EVENT_TABLE_SK,
        },
        ExpressionAttributeValues: marshaller.marshallItem({
          ':aggregateId': aggregateIdMock,
          ':minVersion': 3,
        }),
        KeyConditionExpression:
          '#aggregateId = :aggregateId and #version >= :minVersion',
      });
    });

    it('adds max version', async () => {
      await adapter.getEvents(
        aggregateIdMock,
        { eventStoreId: eventStoreIdMock },
        { maxVersion: 5 },
      );

      // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
      // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
      expect(dynamoDbClientMock.call(0).args[0].input).toMatchObject({
        ExpressionAttributeNames: {
          '#aggregateId': EVENT_TABLE_PK,
          '#version': EVENT_TABLE_SK,
        },
        ExpressionAttributeValues: marshaller.marshallItem({
          ':aggregateId': aggregateIdMock,
          ':maxVersion': 5,
        }),
        KeyConditionExpression:
          '#aggregateId = :aggregateId and #version <= :maxVersion',
      });
    });

    it('adds min & max versions', async () => {
      await adapter.getEvents(
        aggregateIdMock,
        { eventStoreId: eventStoreIdMock },
        {
          minVersion: 3,
          maxVersion: 5,
        },
      );

      // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
      // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
      expect(dynamoDbClientMock.call(0).args[0].input).toMatchObject({
        ExpressionAttributeNames: {
          '#aggregateId': EVENT_TABLE_PK,
          '#version': EVENT_TABLE_SK,
        },
        ExpressionAttributeValues: marshaller.marshallItem({
          ':aggregateId': aggregateIdMock,
          ':minVersion': 3,
          ':maxVersion': 5,
        }),
        KeyConditionExpression:
          '#aggregateId = :aggregateId and #version between :minVersion and :maxVersion',
      });
    });

    it('adds limit', async () => {
      await adapter.getEvents(
        aggregateIdMock,
        { eventStoreId: eventStoreIdMock },
        { limit: 2 },
      );

      // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
      // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
      expect(dynamoDbClientMock.call(0).args[0].input).toMatchObject({
        Limit: 2,
      });
    });
  });

  describe('list aggregate ids', () => {
    const lastEvaluatedKey = marshaller.marshallItem({
      aggregateId: aggregateIdMock,
      version: 1,
      isInitialEvent: 1,
      timestamp: timestampA,
    });

    it('sends a correct QueryCommand to dynamoDbClient to list aggregate ids', async () => {
      const secondAggregateIdMock = 'my-second-aggregate-id';
      const queryCommandOutputMock: QueryCommandOutput = {
        Items: [
          marshaller.marshallItem({ aggregateId: aggregateIdMock }),
          marshaller.marshallItem({ aggregateId: secondAggregateIdMock }),
        ],
        $metadata: {},
      };

      dynamoDbClientMock.on(QueryCommand).resolves(queryCommandOutputMock);

      const { aggregateIds } = await adapter.listAggregateIds({
        eventStoreId: eventStoreIdMock,
      });

      // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
      // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
      expect(dynamoDbClientMock.calls()).toHaveLength(1);
      expect(dynamoDbClientMock.call(0).args[0].input).toStrictEqual({
        ExpressionAttributeNames: {
          '#isInitialEvent': EVENT_TABLE_IS_INITIAL_EVENT_KEY,
        },
        ExpressionAttributeValues: marshaller.marshallItem({
          ':true': 1,
        }),
        IndexName: EVENT_TABLE_INITIAL_EVENT_INDEX_NAME,
        KeyConditionExpression: '#isInitialEvent = :true',
        TableName: dynamoDbTableNameMock,
      });

      // We have to serialize / deserialize because DynamoDB numbers are not regular numbers
      expect(aggregateIds).toMatchObject([
        aggregateIdMock,
        secondAggregateIdMock,
      ]);
    });

    it('adds limit option', async () => {
      await adapter.listAggregateIds(
        { eventStoreId: eventStoreIdMock },
        { limit: 1 },
      );

      // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
      // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
      expect(dynamoDbClientMock.call(0).args[0].input).toMatchObject({
        Limit: 1,
      });
    });

    it('filters aggregate ids with initial event date after timestamp', async () => {
      await adapter.listAggregateIds(
        { eventStoreId: eventStoreIdMock },
        { initialEventAfter: timestampA },
      );

      // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
      // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
      expect(dynamoDbClientMock.call(0).args[0].input).toMatchObject({
        ExpressionAttributeNames: {
          '#timestamp': EVENT_TABLE_TIMESTAMP_KEY,
        },
        ExpressionAttributeValues: marshaller.marshallItem({
          ':initialEventAfter': timestampA,
        }),
        IndexName: EVENT_TABLE_INITIAL_EVENT_INDEX_NAME,
        KeyConditionExpression:
          '#isInitialEvent = :true and #timestamp >= :initialEventAfter',
      });
    });

    it('filters aggregate ids with initial event date before timestamp', async () => {
      await adapter.listAggregateIds(
        { eventStoreId: eventStoreIdMock },
        { initialEventBefore: timestampA },
      );

      // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
      // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
      expect(dynamoDbClientMock.call(0).args[0].input).toMatchObject({
        ExpressionAttributeNames: {
          '#timestamp': EVENT_TABLE_TIMESTAMP_KEY,
        },
        ExpressionAttributeValues: marshaller.marshallItem({
          ':initialEventBefore': timestampA,
        }),
        IndexName: EVENT_TABLE_INITIAL_EVENT_INDEX_NAME,
        KeyConditionExpression:
          '#isInitialEvent = :true and #timestamp <= :initialEventBefore',
      });
    });

    it('filters aggregate ids with initial event date between timestamp', async () => {
      await adapter.listAggregateIds(
        { eventStoreId: eventStoreIdMock },
        {
          initialEventAfter: timestampA,
          initialEventBefore: timestampB,
        },
      );

      // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
      // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
      expect(dynamoDbClientMock.call(0).args[0].input).toMatchObject({
        ExpressionAttributeNames: {
          '#timestamp': EVENT_TABLE_TIMESTAMP_KEY,
        },
        ExpressionAttributeValues: marshaller.marshallItem({
          ':initialEventAfter': timestampA,
          ':initialEventBefore': timestampB,
        }),
        IndexName: EVENT_TABLE_INITIAL_EVENT_INDEX_NAME,
        KeyConditionExpression:
          '#isInitialEvent = :true and #timestamp between :initialEventAfter and :initialEventBefore',
      });
    });

    it('adds reverse option', async () => {
      await adapter.listAggregateIds(
        { eventStoreId: eventStoreIdMock },
        { reverse: true },
      );

      // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
      // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
      expect(dynamoDbClientMock.call(0).args[0].input).toMatchObject({
        ScanIndexForward: false,
      });
    });

    it('returns a nextPageToken if query has LastEvaluatedKey', async () => {
      const queryCommandOutputMock: QueryCommandOutput = {
        Items: [marshaller.marshallItem({ aggregateId: aggregateIdMock })],
        LastEvaluatedKey: lastEvaluatedKey,
        $metadata: {},
      };

      dynamoDbClientMock.on(QueryCommand).resolves(queryCommandOutputMock);

      const { nextPageToken } = await adapter.listAggregateIds(
        { eventStoreId: eventStoreIdMock },
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
        { eventStoreId: eventStoreIdMock },
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
        ExpressionAttributeValues: marshaller.marshallItem({
          ':initialEventAfter': timestampA,
          ':initialEventBefore': timestampB,
        }),
        KeyConditionExpression:
          '#isInitialEvent = :true and #timestamp between :initialEventAfter and :initialEventBefore',
      });
    });

    it('uses the input limit even if the page token has an embedded limit', async () => {
      await adapter.listAggregateIds(
        { eventStoreId: eventStoreIdMock },
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
        ExpressionAttributeValues: marshaller.marshallItem({
          ':initialEventAfter': timestampB,
          ':initialEventBefore': timestampC,
        }),
        KeyConditionExpression:
          '#isInitialEvent = :true and #timestamp between :initialEventAfter and :initialEventBefore',
      });
    });
  });
});
