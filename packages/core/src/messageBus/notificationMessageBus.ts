import type { EventStore } from '~/eventStore/eventStore';

import {
  EventStoreNotFoundError,
  UndefinedMessageBusAdapterError,
} from './errors';
import type { MessageBusAdapter } from './messageBusAdapter';
import type { NotificationMessage } from './notificationMessage';

export class NotificationMessageBus<E extends EventStore = EventStore> {
  messageBusId: string;
  sourceEventStores: E[];
  sourceEventStoresById: Record<string, E>;

  messageBusAdapter?: MessageBusAdapter;
  getMessageBusAdapter: () => MessageBusAdapter;
  getEventStore: (eventStoreId: string) => E;

  publishMessage: (
    notificationMessage: NotificationMessage<E>,
  ) => Promise<void>;

  constructor({
    messageBusId,
    sourceEventStores,
    messageBusAdapter: $messageBusAdapter,
  }: {
    sourceEventStores: E[];
    messageBusId: string;
    messageBusAdapter?: MessageBusAdapter;
  }) {
    this.messageBusId = messageBusId;
    this.sourceEventStores = sourceEventStores;

    this.sourceEventStoresById = this.sourceEventStores.reduce(
      (acc, eventStore) => ({ [eventStore.eventStoreId]: eventStore, ...acc }),
      {} as Record<string, E>,
    );

    if ($messageBusAdapter) {
      this.messageBusAdapter = $messageBusAdapter;
    }

    this.getMessageBusAdapter = () => {
      if (!this.messageBusAdapter) {
        throw new UndefinedMessageBusAdapterError({
          messageBusId: this.messageBusId,
        });
      }

      return this.messageBusAdapter;
    };

    this.getEventStore = eventStoreId => {
      const eventStore = this.sourceEventStoresById[eventStoreId];

      if (eventStore === undefined) {
        throw new EventStoreNotFoundError({
          eventStoreId,
          messageBusId: this.messageBusId,
        });
      }

      return eventStore;
    };

    this.publishMessage = async notificationMessage => {
      const { eventStoreId } = notificationMessage;
      this.getEventStore(eventStoreId);

      const messageBusAdapter = this.getMessageBusAdapter();

      await messageBusAdapter.publishMessage(notificationMessage);
    };
  }
}
