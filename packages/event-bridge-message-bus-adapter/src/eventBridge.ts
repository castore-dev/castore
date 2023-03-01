import {
  EventBridgeClient,
  PutEventsCommand,
} from '@aws-sdk/client-eventbridge';

import type { MessageBusAdapter } from '@castore/core';

export class EventBridgeMessageBusAdapter implements MessageBusAdapter {
  publishMessage: MessageBusAdapter['publishMessage'];
  getEventBusName: () => string;
  eventBusName: string | (() => string);
  eventBridgeClient: EventBridgeClient;

  constructor({
    eventBusName,
    eventBridgeClient,
  }: {
    eventBusName: string | (() => string);
    eventBridgeClient: EventBridgeClient;
  }) {
    this.eventBusName = eventBusName;
    this.eventBridgeClient = eventBridgeClient;

    this.getEventBusName = () =>
      typeof this.eventBusName === 'string'
        ? this.eventBusName
        : this.eventBusName();

    this.publishMessage = async ({ eventStoreId, ...message }) => {
      await this.eventBridgeClient.send(
        new PutEventsCommand({
          Entries: [
            {
              EventBusName: this.getEventBusName(),
              Source: eventStoreId,
              DetailType: message.type,
              Detail: JSON.stringify(message),
            },
          ],
        }),
      );
    };
  }
}
