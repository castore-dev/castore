import { pokemonsEventStore } from '@castore/demo-blueprint';

import { muteEventStore } from './muteEventStore';

muteEventStore(pokemonsEventStore, [
  {
    // valid event
    aggregateId: 'aggregateId',
    version: 1,
    type: 'APPEARED',
    timestamp: '2022',
    payload: {
      name: 'Pikachu',
      level: 1,
    },
    metadata: {
      trigger: 'random',
    },
  },
  {
    aggregateId: 'aggregateId',
    version: 1,
    type: 'APPEARED',
    timestamp: '2022',
    payload: {
      // @ts-expect-error test that payload should follow event type payload schema
      nam: 'userId',
      level: 12,
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
