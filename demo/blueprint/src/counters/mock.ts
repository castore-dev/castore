import { EventStoreEventsDetails } from '@castore/core';

import { counterEventStore } from './eventStore';

export const counterIdMock = 'counterId';

export const counterCreatedEventMock: EventStoreEventsDetails<
  typeof counterEventStore
> = {
  aggregateId: counterIdMock,
  version: 1,
  type: 'COUNTER_CREATED',
  timestamp: '2022',
  payload: {
    userId: 'c358dbfb-8a5e-47ca-82f4-ece787ffe224',
  },
};

export const counterIncrementedEventMock: EventStoreEventsDetails<
  typeof counterEventStore
> = {
  aggregateId: counterIdMock,
  version: 2,
  type: 'COUNTER_INCREMENTED',
  timestamp: '2023',
};

export const counterEventsMocks = [
  counterCreatedEventMock,
  counterIncrementedEventMock,
];
