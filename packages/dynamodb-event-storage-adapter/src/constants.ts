import { marshallOptions as MarshallOptions } from '@aws-sdk/util-dynamodb';

export const EVENT_TABLE_PK = 'aggregateId';
export const EVENT_TABLE_SK = 'version';
export const EVENT_TABLE_TIMESTAMP_KEY = 'timestamp';
export const EVENT_TABLE_EVENT_TYPE_KEY = 'type';
export const EVENT_TABLE_PAYLOAD_KEY = 'payload';
export const EVENT_TABLE_METADATA_KEY = 'metadata';
export const EVENT_TABLE_IS_INITIAL_EVENT_KEY = 'isInitialEvent';
export const EVENT_TABLE_EVENT_STORE_ID_KEY = 'eventStoreId';
export const EVENT_TABLE_INITIAL_EVENT_INDEX_NAME = 'initialEvents';

export const marshallOptions: MarshallOptions = {
  convertEmptyValues: false,
  removeUndefinedValues: true,
};
