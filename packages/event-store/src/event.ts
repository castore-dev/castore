import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { AnyZodObject, z } from 'zod';

import { EventDetail } from './eventDetail';

export class EventStoreEvent<
  T extends string = string,
  D extends EventDetail = EventDetail,
> {
  _types?: { detail?: D };
  type: T;

  constructor({ type }: { type: T }) {
    this.type = type;
  }
}

export type EventStoreEventDetail<
  E extends EventStoreEvent,
  D extends EventDetail = Exclude<
    Exclude<E['_types'], undefined>['detail'],
    undefined
  >,
> = EventDetail extends D
  ? {
      aggregateId: string;
      version: number;
      type: E['type'];
      timestamp: string;
      payload: Record<never, unknown>;
    }
  : D;

// JSON-schema

export class JSONSchemaEvent<
  T extends string = string,
  S extends JSONSchema = { type: 'object'; additionalProperties: false },
  I = FromSchema<{
    type: 'object';
    properties: {
      aggregateId: { type: 'string' };
      version: { type: 'number' };
      type: { const: T };
      timestamp: { type: 'string'; format: 'date-time' };
      payload: S;
    };
    required: ['aggregateId', 'version', 'type', 'timestamp', 'payload'];
    additionalProperties: false;
  }>,
  D extends EventDetail = I extends EventDetail ? I : never,
> implements EventStoreEvent<T, D>
{
  _types?: { detail?: D };
  type: T;
  payloadSchema: S;

  constructor({
    type,
    payloadSchema = { type: 'object', additionalProperties: false } as S,
  }: {
    type: T;
    payloadSchema?: S;
  }) {
    this.type = type;
    this.payloadSchema = payloadSchema;
  }
}

// Zod

export class ZodEvent<
  T extends string = string,
  Z extends AnyZodObject = AnyZodObject,
  I = {
    aggregateId: string;
    version: number;
    type: T;
    timestamp: string;
    payload: z.infer<Z>;
  },
  D extends EventDetail = I extends EventDetail ? I : never,
> implements EventStoreEvent<T, D>
{
  _types?: { detail?: D };
  type: T;
  payloadSchema: Z;

  constructor({
    type,
    payloadSchema = z.object({}) as Z,
  }: {
    type: T;
    payloadSchema?: Z;
  }) {
    this.type = type;
    this.payloadSchema = payloadSchema;
  }
}
