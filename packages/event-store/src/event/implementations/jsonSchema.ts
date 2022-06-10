import { FromSchema, JSONSchema } from 'json-schema-to-ts';

import { EventDetail } from '../eventDetail';
import { EventType } from '../eventType';
import { OmitUndefinableKeys } from './utils';

export class JSONSchemaEventType<
  T extends string = string,
  // Metadata
  MS extends JSONSchema | undefined = JSONSchema | undefined,
  PS extends JSONSchema | undefined = JSONSchema | undefined,
  $D = OmitUndefinableKeys<{
    aggregateId: string;
    version: number;
    type: T;
    timestamp: string;
    payload: PS extends JSONSchema ? FromSchema<PS> : undefined;
    metadata: MS extends JSONSchema ? FromSchema<MS> : undefined;
  }>,
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
