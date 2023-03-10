import type { SQSEvent } from 'aws-lambda';

import type {
  NotificationMessageQueue,
  StateCarryingMessageQueue,
  EventStoreNotificationMessage,
  EventStoreStateCarryingMessage,
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
> = Prettify<
  M extends NotificationMessageQueue
    ? EventStoreNotificationMessage<MessageQueueSourceEventStores<M>>
    : M extends StateCarryingMessageQueue
    ? EventStoreStateCarryingMessage<
        EventStoreNotificationMessage<MessageQueueSourceEventStores<M>>
      >
    : never
>;
