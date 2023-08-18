import type { A, O } from 'ts-toolbelt';

import type {
  AggregateExistsMessageBus,
  NotificationMessageBus,
  StateCarryingMessageBus,
  MessageChannelSourceEventStoreIds,
  MessageChannelSourceEventStoreIdTypes,
} from '@castore/core';
import type { EventBridgeMessageBusMessage } from '@castore/event-bridge-message-bus-adapter';

export type OversizedEntryDetail = { messageUrl: string };

export type EventBridgeS3MessageBusMessage<
  MESSAGE_BUS extends
    | AggregateExistsMessageBus
    | NotificationMessageBus
    | StateCarryingMessageBus,
  EVENT_STORE_IDS extends MessageChannelSourceEventStoreIds<MESSAGE_BUS> = MessageChannelSourceEventStoreIds<MESSAGE_BUS>,
  EVENT_TYPES extends MESSAGE_BUS extends
    | NotificationMessageBus
    | StateCarryingMessageBus
    ? MessageChannelSourceEventStoreIdTypes<MESSAGE_BUS, EVENT_STORE_IDS>
    : never = MESSAGE_BUS extends
    | NotificationMessageBus
    | StateCarryingMessageBus
    ? MessageChannelSourceEventStoreIdTypes<MESSAGE_BUS, EVENT_STORE_IDS>
    : never,
> = EventBridgeMessageBusMessage<
  MESSAGE_BUS,
  EVENT_STORE_IDS,
  EVENT_TYPES
> extends infer MESSAGE
  ? MESSAGE extends object
    ? O.Update<MESSAGE, 'Detail', A.x | OversizedEntryDetail>
    : never
  : never;
