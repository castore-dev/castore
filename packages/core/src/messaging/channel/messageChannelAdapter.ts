import type { Message } from '../message';

export interface MessageChannelAdapter {
  publishMessage: (message: Message) => Promise<void>;
  publishMessages: (messages: Message[]) => Promise<void>;
}
