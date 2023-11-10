import type { FromSchema, JSONSchema } from 'json-schema-to-ts';

import { EventType } from '@castore/core';

export class JSONSchemaEventType<
  TYPE extends string = string,
  PAYLOAD_SCHEMA extends JSONSchema | undefined = JSONSchema | undefined,
  PAYLOAD = JSONSchema extends PAYLOAD_SCHEMA
    ? string extends TYPE
      ? unknown
      : never
    : PAYLOAD_SCHEMA extends JSONSchema
    ? FromSchema<PAYLOAD_SCHEMA>
    : never,
  METADATA_SCHEMA extends JSONSchema | undefined = JSONSchema | undefined,
  METADATA = JSONSchema extends METADATA_SCHEMA
    ? string extends TYPE
      ? unknown
      : never
    : METADATA_SCHEMA extends JSONSchema
    ? FromSchema<METADATA_SCHEMA>
    : never,
> extends EventType<TYPE, PAYLOAD, METADATA> {
  payloadSchema?: PAYLOAD_SCHEMA;
  metadataSchema?: METADATA_SCHEMA;

  constructor({
    type,
    payloadSchema,
    metadataSchema,
  }: {
    type: TYPE;
    payloadSchema?: PAYLOAD_SCHEMA;
    metadataSchema?: METADATA_SCHEMA;
  }) {
    super({ type });
    this.payloadSchema = payloadSchema;
    this.metadataSchema = metadataSchema;
  }
}
