import {
  EventBridgeClient,
  PutEventsCommand,
} from '@aws-sdk/client-eventbridge';
import chunk from 'lodash.chunk';

import type {
  Message,
  MessageChannelAdapter,
  PublishMessageOptions,
} from '@castore/core';
import {
  isAggregateExistsMessage,
  isEventCarryingMessage,
} from '@castore/core';

export const EVENTBRIDGE_MAX_ENTRIES_BATCH_SIZE = 10;

const getDetailType = (
  message: Message,
  { replay = false }: PublishMessageOptions = {},
): string => {
  if (isEventCarryingMessage(message)) {
    return replay ? '__REPLAYED__' : message.event.type;
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

    this.publishMessage = async (message, options) => {
      const { eventStoreId } = message;

      await this.eventBridgeClient.send(
        new PutEventsCommand({
          Entries: [
            {
              EventBusName: this.getEventBusName(),
              Source: eventStoreId,
              DetailType: getDetailType(message, options),
              Detail: JSON.stringify(message),
            },
          ],
        }),
      );
    };

    this.publishMessages = async (messages, options) => {
      for (const chunkMessages of chunk(
        messages,
        EVENTBRIDGE_MAX_ENTRIES_BATCH_SIZE,
      )) {
        await this.eventBridgeClient.send(
          new PutEventsCommand({
            Entries: chunkMessages.map(message => ({
              EventBusName: this.getEventBusName(),
              Source: message.eventStoreId,
              DetailType: getDetailType(message, options),
              Detail: JSON.stringify(message),
            })),
          }),
        );
      }
    };
  }
}
