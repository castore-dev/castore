import DynamoDB from 'aws-sdk/clients/dynamodb';
import { Entity, QueryOptions, Table } from 'dynamodb-toolbox';

import { EventDetail } from 'event/eventDetail';

import { EventsQueryOptions, StorageAdapter } from '../storageAdapter';

export const DocumentClient = new DynamoDB.DocumentClient({
  convertEmptyValues: false,
});

export const EVENT_TABLE_PK = 'aggregateId';
export const EVENT_TABLE_SK = 'version';

export class DynamoDbStorageAdapter implements StorageAdapter {
  pushEvent: (eventDetail: EventDetail) => Promise<void>;
  getEvents: (
    aggregateId: string,
    options?: EventsQueryOptions,
  ) => Promise<EventDetail[]>;
  pushEventTransaction: (eventDetail: EventDetail) => unknown;

  entityName: string;
  tableName: string;
  table: Table<string, typeof EVENT_TABLE_PK, typeof EVENT_TABLE_SK>;

  constructor({
    entityName,
    tableName,
  }: {
    tableName: string;
    entityName: string;
  }) {
    this.entityName = entityName;
    this.tableName = tableName;

    this.table = new Table({
      name: tableName,
      partitionKey: EVENT_TABLE_PK,
      sortKey: EVENT_TABLE_SK,
      attributes: {
        [EVENT_TABLE_PK]: 'string',
        [EVENT_TABLE_SK]: 'number',
      },
      autoExecute: true,
      autoParse: true,
      DocumentClient,
    });

    const entity = new Entity({
      name: entityName,
      attributes: {
        aggregateId: { type: 'string', partitionKey: true },
        version: { type: 'number', sortKey: true },
        type: { type: 'string', required: true },
        timestamp: {
          type: 'string',
          required: true,
          default: () => new Date().toISOString(),
        },
        payload: { type: 'map' },
        metadata: { type: 'map' },
      },
      table: this.table,
      timestamps: false,
    } as const);

    this.pushEvent = async event => {
      await entity.put(event, {
        conditions: { attr: 'version', exists: false },
      });
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

      return items.map(
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
      );
    };

    this.pushEventTransaction = event =>
      entity.putTransaction(event, {
        conditions: { attr: 'version', exists: false },
      });
  }
}
