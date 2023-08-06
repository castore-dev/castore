/* eslint-disable max-lines */
import {
  SQSClient,
  SendMessageCommand,
  SendMessageBatchCommand,
} from '@aws-sdk/client-sqs';
import { mockClient } from 'aws-sdk-client-mock';
import type { A } from 'ts-toolbelt';

import type { Message, PublishMessageOptions } from '@castore/core';

import { SQSMessageQueueAdapter, SQS_MAX_MESSAGE_BATCH_SIZE } from './adapter';

const sqsClientMock = mockClient(SQSClient);

describe('SQSMessageQueueAdapter', () => {
  const queueUrlMock = 'queue.sqs';

  const eventStoreId = 'my-event-store';

  const aggregateId = 'my-aggregate-id';
  const version = 1;

  const event = {
    aggregateId,
    version,
    type: 'my-event-type',
    timestamp: new Date().toISOString(),
  };

  const otherVersion = 2;
  const otherEvent = {
    aggregateId,
    version: otherVersion,
    type: 'my-event-type',
    timestamp: new Date().toISOString(),
  };

  const message = { eventStoreId, event };
  const otherMessage = { eventStoreId, event: otherEvent };

  beforeEach(() => {
    sqsClientMock.reset();
    sqsClientMock.on(SendMessageCommand).resolves({});
    sqsClientMock.on(SendMessageBatchCommand).resolves({});
  });

  it('send a SendMessageCommand to sqs client on message published', async () => {
    const adapter = new SQSMessageQueueAdapter({
      queueUrl: queueUrlMock,
      sqsClient: sqsClientMock as unknown as SQSClient,
    });

    const assertMessage: A.Equals<
      Parameters<typeof adapter.publishMessage>,
      [message: Message, options?: PublishMessageOptions | undefined]
    > = 1;
    assertMessage;

    await adapter.publishMessage(message);

    // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
    // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
    expect(sqsClientMock.calls()).toHaveLength(1);
    expect(sqsClientMock.call(0).args[0].input).toMatchObject({
      QueueUrl: queueUrlMock,
      MessageBody: JSON.stringify(message),
    });
  });

  it('appends MessageDeduplicationId & MessageGroupId if queue is of type fifo', async () => {
    const adapter = new SQSMessageQueueAdapter({
      queueUrl: queueUrlMock,
      sqsClient: sqsClientMock as unknown as SQSClient,
      fifo: true,
    });

    await adapter.publishMessage(message);

    // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
    // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
    expect(sqsClientMock.calls()).toHaveLength(1);
    expect(sqsClientMock.call(0).args[0].input).toMatchObject({
      MessageDeduplicationId: [eventStoreId, aggregateId, version].join('#'),
      MessageGroupId: [eventStoreId, aggregateId].join('#'),
    });
  });

  it('appends replay MessageAttribute if replay is set to true', async () => {
    const adapter = new SQSMessageQueueAdapter({
      queueUrl: queueUrlMock,
      sqsClient: sqsClientMock as unknown as SQSClient,
      fifo: true,
    });

    await adapter.publishMessage(message, { replay: true });

    // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
    // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
    expect(sqsClientMock.calls()).toHaveLength(1);
    expect(sqsClientMock.call(0).args[0].input).toMatchObject({
      MessageAttributes: {
        replay: { DataType: 'Number', StringValue: '1' },
      },
    });
  });

  it('send a SendMessageBatchCommand to sqs client on messages batch published', async () => {
    const adapter = new SQSMessageQueueAdapter({
      queueUrl: queueUrlMock,
      sqsClient: sqsClientMock as unknown as SQSClient,
    });

    const assertMessages: A.Equals<
      Parameters<typeof adapter.publishMessages>,
      [messages: Message[], options?: PublishMessageOptions | undefined]
    > = 1;
    assertMessages;

    await adapter.publishMessages([message, otherMessage]);

    // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
    // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
    expect(sqsClientMock.calls()).toHaveLength(1);
    expect(sqsClientMock.call(0).args[0].input).toMatchObject({
      Entries: [
        {
          Id: [eventStoreId, aggregateId, version].join('#'),
          MessageBody: JSON.stringify(message),
        },
        {
          Id: [eventStoreId, aggregateId, otherVersion].join('#'),
          MessageBody: JSON.stringify(otherMessage),
        },
      ],
      QueueUrl: queueUrlMock,
    });
  });

  it('appends MessageDeduplicationIds & MessageGroupIds if queue is of type fifo', async () => {
    const adapter = new SQSMessageQueueAdapter({
      queueUrl: queueUrlMock,
      sqsClient: sqsClientMock as unknown as SQSClient,
      fifo: true,
    });

    await adapter.publishMessages([message, otherMessage]);

    // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
    // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
    expect(sqsClientMock.calls()).toHaveLength(1);
    expect(sqsClientMock.call(0).args[0].input).toMatchObject({
      Entries: [
        {
          MessageDeduplicationId: [eventStoreId, aggregateId, version].join(
            '#',
          ),
          MessageGroupId: [eventStoreId, aggregateId].join('#'),
        },
        {
          MessageDeduplicationId: [
            eventStoreId,
            aggregateId,
            otherVersion,
          ].join('#'),
          MessageGroupId: [eventStoreId, aggregateId].join('#'),
        },
      ],
      QueueUrl: queueUrlMock,
    });
  });

  it('appends replay MessageAttribute if replay is set to true', async () => {
    const adapter = new SQSMessageQueueAdapter({
      queueUrl: queueUrlMock,
      sqsClient: sqsClientMock as unknown as SQSClient,
    });

    await adapter.publishMessages([message, otherMessage], { replay: true });

    // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
    // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
    expect(sqsClientMock.calls()).toHaveLength(1);
    expect(sqsClientMock.call(0).args[0].input).toMatchObject({
      Entries: [
        {
          MessageAttributes: {
            replay: { DataType: 'Number', StringValue: '1' },
          },
        },
        {
          MessageAttributes: {
            replay: { DataType: 'Number', StringValue: '1' },
          },
        },
      ],
      QueueUrl: queueUrlMock,
    });
  });

  it('chunk messages in separate SendMessageBatchCommand calls when there are more messages then SQS_MAX_MESSAGE_BATCH_SIZE', async () => {
    const adapter = new SQSMessageQueueAdapter({
      queueUrl: queueUrlMock,
      sqsClient: sqsClientMock as unknown as SQSClient,
    });

    await adapter.publishMessages(
      Array.from({ length: SQS_MAX_MESSAGE_BATCH_SIZE + 1 }, () => message),
    );

    // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
    // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
    expect(sqsClientMock.calls()).toHaveLength(2);
  });

  it('works with queue url getters', async () => {
    const adapter = new SQSMessageQueueAdapter({
      queueUrl: () => queueUrlMock,
      sqsClient: sqsClientMock as unknown as SQSClient,
    });

    await adapter.publishMessage(message);

    // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
    // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
    expect(sqsClientMock.calls()).toHaveLength(1);
    expect(sqsClientMock.call(0).args[0].input).toMatchObject({
      QueueUrl: queueUrlMock,
      MessageBody: JSON.stringify(message),
    });
  });
});
