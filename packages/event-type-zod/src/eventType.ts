import { ZodType, ZodTypeAny } from 'zod';

import { EventDetail, EventType, EventDetailParser } from '@castore/core';

const zodPayloadParser =
  <PAYLOAD>(payloadSchema: ZodType<PAYLOAD>) =>
  (eventDetail: EventDetail) => {
    const parsedPayload = payloadSchema.safeParse(eventDetail.payload);

    if (parsedPayload.success) {
      return {
        isValid: true,
        parsedCandidate: {
          ...eventDetail,
          payload: parsedPayload.data,
        },
      };
    }

    return {
      isValid: false,
      parsingErrors: parsedPayload.error.errors.map(
        ({ message }) => new Error(message),
      ),
    };
  };

const zodMetadataParser =
  <METADATA>(metadataSchema: ZodType<METADATA>) =>
  (eventDetail: EventDetail) => {
    const parsedMetadata = metadataSchema.safeParse(eventDetail.metadata);

    if (parsedMetadata.success) {
      return {
        isValid: true,
        parsedCandidate: {
          ...eventDetail,
          metadata: parsedMetadata.data,
        },
      };
    }

    return {
      isValid: false,
      parsingErrors: parsedMetadata.error.errors.map(
        ({ message }) => new Error(message),
      ),
    };
  };

/* eslint-disable complexity */
const zodEventDetailParser = <TYPE extends string, PAYLOAD, METADATA>(
  payloadSchema: ZodType<PAYLOAD> | undefined,
  metadataSchema: ZodType<METADATA> | undefined,
): EventDetailParser<TYPE, PAYLOAD, METADATA> | undefined => {
  if (payloadSchema === undefined && metadataSchema === undefined) {
    return undefined;
  }

  if (metadataSchema === undefined && payloadSchema !== undefined) {
    return zodPayloadParser(payloadSchema) as EventDetailParser<
      TYPE,
      PAYLOAD,
      METADATA
    >;
  }

  if (metadataSchema !== undefined && payloadSchema === undefined) {
    return zodMetadataParser(metadataSchema) as EventDetailParser<
      TYPE,
      PAYLOAD,
      METADATA
    >;
  }

  if (payloadSchema !== undefined && metadataSchema !== undefined) {
    const parser = (eventDetail: EventDetail) => {
      const parsedPayload = payloadSchema.safeParse(eventDetail.payload);
      const parsedMetadata = metadataSchema.safeParse(eventDetail.metadata);

      if (parsedPayload.success && parsedMetadata.success) {
        return {
          isValid: true,
          parsedCandidate: {
            ...eventDetail,
            payload: parsedPayload.data,
            metadata: parsedMetadata.data,
          },
        };
      }

      const payloadErrors = parsedPayload.success
        ? []
        : parsedPayload.error.errors.map(({ message }) => new Error(message));
      const metadataErrors = parsedMetadata.success
        ? []
        : parsedMetadata.error.errors.map(({ message }) => new Error(message));

      return {
        isValid: false,
        parsingErrors: [...payloadErrors, ...metadataErrors],
      };
    };

    return parser as EventDetailParser<TYPE, PAYLOAD, METADATA>;
  }

  return undefined;
};

export class ZodEventType<
  TYPE extends string = string,
  PAYLOAD_SCHEMA extends ZodType | undefined = string extends TYPE
    ? ZodTypeAny | undefined
    : never,
  METADATA_SCHEMA extends ZodType | undefined = string extends TYPE
    ? ZodTypeAny | undefined
    : never,
  PAYLOAD = string extends TYPE
    ? never
    : PAYLOAD_SCHEMA extends ZodType
    ? Zod.infer<PAYLOAD_SCHEMA>
    : unknown,
  METADATA = string extends TYPE
    ? never
    : METADATA_SCHEMA extends ZodType
    ? Zod.infer<METADATA_SCHEMA>
    : unknown,
> extends EventType<TYPE, PAYLOAD, METADATA> {
  _types?: {
    detail: EventDetail<TYPE, PAYLOAD, METADATA>;
  };
  payloadSchema?: PAYLOAD_SCHEMA;
  metadataSchema?: METADATA_SCHEMA;
  parseEventDetail?: EventDetailParser<TYPE, PAYLOAD, METADATA> | undefined;

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
    this.parseEventDetail = zodEventDetailParser<TYPE, PAYLOAD, METADATA>(
      payloadSchema,
      metadataSchema,
    );
  }
}
