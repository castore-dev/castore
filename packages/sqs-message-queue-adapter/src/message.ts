import type { SQSEvent } from 'aws-lambda';

import type {
  NotificationMessageQueue,
  StateCarryingMessageQueue,
  EventStoreNotificationMessage,
  EventStoreStateCarryingMessage,
  MessageQueueSourceEventStores,
} from '@castore/core';

export type SQSMessageQueueMessage = SQSEvent;

type Prettify<OBJECTS extends Record<string, unknown>> =
  OBJECTS extends infer OBJECT
    ? {
        [KEY in keyof OBJECT]: OBJECT[KEY];
      }
    : never;

export type SQSMessageQueueMessageBody<
  MESSAGE_QUEUE extends StateCarryingMessageQueue | NotificationMessageQueue,
> = Prettify<
  MESSAGE_QUEUE extends StateCarryingMessageQueue
    ? EventStoreStateCarryingMessage<
        EventStoreNotificationMessage<
          MessageQueueSourceEventStores<MESSAGE_QUEUE>
        >
      >
    : MESSAGE_QUEUE extends NotificationMessageQueue
    ? EventStoreNotificationMessage<
        MessageQueueSourceEventStores<MESSAGE_QUEUE>
      >
    : never
>;
