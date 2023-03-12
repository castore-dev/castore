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

    this.publishMessage = async message => {
      const { eventStoreId, event } = message;
      const { type } = event;

      await this.eventBridgeClient.send(
        new PutEventsCommand({
          Entries: [
            {
              EventBusName: this.getEventBusName(),
              Source: eventStoreId,
              DetailType: type,
              Detail: JSON.stringify(message),
            },
          ],
        }),
      );
    };
  }
}
