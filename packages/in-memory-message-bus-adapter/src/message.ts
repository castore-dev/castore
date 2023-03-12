import type { Message } from '@castore/core';

type Prettify<OBJECTS extends Record<string, unknown>> =
  OBJECTS extends infer OBJECT
    ? {
        [KEY in keyof OBJECT]: OBJECT[KEY];
      }
    : never;

export type InMemoryMessageBusMessage<
  MESSAGE extends Message = Message,
  EVENT_STORE_IDS extends MESSAGE['eventStoreId'] = MESSAGE['eventStoreId'],
  EVENT_TYPES extends Extract<
    MESSAGE,
    { eventStoreId: EVENT_STORE_IDS }
  >['event']['type'] = Extract<
    MESSAGE,
    { eventStoreId: EVENT_STORE_IDS }
  >['event']['type'],
> = Prettify<
  EVENT_STORE_IDS extends infer EVENT_STORE_ID
    ? EVENT_STORE_ID extends string
      ? EVENT_TYPES extends infer EVENT_TYPE
        ? Extract<
            MESSAGE,
            { eventStoreId: EVENT_STORE_IDS; event: { type: EVENT_TYPE } }
          >
        : never
      : never
    : never
>;

export type Task<
  MESSAGE extends InMemoryMessageBusMessage = InMemoryMessageBusMessage,
> = {
  message: MESSAGE;
  retryHandlerIndex?: number;
  attempt: number;
  retryAttemptsLeft: number;
};
