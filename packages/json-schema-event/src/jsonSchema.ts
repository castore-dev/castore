import { FromSchema, JSONSchema } from 'json-schema-to-ts';

import { EventDetail, EventType } from '@castore/core';

export class JSONSchemaEventType<
  T extends string = string,
  PS extends JSONSchema | undefined = JSONSchema | undefined,
  P = JSONSchema extends PS
    ? string extends T
      ? unknown
      : never
    : PS extends JSONSchema
    ? FromSchema<PS>
    : never,
  MS extends JSONSchema | undefined = JSONSchema | undefined,
  M = JSONSchema extends MS
    ? string extends T
      ? unknown
      : never
    : MS extends JSONSchema
    ? FromSchema<MS>
    : never,
> implements EventType<T, P, M>
{
  _types?: {
    detail: EventDetail<T, P, M>;
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
