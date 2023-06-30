import type {
  AggregateExistsMessage,
  NotificationMessage,
  StateCarryingMessage,
} from '@castore/core';

type Prettify<OBJECTS extends Record<string, unknown>> =
  OBJECTS extends infer OBJECT
    ? {
        [KEY in keyof OBJECT]: OBJECT[KEY];
      }
    : never;

export type InMemoryMessageBusMessage<
  MESSAGE extends
    | AggregateExistsMessage
    | NotificationMessage
    | StateCarryingMessage =
    | AggregateExistsMessage
    | NotificationMessage
    | StateCarryingMessage,
  EVENT_STORE_IDS extends MESSAGE['eventStoreId'] = MESSAGE['eventStoreId'],
  EVENT_TYPES extends MESSAGE extends NotificationMessage | StateCarryingMessage
    ? Extract<MESSAGE, { eventStoreId: EVENT_STORE_IDS }>['event']['type']
    : never = MESSAGE extends NotificationMessage | StateCarryingMessage
    ? Extract<MESSAGE, { eventStoreId: EVENT_STORE_IDS }>['event']['type']
    : never,
> = Prettify<
  EVENT_STORE_IDS extends infer EVENT_STORE_ID
    ? EVENT_STORE_ID extends string
      ? Extract<MESSAGE, { eventStoreId: EVENT_STORE_ID }> &
          (MESSAGE extends NotificationMessage | StateCarryingMessage
            ? { event: { type: EVENT_TYPES } }
            : unknown)
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
