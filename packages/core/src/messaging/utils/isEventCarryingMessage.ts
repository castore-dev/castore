import type {
  Message,
  NotificationMessage,
  StateCarryingMessage,
} from '../message';

export const isEventCarryingMessage = (
  message: Message,
): message is NotificationMessage | StateCarryingMessage => 'event' in message;
