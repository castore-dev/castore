import type { EventStore } from '~/eventStore/eventStore';
import type { $Contravariant } from '~/utils';

import type { EventStoreNotificationMessage } from '../message';
import {
  MessageBusEventStoreNotFoundError,
  UndefinedMessageBusAdapterError,
} from './errors';
import type { MessageBusAdapter } from './messageBusAdapter';

export class NotificationMessageBus<
  EVENT_STORE extends EventStore = EventStore,
> {
  messageBusId: string;
  sourceEventStores: EVENT_STORE[];
  sourceEventStoresById: Record<string, EVENT_STORE>;

  messageBusAdapter?: MessageBusAdapter;
  getMessageBusAdapter: () => MessageBusAdapter;
  getEventStore: (eventStoreId: string) => EVENT_STORE;

  publishMessage: (
    notificationMessage: $Contravariant<
      EVENT_STORE,
      EventStore,
      EventStoreNotificationMessage<EVENT_STORE>
    >,
  ) => Promise<void>;

  constructor({
    messageBusId,
    sourceEventStores,
    messageBusAdapter: $messageBusAdapter,
  }: {
    sourceEventStores: EVENT_STORE[];
    messageBusId: string;
    messageBusAdapter?: MessageBusAdapter;
  }) {
    this.messageBusId = messageBusId;
    this.sourceEventStores = sourceEventStores;

    this.sourceEventStoresById = this.sourceEventStores.reduce(
      (acc, eventStore) => ({ [eventStore.eventStoreId]: eventStore, ...acc }),
      {} as Record<string, EVENT_STORE>,
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
        throw new MessageBusEventStoreNotFoundError({
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
