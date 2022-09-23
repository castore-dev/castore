/* eslint-disable max-lines */
import {
  PutItemCommand,
  PutItemCommandInput,
  QueryCommand,
  QueryCommandInput,
} from '@aws-sdk/client-dynamodb';
import type { AttributeValue, DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { Marshaller } from '@aws/dynamodb-auto-marshaller';
import get from 'lodash/get';

/**
 * @debt decoupling "TODO: Only import types here, EventAlreadyExistsError is problematic"
 */
import {
  EventAlreadyExistsError,
  EventDetail,
  EventsQueryOptions,
  ListAggregateIdsOptions,
  ListAggregateIdsOutput,
  PushEventContext,
  GetLastSnapshotOptions,
  ListSnapshotsOptions,
  StorageAdapter,
  Aggregate,
} from '@castore/core';

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

const getSnapshotPKFromAggregateId = (aggregateId: string): string =>
  `${aggregateId}#snapshot`;

const isConditionalCheckFailedException = (error: Error): boolean =>
  get(error, 'code') === 'ConditionalCheckFailedException';

export class DynamoDbEventStorageAdapter implements StorageAdapter {
  getEvents: (
    aggregateId: string,
    options?: EventsQueryOptions,
  ) => Promise<{ events: EventDetail[] }>;
  getPushEventInput: (eventDetail: EventDetail) => PutItemCommandInput;
  pushEvent: (
    eventDetail: EventDetail,
    context: PushEventContext,
  ) => Promise<void>;
  listAggregateIds: (
    options?: ListAggregateIdsOptions,
  ) => Promise<ListAggregateIdsOutput>;

  putSnapshot: (aggregate: Aggregate) => Promise<void>;
  getLastSnapshot: (
    aggregateId: string,
    options?: GetLastSnapshotOptions,
  ) => Promise<{ snapshot: Aggregate | undefined }>;
  listSnapshots: (
    aggregateId: string,
    options?: ListSnapshotsOptions,
  ) => Promise<{ snapshots: Aggregate[] }>;

  tableName: string;
  dynamoDbClient: DynamoDBClient;

  constructor({
    tableName,
    dynamoDbClient,
  }: {
    tableName: string;
    dynamoDbClient: DynamoDBClient;
  }) {
    this.tableName = tableName;
    this.dynamoDbClient = dynamoDbClient;

    // eslint-disable-next-line complexity
    this.getEvents = async (
      aggregateId,
      { minVersion: minVersion, maxVersion } = {},
    ) => {
      const marshalledEvents: Record<string, AttributeValue>[] = [];

      const eventsQueryCommand = new QueryCommand({
        TableName: this.tableName,
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
        TableName: this.tableName,
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

    this.pushEvent = async (event, context) => {
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

          throw new EventAlreadyExistsError({
            eventStoreId,
            aggregateId,
            version,
          });
        }

        throw error;
      }
    };

    this.listAggregateIds = async ({
      limit: inputLimit,
      pageToken: inputPageToken,
    } = {}) => {
      const aggregateIdsQueryCommandInput: QueryCommandInput = {
        TableName: this.tableName,
        KeyConditionExpression: '#isInitialEvent = :true',
        ExpressionAttributeNames: {
          '#isInitialEvent': EVENT_TABLE_IS_INITIAL_EVENT_KEY,
        },
        ExpressionAttributeValues: marshaller.marshallItem({
          ':true': 1,
        }),
        IndexName: EVENT_TABLE_INITIAL_EVENT_INDEX_NAME,
      };

      const { appliedLimit, appliedLastEvaluatedKey } =
        parseAppliedListAggregateIdsOptions({ inputLimit, inputPageToken });

      if (appliedLimit !== undefined) {
        aggregateIdsQueryCommandInput.Limit = appliedLimit;
      }

      if (appliedLastEvaluatedKey !== undefined) {
        aggregateIdsQueryCommandInput.ExclusiveStartKey =
          appliedLastEvaluatedKey;
      }

      const {
        Items: unmarshalledInitialEvents = [],
        LastEvaluatedKey: lastEvaluatedKey,
      } = await this.dynamoDbClient.send(
        new QueryCommand(aggregateIdsQueryCommandInput),
      );

      const parsedNextPageToken: ParsedPageToken = {
        limit: appliedLimit,
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

    this.putSnapshot = async aggregate => {
      await this.dynamoDbClient.send(
        new PutItemCommand({
          TableName: this.tableName,
          Item: marshaller.marshallItem({
            aggregateId: getSnapshotPKFromAggregateId(aggregate.aggregateId),
            version: aggregate.version,
            aggregate,
          }),
        }),
      );
    };

    this.getLastSnapshot = async (aggregateId, { maxVersion } = {}) => {
      const { snapshots } = await this.listSnapshots(aggregateId, {
        maxVersion,
        limit: 1,
        reverse: true,
      });

      return { snapshot: snapshots[0] };
    };

    // eslint-disable-next-line complexity
    this.listSnapshots = async (
      aggregateId,
      { minVersion, maxVersion, limit, reverse } = {},
    ) => {
      const marshalledSnapshots: Record<string, AttributeValue>[] = [];

      const snapshotsQueryCommand = new QueryCommand({
        TableName: this.tableName,
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
          ':aggregateId': getSnapshotPKFromAggregateId(aggregateId),
          ...(maxVersion !== undefined ? { ':maxVersion': maxVersion } : {}),
          ...(minVersion !== undefined ? { ':minVersion': minVersion } : {}),
        }),
        ScanIndexForward: reverse !== true,
        ConsistentRead: true,
        ...(limit !== undefined ? { Limit: limit } : {}),
      });

      let snapshotsQueryResult = await this.dynamoDbClient.send(
        snapshotsQueryCommand,
      );
      marshalledSnapshots.push(...(snapshotsQueryResult.Items ?? []));

      while (snapshotsQueryResult.LastEvaluatedKey !== undefined) {
        snapshotsQueryCommand.input.ExclusiveStartKey =
          snapshotsQueryResult.LastEvaluatedKey;
        snapshotsQueryResult = await this.dynamoDbClient.send(
          snapshotsQueryCommand,
        );

        marshalledSnapshots.push(...(snapshotsQueryResult.Items ?? []));
      }

      return {
        snapshots: marshalledSnapshots
          .map(item => marshaller.unmarshallItem(item))
          .map(item => item.aggregate) as Aggregate[],
      };
    };
  }
}
