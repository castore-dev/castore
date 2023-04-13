import { pokemonsEventStore } from '~/eventStore/eventStore.fixtures.test';

import { StateCarryingMessageQueue } from './stateCarryingMessageQueue';

export const stateCarryingMessageQueue = new StateCarryingMessageQueue({
  messageQueueId: 'test',
  sourceEventStores: [pokemonsEventStore],
});
