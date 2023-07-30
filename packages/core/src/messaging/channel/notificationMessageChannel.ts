import type { EventStore } from '~/eventStore/eventStore';
import type { $Contravariant } from '~/utils';

import type { EventStoreNotificationMessage } from '../generics';
import {
  MessageChannelEventStoreNotFoundError,
  UndefinedMessageChannelAdapterError,
} from './errors';
import type { MessageChannelAdapter } from './messageChannelAdapter';
import type { PublishMessageOptions } from './types';

export class NotificationMessageChannel<
  EVENT_STORE extends EventStore = EventStore,
> {
  // Mainly for type discrimination
  messageType: 'notification';
  messageChannelType: string;
  messageChannelId: string;
  sourceEventStores: EVENT_STORE[];
  sourceEventStoresById: Record<string, EVENT_STORE>;

  messageChannelAdapter?: MessageChannelAdapter;
  getMessageChannelAdapter: () => MessageChannelAdapter;
  getEventStore: (eventStoreId: string) => EVENT_STORE;

  publishMessage: (
    notificationMessage: $Contravariant<
      EVENT_STORE,
      EventStore,
      EventStoreNotificationMessage<EVENT_STORE>
    >,
    options?: PublishMessageOptions,
  ) => Promise<void>;
  publishMessages: (
    notificationMessages: $Contravariant<
      EVENT_STORE,
      EventStore,
      EventStoreNotificationMessage<EVENT_STORE>
    >[],
    options?: PublishMessageOptions,
  ) => Promise<void>;

  constructor({
    messageChannelType,
    messageChannelId,
    sourceEventStores,
    messageChannelAdapter: $messageChannelAdapter,
  }: {
    messageChannelType: string;
    sourceEventStores: EVENT_STORE[];
    messageChannelId: string;
    messageChannelAdapter?: MessageChannelAdapter;
  }) {
    this.messageType = 'notification';
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
      notificationMessage,
      { replay = false } = {},
    ) => {
      const { eventStoreId } = notificationMessage;
      this.getEventStore(eventStoreId);

      const messageChannelAdapter = this.getMessageChannelAdapter();

      await messageChannelAdapter.publishMessage(notificationMessage, {
        replay,
      });
    };

    this.publishMessages = async (
      notificationMessages,
      { replay = false } = {},
    ) => {
      for (const notificationMessage of notificationMessages) {
        const { eventStoreId } = notificationMessage;
        this.getEventStore(eventStoreId);
      }
      const messageChannelAdapter = this.getMessageChannelAdapter();

      await messageChannelAdapter.publishMessages(notificationMessages, {
        replay,
      });
    };
  }
}
