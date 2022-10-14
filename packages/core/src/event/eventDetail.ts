import { O } from 'ts-toolbelt';

export type EventDetail<
  T extends string = string,
  P = unknown,
  M = unknown,
> = O.Optional<
  O.Omit<
    {
      aggregateId: string;
      version: number;
      type: T;
      timestamp: string;
      payload: P;
      metadata: M;
    },
    | ([P] extends [never] ? 'payload' : never)
    | ([M] extends [never] ? 'metadata' : never)
  >,
  | (undefined extends P ? 'payload' : never)
  | (undefined extends M ? 'metadata' : never)
>;
