import type { EventStore } from '~/eventStore/eventStore';

import { AggregateExistsMessageChannel } from '../channel/aggregateExistsMessageChannel';
import type { MessageChannelAdapter } from '../channel/messageChannelAdapter';

export class AggregateExistsMessageBus<
  EVENT_STORE extends EventStore = EventStore,
> extends AggregateExistsMessageChannel<EVENT_STORE> {
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
      messageChannelType: 'bus',
      messageChannelId: messageQueueId,
      messageChannelAdapter: messageQueueAdapter,
    });
  }
}
