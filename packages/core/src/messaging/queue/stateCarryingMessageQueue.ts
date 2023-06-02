import type { EventStore } from '~/eventStore/eventStore';

import type { MessageChannelAdapter } from '../channel/messageChannelAdapter';
import { StateCarryingMessageChannel } from '../channel/stateCarryingMessageChannel';

export class StateCarryingMessageQueue<
  EVENT_STORE extends EventStore = EventStore,
> extends StateCarryingMessageChannel<EVENT_STORE> {
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
