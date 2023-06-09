import { promise as fastQ, queueAsPromised } from 'fastq';

import type {
  MessageChannelSourceEventStores,
  NotificationMessageQueue,
  EventStoreNotificationMessage,
  StateCarryingMessageQueue,
  EventStoreStateCarryingMessage,
  MessageChannelAdapter,
  Message,
} from '@castore/core';

import {
  parseBackoffRate,
  parseRetryAttempts,
  parseRetryDelayInMs,
} from './utils';

type InMemoryQueueMessage<
  MESSAGE extends StateCarryingMessageQueue | NotificationMessageQueue,
> = StateCarryingMessageQueue | NotificationMessageQueue extends MESSAGE
  ? Message
  : MESSAGE extends StateCarryingMessageQueue
  ? EventStoreStateCarryingMessage<MessageChannelSourceEventStores<MESSAGE>>
  : MESSAGE extends NotificationMessageQueue
  ? EventStoreNotificationMessage<MessageChannelSourceEventStores<MESSAGE>>
  : never;

export type Task<MESSAGE extends Message = Message> = {
  message: MESSAGE;
  attempt: number;
  retryAttemptsLeft: number;
};

type ConstructorArgs<MESSAGE extends Message = Message> = {
  worker?: (message: MESSAGE) => Promise<void>;
  retryAttempts?: number;
  retryDelayInMs?: number;
  retryBackoffRate?: number;
};

export class InMemoryMessageQueueAdapter<MESSAGE extends Message = Message>
  implements MessageChannelAdapter
{
  static attachTo<
    MESSAGE_QUEUE extends StateCarryingMessageQueue | NotificationMessageQueue,
  >(
    messageQueue: MESSAGE_QUEUE,
    constructorArgs: ConstructorArgs<InMemoryQueueMessage<MESSAGE_QUEUE>> = {},
  ): InMemoryMessageQueueAdapter<InMemoryQueueMessage<MESSAGE_QUEUE>> {
    const messageQueueAdapter = new InMemoryMessageQueueAdapter<
      InMemoryQueueMessage<MESSAGE_QUEUE>
    >(constructorArgs);

    messageQueue.messageChannelAdapter = messageQueueAdapter;

    return messageQueueAdapter;
  }

  publishMessage: MessageChannelAdapter['publishMessage'];
  publishMessages: MessageChannelAdapter['publishMessages'];
  private subscribe: (nextHandler: (message: MESSAGE) => Promise<void>) => void;
  retryAttempts: number;
  retryDelayInMs: number;
  retryBackoffRate: number;

  queue?: queueAsPromised<Task<MESSAGE>, void>;

  constructor({
    worker,
    retryAttempts = 2,
    retryDelayInMs = 30000,
    retryBackoffRate = 2,
  }: ConstructorArgs<MESSAGE>) {
    this.retryDelayInMs = parseRetryDelayInMs(retryDelayInMs);
    this.retryAttempts = parseRetryAttempts(retryAttempts);
    this.retryBackoffRate = parseBackoffRate(retryBackoffRate);

    this.subscribe = (
      nextHandler: (message: MESSAGE) => Promise<void>,
    ): void => {
      this.queue = fastQ(({ message }) => nextHandler(message), 1);
      this.queue.error((error, task) => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (error === null) return;

        const { message, attempt, retryAttemptsLeft } = task;

        if (retryAttemptsLeft <= 0) {
          console.error(error);

          return;
        }

        const waitTimeInMs = Math.round(
          this.retryDelayInMs * Math.pow(this.retryBackoffRate, attempt - 1),
        );

        setTimeout(() => {
          const queue = this.queue;
          if (queue === undefined) return;

          void queue.push({
            message,
            attempt: attempt + 1,
            retryAttemptsLeft: retryAttemptsLeft - 1,
          });
        }, waitTimeInMs);
      });
    };

    if (worker !== undefined) {
      this.subscribe(worker);
    }

    this.publishMessage = async message =>
      new Promise<void>(resolve => {
        const queue = this.queue;

        if (queue === undefined) {
          resolve();

          return;
        }

        void queue.push({
          message: message as MESSAGE,
          attempt: 1,
          retryAttemptsLeft: this.retryAttempts,
        });

        resolve();
      });

    this.publishMessages = async messages => {
      for (const message of messages) {
        await this.publishMessage(message);
      }
    };
  }

  set worker(worker: (message: MESSAGE) => Promise<void>) {
    this.subscribe(worker);
  }
}
