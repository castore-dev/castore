import { z, ZodType } from 'zod';

import { EventDetail, EventType } from '@castore/core';

export class ZodEventType<
  TYPE extends string = string,
  PAYLOAD_SCHEMA extends ZodType | undefined = ZodType | undefined,
  PAYLOAD = ZodType extends PAYLOAD_SCHEMA
    ? string extends TYPE
      ? unknown
      : never
    : PAYLOAD_SCHEMA extends ZodType
    ? z.infer<PAYLOAD_SCHEMA>
    : never,
  METADATA_SCHEMA extends ZodType | undefined = ZodType | undefined,
  METADATA = ZodType extends METADATA_SCHEMA
    ? string extends TYPE
      ? unknown
      : never
    : METADATA_SCHEMA extends ZodType
    ? z.infer<METADATA_SCHEMA>
    : never,
> implements EventType<TYPE, PAYLOAD, METADATA>
{
  _types?: {
    detail: EventDetail<TYPE, PAYLOAD, METADATA>;
  };
  type: TYPE;
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
    this.type = type;
    this.payloadSchema = payloadSchema;
    this.metadataSchema = metadataSchema;
  }
}
