import {
  SQSClient,
  SendMessageCommand,
  SendMessageBatchCommand,
} from '@aws-sdk/client-sqs';
import { mockClient } from 'aws-sdk-client-mock';
import type { A } from 'ts-toolbelt';

import type { Message } from '@castore/core';

import { SQSMessageQueueAdapter, SQS_MAX_MESSAGE_BATCH_SIZE } from './adapter';

const sqsClientMock = mockClient(SQSClient);

describe('SQSMessageQueueAdapter', () => {
  const queueUrlMock = 'queue.sqs';

  const eventStoreIdMock = 'my-event-store';

  const eventMock = {
    aggregateId: 'my-aggregate-id',
    version: 1,
    type: 'my-event-type',
    timestamp: new Date().toISOString(),
  };

  const otherEventMock = {
    aggregateId: 'my-aggregate-id',
    version: 2,
    type: 'my-event-type',
    timestamp: new Date().toISOString(),
  };

  const messageMock = {
    eventStoreId: eventStoreIdMock,
    event: eventMock,
  };

  const otherMessageMock = {
    eventStoreId: eventStoreIdMock,
    event: otherEventMock,
  };

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
      [Message]
    > = 1;
    assertMessage;

    await adapter.publishMessage(messageMock);

    // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
    // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
    expect(sqsClientMock.calls()).toHaveLength(1);
    expect(sqsClientMock.call(0).args[0].input).toMatchObject({
      QueueUrl: queueUrlMock,
      MessageBody: JSON.stringify(messageMock),
    });
  });

  it('send a SendMessageBatchCommand to sqs client on messages batch published', async () => {
    const adapter = new SQSMessageQueueAdapter({
      queueUrl: queueUrlMock,
      sqsClient: sqsClientMock as unknown as SQSClient,
    });

    const assertMessages: A.Equals<
      Parameters<typeof adapter.publishMessages>,
      [Message[]]
    > = 1;
    assertMessages;

    await adapter.publishMessages([messageMock, otherMessageMock]);

    // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
    // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
    expect(sqsClientMock.calls()).toHaveLength(1);
    expect(sqsClientMock.call(0).args[0].input).toMatchObject({
      Entries: [
        {
          Id: `${messageMock.eventStoreId}-${messageMock.event.aggregateId}-${messageMock.event.version}`,
          MessageBody: JSON.stringify(messageMock),
        },
        {
          Id: `${otherMessageMock.eventStoreId}-${otherMessageMock.event.aggregateId}-${otherMessageMock.event.version}`,
          MessageBody: JSON.stringify(otherMessageMock),
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
      Array.from({ length: SQS_MAX_MESSAGE_BATCH_SIZE + 1 }, () => messageMock),
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

    await adapter.publishMessage(messageMock);

    // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
    // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
    expect(sqsClientMock.calls()).toHaveLength(1);
    expect(sqsClientMock.call(0).args[0].input).toMatchObject({
      QueueUrl: queueUrlMock,
      MessageBody: JSON.stringify(messageMock),
    });
  });
});
