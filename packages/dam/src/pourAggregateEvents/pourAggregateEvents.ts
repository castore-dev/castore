import type {
  EventDetail,
  EventStore,
  EventStoreNotificationMessage,
  EventsQueryOptions,
} from '@castore/core';

import { getIsBetween } from '~/utils';

interface Props<EVENT_STORE extends EventStore> {
  eventStore: EVENT_STORE;
  messageChannel: {
    publishMessages: (
      message: EventStoreNotificationMessage<EVENT_STORE>[],
    ) => Promise<void>;
  };
  aggregateId: string;
  options?: {
    from?: string;
    to?: string;
  } & EventsQueryOptions;
}

export const pourAggregateEvents = async <EVENT_STORE extends EventStore>({
  eventStore,
  messageChannel,
  aggregateId,
  options: { from, to, ...eventsQueryOptions } = {},
}: Props<EVENT_STORE>): Promise<{
  pouredEventCount: number;
  firstPouredEvent?: EventDetail;
  lastPouredEvent?: EventDetail;
}> => {
  const { events } = await eventStore.getEvents(
    aggregateId,
    eventsQueryOptions,
  );

  const eventsToPour = events.filter(getIsBetween({ from, to }));

  await messageChannel.publishMessages(
    eventsToPour.map(
      event =>
        ({
          eventStoreId: eventStore.eventStoreId,
          event,
        } as EventStoreNotificationMessage<EVENT_STORE>),
    ),
  );

  const pouredEventCount = eventsToPour.length;
  const firstPouredEvent = eventsToPour[0];
  const lastPouredEvent = eventsToPour[eventsToPour.length - 1];

  return {
    pouredEventCount,
    ...(firstPouredEvent !== undefined ? { firstPouredEvent } : {}),
    ...(lastPouredEvent !== undefined ? { lastPouredEvent } : {}),
  };
};
