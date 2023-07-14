import {
  EventStore,
  EventStoreEventsDetails,
  EventStoreNotificationMessage,
} from '@castore/core';

export class MessagePourer<EVENT_STORE extends EventStore> {
  eventStore: EVENT_STORE;
  messageChannel: {
    publishMessage: (
      message: EventStoreNotificationMessage<EVENT_STORE>,
    ) => Promise<void>;
  };
  pouredEventCount: number;

  constructor(
    eventStore: EVENT_STORE,
    messageChannel: {
      publishMessage: (
        message: EventStoreNotificationMessage<EVENT_STORE>,
      ) => Promise<void>;
    },
  ) {
    this.eventStore = eventStore;
    this.messageChannel = messageChannel;
    this.pouredEventCount = 0;
  }

  pourEvents = async (
    eventsToPour: EventStoreEventsDetails<EVENT_STORE>[],
  ): Promise<void> => {
    for (const event of eventsToPour) {
      await this.messageChannel.publishMessage({
        eventStoreId: this.eventStore.eventStoreId,
        event,
      } as EventStoreNotificationMessage<EVENT_STORE>);

      this.pouredEventCount += 1;
    }
  };
}
