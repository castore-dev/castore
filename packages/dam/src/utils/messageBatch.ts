import type { EventStore, EventStoreNotificationMessage } from '@castore/core';

import { isBetween } from './isBetween';

export class MessageBatch<EVENT_STORE extends EventStore> {
  messages: EventStoreNotificationMessage<EVENT_STORE>[];

  constructor(messages: EventStoreNotificationMessage<EVENT_STORE>[] = []) {
    this.messages = messages;
  }

  concat = ({ messages }: MessageBatch<EVENT_STORE>): void => {
    this.messages = this.messages.concat(messages);
  };

  filterByTimestamp = ({ from, to }: { from?: string; to?: string }): void => {
    this.messages = this.messages.filter(({ event }) =>
      isBetween(event, { from, to }),
    );
  };

  sortByTimestamp = (): void => {
    this.messages.sort(({ event: eventA }, { event: eventB }) =>
      eventA.timestamp <= eventB.timestamp ? -1 : 1,
    );
  };
}
