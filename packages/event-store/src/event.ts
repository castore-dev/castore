import { FromSchema, JSONSchema } from "json-schema-to-ts";

import { EventDetail } from "./eventDetail";

export class EventStoreEvent<
  T extends string = string,
  S extends JSONSchema = { type: "object"; additionalProperties: false },
  I = FromSchema<{
    type: "object";
    properties: {
      aggregateId: { type: "string" };
      version: { type: "number" };
      type: { const: T };
      timestamp: { type: "string"; format: "date-time" };
      payload: S;
    };
    required: ["aggregateId", "version", "type", "timestamp", "payload"];
    additionalProperties: false;
  }>,
  D extends EventDetail = I extends EventDetail ? I : never
> {
  _types?: { detail?: D };
  type: T;
  payloadSchema: S;

  constructor({
    type,
    payloadSchema = { type: "object", additionalProperties: false } as S,
  }: {
    type: T;
    payloadSchema?: S;
  }) {
    this.type = type;
    this.payloadSchema = payloadSchema;
  }
}

export type EventStoreEventDetail<E extends EventStoreEvent> = Exclude<
  Exclude<E["_types"], undefined>["detail"],
  undefined
>;
