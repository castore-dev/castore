import { AnyZodObject, z } from 'zod';

import { EventDetail } from '../eventDetail';
import { EventType } from '../eventType';

export class ZodEventType<
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
> implements EventType<T, D>
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
