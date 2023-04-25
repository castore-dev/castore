import type { O } from 'ts-toolbelt';

export type EventDetail<
  TYPE extends string = string,
  PAYLOAD = unknown,
  METADATA = unknown,
> = O.Optional<
  O.Omit<
    {
      aggregateId: string;
      version: number;
      type: TYPE;
      timestamp: string;
      payload: PAYLOAD;
      metadata: METADATA;
    },
    | ([PAYLOAD] extends [never] ? 'payload' : never)
    | ([METADATA] extends [never] ? 'metadata' : never)
  >,
  | (undefined extends PAYLOAD ? 'payload' : never)
  | (undefined extends METADATA ? 'metadata' : never)
>;

export type OptionalTimestamp<EVENT_DETAILS extends EventDetail> =
  EVENT_DETAILS extends infer EVENT_DETAIL
    ? EVENT_DETAIL extends EventDetail
      ? O.Optional<EVENT_DETAIL, 'timestamp'>
      : never
    : never;
