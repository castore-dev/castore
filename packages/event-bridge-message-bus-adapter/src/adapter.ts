import {
  EventBridgeClient,
  PutEventsCommand,
} from '@aws-sdk/client-eventbridge';
import chunk from 'lodash.chunk';

import type { Message, MessageChannelAdapter } from '@castore/core';
import {
  isAggregateExistsMessage,
  isNotificationMessage,
  isStateCarryingMessage,
} from '@castore/core';

export const EVENTBRIDGE_MAX_ENTRIES_BATCH_SIZE = 10;

const getDetailType = (message: Message): string => {
  if (isNotificationMessage(message) || isStateCarryingMessage(message)) {
    return message.event.type;
  }

  if (isAggregateExistsMessage(message)) {
    return '__AGGREGATE_EXISTS__';
  }

  throw new Error('Unable to infer detail-type from message');
};

export class EventBridgeMessageBusAdapter implements MessageChannelAdapter {
  publishMessage: MessageChannelAdapter['publishMessage'];
  publishMessages: MessageChannelAdapter['publishMessages'];
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
      const { eventStoreId } = message;

      await this.eventBridgeClient.send(
        new PutEventsCommand({
          Entries: [
            {
              EventBusName: this.getEventBusName(),
              Source: eventStoreId,
              DetailType: getDetailType(message),
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
              DetailType: getDetailType(message),
              Detail: JSON.stringify(message),
            })),
          }),
        );
      }
    };
  }
}
