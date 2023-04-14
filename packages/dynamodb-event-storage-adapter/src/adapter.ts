/* eslint-disable max-lines */
import {
  PutItemCommand,
  PutItemCommandInput,
  QueryCommand,
  QueryCommandInput,
} from '@aws-sdk/client-dynamodb';
import type { AttributeValue, DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { Marshaller } from '@aws/dynamodb-auto-marshaller';

import { EventDetail, GroupedEvent, StorageAdapter } from '@castore/core';

import { DynamoDBEventAlreadyExistsError } from './error';
import {
  parseAppliedListAggregateIdsOptions,
  ParsedPageToken,
} from './utils/parseAppliedListAggregateIdsOptions';

const marshaller = new Marshaller() as {
  marshallItem: (
    item: Record<string, unknown>,
  ) => Record<string, AttributeValue>;
  unmarshallItem: (
    item: Record<string, AttributeValue>,
  ) => Record<string, unknown>;
};

export const EVENT_TABLE_PK = 'aggregateId';
export const EVENT_TABLE_SK = 'version';
export const EVENT_TABLE_TIMESTAMP_KEY = 'timestamp';
export const EVENT_TABLE_EVENT_TYPE_KEY = 'type';
export const EVENT_TABLE_PAYLOAD_KEY = 'payload';
export const EVENT_TABLE_METADATA_KEY = 'metadata';
export const EVENT_TABLE_IS_INITIAL_EVENT_KEY = 'isInitialEvent';
export const EVENT_TABLE_INITIAL_EVENT_INDEX_NAME = 'initialEvents';

const isConditionalCheckFailedException = (error: Error): boolean =>
  typeof error === 'object' &&
  (error as { code?: unknown }).code === 'ConditionalCheckFailedException';

export class DynamoDbEventStorageAdapter implements StorageAdapter {
  getEvents: StorageAdapter['getEvents'];
  getPushEventInput: (eventDetail: EventDetail) => PutItemCommandInput;
  pushEvent: StorageAdapter['pushEvent'];
  groupEvent: StorageAdapter['groupEvent'];
  listAggregateIds: StorageAdapter['listAggregateIds'];

  putSnapshot: StorageAdapter['putSnapshot'];
  getLastSnapshot: StorageAdapter['getLastSnapshot'];
  listSnapshots: StorageAdapter['listSnapshots'];

  getTableName: () => string;
  tableName: string | (() => string);
  dynamoDbClient: DynamoDBClient;

  constructor({
    tableName,
    dynamoDbClient,
  }: {
    tableName: string | (() => string);
    dynamoDbClient: DynamoDBClient;
  }) {
    this.tableName = tableName;
    this.dynamoDbClient = dynamoDbClient;

    this.getTableName = () =>
      typeof this.tableName === 'string' ? this.tableName : this.tableName();

    // eslint-disable-next-line complexity
    this.getEvents = async (
      aggregateId,
      { minVersion, maxVersion, reverse, limit } = {},
    ) => {
      const marshalledEvents: Record<string, AttributeValue>[] = [];

      const eventsQueryCommand = new QueryCommand({
        TableName: this.getTableName(),
        KeyConditionExpression:
          maxVersion !== undefined
            ? minVersion !== undefined
              ? '#aggregateId = :aggregateId and #version between :minVersion and :maxVersion'
              : '#aggregateId = :aggregateId and #version <= :maxVersion'
            : minVersion !== undefined
            ? '#aggregateId = :aggregateId and #version >= :minVersion'
            : '#aggregateId = :aggregateId',
        ExpressionAttributeNames: {
          '#aggregateId': EVENT_TABLE_PK,
          ...(maxVersion !== undefined || minVersion !== undefined
            ? { '#version': EVENT_TABLE_SK }
            : {}),
        },
        ExpressionAttributeValues: marshaller.marshallItem({
          ':aggregateId': aggregateId,
          ...(maxVersion !== undefined ? { ':maxVersion': maxVersion } : {}),
          ...(minVersion !== undefined ? { ':minVersion': minVersion } : {}),
        }),
        ConsistentRead: true,
        ...(reverse !== undefined ? { ScanIndexForward: !reverse } : {}),
        ...(limit !== undefined ? { Limit: limit } : {}),
      });

      let eventsQueryResult = await this.dynamoDbClient.send(
        eventsQueryCommand,
      );
      marshalledEvents.push(...(eventsQueryResult.Items ?? []));

      while (eventsQueryResult.LastEvaluatedKey !== undefined) {
        eventsQueryCommand.input.ExclusiveStartKey =
          eventsQueryResult.LastEvaluatedKey;
        eventsQueryResult = await this.dynamoDbClient.send(eventsQueryCommand);

        marshalledEvents.push(...(eventsQueryResult.Items ?? []));
      }

      return {
        events: marshalledEvents
          .map(item => marshaller.unmarshallItem(item))
          .map((item): EventDetail => {
            const {
              aggregateId: evtAggregateId,
              version,
              type,
              timestamp,
              payload,
              metadata,
            } = item as EventDetail;

            return {
              aggregateId: evtAggregateId,
              version,
              type,
              timestamp,
              ...(payload !== undefined ? { payload } : {}),
              ...(metadata !== undefined ? { metadata } : {}),
            };
          }),
      };
    };

    this.getPushEventInput = event => {
      const { aggregateId, version, type, timestamp, payload, metadata } =
        event;

      return {
        TableName: this.getTableName(),
        Item: marshaller.marshallItem({
          aggregateId,
          version,
          type,
          timestamp,
          ...(payload !== undefined ? { payload } : {}),
          ...(metadata !== undefined ? { metadata } : {}),
          ...(version === 1 ? { isInitialEvent: 1 } : {}),
        }),
        ExpressionAttributeNames: { '#version': EVENT_TABLE_SK },
        ConditionExpression: 'attribute_not_exists(#version)',
      };
    };

    this.pushEvent = async (eventWithoutTimestamp, context) => {
      const timestamp = new Date().toISOString();
      const event = { ...eventWithoutTimestamp, timestamp };
      const putEventCommand = new PutItemCommand(this.getPushEventInput(event));

      const { aggregateId, version } = event;

      try {
        await this.dynamoDbClient.send(putEventCommand);
      } catch (error) {
        if (
          error instanceof Error &&
          isConditionalCheckFailedException(error)
        ) {
          const { eventStoreId } = context;

          throw new DynamoDBEventAlreadyExistsError({
            eventStoreId,
            aggregateId,
            version,
          });
        }

        throw error;
      }

      return { event };
    };

    this.groupEvent = event => new GroupedEvent({ event });

    // eslint-disable-next-line complexity
    this.listAggregateIds = async ({
      pageToken: inputPageToken,
      ...inputOptions
    } = {}) => {
      const aggregateIdsQueryCommandInput: QueryCommandInput = {
        TableName: this.getTableName(),
        KeyConditionExpression: '#isInitialEvent = :true',
        ExpressionAttributeNames: {
          '#isInitialEvent': EVENT_TABLE_IS_INITIAL_EVENT_KEY,
        },
        ExpressionAttributeValues: marshaller.marshallItem({
          ':true': 1,
        }),
        IndexName: EVENT_TABLE_INITIAL_EVENT_INDEX_NAME,
      };

      const {
        limit,
        initialEventAfter,
        initialEventBefore,
        reverse,
        exclusiveStartKey,
      } = parseAppliedListAggregateIdsOptions({ inputPageToken, inputOptions });

      if (limit !== undefined) {
        aggregateIdsQueryCommandInput.Limit = limit;
      }

      if (initialEventBefore !== undefined || initialEventAfter !== undefined) {
        aggregateIdsQueryCommandInput.KeyConditionExpression =
          initialEventBefore !== undefined
            ? initialEventAfter !== undefined
              ? '#isInitialEvent = :true and #timestamp between :initialEventAfter and :initialEventBefore'
              : '#isInitialEvent = :true and #timestamp <= :initialEventBefore'
            : initialEventAfter !== undefined
            ? '#isInitialEvent = :true and #timestamp >= :initialEventAfter'
            : '#isInitialEvent = :true';

        aggregateIdsQueryCommandInput.ExpressionAttributeNames = {
          ...aggregateIdsQueryCommandInput.ExpressionAttributeNames,
          ['#timestamp']: EVENT_TABLE_TIMESTAMP_KEY,
        };

        aggregateIdsQueryCommandInput.ExpressionAttributeValues = {
          ...aggregateIdsQueryCommandInput.ExpressionAttributeValues,
          ...marshaller.marshallItem({
            ...(initialEventBefore !== undefined
              ? { ':initialEventBefore': initialEventBefore }
              : {}),
            ...(initialEventAfter !== undefined
              ? { ':initialEventAfter': initialEventAfter }
              : {}),
          }),
        };
      }

      if (reverse !== undefined) {
        aggregateIdsQueryCommandInput.ScanIndexForward = !reverse;
      }

      if (exclusiveStartKey !== undefined) {
        aggregateIdsQueryCommandInput.ExclusiveStartKey = exclusiveStartKey;
      }

      const {
        Items: unmarshalledInitialEvents = [],
        LastEvaluatedKey: lastEvaluatedKey,
      } = await this.dynamoDbClient.send(
        new QueryCommand(aggregateIdsQueryCommandInput),
      );

      const parsedNextPageToken: ParsedPageToken = {
        limit,
        initialEventAfter,
        initialEventBefore,
        reverse,
        lastEvaluatedKey,
      };

      return {
        aggregateIds: unmarshalledInitialEvents
          .map(item => marshaller.unmarshallItem(item))
          .map(item => {
            const { aggregateId } = item as Pick<EventDetail, 'aggregateId'>;

            return aggregateId;
          }),
        ...(lastEvaluatedKey !== undefined
          ? { nextPageToken: JSON.stringify(parsedNextPageToken) }
          : {}),
      };
    };

    this.putSnapshot = async () => new Promise(resolve => resolve());

    this.getLastSnapshot = async () =>
      new Promise(resolve => resolve({ snapshot: undefined }));

    this.listSnapshots = async () =>
      new Promise(resolve => resolve({ snapshots: [] }));
  }
}
