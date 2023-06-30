import type { Message, NotificationMessage } from '../message';
import { isEventCarryingMessage } from './isEventCarryingMessage';

export const isNotificationMessage = (
  message: Message,
): message is NotificationMessage =>
  isEventCarryingMessage(message) && !('aggregate' in message);
