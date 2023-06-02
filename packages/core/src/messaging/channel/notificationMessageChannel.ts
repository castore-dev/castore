import type { EventStore } from '~/eventStore/eventStore';
import type { $Contravariant } from '~/utils';

import type { EventStoreNotificationMessage } from '../message';
import {
  MessageChannelEventStoreNotFoundError,
  UndefinedMessageChannelAdapterError,
} from './errors';
import type { MessageChannelAdapter } from './messageChannelAdapter';

export class NotificationMessageChannel<
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
    notificationMessage: $Contravariant<
      EVENT_STORE,
      EventStore,
      EventStoreNotificationMessage<EVENT_STORE>
    >,
  ) => Promise<void>;
  publishMessages: (
    notificationMessages: $Contravariant<
      EVENT_STORE,
      EventStore,
      EventStoreNotificationMessage<EVENT_STORE>
    >[],
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

    this.publishMessage = async notificationMessage => {
      const { eventStoreId } = notificationMessage;
      this.getEventStore(eventStoreId);

      const messageChannelAdapter = this.getMessageChannelAdapter();

      await messageChannelAdapter.publishMessage(notificationMessage);
    };

    this.publishMessages = async notificationMessages => {
      for (const notificationMessage of notificationMessages) {
        const { eventStoreId } = notificationMessage;
        this.getEventStore(eventStoreId);
      }
      const messageChannelAdapter = this.getMessageChannelAdapter();

      await messageChannelAdapter.publishMessages(notificationMessages);
    };
  }
}
