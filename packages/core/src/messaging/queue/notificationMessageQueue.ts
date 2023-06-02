import type { EventStore } from '~/eventStore/eventStore';

import type { MessageChannelAdapter } from '../channel/messageChannelAdapter';
import { NotificationMessageChannel } from '../channel/notificationMessageChannel';

export class NotificationMessageQueue<
  EVENT_STORE extends EventStore = EventStore,
> extends NotificationMessageChannel<EVENT_STORE> {
  constructor({
    messageQueueId,
    sourceEventStores,
    messageQueueAdapter,
  }: {
    sourceEventStores: EVENT_STORE[];
    messageQueueId: string;
    messageQueueAdapter?: MessageChannelAdapter;
  }) {
    super({
      sourceEventStores,
      messageChannelType: 'queue',
      messageChannelId: messageQueueId,
      messageChannelAdapter: messageQueueAdapter,
    });
  }
}
