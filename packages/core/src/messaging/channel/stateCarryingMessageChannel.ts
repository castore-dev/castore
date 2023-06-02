import type { EventStore } from '~/eventStore/eventStore';
import type { $Contravariant } from '~/utils';

import type {
  EventStoreStateCarryingMessage,
  EventStoreNotificationMessage,
} from '../message';
import {
  MessageChannelEventStoreNotFoundError,
  UndefinedMessageChannelAdapterError,
} from './errors';
import type { MessageChannelAdapter } from './messageChannelAdapter';

export class StateCarryingMessageChannel<
  EVENT_STORE extends EventStore = EventStore,
> {
  messageChannelType: string;
  messageChannelId: string;
  sourceEventStores: EVENT_STORE[];
  sourceEventStoresById: Record<string, EVENT_STORE>;

  messageChannelAdapter?: MessageChannelAdapter;
  getMessageChannelAdapter: () => MessageChannelAdapter;
  getEventStore: (eventStoreId: string) => EVENT_STORE;

  publishMessage: (
    stateCarryingMessage: $Contravariant<
      EVENT_STORE,
      EventStore,
      EventStoreStateCarryingMessage<EVENT_STORE>
    >,
  ) => Promise<void>;
  getAggregateAndPublishMessage: (
    notificationMessage: $Contravariant<
      EVENT_STORE,
      EventStore,
      EventStoreNotificationMessage<EVENT_STORE>
    >,
  ) => Promise<void>;

  publishMessages: (
    stateCarryingMessages: $Contravariant<
      EVENT_STORE,
      EventStore,
      EventStoreStateCarryingMessage<EVENT_STORE>
    >[],
  ) => Promise<void>;

  constructor({
    sourceEventStores,
    messageChannelType,
    messageChannelId,
    messageChannelAdapter: $messageChannelAdapter,
  }: {
    sourceEventStores: EVENT_STORE[];
    messageChannelType: string;
    messageChannelId: string;
    messageChannelAdapter?: MessageChannelAdapter;
  }) {
    this.messageChannelType = messageChannelType;
    this.messageChannelId = messageChannelId;
    this.sourceEventStores = sourceEventStores;

    this.sourceEventStoresById = this.sourceEventStores.reduce(
      (acc, eventStore) => ({ [eventStore.eventStoreId]: eventStore, ...acc }),
      {} as Record<string, EVENT_STORE>,
    );

    if ($messageChannelAdapter) {
      this.messageChannelAdapter = $messageChannelAdapter;
    }

    this.getMessageChannelAdapter = () => {
      if (!this.messageChannelAdapter) {
        throw new UndefinedMessageChannelAdapterError({
          messageChannelType: this.messageChannelType,
          messageChannelId: this.messageChannelId,
        });
      }

      return this.messageChannelAdapter;
    };

    this.getEventStore = eventStoreId => {
      const eventStore = this.sourceEventStoresById[eventStoreId];

      if (eventStore === undefined) {
        throw new MessageChannelEventStoreNotFoundError({
          eventStoreId,
          messageChannelType: this.messageChannelType,
          messageChannelId: this.messageChannelId,
        });
      }

      return eventStore;
    };

    this.publishMessage = async stateCarryingMessage => {
      const { eventStoreId } = stateCarryingMessage;
      this.getEventStore(eventStoreId);

      const messageChannelAdapter = this.getMessageChannelAdapter();

      await messageChannelAdapter.publishMessage(stateCarryingMessage);
    };

    this.getAggregateAndPublishMessage = async notificationMessage => {
      const { eventStoreId, event } = notificationMessage;
      const { aggregateId, version } = event;

      const eventStore = this.getEventStore(eventStoreId);

      const { aggregate } = await eventStore.getExistingAggregate(aggregateId, {
        maxVersion: version,
      });

      await this.publishMessage({ ...notificationMessage, aggregate });
    };

    this.publishMessages = async stateCarryingMessages => {
      for (const stateCarryingMessage of stateCarryingMessages) {
        const { eventStoreId } = stateCarryingMessage;
        this.getEventStore(eventStoreId);
      }

      const messageChannelAdapter = this.getMessageChannelAdapter();

      await messageChannelAdapter.publishMessages(stateCarryingMessages);
    };
  }
}
