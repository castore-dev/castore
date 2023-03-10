import type { Message } from '@castore/core';

type Prettify<T extends Record<string, unknown>> = T extends infer U
  ? {
      [K in keyof U]: U[K];
    }
  : never;

export type InMemoryMessageBusMessage<
  M extends Message = Message,
  S extends M['eventStoreId'] = M['eventStoreId'],
  T extends Extract<M, { eventStoreId: S }>['event']['type'] = Extract<
    M,
    { eventStoreId: S }
  >['event']['type'],
> = Prettify<
  S extends infer I
    ? I extends string
      ? T extends infer U
        ? Extract<M, { eventStoreId: S; event: { type: U } }>
        : never
      : never
    : never
>;

export type Task<
  M extends InMemoryMessageBusMessage = InMemoryMessageBusMessage,
> = {
  message: M;
  retryHandlerIndex?: number;
  attempt: number;
  retryAttemptsLeft: number;
};
