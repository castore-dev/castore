import type { AnyMessage } from '@castore/core';

type Prettify<T extends Record<string, unknown>> = T extends infer U
  ? {
      [K in keyof U]: U[K];
    }
  : never;

export type InMemoryMessageBusMessage<
  M extends AnyMessage,
  S extends M['eventStoreId'] = M['eventStoreId'],
  T extends Extract<M, { eventStoreId: S }>['type'] = Extract<
    M,
    { eventStoreId: S }
  >['type'],
> = Prettify<
  S extends infer I
    ? I extends string
      ? T extends infer U
        ? Extract<Extract<M, { eventStoreId: S }>, { type: U }>
        : never
      : never
    : never
>;
