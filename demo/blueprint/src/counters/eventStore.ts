import { EventStore } from '@castore/core';

import { CounterStatus } from './aggregate';
import type { CounterAggregate } from './aggregate';
import {
  counterCreatedEvent,
  counterDecrementedEvent,
  counterIncrementedEvent,
  counterRemovedEvent,
} from './events';

export const counterEventStore = new EventStore({
  eventStoreId: 'COUNTER',
  eventStoreEvents: [
    counterCreatedEvent,
    counterDecrementedEvent,
    counterIncrementedEvent,
    counterRemovedEvent,
  ],
  reduce: (counterAggregate: CounterAggregate, event): CounterAggregate => {
    const { version, aggregateId } = event;

    switch (event.type) {
      case 'COUNTER_CREATED': {
        const { userId, startCount = 0 } = event.payload;

        return {
          aggregateId,
          version: event.version,
          userId,
          status: CounterStatus.ACTIVE,
          count: startCount,
        };
      }
      case 'COUNTER_INCREMENTED':
        return {
          ...counterAggregate,
          version,
          count: counterAggregate.count + 1,
        };
      case 'COUNTER_DECREMENTED':
        return {
          ...counterAggregate,
          version,
          count: counterAggregate.count - 1,
        };
      case 'COUNTER_REMOVED':
        return {
          ...counterAggregate,
          version,
          status: CounterStatus.REMOVED,
        };
    }
  },
});
