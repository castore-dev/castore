import type { SQSRecord } from 'aws-lambda';

import type {
  AggregateExistsMessageQueue,
  EventStoreAggregateExistsMessage,
  NotificationMessageQueue,
  EventStoreNotificationMessage,
  StateCarryingMessageQueue,
  EventStoreStateCarryingMessage,
  MessageChannelSourceEventStores,
} from '@castore/core';

export interface SQSMessageQueueRecord extends SQSRecord {
  messageAttributes: {
    replay?: { stringValue: 'true'; dataType: 'String' };
  };
}

export interface SQSMessageQueueMessage {
  Records: SQSMessageQueueRecord[];
}

type Prettify<OBJECTS extends Record<string, unknown>> =
  OBJECTS extends infer OBJECT
    ? {
        [KEY in keyof OBJECT]: OBJECT[KEY];
      }
    : never;

export type SQSMessageQueueMessageBody<
  MESSAGE_QUEUE extends
    | AggregateExistsMessageQueue
    | StateCarryingMessageQueue
    | NotificationMessageQueue,
> = Prettify<
  MESSAGE_QUEUE extends StateCarryingMessageQueue
    ? EventStoreStateCarryingMessage<
        EventStoreNotificationMessage<
          MessageChannelSourceEventStores<MESSAGE_QUEUE>
        >
      >
    : MESSAGE_QUEUE extends NotificationMessageQueue
    ? EventStoreNotificationMessage<
        MessageChannelSourceEventStores<MESSAGE_QUEUE>
      >
    : MESSAGE_QUEUE extends AggregateExistsMessageQueue
    ? EventStoreAggregateExistsMessage<
        MessageChannelSourceEventStores<MESSAGE_QUEUE>
      >
    : never
>;
