import {
  EventBridgeClient,
  PutEventsCommand,
} from '@aws-sdk/client-eventbridge';
import { mockClient } from 'aws-sdk-client-mock';
import type { A } from 'ts-toolbelt';

import type { Message, PublishMessageOptions } from '@castore/core';

import {
  EventBridgeMessageBusAdapter,
  EVENTBRIDGE_MAX_ENTRIES_BATCH_SIZE,
} from './adapter';

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

  const otherEventMock = {
    aggregateId: 'my-aggregate-id',
    version: 2,
    type: 'my-event-type-2',
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
    eventBridgeClientMock.reset();
    eventBridgeClientMock.on(PutEventsCommand).resolves({});
  });

  it('send a PutEventsCommand to event bridge client on message published', async () => {
    const adapter = new EventBridgeMessageBusAdapter({
      eventBusName: eventBusNameMock,
      eventBridgeClient: eventBridgeClientMock as unknown as EventBridgeClient,
    });

    const assertMessage: A.Equals<
      Parameters<typeof adapter.publishMessage>,
      [message: Message, options?: PublishMessageOptions | undefined]
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

  it('send a PutEventsCommand to event bridge client on messages published', async () => {
    const adapter = new EventBridgeMessageBusAdapter({
      eventBusName: eventBusNameMock,
      eventBridgeClient: eventBridgeClientMock as unknown as EventBridgeClient,
    });

    const assertMessage: A.Equals<
      Parameters<typeof adapter.publishMessages>,
      [messages: Message[], options?: PublishMessageOptions | undefined]
    > = 1;
    assertMessage;

    await adapter.publishMessages([messageMock, otherMessageMock]);

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
        {
          EventBusName: eventBusNameMock,
          Source: eventStoreIdMock,
          DetailType: otherEventMock.type,
          Detail: JSON.stringify(otherMessageMock),
        },
      ],
    });
  });

  it('chunk messages in separate PutEventsCommand calls when there are more messages then EVENTBRIDGE_MAX_ENTRIES_BATCH_SIZE', async () => {
    const adapter = new EventBridgeMessageBusAdapter({
      eventBusName: eventBusNameMock,
      eventBridgeClient: eventBridgeClientMock as unknown as EventBridgeClient,
    });

    await adapter.publishMessages(
      Array.from(
        { length: EVENTBRIDGE_MAX_ENTRIES_BATCH_SIZE + 1 },
        () => messageMock,
      ),
    );

    // regularly check if vitest matchers are available (toHaveReceivedCommandWith)
    // https://github.com/m-radzikowski/aws-sdk-client-mock/issues/139
    expect(eventBridgeClientMock.calls()).toHaveLength(2);
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
