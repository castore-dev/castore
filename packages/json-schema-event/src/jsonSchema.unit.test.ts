import { FromSchema } from 'json-schema-to-ts';
import { A } from 'ts-toolbelt';

import { EventTypeDetail } from '@castore/event-store';

import { JSONSchemaEventType } from './jsonSchema';

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

    expect(Object.keys(simpleEventType)).toHaveLength(3);
    expect(simpleEventType.type).toStrictEqual(type);
    expect(simpleEventType.payloadSchema).toStrictEqual(undefined);
    expect(simpleEventType.metadataSchema).toStrictEqual(undefined);
  });

  it('has correct properties (with payload, no metadata)', () => {
    const payloadEventType = new JSONSchemaEventType({
      type,
      payloadSchema,
    });

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

    expect(Object.keys(payloadEventType)).toHaveLength(3);
    expect(payloadEventType.type).toStrictEqual(type);
    expect(payloadEventType.payloadSchema).toStrictEqual(payloadSchema);
    expect(payloadEventType.metadataSchema).toStrictEqual(undefined);
  });

  it('has correct properties (no payload, with metadata)', () => {
    const metadataEventType = new JSONSchemaEventType({
      type,
      metadataSchema,
    });

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

    expect(Object.keys(metadataEventType)).toHaveLength(3);
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

    expect(Object.keys(fullEventType)).toHaveLength(3);
    expect(fullEventType.type).toStrictEqual(type);
    expect(fullEventType.payloadSchema).toStrictEqual(payloadSchema);
    expect(fullEventType.metadataSchema).toStrictEqual(metadataSchema);
  });
});
