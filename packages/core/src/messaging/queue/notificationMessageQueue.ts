import type { EventStore } from '~/eventStore/eventStore';

import type { NotificationMessage } from '../notificationMessage';
import {
  MessageQueueEventStoreNotFoundError,
  UndefinedMessageQueueAdapterError,
} from './errors';
import type { MessageQueueAdapter } from './messageQueueAdapter';

export class NotificationMessageQueue<E extends EventStore = EventStore> {
  messageQueueId: string;
  sourceEventStores: E[];
  sourceEventStoresById: Record<string, E>;

  messageQueueAdapter?: MessageQueueAdapter;
  getMessageQueueAdapter: () => MessageQueueAdapter;
  getEventStore: (eventStoreId: string) => E;

  publishMessage: (
    notificationMessage: NotificationMessage<E>,
  ) => Promise<void>;

  constructor({
    messageQueueId,
    sourceEventStores,
    messageQueueAdapter: $messageQueueAdapter,
  }: {
    sourceEventStores: E[];
    messageQueueId: string;
    messageQueueAdapter?: MessageQueueAdapter;
  }) {
    this.messageQueueId = messageQueueId;
    this.sourceEventStores = sourceEventStores;

    this.sourceEventStoresById = this.sourceEventStores.reduce(
      (acc, eventStore) => ({ [eventStore.eventStoreId]: eventStore, ...acc }),
      {} as Record<string, E>,
    );

    if ($messageQueueAdapter) {
      this.messageQueueAdapter = $messageQueueAdapter;
    }

    this.getMessageQueueAdapter = () => {
      if (!this.messageQueueAdapter) {
        throw new UndefinedMessageQueueAdapterError({
          messageQueueId: this.messageQueueId,
        });
      }

      return this.messageQueueAdapter;
    };

    this.getEventStore = eventStoreId => {
      const eventStore = this.sourceEventStoresById[eventStoreId];

      if (eventStore === undefined) {
        throw new MessageQueueEventStoreNotFoundError({
          eventStoreId,
          messageQueueId: this.messageQueueId,
        });
      }

      return eventStore;
    };

    this.publishMessage = async notificationMessage => {
      const { eventStoreId } = notificationMessage;
      this.getEventStore(eventStoreId);

      const messageQueueAdapter = this.getMessageQueueAdapter();

      await messageQueueAdapter.publishMessage(notificationMessage);
    };
  }
}
