import type { EventStore } from '~/eventStore';

import type { NotificationMessageBus, StateCarryingMessageBus } from './bus';
import type {
  NotificationMessageQueue,
  StateCarryingMessageQueue,
} from './queue';

export type EventStoreMessageChannel<EVENT_STORE extends EventStore> =
  | NotificationMessageQueue<EVENT_STORE>
  | NotificationMessageBus<EVENT_STORE>
  | StateCarryingMessageQueue<EVENT_STORE>
  | StateCarryingMessageBus<EVENT_STORE>;
