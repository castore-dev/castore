import type { z, ZodType } from 'zod';

import { EventType } from '@castore/core';

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
