import type { EventEmitter } from 'node:events';

import type {
  MessageBusAdapter,
  AnyMessage,
  MessageBusSourceEventStores,
  NotificationMessageBus,
  NotificationMessage,
  StateCarryingMessageBus,
  StateCarryingMessage,
} from '@castore/core';

import type { InMemoryMessageBusMessage } from './message';

type InMemoryBusMessage<
  Q extends NotificationMessageBus | StateCarryingMessageBus,
> = NotificationMessageBus | StateCarryingMessageBus extends Q
  ? AnyMessage
  : Q extends NotificationMessageBus
  ? NotificationMessage<MessageBusSourceEventStores<Q>>
  : Q extends StateCarryingMessageBus
  ? StateCarryingMessage<MessageBusSourceEventStores<Q>>
  : never;

type FilterPattern<E extends string = string, T extends string = string> =
  | { eventStoreId?: E; type?: never }
  | { eventStoreId: E; type?: T };

const match = (filterPattern: FilterPattern, message: AnyMessage): boolean => {
  const { type, eventStoreId } = filterPattern;
  const { type: messageType, eventStoreId: messageEventStoreId } = message;

  if (eventStoreId !== undefined && type !== undefined) {
    return messageEventStoreId === eventStoreId && messageType === type;
  }

  if (eventStoreId !== undefined) {
    return messageEventStoreId === eventStoreId;
  }

  return true;
};

const matchOne = (
  filterPatterns: FilterPattern[],
  message: AnyMessage,
): boolean =>
  filterPatterns.some(filterPattern => match(filterPattern, message));

export class InMemoryMessageBusAdapter<M extends AnyMessage = AnyMessage>
  implements MessageBusAdapter
{
  static attachTo<Q extends NotificationMessageBus | StateCarryingMessageBus>(
    messageBus: Q,
    eventEmitter: EventEmitter,
  ): InMemoryMessageBusAdapter<InMemoryBusMessage<Q>> {
    const messageBusAdapter = new InMemoryMessageBusAdapter<
      InMemoryBusMessage<Q>
    >({ eventEmitter });

    messageBus.messageBusAdapter = messageBusAdapter;

    return messageBusAdapter;
  }

  publishMessage: MessageBusAdapter['publishMessage'];

  callbacks: ((message: M) => Promise<void>)[];
  filterPatterns: FilterPattern[][];

  on: <
    E extends M['eventStoreId'] = M['eventStoreId'],
    T extends Extract<M, { eventStoreId: E }>['type'] = Extract<
      M,
      { eventStoreId: E }
    >['type'],
  >(
    filterPattern: FilterPattern<E, T>,
    callback: (message: InMemoryMessageBusMessage<M, E, T>) => Promise<void>,
  ) => void;

  eventEmitter: EventEmitter;

  constructor({ eventEmitter }: { eventEmitter: EventEmitter }) {
    this.eventEmitter = eventEmitter;

    this.publishMessage = async message =>
      new Promise<void>(resolve => {
        this.eventEmitter.emit('message', message as M);

        resolve();
      });

    this.callbacks = [];
    this.filterPatterns = [];

    this.on = <
      E extends M['eventStoreId'] = M['eventStoreId'],
      T extends Extract<M, { eventStoreId: E }>['type'] = Extract<
        M,
        { eventStoreId: E }
      >['type'],
    >(
      filterPattern: FilterPattern<E, T>,
      callback: (message: InMemoryMessageBusMessage<M, E, T>) => Promise<void>,
    ) => {
      let callbackIndex = this.callbacks.findIndex(cb => cb === callback);

      if (callbackIndex === -1) {
        this.callbacks.push(callback as (message: M) => Promise<void>);
        this.filterPatterns.push([filterPattern]);
        callbackIndex = this.callbacks.length - 1;

        this.eventEmitter.on(
          'message',
          (message: InMemoryMessageBusMessage<M, E, T>) => {
            if (matchOne(this.filterPatterns[callbackIndex], message)) {
              void callback(message);
            }
          },
        );
      } else {
        this.filterPatterns[callbackIndex].push(filterPattern);
      }
    };
  }
}
