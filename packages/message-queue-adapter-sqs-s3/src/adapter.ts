/* eslint-disable max-lines */
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import {
  SQSClient,
  SendMessageRequest,
  SendMessageCommandInput,
} from '@aws-sdk/client-sqs';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import type { Message, MessageChannelAdapter } from '@castore/core';
import { isEventCarryingMessage } from '@castore/core';
import { SQSMessageQueueAdapter } from '@castore/message-queue-adapter-sqs';

import { getMessageSize, SEND_MESSAGES_SIZE_LIMIT } from './getMessageSize';
import type { OversizedEntryDetail } from './message';

export const SQS_MAX_MESSAGE_BATCH_SIZE = 10;

export class SQSS3MessageQueueAdapter implements MessageChannelAdapter {
  publishMessage: MessageChannelAdapter['publishMessage'];
  publishMessages: MessageChannelAdapter['publishMessages'];

  sqsMessageQueueAdapter: SQSMessageQueueAdapter;
  s3BucketName: string | (() => string);
  s3Client: S3Client;
  s3Prefix: string;
  s3PreSignatureExpirationInSec: number;

  getS3BucketName: () => string;
  publishFormattedMessage: (
    messageRequest: SendMessageRequest,
    message: Message,
  ) => Promise<void>;

  constructor({
    queueUrl,
    sqsClient,
    s3BucketName,
    s3Client,
    s3Prefix = '',
    s3PreSignatureExpirationInSec = 900,
  }: {
    queueUrl: string | (() => string);
    sqsClient: SQSClient;
    s3BucketName: string | (() => string);
    s3Client: S3Client;
    s3Prefix?: string;
    s3PreSignatureExpirationInSec?: number;
  }) {
    this.sqsMessageQueueAdapter = new SQSMessageQueueAdapter({
      queueUrl,
      sqsClient,
    });
    this.s3BucketName = s3BucketName;
    this.s3Client = s3Client;
    this.s3Prefix = s3Prefix;
    this.s3PreSignatureExpirationInSec = s3PreSignatureExpirationInSec;

    this.getS3BucketName = () =>
      typeof this.s3BucketName === 'string'
        ? this.s3BucketName
        : this.s3BucketName();

    this.publishMessage = (message, options) =>
      this.publishFormattedMessage(
        this.sqsMessageQueueAdapter.formatMessage(message, options),
        message,
      );

    this.publishFormattedMessage = async (formattedMessage, message) => {
      if (getMessageSize(formattedMessage) <= SEND_MESSAGES_SIZE_LIMIT) {
        return this.sqsMessageQueueAdapter.publishFormattedMessage(
          formattedMessage,
        );
      }

      const { eventStoreId } = message;
      const filePath: string[] = [eventStoreId];

      if (isEventCarryingMessage(message)) {
        const { aggregateId, version } = message.event;
        filePath.push(
          aggregateId,
          [new Date().toISOString(), String(version)].join('#'),
        );
      } else {
        const { aggregateId } = message;
        filePath.push(aggregateId, new Date().toISOString());
      }

      const bucketName = this.getS3BucketName();
      const fileKey = [this.s3Prefix, filePath.join('/')].join('');

      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Body: JSON.stringify(message),
          Key: fileKey,
          ContentType: 'application/json',
        }),
      );

      const messageUrl = await getSignedUrl(
        this.s3Client,
        new GetObjectCommand({
          Bucket: bucketName,
          Key: fileKey,
        }),
        { expiresIn: this.s3PreSignatureExpirationInSec },
      );

      const oversizedEntryDetail: OversizedEntryDetail = { messageUrl };

      return this.sqsMessageQueueAdapter.publishFormattedMessage({
        ...formattedMessage,
        MessageBody: JSON.stringify(oversizedEntryDetail),
      });
    };

    this.publishMessages = async (messages, options) => {
      const formattedMessages = messages.map(message =>
        this.sqsMessageQueueAdapter.formatMessage(message, options),
      );

      type FormattedMessageWithContext = {
        message: Message;
        formattedMessage: SendMessageCommandInput;
        formattedMessageSize: number;
      };

      const formattedMessagesWithContext: FormattedMessageWithContext[] =
        formattedMessages.map((formattedMessage, index) => ({
          formattedMessage,
          formattedMessageSize: getMessageSize(formattedMessage),
          message: messages[index] as Message,
        }));

      formattedMessagesWithContext.sort(
        ({ formattedMessageSize: sizeA }, { formattedMessageSize: sizeB }) =>
          sizeA - sizeB,
      );

      const formattedMessageBatches: FormattedMessageWithContext[][] = [[]];
      let currentBatch =
        formattedMessageBatches[0] as FormattedMessageWithContext[];
      let currentBatchSize = 0;

      // NOTE: We could search for the largest fitting entry instead of doing a for loop
      for (const formattedMessageWithContext of formattedMessagesWithContext) {
        const { formattedMessageSize } = formattedMessageWithContext;

        if (
          currentBatch.length < SQS_MAX_MESSAGE_BATCH_SIZE &&
          currentBatchSize + formattedMessageSize <= SEND_MESSAGES_SIZE_LIMIT
        ) {
          currentBatch.push(formattedMessageWithContext);
          currentBatchSize += formattedMessageSize;
        } else {
          formattedMessageBatches.push([formattedMessageWithContext]);
          currentBatch = formattedMessageBatches.at(
            -1,
          ) as FormattedMessageWithContext[];
          currentBatchSize = formattedMessageSize;
        }
      }

      for (const formattedMessageBatch of formattedMessageBatches) {
        if (formattedMessageBatch.length === 0) {
          // Can happen for first batch if first message is oversized
          continue;
        }

        if (formattedMessageBatch.length === 1) {
          const [formattedMessageWithContext] = formattedMessageBatch as [
            FormattedMessageWithContext,
          ];
          const { formattedMessage, message } = formattedMessageWithContext;

          await this.publishFormattedMessage(formattedMessage, message);
          continue;
        }

        // We are sure that the batch is not oversized if there is more than 1 entry
        return this.sqsMessageQueueAdapter.publishFormattedMessages(
          formattedMessageBatch.map(({ formattedMessage }) => formattedMessage),
        );
      }
    };
  }

  set queueUrl(queueUrl: string | (() => string)) {
    this.sqsMessageQueueAdapter.queueUrl = queueUrl;
  }

  get queueUrl(): string {
    return this.sqsMessageQueueAdapter.getQueueUrl();
  }

  set sqsClient(sqsClient: SQSClient) {
    this.sqsMessageQueueAdapter.sqsClient = sqsClient;
  }

  get sqsClient(): SQSClient {
    return this.sqsMessageQueueAdapter.sqsClient;
  }
}
