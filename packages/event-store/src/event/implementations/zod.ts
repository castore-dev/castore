import { z, ZodType } from 'zod';

import { EventDetail } from '../eventDetail';
import { EventType } from '../eventType';

export class ZodEventType<
  T extends string = string,
  MS extends ZodType | undefined = ZodType | undefined,
  PS extends ZodType | undefined = ZodType | undefined,
  $D = undefined extends MS
    ? undefined extends PS
      ? // No metadata + No payload
        {
          aggregateId: string;
          version: number;
          type: T;
          timestamp: string;
        }
      : PS extends ZodType
      ? // No metadata + With payload
        {
          aggregateId: string;
          version: number;
          type: T;
          timestamp: string;
          payload: z.infer<PS>;
        }
      : never
    : MS extends ZodType
    ? undefined extends PS
      ? // With metadata + No payload
        {
          aggregateId: string;
          version: number;
          type: T;
          timestamp: string;
          metadata: z.infer<MS>;
        }
      : PS extends ZodType
      ? // With metadata + With payload
        {
          aggregateId: string;
          version: number;
          type: T;
          timestamp: string;
          payload: z.infer<PS>;
          metadata: z.infer<MS>;
        }
      : never
    : never,
  D extends EventDetail = $D extends EventDetail ? $D : never,
> implements EventType<T, D>
{
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  _types: {
    detail: D;
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
