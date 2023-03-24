import type { Message } from '../message';

export interface MessageQueueAdapter {
  publishMessage: (message: Message) => Promise<void>;
  publishMessages: (messages: Message[]) => Promise<void>;
}
