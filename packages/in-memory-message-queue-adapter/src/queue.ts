import { promise as fastQ, queueAsPromised } from 'fastq';

import type {
  MessageQueueSourceEventStores,
  NotificationMessageQueue,
  NotificationMessage,
  StateCarryingMessageQueue,
  StateCarryingMessage,
  MessageQueueAdapter,
  AnyMessage,
} from '@castore/core';

type InMemoryQueueMessage<
  Q extends NotificationMessageQueue | StateCarryingMessageQueue,
> = NotificationMessageQueue | StateCarryingMessageQueue extends Q
  ? AnyMessage
  : Q extends NotificationMessageQueue
  ? NotificationMessage<MessageQueueSourceEventStores<Q>>
  : Q extends StateCarryingMessageQueue
  ? StateCarryingMessage<MessageQueueSourceEventStores<Q>>
  : never;

export class InMemoryMessageQueueAdapter<M extends AnyMessage = AnyMessage>
  implements MessageQueueAdapter
{
  static attachTo<
    Q extends NotificationMessageQueue | StateCarryingMessageQueue,
  >(
    messageQueue: Q,
    callback?: (message: InMemoryQueueMessage<Q>) => Promise<void>,
  ): InMemoryMessageQueueAdapter<InMemoryQueueMessage<Q>> {
    const messageQueueAdapter = new InMemoryMessageQueueAdapter<
      InMemoryQueueMessage<Q>
    >({ callback });

    messageQueue.messageQueueAdapter = messageQueueAdapter;

    return messageQueueAdapter;
  }

  publishMessage: MessageQueueAdapter['publishMessage'];

  queue?: queueAsPromised<M, void>;

  constructor({ callback }: { callback?: (message: M) => Promise<void> }) {
    if (callback !== undefined) {
      this.queue = fastQ(callback, 1);
    }

    this.publishMessage = async message =>
      new Promise<void>(resolve => {
        const queue = this.queue;

        if (queue === undefined) {
          resolve();

          return;
        }

        void queue.push(message as M);

        resolve();
      });
  }

  set callback(callback: (message: M) => Promise<void>) {
    this.queue = fastQ(callback, 1);
  }
}
