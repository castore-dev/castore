import {
  EventBridgeClient,
  PutEventsCommand,
  PutEventsRequestEntry,
} from '@aws-sdk/client-eventbridge';
import chunk from 'lodash.chunk';

import type {
  Message,
  MessageChannelAdapter,
  PublishMessageOptions,
} from '@castore/core';
import {
  __REPLAYED__,
  __AGGREGATE_EXISTS__,
  isAggregateExistsMessage,
  isEventCarryingMessage,
} from '@castore/core';

export const EVENTBRIDGE_MAX_ENTRIES_BATCH_SIZE = 10;

const getDetailType = (
  message: Message,
  { replay = false }: PublishMessageOptions = {},
): string => {
  if (isEventCarryingMessage(message)) {
    return replay ? __REPLAYED__ : message.event.type;
  }

  if (isAggregateExistsMessage(message)) {
    return __AGGREGATE_EXISTS__;
  }

  throw new Error('Unable to infer detail-type from message');
};

export class EventBridgeMessageBusAdapter implements MessageChannelAdapter {
  publishMessage: MessageChannelAdapter['publishMessage'];
  publishMessages: MessageChannelAdapter['publishMessages'];

  eventBusName: string | (() => string);
  eventBridgeClient: EventBridgeClient;

  getEventBusName: () => string;
  formatMessage: (
    message: Message,
    options?: PublishMessageOptions,
  ) => PutEventsRequestEntry;
  publishFormattedMessage: (entry: PutEventsRequestEntry) => Promise<void>;
  publishFormattedMessages: (entries: PutEventsRequestEntry[]) => Promise<void>;

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

    this.formatMessage = (message, options) => ({
      EventBusName: this.getEventBusName(),
      Source: message.eventStoreId,
      DetailType: getDetailType(message, options),
      Detail: JSON.stringify(message),
    });

    this.publishMessage = (message, options) =>
      this.publishFormattedMessage(this.formatMessage(message, options));

    this.publishFormattedMessage = async formattedMessage => {
      await this.eventBridgeClient.send(
        new PutEventsCommand({ Entries: [formattedMessage] }),
      );
    };

    this.publishMessages = async (messages, options) =>
      this.publishFormattedMessages(
        messages.map(message => this.formatMessage(message, options)),
      );

    this.publishFormattedMessages = async entries => {
      for (const entriesBatch of chunk(
        entries,
        EVENTBRIDGE_MAX_ENTRIES_BATCH_SIZE,
      )) {
        await this.eventBridgeClient.send(
          new PutEventsCommand({ Entries: entriesBatch }),
        );
      }
    };
  }
}
