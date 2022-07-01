import DynamoDB from 'aws-sdk/clients/dynamodb';
import { Entity, QueryOptions, Table } from 'dynamodb-toolbox';
import get from 'lodash/get';

import {
  EventAlreadyExistsError,
  EventDetail,
  EventsQueryOptions,
  PushEventContext,
  PushEventTransactionContext,
  StorageAdapter,
} from '@castore/event-store';

export const DocumentClient = new DynamoDB.DocumentClient({
  convertEmptyValues: false,
});

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

  constructor({ tableName }: { tableName: string }) {
    this.tableName = tableName;

    const table = new Table({
      name: tableName,
      partitionKey: EVENT_TABLE_PK,
      sortKey: EVENT_TABLE_SK,
      attributes: {
        [EVENT_TABLE_PK]: 'string',
        [EVENT_TABLE_SK]: 'number',
        [EVENT_TABLE_EVENT_TYPE_KEY]: 'string',
        [EVENT_TABLE_TIMESTAMP_KEY]: 'string',
        [EVENT_TABLE_PAYLOAD_KEY]: 'map',
        [EVENT_TABLE_METADATA_KEY]: 'map',
        [EVENT_TABLE_IS_INITIAL_EVENT_KEY]: 'number',
      },
      indexes: {
        [EVENT_TABLE_INITIAL_EVENT_INDEX_NAME]: {
          partitionKey: EVENT_TABLE_IS_INITIAL_EVENT_KEY,
          sortKey: EVENT_TABLE_TIMESTAMP_KEY,
        },
      },
      autoExecute: true,
      autoParse: true,
      DocumentClient,
    });

    const entity = new Entity({
      name: 'event',
      attributes: {
        [EVENT_TABLE_PK]: { type: 'string', partitionKey: true },
        [EVENT_TABLE_SK]: { type: 'number', sortKey: true },
        [EVENT_TABLE_EVENT_TYPE_KEY]: { type: 'string', required: true },
        [EVENT_TABLE_TIMESTAMP_KEY]: {
          type: 'string',
          required: true,
          default: () => new Date().toISOString(),
        },
        [EVENT_TABLE_PAYLOAD_KEY]: { type: 'map' },
        [EVENT_TABLE_METADATA_KEY]: { type: 'map' },
        [EVENT_TABLE_IS_INITIAL_EVENT_KEY]: {
          type: 'number',
          default: ({
            [EVENT_TABLE_SK]: version,
          }: {
            [EVENT_TABLE_SK]: number;
          }) => (version === 1 ? 1 : undefined),
          dependsOn: [EVENT_TABLE_SK],
        },
      },
      table,
      timestamps: false,
    } as const);

    this.pushEvent = async (event, context) => {
      try {
        await entity.put(event, {
          conditions: { attr: 'version', exists: false },
        });
      } catch (error) {
        if (
          error instanceof Error &&
          isConditionalCheckFailedException(error)
        ) {
          const { aggregateId, version } = event;
          const { eventStoreId } = context;

          throw new EventAlreadyExistsError({
            eventStoreId,
            aggregateId,
            version,
          });
        }
      }
    };

    this.getEvents = async (aggregateId, { maxVersion } = {}) => {
      const queryOptions: QueryOptions<typeof entity> = {
        consistent: true,
      };

      if (maxVersion !== undefined) {
        queryOptions.lte = maxVersion;
      }

      const { Items: items = [] } = await entity.query(
        aggregateId,
        queryOptions,
      );

      return {
        events: items.map(
          ({
            aggregateId: eventAggregateId,
            version,
            type,
            timestamp,
            ...item
          }) => {
            const payload = item.payload as unknown | undefined;
            const metadata = item.metadata as unknown | undefined;

            const eventDetail: EventDetail = {
              aggregateId: eventAggregateId,
              version,
              type,
              timestamp,
              ...(payload !== undefined ? { payload } : {}),
              ...(metadata !== undefined ? { metadata } : {}),
            };

            return eventDetail;
          },
        ),
      };
    };

    this.pushEventTransaction = event =>
      entity.putTransaction(event, {
        conditions: { attr: 'version', exists: false },
      });

    this.listAggregateIds = async () => {
      const aggregateIds: string[] = [];

      let queryResult = await entity.query(1, {
        index: EVENT_TABLE_INITIAL_EVENT_INDEX_NAME,
      });

      aggregateIds.push(
        ...(queryResult.Items ?? []).map(({ aggregateId }) => aggregateId),
      );

      while (queryResult.next) {
        queryResult = await queryResult.next();
        aggregateIds.push(
          ...(queryResult.Items ?? []).map(({ aggregateId }) => aggregateId),
        );
      }

      return { aggregateIds };
    };
  }
}
