import {
  AggregateExistsMessage,
  AggregateExistsMessageQueue,
  EventStoreId,
} from '@castore/core';
import { InMemoryMessageQueueAdapter } from '@castore/in-memory-message-queue-adapter';

import {
  mockedEventStore,
  eventStoreId,
  aggregate1Id,
  aggregate2Id,
  aggregate3Id,
} from './fixtures.test';
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
    const { pouredAggregateIdCount, startAggregateId, endAggregateId } =
      await pourEventStoreAggregateIds(mockedEventStore, messageQueue);

    expect(pouredAggregateIdCount).toStrictEqual(3);
    expect(startAggregateId).toStrictEqual(aggregate1Id);
    expect(endAggregateId).toStrictEqual(aggregate3Id);

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

  it('correctly filters aggregates based on initialEvent', async () => {
    const { pouredAggregateIdCount, startAggregateId, endAggregateId } =
      await pourEventStoreAggregateIds(mockedEventStore, messageQueue, {
        initialEventAfter: '2021-01-01T00:00:00.001Z',
        initialEventBefore: '2022-12-01T00:00:00.000Z',
      });

    expect(pouredAggregateIdCount).toStrictEqual(1);
    expect(startAggregateId).toStrictEqual(aggregate2Id);
    expect(endAggregateId).toStrictEqual(aggregate2Id);

    expect(receivedMessages).toHaveLength(1);

    expect(receivedMessages[0]).toStrictEqual({
      eventStoreId,
      aggregateId: aggregate2Id,
    });
  });

  it('correctly applies batches', async () => {
    const listAggregateIdsSpy = vi.spyOn(mockedEventStore, 'listAggregateIds');

    await pourEventStoreAggregateIds(mockedEventStore, messageQueue, {
      batchSize: 2,
    });

    expect(listAggregateIdsSpy).toHaveBeenCalledTimes(2);
    expect(listAggregateIdsSpy).toHaveBeenCalledWith({ limit: 2 });

    listAggregateIdsSpy.mockRestore();
  });

  it('correctly applies reverse', async () => {
    const { pouredAggregateIdCount, startAggregateId, endAggregateId } =
      await pourEventStoreAggregateIds(mockedEventStore, messageQueue, {
        reverse: true,
      });

    expect(pouredAggregateIdCount).toStrictEqual(3);
    expect(startAggregateId).toStrictEqual(aggregate3Id);
    expect(endAggregateId).toStrictEqual(aggregate1Id);

    expect(receivedMessages).toHaveLength(3);

    expect(receivedMessages[0]).toStrictEqual({
      eventStoreId,
      aggregateId: aggregate3Id,
    });
    expect(receivedMessages[1]).toStrictEqual({
      eventStoreId,
      aggregateId: aggregate2Id,
    });
    expect(receivedMessages[2]).toStrictEqual({
      eventStoreId,
      aggregateId: aggregate1Id,
    });
  });
});
