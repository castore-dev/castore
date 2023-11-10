import type { FromSchema } from 'json-schema-to-ts';
import type { A } from 'ts-toolbelt';

import type { EventTypeDetail } from '@castore/core';

import { JSONSchemaEventType } from './eventType';

const expectedProperties = new Set([
  // applying super(...) apparently adds { _types: undefined, parseEventDetail: undefined } to the class
  '_types',
  'parseEventDetail',
  'type',
  'payloadSchema',
  'metadataSchema',
]);

describe('jsonSchemaEvent implementation', () => {
  const type = 'SOMETHING_HAPPENED';

  const payloadSchema = {
    type: 'object',
    properties: {
      message: { type: 'string' },
    },
    required: ['message'],
    additionalProperties: false,
  } as const;

  type Payload = FromSchema<typeof payloadSchema>;

  const metadataSchema = {
    type: 'object',
    properties: {
      userEmail: { type: 'string', format: 'email' },
    },
    required: ['userEmail'],
    additionalProperties: false,
  } as const;

  type Metadata = FromSchema<typeof metadataSchema>;

  it('has correct properties (no payload, no metadata)', () => {
    const simpleEventType = new JSONSchemaEventType({ type });

    const assertExtends: A.Extends<
      typeof simpleEventType,
      JSONSchemaEventType
    > = 1;
    assertExtends;

    type SimpleEventTypeDetail = EventTypeDetail<typeof simpleEventType>;
    const assertSimpleEventTypeDetail: A.Equals<
      SimpleEventTypeDetail,
      {
        aggregateId: string;
        version: number;
        type: typeof type;
        timestamp: string;
      }
    > = 1;
    assertSimpleEventTypeDetail;

    expect(new Set(Object.keys(simpleEventType))).toStrictEqual(
      expectedProperties,
    );
    expect(simpleEventType.type).toStrictEqual(type);
    expect(simpleEventType.payloadSchema).toStrictEqual(undefined);
    expect(simpleEventType.metadataSchema).toStrictEqual(undefined);
  });

  it('has correct properties (with payload, no metadata)', () => {
    const payloadEventType = new JSONSchemaEventType({
      type,
      payloadSchema,
    });

    const assertExtends: A.Extends<
      typeof payloadEventType,
      JSONSchemaEventType
    > = 1;
    assertExtends;

    type PayloadEventTypeDetail = EventTypeDetail<typeof payloadEventType>;
    const assertPayloadEventTypeDetail: A.Equals<
      PayloadEventTypeDetail,
      {
        aggregateId: string;
        version: number;
        type: typeof type;
        timestamp: string;
        payload: Payload;
      }
    > = 1;
    assertPayloadEventTypeDetail;

    expect(new Set(Object.keys(payloadEventType))).toStrictEqual(
      expectedProperties,
    );
    expect(payloadEventType.type).toStrictEqual(type);
    expect(payloadEventType.payloadSchema).toStrictEqual(payloadSchema);
    expect(payloadEventType.metadataSchema).toStrictEqual(undefined);
  });

  it('has correct properties (no payload, with metadata)', () => {
    const metadataEventType = new JSONSchemaEventType({
      type,
      metadataSchema,
    });

    const assertExtends: A.Extends<
      typeof metadataEventType,
      JSONSchemaEventType
    > = 1;
    assertExtends;

    type MetadataEventTypeDetail = EventTypeDetail<typeof metadataEventType>;
    const assertMetadataEventTypeDetail: A.Equals<
      MetadataEventTypeDetail,
      {
        aggregateId: string;
        version: number;
        type: typeof type;
        timestamp: string;
        metadata: Metadata;
      }
    > = 1;
    assertMetadataEventTypeDetail;

    expect(new Set(Object.keys(metadataEventType))).toStrictEqual(
      expectedProperties,
    );
    expect(metadataEventType.type).toStrictEqual(type);
    expect(metadataEventType.payloadSchema).toStrictEqual(undefined);
    expect(metadataEventType.metadataSchema).toStrictEqual(metadataSchema);
  });

  it('has correct properties (with payload, with metadata)', () => {
    const fullEventType = new JSONSchemaEventType({
      type,
      payloadSchema,
      metadataSchema,
    });

    const assertExtends: A.Extends<
      typeof fullEventType,
      JSONSchemaEventType
    > = 1;
    assertExtends;

    type FullEventTypeDetail = EventTypeDetail<typeof fullEventType>;
    const assertFullEventTypeDetail: A.Equals<
      FullEventTypeDetail,
      {
        aggregateId: string;
        version: number;
        type: typeof type;
        timestamp: string;
        payload: Payload;
        metadata: Metadata;
      }
    > = 1;
    assertFullEventTypeDetail;

    expect(new Set(Object.keys(fullEventType))).toStrictEqual(
      expectedProperties,
    );
    expect(fullEventType.type).toStrictEqual(type);
    expect(fullEventType.payloadSchema).toStrictEqual(payloadSchema);
    expect(fullEventType.metadataSchema).toStrictEqual(metadataSchema);
  });
});
