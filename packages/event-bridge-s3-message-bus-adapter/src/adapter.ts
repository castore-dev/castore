import type {
  EventBridgeClient,
  PutEventsRequestEntry,
} from '@aws-sdk/client-eventbridge';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import type { Message, MessageChannelAdapter } from '@castore/core';
import { isEventCarryingMessage } from '@castore/core';
import { EventBridgeMessageBusAdapter } from '@castore/event-bridge-message-bus-adapter';

import { getEntrySize, PUT_EVENTS_ENTRIES_SIZE_LIMIT } from './getEntrySize';
import type { OversizedEntryDetail } from './message';

const EVENTBRIDGE_MAX_ENTRIES_BATCH_SIZE = 10;

export class EventBridgeS3MessageBusAdapter implements MessageChannelAdapter {
  publishMessage: MessageChannelAdapter['publishMessage'];
  publishMessages: MessageChannelAdapter['publishMessages'];

  eventBridgeMessageBusAdapter: EventBridgeMessageBusAdapter;
  s3BucketName: string | (() => string);
  s3Client: S3Client;
  s3Prefix: string;
  s3PreSignatureExpirationInSec: number;

  getS3BucketName: () => string;
  publishEntry: (
    entry: PutEventsRequestEntry,
    message: Message,
  ) => Promise<void>;

  constructor({
    eventBusName,
    eventBridgeClient,
    s3BucketName,
    s3Client,
    s3Prefix = '',
    s3PreSignatureExpirationInSec = 900,
  }: {
    eventBusName: string | (() => string);
    eventBridgeClient: EventBridgeClient;
    s3BucketName: string | (() => string);
    s3Client: S3Client;
    s3Prefix?: string;
    s3PreSignatureExpirationInSec?: number;
  }) {
    this.eventBridgeMessageBusAdapter = new EventBridgeMessageBusAdapter({
      eventBusName,
      eventBridgeClient,
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
      this.publishEntry(
        this.eventBridgeMessageBusAdapter.getEntry(message, options),
        message,
      );

    this.publishEntry = async (entry, message) => {
      if (getEntrySize(entry) <= PUT_EVENTS_ENTRIES_SIZE_LIMIT) {
        return this.eventBridgeMessageBusAdapter.publishEntry(entry);
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
      const fileKey = [this.s3Prefix, ...filePath].join('/');

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

      return this.eventBridgeMessageBusAdapter.publishEntry({
        ...entry,
        Detail: JSON.stringify(oversizedEntryDetail),
      });
    };

    this.publishMessages = async (messages, options) => {
      const entries = messages.map(message =>
        this.eventBridgeMessageBusAdapter.getEntry(message, options),
      );

      type EntryWithContext = {
        message: Message;
        entry: PutEventsRequestEntry;
        entrySize: number;
      };

      const entriesWithContext: EntryWithContext[] = entries.map(
        (entry, index) => ({
          entry,
          entrySize: getEntrySize(entry),
          message: messages[index] as Message,
        }),
      );

      entriesWithContext.sort(
        ({ entrySize: sizeA }, { entrySize: sizeB }) => sizeA - sizeB,
      );

      const entryBatches: EntryWithContext[][] = [[]];
      let currentBatch = entryBatches[0] as EntryWithContext[];
      let currentBatchSize = 0;

      // NOTE: We could search for the largest fitting entry instead of doing a for loop
      for (const entryWithContext of entriesWithContext) {
        const { entrySize } = entryWithContext;

        if (
          currentBatch.length < EVENTBRIDGE_MAX_ENTRIES_BATCH_SIZE &&
          currentBatchSize + entrySize <= PUT_EVENTS_ENTRIES_SIZE_LIMIT
        ) {
          currentBatch.push(entryWithContext);
          currentBatchSize += entrySize;
        } else {
          entryBatches.push([entryWithContext]);
          currentBatch = entryBatches.at(-1) as EntryWithContext[];
          currentBatchSize = entrySize;
        }
      }

      for (const entryBatch of entryBatches) {
        if (entryBatch.length === 1) {
          const [messageAndEntry] = entryBatch as [EntryWithContext];
          const { entry, message } = messageAndEntry;

          // TODO: create publishEntry(entry, message) method
          return this.publishEntry(entry, message);
        }

        // We are sure that the batch is not oversized if there is more than 1 entry
        return this.eventBridgeMessageBusAdapter.publishEntries(
          entryBatch.map(({ entry }) => entry),
        );
      }

      await this.eventBridgeMessageBusAdapter.publishEntries(entries);
    };
  }
}
