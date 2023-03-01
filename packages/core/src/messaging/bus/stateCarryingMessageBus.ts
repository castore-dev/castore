import type { EventStore } from '~/eventStore/eventStore';

import type { NotificationMessage } from '../notificationMessage';
import type { StateCarryingMessage } from '../stateCarryingMessage';
import {
  MessageBusEventStoreNotFoundError,
  UndefinedMessageBusAdapterError,
} from './errors';
import type { MessageBusAdapter } from './messageBusAdapter';

export class StateCarryingMessageBus<E extends EventStore = EventStore> {
  messageBusId: string;
  sourceEventStores: E[];
  sourceEventStoresById: Record<string, E>;

  messageBusAdapter?: MessageBusAdapter;
  getMessageBusAdapter: () => MessageBusAdapter;
  getEventStore: (eventStoreId: string) => E;

  publishMessage: (
    stateCarryingMessage: StateCarryingMessage<E>,
  ) => Promise<void>;
  getAggregateAndPublishMessage: (
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
        throw new MessageBusEventStoreNotFoundError({
          eventStoreId,
          messageBusId: this.messageBusId,
        });
      }

      return eventStore;
    };

    this.publishMessage = async stateCarryingMessage => {
      const { eventStoreId } = stateCarryingMessage;
      this.getEventStore(eventStoreId);

      const messageBusAdapter = this.getMessageBusAdapter();

      await messageBusAdapter.publishMessage(stateCarryingMessage);
    };

    this.getAggregateAndPublishMessage = async notificationMessage => {
      const { eventStoreId, aggregateId, version } = notificationMessage;

      const eventStore = this.getEventStore(eventStoreId);

      const { aggregate } = await eventStore.getExistingAggregate(aggregateId, {
        maxVersion: version,
      });

      await this.publishMessage({ ...notificationMessage, aggregate });
    };
  }
}
