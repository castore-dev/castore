import { FromSchema, JSONSchema } from 'json-schema-to-ts';

import { EventDetail } from '../eventDetail';
import { EventType } from '../eventType';

export class JSONSchemaEventType<
  T extends string = string,
  // Metadata
  MS extends JSONSchema | undefined = JSONSchema | undefined,
  PS extends JSONSchema | undefined = JSONSchema | undefined,
  $D = undefined extends MS
    ? undefined extends PS
      ? // No metadata + No payload
        FromSchema<{
          type: 'object';
          properties: {
            aggregateId: { type: 'string' };
            version: { type: 'number' };
            type: { const: T };
            timestamp: { type: 'string'; format: 'date-time' };
          };
          required: ['aggregateId', 'version', 'type', 'timestamp'];
          additionalProperties: false;
        }>
      : PS extends JSONSchema
      ? // No metadata + With payload
        FromSchema<{
          type: 'object';
          properties: {
            aggregateId: { type: 'string' };
            version: { type: 'number' };
            type: { const: T };
            timestamp: { type: 'string'; format: 'date-time' };
            payload: PS;
          };
          required: ['aggregateId', 'version', 'type', 'timestamp', 'payload'];
          additionalProperties: false;
        }>
      : never
    : MS extends JSONSchema
    ? undefined extends PS
      ? // With metadata + No payload
        FromSchema<{
          type: 'object';
          properties: {
            aggregateId: { type: 'string' };
            version: { type: 'number' };
            type: { const: T };
            timestamp: { type: 'string'; format: 'date-time' };
            metadata: MS;
          };
          required: ['aggregateId', 'version', 'type', 'timestamp', 'metadata'];
          additionalProperties: false;
        }>
      : PS extends JSONSchema
      ? // With metadata + With payload
        FromSchema<{
          type: 'object';
          properties: {
            aggregateId: { type: 'string' };
            version: { type: 'number' };
            type: { const: T };
            timestamp: { type: 'string'; format: 'date-time' };
            payload: PS;
            metadata: MS;
          };
          required: [
            'aggregateId',
            'version',
            'type',
            'timestamp',
            'payload',
            'metadata',
          ];
          additionalProperties: false;
        }>
      : never
    : never,
  D extends EventDetail = $D extends EventDetail ? $D : never,
> implements EventType<T, D>
{
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  _types: {
    detail: D;
  };
  type: T;
  payloadSchema?: PS;
  metadataSchema?: MS;

  constructor({
    type,
    payloadSchema,
    metadataSchema,
  }: {
    type: T;
    payloadSchema?: PS;
    metadataSchema?: MS;
  }) {
    this.type = type;
    this.payloadSchema = payloadSchema;
    this.metadataSchema = metadataSchema;
  }
}
