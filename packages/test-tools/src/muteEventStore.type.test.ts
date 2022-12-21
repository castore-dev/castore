import { counterEventStore } from '@castore/demo-blueprint';

import { muteEventStore } from './muteEventStore';

muteEventStore(counterEventStore, [
  {
    // valid event
    aggregateId: 'aggregateId',
    version: 1,
    type: 'COUNTER_CREATED',
    timestamp: '2022',
    payload: {
      userId: 'userId',
    },
  },
  {
    aggregateId: 'aggregateId',
    version: 1,
    type: 'COUNTER_CREATED',
    timestamp: '2022',
    payload: {
      // @ts-expect-error test that payload should follow event type payload schema
      userIdd: 'userId',
    },
  },
  {
    aggregateId: 'aggregateId',
    version: 1,
    // @ts-expect-error type should follow valid event types
    type: 'INVALID_TYPE',
    timestamp: '2022',
  },
]);
