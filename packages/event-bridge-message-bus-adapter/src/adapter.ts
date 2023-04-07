import {
  EventBridgeClient,
  PutEventsCommand,
} from '@aws-sdk/client-eventbridge';
import chunk from 'lodash.chunk';

import type { MessageBusAdapter } from '@castore/core';

export const EVENTBRIDGE_MAX_ENTRIES_BATCH_SIZE = 10;

export class EventBridgeMessageBusAdapter implements MessageBusAdapter {
  publishMessage: MessageBusAdapter['publishMessage'];
  publishMessages: MessageBusAdapter['publishMessages'];
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

    this.publishMessages = async messages => {
      for (const chunkMessages of chunk(
        messages,
        EVENTBRIDGE_MAX_ENTRIES_BATCH_SIZE,
      )) {
        await this.eventBridgeClient.send(
          new PutEventsCommand({
            Entries: chunkMessages.map(message => ({
              EventBusName: this.getEventBusName(),
              Source: message.eventStoreId,
              DetailType: message.event.type,
              Detail: JSON.stringify(message),
            })),
          }),
        );
      }
    };
  }
}
