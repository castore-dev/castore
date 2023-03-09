import type { SQSEvent } from 'aws-lambda';

import type {
  EventStoreEventsDetails,
  EventStoreAggregate,
  NotificationMessageQueue,
  StateCarryingMessageQueue,
  MessageQueueSourceEventStoreIds,
  MessageQueueSourceEventStoreIdTypes,
  MessageQueueSourceEventStores,
} from '@castore/core';

export type SQSMessageQueueMessage = SQSEvent;

type Prettify<T extends Record<string, unknown>> = T extends infer U
  ? {
      [K in keyof U]: U[K];
    }
  : never;

export type SQSMessageQueueMessageBody<
  M extends NotificationMessageQueue | StateCarryingMessageQueue,
  S extends MessageQueueSourceEventStoreIds<M> = MessageQueueSourceEventStoreIds<M>,
  T extends MessageQueueSourceEventStoreIdTypes<
    M,
    S
  > = MessageQueueSourceEventStoreIdTypes<M, S>,
> = Prettify<
  S extends infer I
    ? I extends string
      ? {
          eventStoreId: I;
          event: T extends infer U
            ? U extends MessageQueueSourceEventStoreIdTypes<M, I>
              ? Extract<
                  EventStoreEventsDetails<
                    Extract<
                      MessageQueueSourceEventStores<M>,
                      { eventStoreId: S }
                    >
                  >,
                  { type: U }
                >
              : never
            : never;
        } & (M extends StateCarryingMessageQueue
          ? {
              aggregate: EventStoreAggregate<
                Extract<MessageQueueSourceEventStores<M>, { eventStoreId: S }>
              >;
            }
          : unknown)
      : never
    : never
>;
