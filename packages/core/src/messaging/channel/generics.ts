import type {
  EventStore,
  EventStoreEventsTypes,
  EventStoreId,
} from '~/eventStore';

import type {
  EventStoreNotificationMessage,
  EventStoreStateCarryingMessage,
} from '../message';
import type { NotificationMessageChannel } from './notificationMessageChannel';
import type { StateCarryingMessageChannel } from './stateCarryingMessageChannel';

export type EventStoreMessageChannel<EVENT_STORE extends EventStore> =
  | NotificationMessageChannel<EVENT_STORE>
  | StateCarryingMessageChannel<EVENT_STORE>;

export type MessageChannelSourceEventStores<
  MESSAGE_CHANNEL extends
    | StateCarryingMessageChannel
    | NotificationMessageChannel,
> = MESSAGE_CHANNEL['sourceEventStores'][number];

export type MessageChannelMessage<
  MESSAGE_CHANNEL extends
    | StateCarryingMessageChannel
    | NotificationMessageChannel,
> = MESSAGE_CHANNEL extends StateCarryingMessageChannel
  ? EventStoreStateCarryingMessage<
      MessageChannelSourceEventStores<MESSAGE_CHANNEL>
    >
  : MESSAGE_CHANNEL extends NotificationMessageChannel
  ? EventStoreNotificationMessage<
      MessageChannelSourceEventStores<MESSAGE_CHANNEL>
    >
  : never;

export type MessageChannelSourceEventStoreIds<
  MESSAGE_CHANNEL extends
    | StateCarryingMessageChannel
    | NotificationMessageChannel,
> = EventStoreId<MessageChannelSourceEventStores<MESSAGE_CHANNEL>>;

export type MessageChannelSourceEventStoreIdTypes<
  MESSAGE_CHANNEL extends
    | StateCarryingMessageChannel
    | NotificationMessageChannel,
  EVENT_STORE_ID extends MessageChannelSourceEventStoreIds<MESSAGE_CHANNEL> = MessageChannelSourceEventStoreIds<MESSAGE_CHANNEL>,
> = EventStoreEventsTypes<
  Extract<
    MessageChannelSourceEventStores<MESSAGE_CHANNEL>,
    { eventStoreId: EVENT_STORE_ID }
  >
>[number]['type'];
