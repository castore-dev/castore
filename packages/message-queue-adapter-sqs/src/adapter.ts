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
  PublishMessageOptions,
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

  queueUrl: string | (() => string);
  sqsClient: SQSClient;
  fifo: boolean;

  getQueueUrl: () => string;
  formatMessage: (
    message: Message,
    options?: PublishMessageOptions,
  ) => SendMessageCommandInput;
  publishFormattedMessage: (entry: SendMessageCommandInput) => Promise<void>;
  publishFormattedMessages: (
    entries: SendMessageCommandInput[],
  ) => Promise<void>;

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

    this.formatMessage = (message, { replay = false } = {}) => {
      const { eventStoreId } = message;
      const { aggregateId, version } = parseMessage(message);

      const formattedMessage: SendMessageCommandInput = {
        MessageBody: JSON.stringify(message),
        QueueUrl: this.getQueueUrl(),
      };

      const messageId = [eventStoreId, aggregateId, version]
        .filter(Boolean)
        .join('#');

      if (this.fifo) {
        formattedMessage.MessageDeduplicationId = messageId;
        formattedMessage.MessageGroupId = [eventStoreId, aggregateId].join('#');
      }

      formattedMessage.MessageAttributes = {
        messageId: { DataType: 'String', StringValue: messageId },
      };

      if (replay) {
        formattedMessage.MessageAttributes.replay = {
          DataType: 'Number',
          StringValue: '1',
        };
      }

      return formattedMessage;
    };

    this.publishMessage = (message, options) =>
      this.publishFormattedMessage(this.formatMessage(message, options));

    this.publishFormattedMessage = async formattedMessage => {
      await this.sqsClient.send(new SendMessageCommand(formattedMessage));
    };

    this.publishFormattedMessages = async formattedMessages => {
      for (const formattedMessageBatch of chunk(
        formattedMessages,
        SQS_MAX_MESSAGE_BATCH_SIZE,
      )) {
        await this.sqsClient.send(
          new SendMessageBatchCommand({
            Entries: formattedMessageBatch.map(formattedMessage => ({
              ...formattedMessage,
              Id: (
                formattedMessage.MessageAttributes as {
                  messageId: { DataType: 'String'; StringValue: string };
                }
              ).messageId.StringValue,
            })),
            QueueUrl: this.getQueueUrl(),
          }),
        );
      }
    };

    this.publishMessages = async (messages, { replay = false } = {}) => {
      const baseEntry: Omit<
        SendMessageBatchRequestEntry,
        'Id' | 'MessageBody'
      > = {};

      if (replay) {
        baseEntry.MessageAttributes = {
          replay: { DataType: 'Number', StringValue: '1' },
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
