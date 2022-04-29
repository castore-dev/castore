import { JSONSchema } from "json-schema-to-ts";
import { A, O } from "ts-toolbelt";

export class EventStoreEvent<
  T extends string = string,
  S extends JSONSchema = { type: "object" }
> {
  type: T;
  payloadSchema: S;
  schema: O.Readonly<
    {
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
    },
    A.Key,
    "deep"
  >;

  constructor({
    type,
    payloadSchema = { type: "object", additionalProperties: false } as S,
  }: {
    type: T;
    payloadSchema?: S;
  }) {
    this.type = type;
    this.payloadSchema = payloadSchema;
    this.schema = {
      type: "object",
      properties: {
        aggregateId: { type: "string" },
        version: { type: "number" },
        type: { const: type },
        timestamp: { type: "string", format: "date-time" },
        payload: payloadSchema,
      },
      required: ["aggregateId", "version", "type", "timestamp", "payload"],
      additionalProperties: false,
    } as const;
  }
}
