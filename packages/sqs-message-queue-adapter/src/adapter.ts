import {
  SQSClient,
  SendMessageCommand,
  SendMessageBatchCommand,
} from '@aws-sdk/client-sqs';
import chunk from 'lodash.chunk';

import type { MessageQueueAdapter } from '@castore/core';

export const SQS_MAX_MESSAGE_BATCH_SIZE = 10;

export class SQSMessageQueueAdapter implements MessageQueueAdapter {
  publishMessage: MessageQueueAdapter['publishMessage'];
  publishMessages: MessageQueueAdapter['publishMessages'];
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
      const { eventStoreId, event } = message;
      const { aggregateId, version } = event;

      await this.sqsClient.send(
        new SendMessageCommand({
          MessageBody: JSON.stringify(message),
          QueueUrl: this.getQueueUrl(),
          ...(this.fifo
            ? {
                MessageDeduplicationId: [
                  eventStoreId,
                  aggregateId,
                  version,
                ].join('#'),
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
              const { eventStoreId, event } = message;
              const { aggregateId, version } = event;
              const messageId = [eventStoreId, aggregateId, version].join('#');

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
