import { promise as fastQ, queueAsPromised } from 'fastq';

import type {
  MessageQueueSourceEventStores,
  NotificationMessageQueue,
  EventStoreNotificationMessage,
  StateCarryingMessageQueue,
  EventStoreStateCarryingMessage,
  MessageQueueAdapter,
  Message,
} from '@castore/core';

import {
  parseBackoffRate,
  parseRetryAttempts,
  parseRetryDelayInMs,
} from './utils';

type InMemoryQueueMessage<
  Q extends NotificationMessageQueue | StateCarryingMessageQueue,
> = NotificationMessageQueue | StateCarryingMessageQueue extends Q
  ? Message
  : Q extends NotificationMessageQueue
  ? EventStoreNotificationMessage<MessageQueueSourceEventStores<Q>>
  : Q extends StateCarryingMessageQueue
  ? EventStoreStateCarryingMessage<MessageQueueSourceEventStores<Q>>
  : never;

export type Task<M extends Message = Message> = {
  message: M;
  attempt: number;
  retryAttemptsLeft: number;
};

type ConstructorArgs<M extends Message = Message> = {
  worker?: (message: M) => Promise<void>;
  retryAttempts?: number;
  retryDelayInMs?: number;
  retryBackoffRate?: number;
};

export class InMemoryMessageQueueAdapter<M extends Message = Message>
  implements MessageQueueAdapter
{
  static attachTo<
    Q extends NotificationMessageQueue | StateCarryingMessageQueue,
  >(
    messageQueue: Q,
    constructorArgs: ConstructorArgs<InMemoryQueueMessage<Q>> = {},
  ): InMemoryMessageQueueAdapter<InMemoryQueueMessage<Q>> {
    const messageQueueAdapter = new InMemoryMessageQueueAdapter<
      InMemoryQueueMessage<Q>
    >(constructorArgs);

    messageQueue.messageQueueAdapter = messageQueueAdapter;

    return messageQueueAdapter;
  }

  publishMessage: MessageQueueAdapter['publishMessage'];
  private subscribe: (nextHandler: (message: M) => Promise<void>) => void;
  retryAttempts: number;
  retryDelayInMs: number;
  retryBackoffRate: number;

  queue?: queueAsPromised<Task<M>, void>;

  constructor({
    worker,
    retryAttempts = 2,
    retryDelayInMs = 30000,
    retryBackoffRate = 2,
  }: ConstructorArgs<M>) {
    this.retryDelayInMs = parseRetryDelayInMs(retryDelayInMs);
    this.retryAttempts = parseRetryAttempts(retryAttempts);
    this.retryBackoffRate = parseBackoffRate(retryBackoffRate);

    this.subscribe = (nextHandler: (message: M) => Promise<void>): void => {
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
          message: message as M,
          attempt: 1,
          retryAttemptsLeft: this.retryAttempts,
        });

        resolve();
      });
  }

  set worker(worker: (message: M) => Promise<void>) {
    this.subscribe(worker);
  }
}
