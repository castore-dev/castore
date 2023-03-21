import type { A } from 'ts-toolbelt';

import type { EventStore } from '~/eventStore';
import type { userEventStore } from '~/eventStore/eventStore.util.test';

import type { ConnectedEventStore } from './connectedEventStore';
import type { userEventStoreWithStateCarryingMessageBus } from './connectedEventStore.util.test';

// --- EXTENDS ---

const assertExtendsConnectedEventStore: A.Extends<
  typeof userEventStoreWithStateCarryingMessageBus,
  ConnectedEventStore
> = 1;
assertExtendsConnectedEventStore;

const assertExtendsEventStore: A.Extends<
  typeof userEventStoreWithStateCarryingMessageBus,
  EventStore
> = 1;
assertExtendsEventStore;

const assertExtendsOriginalEventStore: A.Extends<
  typeof userEventStoreWithStateCarryingMessageBus,
  typeof userEventStore
> = 1;
assertExtendsOriginalEventStore;
