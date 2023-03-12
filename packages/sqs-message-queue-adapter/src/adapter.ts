import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

import type { MessageQueueAdapter } from '@castore/core';

export class SQSMessageQueueAdapter implements MessageQueueAdapter {
  publishMessage: MessageQueueAdapter['publishMessage'];
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
  }
}
