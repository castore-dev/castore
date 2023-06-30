import type { EventEmitter } from 'node:events';

import {
  MessageChannelAdapter,
  Message,
  AggregateExistsMessageBus,
  NotificationMessageBus,
  NotificationMessage,
  StateCarryingMessageBus,
  StateCarryingMessage,
} from '@castore/core';

import type { InMemoryMessageBusMessage, Task } from './message';
import type {
  ConstructorArgs,
  FilterPattern,
  InMemoryBusMessage,
} from './types';
import {
  doesMessageMatchAnyFilterPattern,
  parseBackoffRate,
  parseRetryAttempts,
  parseRetryDelayInMs,
} from './utils';

export class InMemoryMessageBusAdapter<MESSAGE extends Message = Message>
  implements MessageChannelAdapter
{
  static attachTo<
    MESSAGE_BUS extends
      | AggregateExistsMessageBus
      | NotificationMessageBus
      | StateCarryingMessageBus,
  >(
    messageBus: MESSAGE_BUS,
    constructorArgs: ConstructorArgs,
  ): InMemoryMessageBusAdapter<InMemoryBusMessage<MESSAGE_BUS>> {
    const messageBusAdapter = new InMemoryMessageBusAdapter<
      InMemoryBusMessage<MESSAGE_BUS>
    >(constructorArgs);

    messageBus.messageChannelAdapter = messageBusAdapter;

    return messageBusAdapter;
  }

  publishMessage: MessageChannelAdapter['publishMessage'];
  publishMessages: MessageChannelAdapter['publishMessages'];
  retryAttempts: number;
  retryDelayInMs: number;
  retryBackoffRate: number;

  handlers: ((message: MESSAGE) => Promise<void>)[];
  filterPatterns: FilterPattern[][];

  on: <
    EVENT_STORE_ID extends MESSAGE['eventStoreId'] = MESSAGE['eventStoreId'],
    EVENT_TYPE extends MESSAGE extends
      | NotificationMessage
      | StateCarryingMessage
      ? Extract<MESSAGE, { eventStoreId: EVENT_STORE_ID }>['event']['type']
      : never = MESSAGE extends NotificationMessage | StateCarryingMessage
      ? Extract<MESSAGE, { eventStoreId: EVENT_STORE_ID }>['event']['type']
      : never,
  >(
    filterPattern: FilterPattern<EVENT_STORE_ID, EVENT_TYPE>,
    handler: (
      message: InMemoryMessageBusMessage<MESSAGE, EVENT_STORE_ID, EVENT_TYPE>,
    ) => Promise<void>,
  ) => void;

  eventEmitter: EventEmitter;

  constructor({
    eventEmitter,
    retryAttempts = 2,
    retryDelayInMs = 30000,
    retryBackoffRate = 2,
  }: ConstructorArgs) {
    this.eventEmitter = eventEmitter;
    this.retryDelayInMs = parseRetryDelayInMs(retryDelayInMs);
    this.retryAttempts = parseRetryAttempts(retryAttempts);
    this.retryBackoffRate = parseBackoffRate(retryBackoffRate);

    this.eventEmitter.on(
      'error',
      (error: Error, task: Task, handlerIndex: number) => {
        const { message, attempt, retryAttemptsLeft } = task;

        if (retryAttemptsLeft <= 0) {
          console.error(error);

          return;
        }

        const waitTimeInMs = Math.round(
          this.retryDelayInMs * Math.pow(this.retryBackoffRate, attempt - 1),
        );

        setTimeout(() => {
          this.eventEmitter.emit('message', {
            message,
            attempt: attempt + 1,
            retryAttemptsLeft: retryAttemptsLeft - 1,
            retryHandlerIndex: handlerIndex,
          });
        }, waitTimeInMs);
      },
    );

    this.publishMessage = async message =>
      new Promise<void>(resolve => {
        const task: Task = {
          message,
          attempt: 1,
          retryAttemptsLeft: this.retryAttempts,
        };

        this.eventEmitter.emit('message', task);

        resolve();
      });

    this.publishMessages = async messages => {
      for (const message of messages) {
        await this.publishMessage(message);
      }
    };

    this.handlers = [];
    this.filterPatterns = [];

    this.on = <
      EVENT_STORE_ID extends MESSAGE['eventStoreId'] = MESSAGE['eventStoreId'],
      EVENT_TYPE extends MESSAGE extends
        | NotificationMessage
        | StateCarryingMessage
        ? Extract<MESSAGE, { eventStoreId: EVENT_STORE_ID }>['event']['type']
        : never = MESSAGE extends NotificationMessage | StateCarryingMessage
        ? Extract<MESSAGE, { eventStoreId: EVENT_STORE_ID }>['event']['type']
        : never,
    >(
      filterPattern: FilterPattern<EVENT_STORE_ID, EVENT_TYPE>,
      handler: (
        message: InMemoryMessageBusMessage<MESSAGE, EVENT_STORE_ID, EVENT_TYPE>,
      ) => Promise<void>,
    ) => {
      let handlerIndex = this.handlers.findIndex(
        savedHandler =>
          savedHandler ===
          (handler as unknown as (message: MESSAGE) => Promise<void>),
      );

      if (handlerIndex === -1) {
        this.handlers.push(
          handler as unknown as (message: MESSAGE) => Promise<void>,
        );
        this.filterPatterns.push([filterPattern]);
        handlerIndex = this.handlers.length - 1;

        const filterPatterns = this.filterPatterns[handlerIndex];

        if (filterPatterns === undefined) {
          throw new Error('Internal error: filterPattern is undefined.');
        }

        this.eventEmitter.on(
          'message',
          (
            task: Task<
              InMemoryMessageBusMessage<MESSAGE, EVENT_STORE_ID, EVENT_TYPE>
            >,
          ) => {
            const { message, retryHandlerIndex } = task;

            if (
              retryHandlerIndex === undefined
                ? doesMessageMatchAnyFilterPattern(message, filterPatterns)
                : retryHandlerIndex === handlerIndex
            ) {
              void handler(message).catch(error => {
                this.eventEmitter.emit('error', error, task, handlerIndex);
              });
            }
          },
        );
      } else {
        const filterPatterns = this.filterPatterns[handlerIndex];

        if (filterPatterns === undefined) {
          throw new Error('Internal error: filterPattern is undefined.');
        }

        filterPatterns.push(filterPattern);
      }
    };
  }
}
