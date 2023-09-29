import { promise as fastQ, queueAsPromised } from 'fastq';

import type {
  MessageChannelSourceEventStores,
  AggregateExistsMessageQueue,
  EventStoreAggregateExistsMessage,
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

export type InMemoryQueueMessage<
  MESSAGE_QUEUE extends
    | AggregateExistsMessageQueue
    | StateCarryingMessageQueue
    | NotificationMessageQueue,
> =
  | AggregateExistsMessageQueue
  | StateCarryingMessageQueue
  | NotificationMessageQueue extends MESSAGE_QUEUE
  ? Message
  : MESSAGE_QUEUE extends StateCarryingMessageQueue
  ? EventStoreStateCarryingMessage<
      MessageChannelSourceEventStores<MESSAGE_QUEUE>
    >
  : MESSAGE_QUEUE extends NotificationMessageQueue
  ? EventStoreNotificationMessage<
      MessageChannelSourceEventStores<MESSAGE_QUEUE>
    >
  : MESSAGE_QUEUE extends AggregateExistsMessageQueue
  ? EventStoreAggregateExistsMessage<
      MessageChannelSourceEventStores<MESSAGE_QUEUE>
    >
  : never;

export type TaskContext = {
  attempt: number;
  retryAttemptsLeft: number;
  replay: boolean;
};

export type Task<MESSAGE extends Message = Message> = {
  message: MESSAGE;
} & TaskContext;

type ConstructorArgs<MESSAGE extends Message = Message> = {
  worker?: (message: MESSAGE, context: TaskContext) => Promise<void>;
  retryAttempts?: number;
  retryDelayInMs?: number;
  retryBackoffRate?: number;
};

export class InMemoryMessageQueueAdapter<MESSAGE extends Message = Message>
  implements MessageChannelAdapter
{
  static attachTo<
    MESSAGE_QUEUE extends
      | AggregateExistsMessageQueue
      | StateCarryingMessageQueue
      | NotificationMessageQueue,
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
  private subscribe: (
    nextHandler: (message: MESSAGE, context: TaskContext) => Promise<void>,
  ) => void;
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
      nextHandler: (message: MESSAGE, context: TaskContext) => Promise<void>,
    ): void => {
      this.queue = fastQ(
        ({ message, ...context }) => nextHandler(message, context),
        1,
      );
      this.queue.error((error, task) => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (error === null) return;

        const { attempt, retryAttemptsLeft, ...restTask } = task;

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
            attempt: attempt + 1,
            retryAttemptsLeft: retryAttemptsLeft - 1,
            ...restTask,
          });
        }, waitTimeInMs);
      });
    };

    if (worker !== undefined) {
      this.subscribe(worker);
    }

    this.publishMessage = async (message, { replay = false } = {}) =>
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
          replay,
        });

        resolve();
      });

    this.publishMessages = async (messages, options) => {
      for (const message of messages) {
        await this.publishMessage(message, options);
      }
    };
  }

  set worker(
    worker: (message: MESSAGE, context: TaskContext) => Promise<void>,
  ) {
    this.subscribe(worker);
  }
}
