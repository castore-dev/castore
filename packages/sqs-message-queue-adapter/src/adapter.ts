import {
  SQSClient,
  SendMessageCommand,
  SendMessageBatchCommand,
  SendMessageCommandInput,
  SendMessageBatchRequestEntry,
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

    this.publishMessage = async (message, { replay = false } = {}) => {
      const { eventStoreId } = message;
      const { aggregateId, version } = parseMessage(message);

      const sendMessageCommandInput: SendMessageCommandInput = {
        MessageBody: JSON.stringify(message),
        QueueUrl: this.getQueueUrl(),
      };

      if (this.fifo) {
        sendMessageCommandInput.MessageDeduplicationId = [
          eventStoreId,
          aggregateId,
          version,
        ]
          .filter(Boolean)
          .join('#');

        sendMessageCommandInput.MessageGroupId = [
          eventStoreId,
          aggregateId,
        ].join('#');
      }

      if (replay) {
        sendMessageCommandInput.MessageAttributes = {
          replay: { DataType: 'String', StringValue: 'true' },
        };
      }

      await this.sqsClient.send(
        new SendMessageCommand(sendMessageCommandInput),
      );
    };

    this.publishMessages = async (messages, { replay = false } = {}) => {
      const baseEntry: Omit<
        SendMessageBatchRequestEntry,
        'Id' | 'MessageBody'
      > = {};

      if (replay) {
        baseEntry.MessageAttributes = {
          replay: { DataType: 'String', StringValue: 'true' },
        };
      }

      for (const chunkMessages of chunk(messages, SQS_MAX_MESSAGE_BATCH_SIZE)) {
        await this.sqsClient.send(
          new SendMessageBatchCommand({
            Entries: chunkMessages.map(message => {
              const { eventStoreId } = message;
              const { aggregateId, version } = parseMessage(message);
              const messageId = [eventStoreId, aggregateId, version]
                .filter(Boolean)
                .join('#');

              const entry: SendMessageBatchRequestEntry = {
                ...baseEntry,
                Id: messageId,
                MessageBody: JSON.stringify(message),
              };

              if (this.fifo) {
                entry.MessageDeduplicationId = messageId;
                entry.MessageGroupId = [eventStoreId, aggregateId].join('#');
              }

              return entry;
            }),
            QueueUrl: this.getQueueUrl(),
          }),
        );
      }
    };
  }
}
