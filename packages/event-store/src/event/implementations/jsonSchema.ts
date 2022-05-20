import { FromSchema, JSONSchema } from 'json-schema-to-ts';

import { EventDetail } from '../eventDetail';
import { EventType } from '../eventType';

export class JSONSchemaEventType<
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
> implements EventType<T, D>
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
