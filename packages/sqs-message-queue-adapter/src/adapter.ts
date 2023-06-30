import {
  SQSClient,
  SendMessageCommand,
  SendMessageBatchCommand,
} from '@aws-sdk/client-sqs';
import chunk from 'lodash.chunk';

import {
  isAggregateExistsMessage,
  isEventCarryingMessage,
  Message,
  MessageChannelAdapter,
} from '@castore/core';

export const SQS_MAX_MESSAGE_BATCH_SIZE = 10;

const parseMessage = (
  message: Message,
): { aggregateId: string; version?: number } => {
  if (isAggregateExistsMessage(message)) {
    return { aggregateId: message.aggregateId };
  }

  if (isEventCarryingMessage(message)) {
    const { event } = message;

    return {
      aggregateId: event.aggregateId,
      version: event.version,
    };
  }

  throw new Error('Unable to parse message');
};

export class SQSMessageQueueAdapter implements MessageChannelAdapter {
  publishMessage: MessageChannelAdapter['publishMessage'];
  publishMessages: MessageChannelAdapter['publishMessages'];
  getQueueUrl: () => string;
  queueUrl: string | (() => string);
  sqsClient: SQSClient;
  fifo: boolean;

  constructor({
    queueUrl,
    sqsClient,
    fifo = false,
  }: {
    queueUrl: string | (() => string);
    sqsClient: SQSClient;
    fifo?: boolean;
  }) {
    this.queueUrl = queueUrl;
    this.sqsClient = sqsClient;
    this.fifo = fifo;

    this.getQueueUrl = () =>
      typeof this.queueUrl === 'string' ? this.queueUrl : this.queueUrl();

    this.publishMessage = async message => {
      const { eventStoreId } = message;
      const { aggregateId, version } = parseMessage(message);

      await this.sqsClient.send(
        new SendMessageCommand({
          MessageBody: JSON.stringify(message),
          QueueUrl: this.getQueueUrl(),
          ...(this.fifo
            ? {
                MessageDeduplicationId: [eventStoreId, aggregateId, version]
                  .filter(Boolean)
                  .join('#'),
                MessageGroupId: [eventStoreId, aggregateId].join('#'),
              }
            : {}),
        }),
      );
    };

    this.publishMessages = async messages => {
      for (const chunkMessages of chunk(messages, SQS_MAX_MESSAGE_BATCH_SIZE)) {
        await this.sqsClient.send(
          new SendMessageBatchCommand({
            Entries: chunkMessages.map(message => {
              const { eventStoreId } = message;
              const { aggregateId, version } = parseMessage(message);

              const messageId = [eventStoreId, aggregateId, version]
                .filter(Boolean)
                .join('#');

              return {
                Id: messageId,
                MessageBody: JSON.stringify(message),
                ...(this.fifo
                  ? {
                      MessageDeduplicationId: messageId,
                      MessageGroupId: [eventStoreId, aggregateId].join('#'),
                    }
                  : {}),
              };
            }),
            QueueUrl: this.getQueueUrl(),
          }),
        );
      }
    };
  }
}
