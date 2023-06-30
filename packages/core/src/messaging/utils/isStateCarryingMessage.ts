import type { Message, StateCarryingMessage } from '../message';
import { isEventCarryingMessage } from './isEventCarryingMessage';

export const isStateCarryingMessage = (
  message: Message,
): message is StateCarryingMessage =>
  isEventCarryingMessage(message) && 'aggregate' in message;
