import type { EventStore } from '~/eventStore/eventStore';

import type { MessageChannelAdapter } from '../channel/messageChannelAdapter';
import { StateCarryingMessageChannel } from '../channel/stateCarryingMessageChannel';

export class StateCarryingMessageBus<
  EVENT_STORE extends EventStore = EventStore,
> extends StateCarryingMessageChannel<EVENT_STORE> {
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
