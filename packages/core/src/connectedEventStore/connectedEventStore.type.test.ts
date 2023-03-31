import type { A } from 'ts-toolbelt';

import type { EventStore } from '~/eventStore';
import type { pokemonsEventStore } from '~/eventStore/eventStore.fixtures.test';

import type { ConnectedEventStore } from './connectedEventStore';
import type { pokemonsEventStoreWithStateCarryingMessageBus } from './connectedEventStore.fixtures.test';

// --- EXTENDS ---

const assertExtendsConnectedEventStore: A.Extends<
  typeof pokemonsEventStoreWithStateCarryingMessageBus,
  ConnectedEventStore
> = 1;
assertExtendsConnectedEventStore;

const assertExtendsEventStore: A.Extends<
  typeof pokemonsEventStoreWithStateCarryingMessageBus,
  EventStore
> = 1;
assertExtendsEventStore;

const assertExtendsOriginalEventStore: A.Extends<
  typeof pokemonsEventStoreWithStateCarryingMessageBus,
  typeof pokemonsEventStore
> = 1;
assertExtendsOriginalEventStore;
