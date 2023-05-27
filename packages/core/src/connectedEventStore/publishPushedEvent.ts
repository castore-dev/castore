import type {
  EventStoreAggregate,
  EventStoreEventsDetails,
} from '~/eventStore/generics';
import {
  NotificationMessageBus,
  NotificationMessageQueue,
  StateCarryingMessageBus,
  StateCarryingMessageQueue,
} from '~/messaging';

import type { ConnectedEventStore } from './connectedEventStore';

export const publishPushedEvent = async <
  CONNECTED_EVENT_STORE extends ConnectedEventStore,
>(
  connectedEventStore: CONNECTED_EVENT_STORE,
  message: {
    event: EventStoreEventsDetails<CONNECTED_EVENT_STORE>;
    nextAggregate?: EventStoreAggregate<CONNECTED_EVENT_STORE>;
  },
): Promise<void> => {
  const { event, nextAggregate } = message;

  if (
    /**
     * @debt refactor "Create NotificationMessageChannel class w. only publish prop, extended by MessageQueues & Bus"
     */
    connectedEventStore.messageChannel instanceof NotificationMessageQueue ||
    connectedEventStore.messageChannel instanceof NotificationMessageBus
  ) {
    await connectedEventStore.messageChannel.publishMessage({
      eventStoreId: connectedEventStore.eventStoreId,
      event,
    });
  }

  if (
    /**
     * @debt refactor "Create StateCarryingMessageChannel class w. only publish prop, extended by MessageQueues & Bus"
     */
    connectedEventStore.messageChannel instanceof StateCarryingMessageQueue ||
    connectedEventStore.messageChannel instanceof StateCarryingMessageBus
  ) {
    let aggregate: EventStoreAggregate<CONNECTED_EVENT_STORE> | undefined =
      nextAggregate;

    if (aggregate === undefined) {
      const { aggregateId, version } = event;
      aggregate = (
        await connectedEventStore.getAggregate(aggregateId, {
          maxVersion: version,
        })
      ).aggregate;
    }

    await connectedEventStore.messageChannel.publishMessage({
      eventStoreId: connectedEventStore.eventStoreId,
      event,
      aggregate,
    });
  }
};
