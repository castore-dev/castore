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

  constructor({
    queueUrl,
    sqsClient,
  }: {
    queueUrl: string | (() => string);
    sqsClient: SQSClient;
  }) {
    this.queueUrl = queueUrl;
    this.sqsClient = sqsClient;

    this.getQueueUrl = () =>
      typeof this.queueUrl === 'string' ? this.queueUrl : this.queueUrl();

    this.publishMessage = async message => {
      await this.sqsClient.send(
        new SendMessageCommand({
          MessageBody: JSON.stringify(message),
          QueueUrl: this.getQueueUrl(),
        }),
      );
    };

    this.publishMessages = async messages => {
      for (const chunkMessages of chunk(messages, SQS_MAX_MESSAGE_BATCH_SIZE)) {
        await this.sqsClient.send(
          new SendMessageBatchCommand({
            Entries: chunkMessages.map(message => ({
              Id: `${message.eventStoreId}-${message.event.aggregateId}-${message.event.version}`,
              MessageBody: JSON.stringify(message),
            })),
            QueueUrl: this.getQueueUrl(),
          }),
        );
      }
    };
  }
}
