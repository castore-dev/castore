import { configureStore, EnhancedStore } from '@reduxjs/toolkit';

import { EventStore } from '@castore/core';

import { getCastoreReducers } from '~/getCastoreReducers';
import { ReduxEventStorageAdapter } from '~/reduxAdapter';
import { EventStoresReduxState } from '~/types';
import { DEFAULT_PREFIX } from '~/utils/getEventStoreSliceName';

export const configureCastore = <E extends EventStore[]>({
  eventStores,
  prefix = DEFAULT_PREFIX,
}: {
  eventStores: E;
  prefix?: string;
}): EnhancedStore<EventStoresReduxState<E>> => {
  const castoreReducers = getCastoreReducers({ eventStores, prefix });

  const store = configureStore({ reducer: castoreReducers });

  eventStores.forEach(eventStore => {
    eventStore.storageAdapter = new ReduxEventStorageAdapter({
      store,
      eventStoreId: eventStore.eventStoreId,
      prefix,
    });
  });

  return store as EnhancedStore<EventStoresReduxState<E>>;
};
