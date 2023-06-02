import type {
  EventStoreAggregate,
  EventStoreEventsDetails,
} from '~/eventStore/generics';
import {
  NotificationMessageChannel,
  StateCarryingMessageChannel,
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
    connectedEventStore.messageChannel instanceof NotificationMessageChannel
  ) {
    await connectedEventStore.messageChannel.publishMessage({
      eventStoreId: connectedEventStore.eventStoreId,
      event,
    });
  }

  if (
    connectedEventStore.messageChannel instanceof StateCarryingMessageChannel
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
