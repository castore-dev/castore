import {
  AggregateExistsMessage,
  AggregateExistsMessageQueue,
  EventStoreId,
  ListAggregateIdsOptions,
} from '@castore/core';
import { InMemoryMessageQueueAdapter } from '@castore/in-memory-message-queue-adapter';

import {
  mockedEventStore,
  eventStoreId,
  aggregate1Id,
  aggregate2Id,
  aggregate3Id,
} from '../fixtures.test';
import { pourEventStoreAggregateIds } from './pourEventStoreAggregateIds';

const messageQueue = new AggregateExistsMessageQueue({
  messageQueueId: 'testMessageQueue',
  sourceEventStores: [mockedEventStore],
});

let receivedMessages: AggregateExistsMessage<
  EventStoreId<typeof mockedEventStore>
>[] = [];

InMemoryMessageQueueAdapter.attachTo(messageQueue, {
  worker: message =>
    new Promise(resolve => {
      receivedMessages.push(message);
      resolve();
    }),
});

describe('pourEventStoreAggregateIds', () => {
  beforeEach(() => {
    receivedMessages = [];
  });

  it('pours event store aggregate ids in correct order', async () => {
    const {
      pouredAggregateIdCount,
      firstScannedAggregate,
      lastScannedAggregate,
    } = await pourEventStoreAggregateIds({
      eventStore: mockedEventStore,
      messageChannel: messageQueue,
    });

    expect(pouredAggregateIdCount).toStrictEqual(3);
    expect(firstScannedAggregate).toStrictEqual({ aggregateId: aggregate1Id });
    expect(lastScannedAggregate).toStrictEqual({ aggregateId: aggregate3Id });

    expect(receivedMessages).toHaveLength(3);

    expect(receivedMessages[0]).toStrictEqual({
      eventStoreId,
      aggregateId: aggregate1Id,
    });
    expect(receivedMessages[1]).toStrictEqual({
      eventStoreId,
      aggregateId: aggregate2Id,
    });
    expect(receivedMessages[2]).toStrictEqual({
      eventStoreId,
      aggregateId: aggregate3Id,
    });
  });

  it('correctly passes options', async () => {
    const options: ListAggregateIdsOptions = {
      limit: 2,
      initialEventAfter: '2021-01-01T00:00:00.001Z',
      initialEventBefore: '2022-12-01T00:00:00.000Z',
      reverse: true,
    };

    const listAggregateIdsMock = vi.spyOn(mockedEventStore, 'listAggregateIds');

    await pourEventStoreAggregateIds({
      eventStore: mockedEventStore,
      messageChannel: messageQueue,
      options,
    });

    expect(listAggregateIdsMock).toHaveBeenCalledWith(options);

    listAggregateIdsMock.mockRestore();
  });
});
