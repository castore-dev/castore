import type { EventStore } from '~/eventStore/eventStore';
import type { $Contravariant } from '~/utils';

import type {
  EventStoreStateCarryingMessage,
  EventStoreNotificationMessage,
} from '../generics';
import {
  MessageChannelEventStoreNotFoundError,
  UndefinedMessageChannelAdapterError,
} from './errors';
import type { MessageChannelAdapter } from './messageChannelAdapter';
import type { PublishMessageOptions } from './types';

export class StateCarryingMessageChannel<
  EVENT_STORE extends EventStore = EventStore,
> {
  // Mainly for type discrimination
  messageType: 'stateCarrying';
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
    options?: PublishMessageOptions,
  ) => Promise<void>;
  getAggregateAndPublishMessage: (
    notificationMessage: $Contravariant<
      EVENT_STORE,
      EventStore,
      EventStoreNotificationMessage<EVENT_STORE>
    >,
    options?: PublishMessageOptions,
  ) => Promise<void>;

  publishMessages: (
    stateCarryingMessages: $Contravariant<
      EVENT_STORE,
      EventStore,
      EventStoreStateCarryingMessage<EVENT_STORE>
    >[],
    options?: PublishMessageOptions,
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
    this.messageType = 'stateCarrying';
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

    this.publishMessage = async (
      stateCarryingMessage,
      { replay = false } = {},
    ) => {
      const { eventStoreId } = stateCarryingMessage;
      this.getEventStore(eventStoreId);

      const messageChannelAdapter = this.getMessageChannelAdapter();

      await messageChannelAdapter.publishMessage(stateCarryingMessage, {
        replay,
      });
    };

    this.getAggregateAndPublishMessage = async (
      notificationMessage,
      { replay = false } = {},
    ) => {
      const { eventStoreId, event } = notificationMessage;
      const { aggregateId, version } = event;

      const eventStore = this.getEventStore(eventStoreId);

      const { aggregate } = await eventStore.getExistingAggregate(aggregateId, {
        maxVersion: version,
      });

      await this.publishMessage(
        { ...notificationMessage, aggregate },
        { replay },
      );
    };

    this.publishMessages = async (
      stateCarryingMessages,
      { replay = false } = {},
    ) => {
      for (const stateCarryingMessage of stateCarryingMessages) {
        const { eventStoreId } = stateCarryingMessage;
        this.getEventStore(eventStoreId);
      }

      const messageChannelAdapter = this.getMessageChannelAdapter();

      await messageChannelAdapter.publishMessages(stateCarryingMessages, {
        replay,
      });
    };
  }
}
