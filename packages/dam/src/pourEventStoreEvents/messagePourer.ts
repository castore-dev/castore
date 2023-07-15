import type {
  EventStore,
  EventStoreEventsDetails,
  EventStoreNotificationMessage,
} from '@castore/core';

import { getThrottle } from '~/utils/getThrottle';

export class MessagePourer<EVENT_STORE extends EventStore> {
  eventStore: EVENT_STORE;
  messageChannel: {
    publishMessage: (
      message: EventStoreNotificationMessage<EVENT_STORE>,
    ) => Promise<void>;
  };
  pouredEventCount: number;
  throttle: <RESPONSE>(
    throttledFn: () => Promise<RESPONSE>,
  ) => Promise<RESPONSE>;

  constructor(
    eventStore: EVENT_STORE,
    messageChannel: {
      publishMessage: (
        message: EventStoreNotificationMessage<EVENT_STORE>,
      ) => Promise<void>;
    },
    rateLimit = Infinity,
  ) {
    this.eventStore = eventStore;
    this.messageChannel = messageChannel;
    this.pouredEventCount = 0;
    this.throttle = getThrottle(rateLimit);
  }

  pourEvents = async (
    eventsToPour: EventStoreEventsDetails<EVENT_STORE>[],
  ): Promise<void> => {
    for (const event of eventsToPour) {
      await this.throttle(() =>
        this.messageChannel.publishMessage({
          eventStoreId: this.eventStore.eventStoreId,
          event,
        } as EventStoreNotificationMessage<EVENT_STORE>),
      );

      this.pouredEventCount += 1;
    }
  };
}
