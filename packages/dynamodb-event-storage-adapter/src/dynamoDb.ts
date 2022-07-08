/* eslint-disable max-lines */
import { PutItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';
import type { AttributeValue, DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { Marshaller } from '@aws/dynamodb-auto-marshaller';
import get from 'lodash/get';

import {
  EventAlreadyExistsError,
  EventDetail,
  EventsQueryOptions,
  PushEventContext,
  PushEventTransactionContext,
  StorageAdapter,
} from '@castore/core';

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
  get(error, 'code') === 'ConditionalCheckFailedException';

export class DynamoDbEventStorageAdapter implements StorageAdapter {
  getEvents: (
    aggregateId: string,
    options?: EventsQueryOptions,
  ) => Promise<{ events: EventDetail[] }>;
  pushEvent: (
    eventDetail: EventDetail,
    context: PushEventContext,
  ) => Promise<void>;
  pushEventTransaction: (
    eventDetail: EventDetail,
    context: PushEventTransactionContext,
  ) => unknown;
  listAggregateIds: () => Promise<{ aggregateIds: string[] }>;

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

    this.getEvents = async (aggregateId, { maxVersion } = {}) => {
      const marshalledEvents: Record<string, AttributeValue>[] = [];

      const eventsQueryCommand = new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression:
          maxVersion !== undefined
            ? '#aggregateId = :aggregateId and #version <= :maxVersion'
            : '#aggregateId = :aggregateId',
        ExpressionAttributeNames: {
          '#aggregateId': EVENT_TABLE_PK,
          ...(maxVersion !== undefined ? { '#version': EVENT_TABLE_SK } : {}),
        },
        ExpressionAttributeValues: marshaller.marshallItem({
          ':aggregateId': aggregateId,
          ...(maxVersion !== undefined ? { ':maxVersion': maxVersion } : {}),
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

    this.pushEvent = async (event, context) => {
      const { aggregateId, version, type, timestamp, payload, metadata } =
        event;

      const putEventCommand = new PutItemCommand({
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
      });

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
      }
    };

    this.pushEventTransaction = () => {
      // To re-implement
    };

    this.listAggregateIds = async () => {
      const unmarshalledInitialEvents: Record<string, AttributeValue>[] = [];

      const aggregateIdsQueryCommand = new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: '#isInitialEvent = :true',
        ExpressionAttributeNames: {
          '#isInitialEvent': EVENT_TABLE_IS_INITIAL_EVENT_KEY,
        },
        ExpressionAttributeValues: marshaller.marshallItem({
          ':true': 1,
        }),
        IndexName: EVENT_TABLE_INITIAL_EVENT_INDEX_NAME,
      });

      let aggregateIdsQueryResult = await this.dynamoDbClient.send(
        aggregateIdsQueryCommand,
      );

      unmarshalledInitialEvents.push(...(aggregateIdsQueryResult.Items ?? []));

      while (aggregateIdsQueryResult.LastEvaluatedKey !== undefined) {
        aggregateIdsQueryCommand.input.ExclusiveStartKey =
          aggregateIdsQueryResult.LastEvaluatedKey;
        aggregateIdsQueryResult = await this.dynamoDbClient.send(
          aggregateIdsQueryCommand,
        );

        unmarshalledInitialEvents.push(
          ...(aggregateIdsQueryResult.Items ?? []),
        );
      }

      return {
        aggregateIds: unmarshalledInitialEvents
          .map(item => marshaller.unmarshallItem(item))
          .map(item => {
            const { aggregateId } = item as Pick<
              EventDetail,
              'aggregateId' | 'version' | 'timestamp'
            >;

            return aggregateId;
          }),
      };
    };
  }
}
