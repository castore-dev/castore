import type {
  EventDetail,
  EventStore,
  EventStoreNotificationMessage,
  EventsQueryOptions,
  PublishMessageOptions,
} from '@castore/core';

import { getThrottle } from '~/utils/getThrottle';
import { getIsBetween } from '~/utils/isBetween';

interface Props<EVENT_STORE extends EventStore> {
  eventStore: EVENT_STORE;
  messageChannel: {
    publishMessage: (
      message: EventStoreNotificationMessage<EVENT_STORE>,
      options?: PublishMessageOptions,
    ) => Promise<void>;
  };
  aggregateId: string;
  options?: EventsQueryOptions;
  filters?: {
    from?: string;
    to?: string;
  };
  rateLimit?: number;
}

export const pourAggregateEvents = async <EVENT_STORE extends EventStore>({
  eventStore,
  messageChannel,
  aggregateId,
  options = {},
  filters: { from, to } = {},
  rateLimit,
}: Props<EVENT_STORE>): Promise<{
  pouredEventCount: number;
  firstPouredEvent?: EventDetail;
  lastPouredEvent?: EventDetail;
}> => {
  const throttle = getThrottle(rateLimit);

  const { events } = await eventStore.getEvents(aggregateId, options);

  const eventsToPour = events.filter(getIsBetween({ from, to }));

  for (const eventToPour of eventsToPour) {
    await throttle(() =>
      messageChannel.publishMessage(
        {
          eventStoreId: eventStore.eventStoreId,
          event: eventToPour,
        } as EventStoreNotificationMessage<EVENT_STORE>,
        { replay: true },
      ),
    );
  }

  const pouredEventCount = eventsToPour.length;
  const firstPouredEvent = eventsToPour[0];
  const lastPouredEvent = eventsToPour[eventsToPour.length - 1];

  return {
    pouredEventCount,
    ...(firstPouredEvent !== undefined ? { firstPouredEvent } : {}),
    ...(lastPouredEvent !== undefined ? { lastPouredEvent } : {}),
  };
};
