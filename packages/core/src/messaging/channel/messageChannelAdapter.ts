import type { Message } from '../message';
import type { PublishMessageOptions } from './types';

export interface MessageChannelAdapter {
  publishMessage: (
    message: Message,
    options?: PublishMessageOptions,
  ) => Promise<void>;
  publishMessages: (
    messages: Message[],
    options?: PublishMessageOptions,
  ) => Promise<void>;
}
