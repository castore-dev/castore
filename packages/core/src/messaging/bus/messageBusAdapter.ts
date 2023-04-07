import type { Message } from '../message';

export interface MessageBusAdapter {
  publishMessage: (message: Message) => Promise<void>;
  publishMessages: (messages: Message[]) => Promise<void>;
}
