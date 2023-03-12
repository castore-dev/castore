import type { EventStore } from '~/eventStore/eventStore';

import type {
  EventStoreStateCarryingMessage,
  EventStoreNotificationMessage,
} from '../message';
import {
  MessageQueueEventStoreNotFoundError,
  UndefinedMessageQueueAdapterError,
} from './errors';
import type { MessageQueueAdapter } from './messageQueueAdapter';

export class StateCarryingMessageQueue<
  EVENT_STORE extends EventStore = EventStore,
> {
  messageQueueId: string;
  sourceEventStores: EVENT_STORE[];
  sourceEventStoresById: Record<string, EVENT_STORE>;

  messageQueueAdapter?: MessageQueueAdapter;
  getMessageQueueAdapter: () => MessageQueueAdapter;
  getEventStore: (eventStoreId: string) => EVENT_STORE;

  publishMessage: (
    stateCarryingMessage: EventStoreStateCarryingMessage<EVENT_STORE>,
  ) => Promise<void>;
  getAggregateAndPublishMessage: (
    notificationMessage: EventStoreNotificationMessage<EVENT_STORE>,
  ) => Promise<void>;

  constructor({
    messageQueueId,
    sourceEventStores,
    messageQueueAdapter: $messageQueueAdapter,
  }: {
    sourceEventStores: EVENT_STORE[];
    messageQueueId: string;
    messageQueueAdapter?: MessageQueueAdapter;
  }) {
    this.messageQueueId = messageQueueId;
    this.sourceEventStores = sourceEventStores;

    this.sourceEventStoresById = this.sourceEventStores.reduce(
      (acc, eventStore) => ({ [eventStore.eventStoreId]: eventStore, ...acc }),
      {} as Record<string, EVENT_STORE>,
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

    this.publishMessage = async stateCarryingMessage => {
      const { eventStoreId } = stateCarryingMessage;
      this.getEventStore(eventStoreId);

      const messageQueueAdapter = this.getMessageQueueAdapter();

      await messageQueueAdapter.publishMessage(stateCarryingMessage);
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
  }
}
