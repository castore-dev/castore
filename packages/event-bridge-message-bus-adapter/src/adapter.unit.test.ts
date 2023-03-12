import {
  EventBridgeClient,
  PutEventsCommand,
} from '@aws-sdk/client-eventbridge';
import { mockClient } from 'aws-sdk-client-mock';
import type { A } from 'ts-toolbelt';

import type { Message } from '@castore/core';

import { EventBridgeMessageBusAdapter } from './adapter';

const eventBridgeClientMock = mockClient(EventBridgeClient);

describe('EventBridgeMessageBusAdapter', () => {
  const eventBusNameMock = 'my-event-bus';

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
    eventBridgeClientMock.reset();
    eventBridgeClientMock.on(PutEventsCommand).resolves({});
  });

  it('send a PutEventsCommand to event bridge client', async () => {
    const adapter = new EventBridgeMessageBusAdapter({
      eventBusName: eventBusNameMock,
      eventBridgeClient: eventBridgeClientMock as unknown as EventBridgeClient,
    });

    const assertMessage: A.Equals<
      Parameters<typeof adapter.publishMessage>,
      [Message]
    > = 1;
    assertMessage;

    await adapter.publishMessage(messageMock);

    // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
    // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
    expect(eventBridgeClientMock.calls()).toHaveLength(1);
    expect(eventBridgeClientMock.call(0).args[0].input).toMatchObject({
      Entries: [
        {
          EventBusName: eventBusNameMock,
          Source: eventStoreIdMock,
          DetailType: eventMock.type,
          Detail: JSON.stringify(messageMock),
        },
      ],
    });
  });

  it('works with event bus name getters', async () => {
    const adapter = new EventBridgeMessageBusAdapter({
      eventBusName: () => eventBusNameMock,
      eventBridgeClient: eventBridgeClientMock as unknown as EventBridgeClient,
    });

    await adapter.publishMessage(messageMock);

    // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
    // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
    expect(eventBridgeClientMock.calls()).toHaveLength(1);
    expect(eventBridgeClientMock.call(0).args[0].input).toMatchObject({
      Entries: [
        {
          EventBusName: eventBusNameMock,
          Source: eventStoreIdMock,
          DetailType: eventMock.type,
          Detail: JSON.stringify(messageMock),
        },
      ],
    });
  });
});
