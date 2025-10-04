import type * as z3 from 'zod/v3';
import type * as z4 from 'zod/v4/core';

import { EventType } from '@castore/core';

type ZodType = z3.ZodTypeAny | z4.$ZodType;
type inferZodType<T extends ZodType> = T extends z3.ZodTypeAny
  ? z3.infer<T>
  : z4.infer<T>;

export class ZodEventType<
  TYPE extends string = string,
  PAYLOAD_SCHEMA extends ZodType | undefined = ZodType | undefined,
  PAYLOAD = ZodType extends PAYLOAD_SCHEMA
    ? string extends TYPE
      ? unknown
      : never
    : PAYLOAD_SCHEMA extends ZodType
    ? inferZodType<PAYLOAD_SCHEMA>
    : never,
  METADATA_SCHEMA extends ZodType | undefined = ZodType | undefined,
  METADATA = ZodType extends METADATA_SCHEMA
    ? string extends TYPE
      ? unknown
      : never
    : METADATA_SCHEMA extends ZodType
    ? inferZodType<METADATA_SCHEMA>
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
