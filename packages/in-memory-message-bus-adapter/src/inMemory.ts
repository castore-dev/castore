import type { EventEmitter } from 'node:events';

import type {
  MessageBusAdapter,
  Message,
  NotificationMessageBus,
  StateCarryingMessageBus,
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

export class InMemoryMessageBusAdapter<M extends Message = Message>
  implements MessageBusAdapter
{
  static attachTo<Q extends NotificationMessageBus | StateCarryingMessageBus>(
    messageBus: Q,
    constructorArgs: ConstructorArgs,
  ): InMemoryMessageBusAdapter<InMemoryBusMessage<Q>> {
    const messageBusAdapter = new InMemoryMessageBusAdapter<
      InMemoryBusMessage<Q>
    >(constructorArgs);

    messageBus.messageBusAdapter = messageBusAdapter;

    return messageBusAdapter;
  }

  publishMessage: MessageBusAdapter['publishMessage'];
  retryAttempts: number;
  retryDelayInMs: number;
  retryBackoffRate: number;

  handlers: ((message: M) => Promise<void>)[];
  filterPatterns: FilterPattern[][];

  on: <
    E extends M['eventStoreId'] = M['eventStoreId'],
    T extends Extract<M, { eventStoreId: E }>['event']['type'] = Extract<
      M,
      { eventStoreId: E }
    >['event']['type'],
  >(
    filterPattern: FilterPattern<E, T>,
    handler: (message: InMemoryMessageBusMessage<M, E, T>) => Promise<void>,
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

    this.handlers = [];
    this.filterPatterns = [];

    this.on = <
      E extends M['eventStoreId'] = M['eventStoreId'],
      T extends Extract<M, { eventStoreId: E }>['event']['type'] = Extract<
        M,
        { eventStoreId: E }
      >['event']['type'],
    >(
      filterPattern: FilterPattern<E, T>,
      handler: (message: InMemoryMessageBusMessage<M, E, T>) => Promise<void>,
    ) => {
      let handlerIndex = this.handlers.findIndex(
        savedHandler => savedHandler === handler,
      );

      if (handlerIndex === -1) {
        this.handlers.push(handler as (message: M) => Promise<void>);
        this.filterPatterns.push([filterPattern]);
        handlerIndex = this.handlers.length - 1;

        this.eventEmitter.on(
          'message',
          (task: Task<InMemoryMessageBusMessage<M, E, T>>) => {
            const { message, retryHandlerIndex } = task;

            if (
              retryHandlerIndex === undefined
                ? doesMessageMatchAnyFilterPattern(
                    message,
                    this.filterPatterns[handlerIndex],
                  )
                : retryHandlerIndex === handlerIndex
            ) {
              void handler(message).catch(error => {
                this.eventEmitter.emit('error', error, task, handlerIndex);
              });
            }
          },
        );
      } else {
        this.filterPatterns[handlerIndex].push(filterPattern);
      }
    };
  }
}
