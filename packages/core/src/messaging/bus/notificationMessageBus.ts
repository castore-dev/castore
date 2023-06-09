import type { EventStore } from '~/eventStore/eventStore';

import type { MessageChannelAdapter } from '../channel/messageChannelAdapter';
import { NotificationMessageChannel } from '../channel/notificationMessageChannel';

export class NotificationMessageBus<
  EVENT_STORE extends EventStore = EventStore,
> extends NotificationMessageChannel<EVENT_STORE> {
  constructor({
    messageBusId,
    sourceEventStores,
    messageBusAdapter: $messageBusAdapter,
  }: {
    sourceEventStores: EVENT_STORE[];
    messageBusId: string;
    messageBusAdapter?: MessageChannelAdapter;
  }) {
    super({
      sourceEventStores,
      messageChannelType: 'bus',
      messageChannelId: messageBusId,
      messageChannelAdapter: $messageBusAdapter,
    });
  }
}
