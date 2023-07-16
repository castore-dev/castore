import type { EventStore, EventStoreNotificationMessage } from '@castore/core';

import { getThrottle } from '~/utils/getThrottle';

import type { MessageBatch } from './messageBatch';

export class MessagePourer<EVENT_STORE extends EventStore> {
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
    messageChannel: {
      publishMessage: (
        message: EventStoreNotificationMessage<EVENT_STORE>,
      ) => Promise<void>;
    },
    rateLimit = Infinity,
  ) {
    this.messageChannel = messageChannel;
    this.pouredEventCount = 0;
    this.throttle = getThrottle(rateLimit);
  }

  pourMessageBatch = async ({
    messages,
  }: MessageBatch<EVENT_STORE>): Promise<void> => {
    for (const message of messages) {
      await this.throttle(() => this.messageChannel.publishMessage(message));

      this.pouredEventCount += 1;
    }
  };
}
