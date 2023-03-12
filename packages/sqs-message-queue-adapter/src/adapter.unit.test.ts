import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { mockClient } from 'aws-sdk-client-mock';
import type { A } from 'ts-toolbelt';

import type { Message } from '@castore/core';

import { SQSMessageQueueAdapter } from './adapter';

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

  const messageMock = {
    eventStoreId: eventStoreIdMock,
    event: eventMock,
  };

  beforeEach(() => {
    sqsClientMock.reset();
    sqsClientMock.on(SendMessageCommand).resolves({});
  });

  it('send a SendMessageCommand to sqs client', async () => {
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
